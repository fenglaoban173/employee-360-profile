import { reactive } from 'vue'

export type EmployeeStatus = 'active' | 'probation' | 'leave' | 'resigned'

/** 员工档案 - 共享 mock 数据（员工 360° 档案详情页使用） */

export interface GrowthRecord {
  type: 'entry' | 'regularization' | 'training' | 'performance' | 'transfer' | 'promotion' | 'salary' | 'resignation'
  date: string
  title: string
  description: string
}

export interface Contract {
  name: string
  type: string
  startDate: string
  endDate: string
  position: string
  /** 关联的合同附件（对应 employee.attachments 中 category='合同' 的文件 name） */
  attachments?: string[]
}

/** 合同类型选项（与新增员工表单中的合同类型保持一致） */
export const contractTypeOptions = [
  '劳动合同',
  '实习协议',
  '劳务派遣合同',
  '外包合同',
  '兼职合同',
]

/** 转正考核人员 */
export interface RegularizationReviewer {
  name: string
  /** 考核评分表附件（对应 employee.attachments 中 category='其他' 的文件 name） */
  attachment?: string
}

/** 转正记录 */
export interface RegularizationRecord {
  date: string
  /** 转正汇报文档 */
  report?: string
  description?: string
  reviewers: RegularizationReviewer[]
}

export interface SalaryRecord {
  effectiveDate: string
  amount: string
  change: string
  approver: string
}

export interface TrainingRecord {
  date: string
  name: string
  type: '内部' | '外部'
  location: string
  duration: number
}

export interface RewardRecord {
  date: string
  level: '公司级' | '部门级' | '团队级'
  title: string
  reason: string
}

/** 附件的文件类型（细粒度，对应一份具体的入职 / 离职材料） */
export type AttachmentCategory =
  | '身份证证件'
  | '银行卡证件'
  | '白底照片'
  | '学历证书'
  | '离职证明'
  | '体检报告'
  | '个人简历'
  | '薪资流水'
  | '入职通知书'
  | '廉洁从业规定'
  | '入职承诺书'
  | '保密协议'
  | '劳动合同'

/** 附件文件类型下拉选项（13 类，按业务约定顺序） */
export const attachmentCategoryOptions: AttachmentCategory[] = [
  '身份证证件',
  '银行卡证件',
  '白底照片',
  '学历证书',
  '离职证明',
  '体检报告',
  '个人简历',
  '薪资流水',
  '入职通知书',
  '廉洁从业规定',
  '入职承诺书',
  '保密协议',
  '劳动合同',
]

export interface Attachment {
  name: string
  category: AttachmentCategory
  size: string
  uploadDate: string
  uploader: string
}

export interface WorkHistoryItem {
  period: string[]
  company: string
  title: string
  reference: string
  referencePhone: string
  reason: string
}

export interface EducationHistoryItem {
  period: string[]
  degree: string
  school: string
  major: string
}

export interface Employee {
  id: number
  employeeNo: string
  name: string
  avatar: string
  email: string
  phone: string
  department: string
  position: string
  status: EmployeeStatus
  entryDate: string
  departureDate?: string
  birthDate: string
  gender: '男' | '女'
  nativePlace: string
  address: string
  reportTo: string
  workLocation: string
  contractType: string
  contractEnd: string
  employeeCategory: string
  idCard: string
  ethnicity: string
  maritalStatus: string
  hukouAddress: string
  emergencyContact: string
  emergencyPhone: string
  highestEducation: string
  graduateSchool: string
  departmentTenure: string
  education: {
    school: string
    major: string
    degree: string
    period: string
  }
  career: { period: string; title: string; department: string; description: string }[]
  workHistory: WorkHistoryItem[]
  educationHistory: EducationHistoryItem[]
  performance: { period: string; score: number; level: string; comment: string }[]
  family: { relation: string; name: string; company: string; phone: string }[]
  contractReleased?: boolean
  growthRecords: GrowthRecord[]
  regularizations?: RegularizationRecord[]
  contracts: Contract[]
  salaries: SalaryRecord[]
  trainings: TrainingRecord[]
  rewards: RewardRecord[]
  attachments: Attachment[]
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`

/** 通用：员工成长记录模板 */
const buildGrowth = (
  type: GrowthRecord['type'],
  date: string,
  title: string,
  description: string
): GrowthRecord => ({ type, date, title, description })

export const employees: Employee[] = reactive([

  {
    id: 1,
    employeeNo: 'E10001',
    name: '张明远',
    avatar: avatar('zhangmingyuan'),
    email: 'zhangmingyuan@example.com',
    phone: '138-0001-0001',
    department: '技术部',
    position: '高级前端工程师',
    status: 'active',
    entryDate: '2022-04-18',
    birthDate: '1993-07-21',
    gender: '男',
    nativePlace: '浙江 杭州',
    address: '上海市浦东新区张江高科技园区',
    reportTo: '李思雨',
    workLocation: '上海',
    contractType: '劳动合同',
    contractEnd: '2027-04-17',
    employeeCategory: '正式员工',
    idCard: '330106199307210721',
    ethnicity: '汉族',
    maritalStatus: '已婚',
    hukouAddress: '浙江省杭州市西湖区文三路 88 号',
    emergencyContact: '张丽华',
    emergencyPhone: '138-0011-2233',
    contractReleased: true,
    family: [
      { relation: '父亲', name: '张建国', company: '杭州市第一建筑工程公司', phone: '138-0011-7700' },
      { relation: '母亲', name: '陈秀英', company: '杭州市西湖区社区医院', phone: '138-0011-7711' },
    ],
    highestEducation: '本科',
    graduateSchool: '浙江大学',
    departmentTenure: '2 年',
    education: { school: '浙江大学', major: '计算机科学与技术', degree: '本科', period: '2011 - 2015'},
    career: [
      { period: '2023.01 - 至今', title: '高级前端工程师', department: '技术部', description: '负责核心业务系统前端架构设计与团队 code review。' },
      { period: '2022.04 - 2022.12', title: '前端工程师', department: '技术部', description: '参与多个核心业务模块从 0 到 1 的搭建。' },
    ],
    workHistory: [
      { period: ['2022-04-18', ''], company: '本公司', title: '高级前端工程师', reference: '李思雨', referencePhone: '138-0002-0002', reason: '内部晋升' },
      { period: ['2022-04-18', '2022-12-31'], company: '本公司', title: '前端工程师', reference: '李思雨', referencePhone: '138-0002-0002', reason: '试用期转正' },
    ],
    educationHistory: [
      { period: ['2011-09-01', '2015-06-30'], degree: '本科', school: '浙江大学', major: '计算机科学与技术' },
    ],
    performance: [
      { period: '2026 Q1', score: 92, level: 'A', comment: '业务交付稳定，主导多个关键项目。' },
      { period: '2025 Q4', score: 88, level: 'B+', comment: '持续贡献，代码质量稳步提升。' },
      { period: '2025 Q3', score: 85, level: 'B+', comment: '完成 OKR，主动承担额外任务。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2022-04-18', '入职办理', '入职部门：技术部\n入职岗位：前端工程师'),
      buildGrowth('regularization', '2022-07-18', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2022-08-10', '完成培训', '《产品方法论》内部培训，培训时长 16 学时'),
      buildGrowth('training', '2023-03-22', '完成培训', '《TypeScript 进阶实战》内部培训，培训时长 24 学时'),
      buildGrowth('performance', '2022-12-30', '年终绩效', '2022 年度绩效：优秀 等级 96 分'),
      buildGrowth('training', '2024-05-15', '完成培训', '《高级前端架构实战》外部培训，培训时长 32 学时'),
      buildGrowth('transfer', '2023-06-01', '岗位调整', '从「前端工程师」调整为「高级前端工程师」'),
      buildGrowth('promotion', '2024-06-01', '职级晋升', '从 P6 晋升至 P7'),
      buildGrowth('transfer', '2024-11-01', '岗位调整', '从「增长业务组·前端」调整为「架构组·前端」'),
      buildGrowth('salary', '2025-04-01', '薪资调整', '月度薪资由 32,000 调整为 36,000'),
      buildGrowth('transfer', '2025-09-01', '岗位调整', '从「架构组·前端」调整为「基础平台部·架构组」'),
    ],
    regularizations: [
      {
        date: '2022-07-18',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '李思雨', attachment: '转正评分表-李思雨.pdf' },
          { name: '陈欣宜', attachment: '转正评分表-陈欣宜.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3+2 年）', type: '劳动合同', startDate: '2022-04-18', endDate: '2027-04-17', position: '前端工程师', attachments: ['劳动合同.pdf'] },
    ],
    salaries: [
      { effectiveDate: '2025-04-01', amount: '36,000 元/月', change: '+4,000', approver: '李思雨' },
      { effectiveDate: '2024-06-01', amount: '32,000 元/月', change: '+2,000', approver: '李思雨' },
      { effectiveDate: '2023-04-01', amount: '30,000 元/月', change: '+2,000', approver: '李思雨' },
    ],
    trainings: [
      { date: '2025-09-10', name: '高级前端架构实战', type: '外部', location: '上海·浦东国际会议中心', duration: 24 },
      { date: '2024-06-12', name: '《产品方法论》', type: '内部', location: '公司总部·3 楼培训室', duration: 8 },
      { date: '2022-08-10', name: '新员工入职培训', type: '内部', location: '公司总部·1 楼大会议室', duration: 4 },
    ],
    rewards: [
      { date: '2025-01', level: '公司级', title: '年度优秀员工', reason: '2024 年度业务贡献突出，主导关键系统重构' },
      { date: '2024-03', level: '部门级', title: '技术之星', reason: 'Q1 季度技术分享贡献' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.2 MB', uploadDate: '2022-04-18', uploader: '张明远' },
      { name: '学历证书.pdf', category: '学历证书', size: '0.8 MB', uploadDate: '2022-04-18', uploader: '张明远' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2022-04-18', uploader: '陈秀英' },
    ],
  },
  {
    id: 2,
    employeeNo: 'E10002',
    name: '李思雨',
    avatar: avatar('lisiyu'),
    email: 'lisiyu@example.com',
    phone: '138-0002-0002',
    department: '产品部',
    position: '高级产品经理',
    status: 'active',
    entryDate: '2020-09-01',
    birthDate: '1991-04-12',
    gender: '女',
    nativePlace: '江苏 苏州',
    address: '上海市徐汇区漕河泾',
    reportTo: '陈欣宜',
    workLocation: '上海',
    contractType: '劳动合同',
    contractEnd: '2026-08-31',
    employeeCategory: '正式员工',
    idCard: '320105199104120412',
    ethnicity: '汉族',
    maritalStatus: '已婚',
    hukouAddress: '江苏省南京市鼓楼区中央路 233 号',
    emergencyContact: '李建国',
    emergencyPhone: '138-0022-3344',
    contractReleased: true,
    family: [
      { relation: '配偶', name: '陈思远', company: '阿里巴巴集团', phone: '138-0022-3380' },
      { relation: '儿子', name: '李宇轩', company: '南京市北京东路小学', phone: '—' },
    ],
    highestEducation: '硕士研究生',
    graduateSchool: '复旦大学',
    departmentTenure: '5 年',
    education: { school: '复旦大学', major: '工商管理', degree: '硕士研究生', period: '2014 - 2017' },
    career: [
      { period: '2022.06 - 至今', title: '高级产品经理', department: '产品部', description: '负责增长方向产品规划与团队管理。' },
      { period: '2020.09 - 2022.05', title: '产品经理', department: '产品部', description: '负责核心产品的迭代与数据分析。' },
    ],
    workHistory: [
      { period: ['2020-09-01', ''], company: '本公司', title: '高级产品经理', reference: '陈欣宜', referencePhone: '138-0004-0004', reason: '内部晋升' },
      { period: ['2020-09-01', '2022-05-31'], company: '本公司', title: '产品经理', reference: '陈欣宜', referencePhone: '138-0004-0004', reason: '试用期转正' },
    ],
    educationHistory: [
      { period: ['2014-09-01', '2017-06-30'], degree: '硕士研究生', school: '复旦大学', major: '工商管理' },
    ],
    performance: [
      { period: '2026 Q1', score: 95, level: 'A+', comment: 'Q1 超额完成 OKR，业务指标显著上升。' },
      { period: '2025 Q4', score: 90, level: 'A', comment: '持续推动跨部门协作，口碑良好。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2020-09-01', '入职办理', '入职部门：产品部\n入职岗位：产品经理'),
      buildGrowth('regularization', '2020-12-01', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2021-03-15', '完成培训', '《业务洞察方法论》内部培训，培训时长 24 学时'),
      buildGrowth('performance', '2021-12-30', '年终绩效', '2021 年度绩效：A 级，92 分'),
      buildGrowth('promotion', '2022-06-01', '职级晋升', '从「产品经理」晋升至「高级产品经理」'),
      buildGrowth('salary', '2023-04-01', '薪资调整', '月度薪资由 28,000 调整为 32,000'),
      buildGrowth('training', '2024-09-20', '完成培训', '《高效能团队管理》外部培训，培训时长 32 学时'),
      buildGrowth('performance', '2024-12-30', '年终绩效', '2024 年度绩效：A 级，93 分'),
      buildGrowth('salary', '2025-04-01', '薪资调整', '月度薪资由 32,000 调整为 38,000'),
    ],
    regularizations: [
      {
        date: '2020-12-01',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '陈欣宜', attachment: '转正评分表-陈欣宜.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3 年）', type: '劳动合同', startDate: '2020-09-01', endDate: '2023-08-31', position: '产品经理', attachments: ['劳动合同.pdf'] },
      { name: '劳动合同续签（3 年）', type: '劳动合同', startDate: '2023-09-01', endDate: '2026-08-31', position: '高级产品经理', attachments: ['劳动合同续签.pdf'] },
    ],
    salaries: [
      { effectiveDate: '2025-04-01', amount: '38,000 元/月', change: '+6,000', approver: '陈欣宜' },
      { effectiveDate: '2023-04-01', amount: '32,000 元/月', change: '+4,000', approver: '陈欣宜' },
      { effectiveDate: '2022-06-01', amount: '28,000 元/月', change: '+3,000', approver: '陈欣宜' },
    ],
    trainings: [
      { date: '2024-09-20', name: '《高效能团队管理》', type: '外部', location: '杭州·阿里西溪园区', duration: 24 },
      { date: '2022-05-10', name: '产品经理进阶培训', type: '外部', location: '北京·中关村创业大街', duration: 32 },
      { date: '2021-03-15', name: '《业务洞察方法论》', type: '内部', location: '公司总部·3 楼培训室', duration: 16 },
      { date: '2020-09-01', name: '新员工入职培训', type: '内部', location: '公司总部·1 楼大会议室', duration: 4 },
    ],
    rewards: [
      { date: '2025-01', level: '公司级', title: '年度卓越贡献奖', reason: '主导增长方向产品，业务指标 +45%' },
      { date: '2023-01', level: '部门级', title: '产品之星', reason: '年度产品创新贡献' },
      { date: '2022-03', level: '部门级', title: '最佳协作奖', reason: '跨部门协作推动产品上线' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.2 MB', uploadDate: '2020-09-01', uploader: '李思雨' },
      { name: '硕士学位证书.pdf', category: '学历证书', size: '0.9 MB', uploadDate: '2020-09-01', uploader: '李思雨' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2020-09-01', uploader: '陈秀英' },
      { name: '劳动合同续签.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2023-09-01', uploader: '陈秀英' },
    ],
  },
  {
    id: 3,
    employeeNo: 'E10003',
    name: '王浩然',
    avatar: avatar('wanghaoran'),
    email: 'wanghaoran@example.com',
    phone: '138-0003-0003',
    department: '设计部',
    position: 'UI 设计师',
    status: 'probation',
    entryDate: '2026-08-12',
    birthDate: '1998-11-05',
    gender: '男',
    nativePlace: '广东 深圳',
    address: '深圳市南山区科技园',
    reportTo: '李思雨',
    workLocation: '深圳',
    contractType: '实习协议',
    contractEnd: '2027-02-11',
    employeeCategory: '实习生员工',
    idCard: '440305199811051105',
    ethnicity: '汉族',
    maritalStatus: '未婚',
    hukouAddress: '广东省深圳市南山区粤海街道科技园南区',
    emergencyContact: '王志强',
    emergencyPhone: '138-0033-4455',
    contractReleased: true,
    family: [
      { relation: '父亲', name: '王志明', company: '深圳市南山区退休', phone: '138-0033-4490' },
    ],
    highestEducation: '本科',
    graduateSchool: '广州美术学院',
    departmentTenure: '2 个月',
    education: { school: '广州美术学院', major: '视觉传达设计', degree: '本科', period: '2017 - 2021' },
    career: [
      { period: '2026.08 - 至今', title: 'UI 设计师', department: '设计部', description: '试用期 - 参与移动端产品视觉设计。' },
    ],
    workHistory: [
      { period: ['2026-08-12', ''], company: '本公司', title: 'UI 设计师', reference: '李思雨', referencePhone: '138-0002-0002', reason: '试用期' },
    ],
    educationHistory: [
      { period: ['2017-09-01', '2021-06-30'], degree: '本科', school: '广州美术学院', major: '视觉传达设计' },
    ],
    performance: [
      { period: '2026 Q3', score: 80, level: 'B', comment: '试用期表现良好，设计输出符合预期。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2026-08-12', '入职办理', '入职部门：设计部\n入职岗位：UI 设计师\n入职状态：试用期'),
      buildGrowth('training', '2026-08-20', '入职培训', '新员工入职培训，培训时长 16 学时'),
    ],
    contracts: [
      { name: '试用期劳动合同（6 个月）', type: '劳动合同', startDate: '2026-08-12', endDate: '2027-02-11', position: 'UI 设计师', attachments: ['试用期劳动合同.pdf'] },
    ],
    salaries: [
      { effectiveDate: '2026-08-12', amount: '15,000 元/月（试用期 80%）', change: '—', approver: '李思雨' },
    ],
    trainings: [
      { date: '2026-08-20', name: '新员工入职培训', type: '内部', location: '公司总部·1 楼大会议室', duration: 4 },
      { date: '2026-09-05', name: '设计系统入门', type: '内部', location: '线上（腾讯会议）', duration: 8 },
    ],
    rewards: [],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.1 MB', uploadDate: '2026-08-12', uploader: '王浩然' },
      { name: '学历证书.pdf', category: '学历证书', size: '0.8 MB', uploadDate: '2026-08-12', uploader: '王浩然' },
      { name: '试用期劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2026-08-12', uploader: '陈秀英' },
    ],
  },
  {
    id: 4,
    employeeNo: 'E10004',
    name: '陈欣宜',
    avatar: avatar('chenxinyi'),
    email: 'chenxinyi@example.com',
    phone: '138-0004-0004',
    department: '人力资源部',
    position: '高级 HRBP',
    status: 'active',
    entryDate: '2019-05-20',
    birthDate: '1990-02-18',
    gender: '女',
    nativePlace: '北京',
    address: '北京市朝阳区国贸',
    reportTo: '—',
    workLocation: '北京',
    contractType: '劳动合同',
    contractEnd: '2028-05-19',
    employeeCategory: '正式员工',
    idCard: '110105199002180218',
    ethnicity: '汉族',
    maritalStatus: '已婚',
    hukouAddress: '北京市朝阳区建国路 88 号',
    emergencyContact: '陈国强',
    emergencyPhone: '138-0044-5566',
    contractReleased: false,
    family: [
      { relation: '配偶', name: '林志辉', company: '字节跳动', phone: '138-0044-5590' },
      { relation: '女儿', name: '陈思涵', company: '北京市朝阳区某小学', phone: '—' },
    ],
    highestEducation: '本科',
    graduateSchool: '中国人民大学',
    departmentTenure: '7 年',
    education: { school: '中国人民大学', major: '人力资源管理', degree: '本科', period: '2008 - 2012' },
    career: [
      { period: '2021.04 - 至今', title: '高级 HRBP', department: '人力资源部', description: '对接技术部、产品部、运营部。' },
      { period: '2019.05 - 2021.03', title: 'HRBP', department: '人力资源部', description: '负责招聘与员工关系。' },
    ],
    workHistory: [
      { period: ['2019-05-20', ''], company: '本公司', title: '高级 HRBP', reference: '—', referencePhone: '—', reason: '内部晋升' },
      { period: ['2019-05-20', '2021-03-31'], company: '本公司', title: 'HRBP', reference: '—', referencePhone: '—', reason: '试用期转正' },
    ],
    educationHistory: [
      { period: ['2008-09-01', '2012-06-30'], degree: '本科', school: '中国人民大学', major: '人力资源管理' },
    ],
    performance: [
      { period: '2026 Q1', score: 89, level: 'A', comment: '员工满意度持续提升，组织氛围改善明显。' },
      { period: '2025 Q4', score: 86, level: 'B+', comment: '关键岗位招聘达成率 100%。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2019-05-20', '入职办理', '入职部门：人力资源部\n入职岗位：HRBP'),
      buildGrowth('regularization', '2019-08-20', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2019-09-10', '完成培训', '《HR 三支柱模型》内部培训'),
      buildGrowth('promotion', '2021-04-01', '职级晋升', '从「HRBP」晋升至「高级 HRBP」'),
      buildGrowth('performance', '2022-12-30', '年终绩效', '2022 年度绩效：A 级，91 分'),
      buildGrowth('salary', '2023-04-01', '薪资调整', '月度薪资由 22,000 调整为 26,000'),
      buildGrowth('training', '2024-05-15', '完成培训', '《组织发展与人才盘点》外部培训'),
      buildGrowth('performance', '2024-12-30', '年终绩效', '2024 年度绩效：A 级，90 分'),
      buildGrowth('salary', '2025-04-01', '薪资调整', '月度薪资由 26,000 调整为 30,000'),
    ],
    regularizations: [
      {
        date: '2019-08-20',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '王丽', attachment: '转正评分表-王丽.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3 年）', type: '劳动合同', startDate: '2019-05-20', endDate: '2022-05-19', position: 'HRBP', attachments: ['劳动合同.pdf'] },
      { name: '劳动合同续签（3 年）', type: '劳动合同', startDate: '2022-05-20', endDate: '2025-05-19', position: 'HRBP' },
      { name: '劳动合同续签（3 年）', type: '劳动合同', startDate: '2025-05-20', endDate: '2028-05-19', position: '高级 HRBP', attachments: ['劳动合同续签(2).pdf'] },
    ],
    salaries: [
      { effectiveDate: '2025-04-01', amount: '30,000 元/月', change: '+4,000', approver: '—' },
      { effectiveDate: '2023-04-01', amount: '26,000 元/月', change: '+4,000', approver: '—' },
      { effectiveDate: '2021-04-01', amount: '22,000 元/月', change: '+3,000', approver: '—' },
    ],
    trainings: [
      { date: '2024-05-15', name: '《组织发展与人才盘点》', type: '外部', location: '北京·国家会议中心', duration: 24 },
      { date: '2022-04-20', name: 'HRBP 实战工作坊', type: '外部', location: '上海·徐汇万科中心', duration: 16 },
      { date: '2019-09-10', name: '《HR 三支柱模型》', type: '内部', location: '公司总部·3 楼培训室', duration: 8 },
    ],
    rewards: [
      { date: '2024-01', level: '公司级', title: '年度 HR 卓越奖', reason: '组织文化建设贡献突出' },
      { date: '2021-03', level: '团队级', title: '招聘之星', reason: '关键岗位招聘达成率行业领先' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.2 MB', uploadDate: '2019-05-20', uploader: '陈欣宜' },
      { name: '学历证书.pdf', category: '学历证书', size: '0.8 MB', uploadDate: '2019-05-20', uploader: '陈欣宜' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2019-05-20', uploader: '陈秀英' },
      { name: '劳动合同续签(2).pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2025-05-20', uploader: '陈秀英' },
    ],
  },
  {
    id: 5,
    employeeNo: 'E10005',
    name: '刘子昂',
    avatar: avatar('liuziang'),
    email: 'liuziang@example.com',
    phone: '138-0005-0005',
    department: '运营部',
    position: '运营专员',
    status: 'active',
    entryDate: '2022-02-14',
    birthDate: '1996-09-30',
    gender: '男',
    nativePlace: '四川 成都',
    address: '上海市长宁区',
    reportTo: '李思雨',
    workLocation: '上海',
    contractType: '兼职合同',
    contractEnd: '2027-02-13',
    employeeCategory: '兼职员工',
    idCard: '510107198809300930',
    ethnicity: '汉族',
    maritalStatus: '未婚',
    hukouAddress: '四川省成都市武侯区人民南路 4 段 18 号',
    emergencyContact: '刘德明',
    emergencyPhone: '138-0055-6677',
    contractReleased: true,
    family: [
      { relation: '父亲', name: '刘德胜', company: '成都市武侯区水务局', phone: '138-0055-6610' },
      { relation: '母亲', name: '黄淑芬', company: '成都市武侯区某学校', phone: '138-0055-6620' },
      { relation: '姐姐', name: '刘子琪', company: '成都市高新区某科技公司', phone: '138-0055-6630' },
    ],
    highestEducation: '本科',
    graduateSchool: '四川大学',
    departmentTenure: '3 年',
    education: { school: '四川大学', major: '市场营销', degree: '本科', period: '2014 - 2018' },
    career: [
      { period: '2022.02 - 至今', title: '运营专员', department: '运营部', description: '负责用户增长与活动运营。' },
    ],
    workHistory: [
      { period: ['2022-02-14', ''], company: '本公司', title: '运营专员', reference: '李思雨', referencePhone: '138-0002-0002', reason: '试用期转正' },
    ],
    educationHistory: [
      { period: ['2014-09-01', '2018-06-30'], degree: '本科', school: '四川大学', major: '市场营销' },
    ],
    performance: [
      { period: '2025 Q4', score: 76, level: 'B', comment: '完成核心 KPI，活动转化符合预期。' },
      { period: '2025 Q3', score: 78, level: 'B', comment: '活动策划执行力较好。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2022-02-14', '入职办理', '入职部门：运营部\n入职岗位：运营专员'),
      buildGrowth('regularization', '2022-05-14', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2022-06-01', '完成培训', '《用户增长实操》内部培训'),
      buildGrowth('performance', '2023-12-30', '年终绩效', '2023 年度绩效：B 级，82 分'),
      buildGrowth('salary', '2024-04-01', '薪资调整', '月度薪资由 14,000 调整为 16,000'),
      buildGrowth('training', '2025-03-15', '完成培训', '《活动运营进阶》外部培训'),
      buildGrowth('performance', '2025-12-30', '年终绩效', '2025 年度绩效：B 级，80 分'),
    ],
    regularizations: [
      {
        date: '2022-05-14',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '李思雨', attachment: '转正评分表-李思雨.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3 年）', type: '劳动合同', startDate: '2022-02-14', endDate: '2025-02-13', position: '运营专员', attachments: ['劳动合同.pdf'] },
      { name: '劳动合同续签（2 年）', type: '劳动合同', startDate: '2025-02-14', endDate: '2027-02-13', position: '运营专员' },
    ],
    salaries: [
      { effectiveDate: '2024-04-01', amount: '16,000 元/月', change: '+2,000', approver: '李思雨' },
    ],
    trainings: [
      { date: '2025-03-15', name: '《活动运营进阶》', type: '外部', location: '广州·天河珠江新城', duration: 16 },
      { date: '2022-06-01', name: '《用户增长实操》', type: '内部', location: '公司总部·3 楼培训室', duration: 8 },
    ],
    rewards: [
      { date: '2024-12', level: '团队级', title: 'Q4 活动之星', reason: '双 11 活动转化率第一' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.0 MB', uploadDate: '2022-02-14', uploader: '陈思远' },
      { name: '学历证书.pdf', category: '学历证书', size: '0.7 MB', uploadDate: '2022-02-14', uploader: '陈思远' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2022-02-14', uploader: '陈秀英' },
    ],
  },
  {
    id: 6,
    employeeNo: 'E10006',
    name: '赵雨彤',
    avatar: avatar('zhaoyutong'),
    email: 'zhaoyutong@example.com',
    phone: '138-0006-0006',
    department: '技术部',
    position: '后端工程师',
    status: 'active',
    entryDate: '2024-06-01',
    birthDate: '1995-12-08',
    gender: '女',
    nativePlace: '湖北 武汉',
    address: '上海市浦东新区',
    reportTo: '张明远',
    workLocation: '上海',
    contractType: '劳务派遣合同',
    contractEnd: '2027-05-31',
    employeeCategory: '劳务派遣员工',
    idCard: '420106199312081208',
    ethnicity: '汉族',
    maritalStatus: '未婚',
    hukouAddress: '湖北省武汉市武昌区中南路 99 号',
    emergencyContact: '赵建华',
    emergencyPhone: '138-0066-7788',
    contractReleased: true,
    family: [
      { relation: '父亲', name: '赵建强', company: '武汉市武昌区某机关单位', phone: '138-0066-7720' },
    ],
    highestEducation: '硕士研究生',
    graduateSchool: '华中科技大学',
    departmentTenure: '2 年',
    education: { school: '华中科技大学', major: '软件工程', degree: '硕士研究生', period: '2017 - 2020' },
    career: [
      { period: '2024.06 - 至今', title: '后端工程师', department: '技术部', description: '负责服务端架构与性能优化。' },
    ],
    workHistory: [
      { period: ['2024-06-01', ''], company: '本公司', title: '后端工程师', reference: '张明远', referencePhone: '138-0001-0001', reason: '试用期转正' },
    ],
    educationHistory: [
      { period: ['2017-09-01', '2020-06-30'], degree: '硕士研究生', school: '华中科技大学', major: '软件工程' },
    ],
    performance: [
      { period: '2026 Q1', score: 87, level: 'B+', comment: '推动系统稳定性建设，故障率显著下降。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2024-06-01', '入职办理', '入职部门：技术部\n入职岗位：后端工程师'),
      buildGrowth('regularization', '2024-09-01', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2024-07-15', '入职培训', '《服务端架构基础》内部培训'),
      buildGrowth('performance', '2024-12-30', '年终绩效', '2024 年度绩效：B+ 级，85 分'),
      buildGrowth('salary', '2025-04-01', '薪资调整', '月度薪资由 25,000 调整为 28,000'),
    ],
    regularizations: [
      {
        date: '2024-09-01',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '张明远', attachment: '转正评分表-张明远.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3 年）', type: '劳动合同', startDate: '2024-06-01', endDate: '2027-05-31', position: '后端工程师', attachments: ['劳动合同.pdf'] },
    ],
    salaries: [
      { effectiveDate: '2025-04-01', amount: '28,000 元/月', change: '+3,000', approver: '张明远' },
    ],
    trainings: [
      { date: '2025-08-10', name: '《分布式系统实战》', type: '外部', location: '深圳·南山科技园', duration: 24 },
      { date: '2024-07-15', name: '《服务端架构基础》', type: '内部', location: '公司总部·2 楼技术分享厅', duration: 16 },
    ],
    rewards: [
      { date: '2025-01', level: '部门级', title: '技术新星', reason: '首年技术贡献突出' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.1 MB', uploadDate: '2024-06-01', uploader: '赵文博' },
      { name: '硕士学位证书.pdf', category: '学历证书', size: '0.9 MB', uploadDate: '2024-06-01', uploader: '赵文博' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2024-06-01', uploader: '陈秀英' },
    ],
  },
  {
    id: 7,
    employeeNo: 'E10007',
    name: '孙一鸣',
    avatar: avatar('sunyiming'),
    email: 'sunyiming@example.com',
    phone: '138-0007-0007',
    department: '市场部',
    position: '市场经理',
    status: 'resigned',
    entryDate: '2020-04-10',
    departureDate: '2026-09-30',
    birthDate: '1989-08-23',
    gender: '男',
    nativePlace: '上海',
    address: '上海市黄浦区',
    reportTo: '陈欣宜',
    workLocation: '上海',
    contractType: '外包合同',
    contractEnd: '2025-04-09',
    employeeCategory: '外包员工',
    idCard: '310101199108230823',
    ethnicity: '汉族',
    maritalStatus: '已婚',
    hukouAddress: '上海市黄浦区南京东路 233 号',
    emergencyContact: '孙慧芳',
    emergencyPhone: '138-0077-8899',
    contractReleased: true,
    family: [
      { relation: '配偶', name: '周敏', company: '上海市某贸易公司', phone: '138-0077-8830' },
      { relation: '儿子', name: '孙宇辰', company: '上海市黄浦区某中学', phone: '—' },
    ],
    highestEducation: '本科',
    graduateSchool: '上海交通大学',
    departmentTenure: '5 年',
    education: { school: '上海交通大学', major: '市场营销', degree: '本科', period: '2007 - 2011' },
    career: [
      { period: '2020.04 - 2026.09', title: '市场经理', department: '市场部', description: '负责品牌推广与渠道合作。' },
    ],
    workHistory: [
      { period: ['2020-04-10', '2026-09-30'], company: '本公司', title: '市场经理', reference: '陈欣宜', referencePhone: '138-0004-0004', reason: '个人原因离职' },
    ],
    educationHistory: [
      { period: ['2007-09-01', '2011-06-30'], degree: '本科', school: '上海交通大学', major: '市场营销' },
    ],
    performance: [
      { period: '2025 Q4', score: 82, level: 'B+', comment: '市场活动 ROI 表现稳定。' },
    ],
    growthRecords: [
      buildGrowth('entry', '2020-04-10', '入职办理', '入职部门：市场部\n入职岗位：市场经理'),
      buildGrowth('regularization', '2020-07-10', '转正通过', '试用期满考核转正通过'),
      buildGrowth('training', '2020-08-15', '完成培训', '《品牌营销方法论》内部培训'),
      buildGrowth('performance', '2021-12-30', '年终绩效', '2021 年度绩效：A 级，88 分'),
      buildGrowth('promotion', '2022-04-01', '职级晋升', '从「市场专员」晋升至「市场经理」'),
      buildGrowth('salary', '2023-04-01', '薪资调整', '月度薪资由 20,000 调整为 24,000'),
      buildGrowth('training', '2024-09-10', '完成培训', '《整合营销传播》外部培训'),
      buildGrowth('performance', '2024-12-30', '年终绩效', '2024 年度绩效：B+ 级，83 分'),
      buildGrowth('resignation', '2026-09-30', '离职办理', '因个人原因申请离职归公司所有档案'),
    ],
    regularizations: [
      {
        date: '2020-07-10',
        report: '转正汇报.pdf',
        description: '试用期满考核转正通过',
        reviewers: [
          { name: '陈欣宜', attachment: '转正评分表-陈欣宜.pdf' },
        ],
      },
    ],
    contracts: [
      { name: '劳动合同（3 年）', type: '劳动合同', startDate: '2020-04-10', endDate: '2023-04-09', position: '市场经理', attachments: ['劳动合同.pdf'] },
      { name: '劳动合同续签（2 年）', type: '劳动合同', startDate: '2023-04-10', endDate: '2025-04-09', position: '市场经理' },
      { name: '解除/终止劳动合同', type: '劳动合同', startDate: '2025-04-10', endDate: '2026-09-30', position: '市场经理' },
    ],
    salaries: [
      { effectiveDate: '2023-04-01', amount: '24,000 元/月', change: '+4,000', approver: '陈欣宜' },
    ],
    trainings: [
      { date: '2024-09-10', name: '《整合营销传播》', type: '外部', location: '上海·静安寺', duration: 16 },
      { date: '2020-08-15', name: '《品牌营销方法论》', type: '内部', location: '公司总部·3 楼培训室', duration: 8 },
    ],
    rewards: [
      { date: '2022-01', level: '公司级', title: '年度品牌贡献奖', reason: '主导品牌升级项目' },
    ],
    attachments: [
      { name: '身份证扫描件.pdf', category: '身份证证件', size: '1.2 MB', uploadDate: '2020-04-10', uploader: '周子墨' },
      { name: '学历证书.pdf', category: '学历证书', size: '0.8 MB', uploadDate: '2020-04-10', uploader: '周子墨' },
      { name: '劳动合同.pdf', category: '劳动合同', size: '0.5 MB', uploadDate: '2020-04-10', uploader: '陈秀英' },
      { name: '离职证明.pdf', category: '离职证明', size: '0.3 MB', uploadDate: '2026-09-30', uploader: '陈秀英' },
    ],
  },
])