# 员工 360° 档案

> 一个**纯前端 mock**的员工档案管理系统：列表筛选 / 详情 8 Tab / 真实 ZIP 批量导出。

基于 **Vue 3 + TypeScript + Arco Design Vue 2.55 + Vite 5** 实现，所有数据来自前端 `reactive` mock，无需后端。

## 在线预览

**https://fenglaoban173.github.io/employee-360-profile/**

- 登录页已预填演示账号（任意账号密码即可登录），直接点「登录」进入
- 当前为前端 mock 阶段，不接真实后端

> 每次推 `main` 后由 GitHub Actions 自动构建并发布。

## 项目特性

- **Vue 3** `<script setup>` Composition API
- **TypeScript** 全量类型（Employee 38 字段 + 7 个子类型）
- **Arco Design Vue 2.55** 组件库
- **Vue Router 4** Hash 模式（兼容静态部署，避免 404）
- **Pinia** 用户状态
- **JSZip** 真实 ZIP 包生成（每个员工一个文件夹）
- **Vite 5** 构建，1148 modules / 4.5s

## 功能模块

| 模块 | 路径 | 说明 |
|---|---|---|
| **员工档案列表** | `#/employee-profile` | 5 张统计指标卡 + 快捷 Tab + 高级筛选 + 9 列表格 + 批量操作 |
| **员工档案详情** | `#/employee-profile/:id` | 基础信息卡 + 8 个 Tab（基本信息 / 家庭 / 工作 / 教育 / 合同 / 转正 / 培训 / 附件） |
| **新增 / 编辑抽屉** | 列表内嵌 | 7 大区块表单，940px 右侧抽屉 |
| **批量导出** | 列表「批量导出」 | 统一配置 + 按员工微调 → 真实 ZIP 下载 |
| **登录 / 404** | `#/login` / `*` | 登录 mock + 404 占位 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（http://localhost:3000）
npm run dev

# 3. 类型检查（不阻塞 build）
npm run type-check

# 4. 生产构建（输出 dist/）
npm run build

# 5. 预览生产包
npm run preview
```

## 项目结构

```
员工360档案/
├── prd/
│   └── 员工360档案-PRD.md        # 完整功能 PRD（4 大部分 / 8 Tab 详解）
├── public/
│   ├── logo.svg
│   └── growth/                   # 详情页成长记录 5 张图标
│       ├── entry.png             #   入职
│       ├── regularization.png    #   转正
│       ├── training.png          #   培训
│       ├── transfer.png          #   调岗
│       └── resignation.svg       #   离职
├── src/
│   ├── components/
│   │   └── StatCard.vue          # 列表顶部通用指标卡
│   ├── layouts/
│   │   ├── MainLayout.vue        # 侧边栏 + 顶部
│   │   └── components/
│   │       └── BreadcrumbNav.vue
│   ├── router/index.ts           # 3 条路由：/login、/employee-profile、/:id
│   ├── stores/user.ts            # token + userInfo
│   ├── styles/
│   │   ├── variables.scss        # SCSS 变量
│   │   └── global.scss           # 全局样式
│   ├── utils/
│   │   ├── format.ts             # maskIdCard / maskPhone
│   │   └── batchExport.ts        # JSZip 打包 + 触发下载
│   ├── views/
│   │   ├── employee-profile/
│   │   │   ├── data.ts           # Employee 类型 + 7 条 mock
│   │   │   ├── index.vue         # 列表
│   │   │   └── detail.vue        # 详情
│   │   ├── login/index.vue
│   │   └── error/404.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 关键设计

### 列表筛选三段式
- **顶部 5 张 StatCard**：纯展示指标，不联动筛选
- **快捷 Tab**：在职状态组（4 项）+ 工作地点组（5 项），带 count 角标
- **高级筛选行**：姓名搜索 / 员工类别 / 部门 / 入职日期范围 / 离职日期范围

### 批量导出双板块
- **统一配置**（顶部横排 13 项）：身份证证件 / 银行卡证件 / 白底照片 / 学历证书 / 离职证明 / 体检报告 / 个人简历 / 薪资流水 / 入职通知书 / 廉洁从业规定 / 入职承诺书 / 保密协议 / 劳动合同
- **按员工微调**（底部右侧）：可单独覆盖某员工的导出项
- **优先级**：微调 > 统一，未自定义的员工自动沿用统一配置
- **下载**：`员工档案批量导出_N人_M份_YYYY-MM-DD.zip`，每个员工一个文件夹

### 详情页 8 Tab
| Tab | 数据来源 |
|---|---|
| 基本信息 | Employee 顶层字段 + 5 节点成长记录 stepper |
| 家庭成员 | `Employee.family[]` |
| 工作经历 | `Employee.workHistory[]` |
| 教育经历 | `Employee.educationHistory[]` |
| 合同信息 | `Employee.contracts[]` + 抽屉增删改 |
| 转正记录 | `Employee.regularizations[0]` + 抽屉增删改 |
| 培训记录 | `Employee.trainings[]` + 抽屉增删改 |
| 附件资料 | `Employee.attachments[]` + 抽屉增删改（13 分类） |

### 通用删除确认弹窗
全站统一 `requestDeleteConfirm(title, content, action)` 调用，7 个触发场景：
- 列表行删除 / 批量删除
- 详情页合同 / 转正记录 / 考核人员 / 培训 / 附件删除

### 敏感字段脱敏
`maskIdCard`（前 6 + `***********` + 后 4）+ `maskPhone`（前 3 + `****` + 后 4），hover 揭示明文，应用位置：列表手机号、详情身份证 / 联系电话 / 紧急电话 / 家庭成员电话 / 工作经历证明人电话。

## 部署

GitHub Actions 在 `.github/workflows/` 配置：推 `main` → 自动 `npm run build` → 发布到 GitHub Pages `/material-system/` 子路径。

`vite.config.ts` 已配置：
- `base: '/material-system/'`（仅 build 模式）
- 路径别名 `@` → `src/`
- SCSS 自动注入 `variables.scss` 到每个组件

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

MIT
