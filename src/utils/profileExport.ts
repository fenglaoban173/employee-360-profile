import JSZip from 'jszip'
import ExcelJS from 'exceljs'
import type {
  Employee,
  Attachment,
  GrowthRecord,
  Contract,
  TrainingRecord,
} from '@/views/employee-profile/data'
import { employeeStatusText, relativeTime, formatShortDateTime } from '@/utils/format'

/**
 * 员工档案导出工具
 * - 生成 9 个 sheet 的 Excel（首页信息 + 8 Tab）
 * - 打包所有附件（按原文件名）
 * - 一起塞进 zip
 *
 * 详情页「导出档案」与列表页「批量导出」共用同一套 sheet 构建逻辑，
 * 保证单人和批量导出的 Excel 内容完全一致。
 */

const sanitizeName = (name: string): string =>
  name.replace(/[\\/:*?"<>|]/g, '_').trim() || '未命名'

const statusText = (s: Employee['status'], category?: string) =>
  employeeStatusText(s, category)

/** 培训方：内部取讲师，外部取机构名称 */
const trainingParty = (t: TrainingRecord) =>
  t.type === '内部' ? t.lecturer : t.institution

/** 司龄 */
const calcTenure = (entryDate: string, departureDate?: string): string => {
  if (!entryDate) return '—'
  const start = new Date(entryDate)
  const end = departureDate ? new Date(departureDate) : new Date()
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  const years = Math.floor(months / 12)
  const m = months % 12
  if (years <= 0) return `${months} 个月`
  if (m <= 0) return `${years} 年`
  return `${years} 年 ${m} 个月`
}

/** 通用：sheet 标题行（粗体白底蓝字），span 控制标题合并的列数 */
const writeTitle = (ws: ExcelJS.Worksheet, title: string, span = 4) => {
  ws.mergeCells(1, 1, 1, span)
  const cell = ws.getCell(1, 1)
  cell.value = title
  cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF165DFF' },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(1).height = 28
}

/** 通用：单元格细边框（每次返回新对象，避免 exceljs 复用同一引用） */
const cellBorder = (): Partial<ExcelJS.Borders> => ({
  top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
})

/** 通用：分区小标题（如「审批详情」「审批记录」），横向合并 span 列 */
const writeSectionLabel = (
  ws: ExcelJS.Worksheet,
  rowIndex: number,
  span: number,
  text: string
) => {
  const row = ws.getRow(rowIndex)
  for (let c = 1; c <= span; c++) {
    const cell = row.getCell(c)
    if (c === 1) cell.value = text
    cell.font = { bold: true, size: 11, color: { argb: 'FF1D2129' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  }
  ws.mergeCells(rowIndex, 1, rowIndex, span)
  row.height = 24
}

/** 通用：合并单元格并把样式逐格套用（ExcelJS 合并后需逐格赋值，边框才完整） */
const mergeStyled = (
  ws: ExcelJS.Worksheet,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  apply: (cell: ExcelJS.Cell) => void
) => {
  ws.mergeCells(r1, c1, r2, c2)
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) apply(ws.getCell(r, c))
  }
}

/** 通用：表头行（粗体灰底），startCol 指定起始列 */
const writeHeader = (
  ws: ExcelJS.Worksheet,
  rowIndex: number,
  headers: string[],
  startCol = 1
) => {
  const row = ws.getRow(rowIndex)
  headers.forEach((h, i) => {
    const cell = row.getCell(startCol + i)
    cell.value = h
    cell.font = { bold: true, color: { argb: 'FF1D2129' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F3F5' },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
  })
  row.height = 22
}

/** 通用：填充一行数据 */
const writeRow = (ws: ExcelJS.Worksheet, rowIndex: number, values: (string | number | undefined | null)[]) => {
  const row = ws.getRow(rowIndex)
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1)
    cell.value = (v ?? '—') as string | number
    cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
  })
  row.height = 20
}

/** 通用：键值对 sheet（字段名 | 值） */
const writeKV = (
  ws: ExcelJS.Worksheet,
  startRow: number,
  pairs: [string, string | number | undefined | null][]
) => {
  pairs.forEach(([k, v], i) => {
    const r = startRow + i
    const keyCell = ws.getCell(r, 1)
    keyCell.value = k
    keyCell.font = { bold: true, color: { argb: 'FF4E5969' } }
    keyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } }
    keyCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    keyCell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
    const valCell = ws.getCell(r, 2)
    valCell.value = (v ?? '—') as string | number
    valCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    valCell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
    ws.getRow(r).height = 20
  })
}

/** 成长记录节点标题映射（避免 sheet 里出现英文 type） */
const growthTypeText: Record<GrowthRecord['type'], string> = {
  entry: '入职',
  regularization: '转正',
  training: '培训',
  performance: '绩效',
  transfer: '调岗',
  promotion: '晋升',
  salary: '调薪',
  resignation: '离职',
}

/** 审批结果配色：节点圆点色 + 结果文字色（与详情页时间轴一致） */
const approvalTone = (result: string): { dot: string; text: string } => {
  if (result === '已同意' || result === '自动通过') {
    return { dot: 'FF52C41A', text: 'FF389E0D' }
  }
  if (result === '已拒绝' || result === '已撤销') {
    return { dot: 'FFF5222D', text: 'FFCF1322' }
  }
  if (result === '已提交') return { dot: 'FF8C8C8C', text: 'FF595959' }
  return { dot: 'FF1677FF', text: 'FF0958D9' }
}

// ============ 各 sheet 构造 ============

const buildHomeSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('首页信息')
  ws.columns = [{ width: 22 }, { width: 38 }, { width: 22 }, { width: 38 }]

  writeTitle(ws, '员工档案 · 首页信息')

  // 顶部 1 行：姓名 + 工号
  writeKV(ws, 3, [
    ['姓名', e.name],
    ['工号', e.employeeNo],
  ])
  // 第 3 行右边两列也要写值
  ws.getCell(3, 3).value = '工号'
  ws.getCell(3, 3).font = { bold: true, color: { argb: 'FF4E5969' } }
  ws.getCell(3, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } }
  ws.getCell(3, 3).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getCell(3, 4).value = e.employeeNo
  ws.getCell(3, 4).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  // 边框补全
  for (let c = 3; c <= 4; c++) {
    const cell = ws.getCell(3, c)
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
  }

  // 从第 5 行开始写主要字段（4 列布局：键/值/键/值）
  const fields: [string, string][] = [
    ['部门', e.department],
    ['岗位', e.position],
    ['直属领导', e.reportTo],
    ['工作地点', e.workLocation],
    ['合同类型', e.contractType],
    ['合同到期', e.contractEnd],
    ['员工类别', e.employeeCategory],
    ['在职状态', statusText(e.status, e.employeeCategory)],
    ['入职日期', e.entryDate],
    ['司龄', calcTenure(e.entryDate, e.departureDate)],
    ['转正日期', e.regularizations?.[0]?.date ?? '—'],
    ['离职日期', e.departureDate ?? '—'],
  ]

  let r = 5
  for (let i = 0; i < fields.length; i += 2) {
    const [k1, v1] = fields[i]
    const [k2, v2] = fields[i + 1] ?? ['', '']
    const keyStyle = (val: string) => {
      const cell = ws.getCell(r, val === k1 ? 1 : 3)
      cell.value = val
      cell.font = { bold: true, color: { argb: 'FF4E5969' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } }
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    }
    const valStyle = (col: number, val: string) => {
      const cell = ws.getCell(r, col)
      cell.value = val || '—'
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    }
    const border: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
    ;[1, 2, 3, 4].forEach(c => {
      ws.getCell(r, c).border = border
    })
    keyStyle(k1)
    valStyle(2, v1)
    if (k2) {
      keyStyle(k2)
      valStyle(4, v2)
    } else {
      ws.getCell(r, 3).value = ''
      ws.getCell(r, 4).value = ''
    }
    ws.getRow(r).height = 20
    r++
  }
}

const buildBasicInfoSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('基本信息')
  ws.columns = [{ width: 22 }, { width: 50 }]

  writeTitle(ws, '基本信息 · Tab 1')

  let r = 3
  // 个人信息
  ws.getCell(r, 1).value = '【个人信息】'
  ws.getCell(r, 1).font = { bold: true, color: { argb: 'FF165DFF' } }
  ws.mergeCells(r, 1, r, 2)
  r++
  writeKV(ws, r, [
    ['姓名', e.name],
    ['性别', e.gender],
    ['民族', e.ethnicity],
    ['出生日期', e.birthDate],
    ['婚姻状况', e.maritalStatus],
    ['身份证号', e.idCard],
    ['联系电话', e.phone],
    ['紧急联系电话', e.emergencyPhone],
    ['电子邮箱', e.email],
    ['现在住址', e.address],
    ['户藉地址', e.hukouAddress],
    ['籍贯', e.nativePlace],
    ['最高学历', e.highestEducation],
    ['毕业院校', e.graduateSchool],
    ['紧急情况联系人', e.emergencyContact],
    ['是否与原单位解除劳动合同',
      e.contractReleased === undefined ? '—' : e.contractReleased ? '是' : '否'],
  ])
  r += 16
  // 在职信息
  ws.getCell(r, 1).value = '【在职信息】'
  ws.getCell(r, 1).font = { bold: true, color: { argb: 'FF165DFF' } }
  ws.mergeCells(r, 1, r, 2)
  r++
  writeKV(ws, r, [
    ['员工编号', e.employeeNo],
    ['在职状态', statusText(e.status, e.employeeCategory)],
    ['司龄', calcTenure(e.entryDate, e.departureDate)],
    ['员工类别', e.employeeCategory],
    ['合同类型', e.contractType],
    ['入职日期', e.entryDate],
    ['转正日期', e.regularizations?.[0]?.date ?? '—'],
    ['离职日期', e.departureDate ?? '—'],
  ])
  r += 8
  // 成长记录
  ws.getCell(r, 1).value = '【员工成长记录】'
  ws.getCell(r, 1).font = { bold: true, color: { argb: 'FF165DFF' } }
  ws.mergeCells(r, 1, r, 2)
  r++
  const growthByType: Record<string, GrowthRecord[]> = {}
  e.growthRecords.forEach(g => {
    growthByType[g.type] = growthByType[g.type] || []
    growthByType[g.type].push(g)
  })
  ;(Object.keys(growthTypeText) as GrowthRecord['type'][]).forEach(type => {
    const records = growthByType[type] || []
    ws.getCell(r, 1).value = `${growthTypeText[type]}（${records.length ? '已完成' : '未发生'}）`
    ws.getCell(r, 1).font = { bold: true }
    ws.getCell(r, 2).value = records.length
      ? records
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map(rec => `[${rec.date}] ${rec.title}${rec.description ? ' — ' + rec.description.replace(/\n/g, ' ') : ''}`)
          .join('\n')
      : '—'
    ws.getCell(r, 2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 }
    ws.getRow(r).height = Math.max(20, records.length * 18)
    const border: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E6EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E6EB' } },
    }
    ws.getCell(r, 1).border = border
    ws.getCell(r, 2).border = border
    r++
  })
}

const buildFamilySheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('家庭成员')
  ws.columns = [
    { width: 14 }, { width: 16 }, { width: 30 }, { width: 18 },
  ]
  writeTitle(ws, '家庭成员 · Tab 2')
  writeHeader(ws, 3, ['成员关系', '姓名', '工作单位', '电话'])
  if (e.family.length === 0) {
    ws.getCell(4, 1).value = '暂无家庭成员'
    ws.mergeCells(4, 1, 4, 4)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.family.forEach((f, i) => writeRow(ws, 4 + i, [f.relation, f.name, f.company, f.phone]))
  }
}

const buildWorkHistorySheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('工作经历')
  ws.columns = [
    { width: 26 }, { width: 24 }, { width: 20 }, { width: 16 }, { width: 18 }, { width: 30 },
  ]
  writeTitle(ws, '工作经历 · Tab 3')
  writeHeader(ws, 3, ['起止日期', '工作单位', '职务', '证明人', '证明人电话', '离职原因'])
  if (e.workHistory.length === 0) {
    ws.getCell(4, 1).value = '暂无工作经历'
    ws.mergeCells(4, 1, 4, 6)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.workHistory.forEach((w, i) => {
      const period = Array.isArray(w.period) ? `${w.period[0] ?? ''} ~ ${w.period[1] || '至今'}` : '—'
      writeRow(ws, 4 + i, [period, w.company, w.title, w.reference, w.referencePhone, w.reason])
    })
  }
}

const buildEducationSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('教育经历')
  ws.columns = [{ width: 26 }, { width: 18 }, { width: 28 }, { width: 22 }]
  writeTitle(ws, '教育经历 · Tab 4')
  writeHeader(ws, 3, ['起止日期', '学历/学位', '毕业学校', '专业'])
  if (e.educationHistory.length === 0) {
    ws.getCell(4, 1).value = '暂无教育经历'
    ws.mergeCells(4, 1, 4, 4)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.educationHistory.forEach((ed, i) => {
      const period = Array.isArray(ed.period)
        ? `${ed.period[0] ?? ''} ~ ${ed.period[1] || '至今'}`
        : '—'
      writeRow(ws, 4 + i, [period, ed.degree, ed.school, ed.major])
    })
  }
}

const buildContractSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('合同信息')
  ws.columns = [
    { width: 22 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 30 },
  ]
  writeTitle(ws, '合同信息 · Tab 5')
  writeHeader(ws, 3, ['合同名称', '合同类型', '开始日期', '结束日期', '岗位', '合同附件'])
  if (e.contracts.length === 0) {
    ws.getCell(4, 1).value = '暂无合同'
    ws.mergeCells(4, 1, 4, 6)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.contracts.forEach((c: Contract, i) => {
      writeRow(ws, 4 + i, [
        c.name,
        c.type,
        c.startDate,
        c.endDate,
        c.position,
        c.attachments?.length ? c.attachments.join(', ') : '—',
      ])
    })
  }
}

/**
 * 转正记录 sheet（数据由飞书审批同步，只读）
 * 上半部分：审批详情（部门 / 入职时间 / 转正日期 / 转正文档）
 * 下半部分：审批记录（节点名称 / 审批人 / 审批结果 / 审批意见 / 审批时间）
 */
const buildRegularizationSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('转正记录')
  // A 列 = 节点线（圆点 + 竖线），B~F = 节点名称 / 审批人 / 审批结果 / 审批意见 / 审批时间
  ws.columns = [
    { width: 3 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 40 }, { width: 22 },
  ]
  writeTitle(ws, '转正记录 · Tab 6', 6)

  const rec = e.regularizations?.[0]

  // ===== 审批详情 =====
  writeSectionLabel(ws, 3, 6, '审批详情')
  const details: [string, string | undefined][] = [
    ['部门', e.department],
    ['入职时间', e.entryDate],
    ['转正日期', rec?.date],
    ['转正文档', rec?.doc?.name],
    ['文档链接', rec?.doc?.url],
  ]
  details.forEach(([k, v], i) => {
    const r = 4 + i
    mergeStyled(ws, r, 1, r, 2, (cell) => {
      cell.font = { bold: true, color: { argb: 'FF4E5969' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } }
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
      cell.border = cellBorder()
    })
    ws.getCell(r, 1).value = k
    mergeStyled(ws, r, 3, r, 6, (cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
      cell.border = cellBorder()
    })
    ws.getCell(r, 3).value = (v ?? '—') as string
    ws.getRow(r).height = 20
  })

  // ===== 审批记录：竖版时间轴 =====
  const sectionRow = 4 + details.length + 1
  writeSectionLabel(ws, sectionRow, 6, '审批记录')
  const colHeaderRow = sectionRow + 1
  writeHeader(ws, colHeaderRow, [
    '节点名称', '审批人', '审批结果', '审批意见', '审批时间',
  ], 2)

  const approvals = rec?.approvals || []
  if (approvals.length === 0) {
    const r = colHeaderRow + 1
    mergeStyled(ws, r, 1, r, 6, (cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    ws.getCell(r, 1).value = rec ? '暂无审批记录' : '暂无转正记录'
    return
  }

  approvals.forEach((a, i) => {
    const r = colHeaderRow + 1 + i
    const tone = approvalTone(a.result)

    // 左侧节点：圆点 + 竖向连线（用单元格右边框画竖线，逐行连续）
    const nodeCell = ws.getCell(r, 1)
    nodeCell.value = '●'
    nodeCell.font = { size: 10, color: { argb: tone.dot } }
    nodeCell.alignment = { vertical: 'middle', horizontal: 'right' }
    nodeCell.border = {
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    }

    // 右侧内容
    const put = (col: number, value: string, align: 'left' | 'center' = 'left') => {
      const cell = ws.getCell(r, col)
      cell.value = value
      cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFE5E6EB' } },
      }
    }
    put(2, a.node)
    put(3, a.approver)
    put(4, a.result, 'center')
    put(5, a.comment ?? '—')
    if (!a.comment) {
      ws.getCell(r, 5).font = { color: { argb: 'FFBFBFBF' } }
    }
    // 审批结果按状态着色（对应页面上的彩色标签）
    ws.getCell(r, 4).font = { bold: true, color: { argb: tone.text } }

    // 时间：相对时间在上、绝对时间在下（与页面一致）
    const timeCell = ws.getCell(r, 6)
    timeCell.value = `${relativeTime(a.time)}\n${formatShortDateTime(a.time)}`
    timeCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true }
    timeCell.border = {
      bottom: { style: 'hair', color: { argb: 'FFE5E6EB' } },
    }
    // 行高不写死，留给 Excel 按换行内容自动撑开
  })
}

const buildTrainingSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('培训记录')
  ws.columns = [
    { width: 24 }, { width: 14 }, { width: 12 }, { width: 18 }, { width: 12 }, { width: 20 }, { width: 30 },
  ]
  writeTitle(ws, '培训记录 · Tab 7')
  writeHeader(ws, 3, ['培训名称', '培训日期', '培训类型', '培训方', '培训时长', '培训地点', '备注'])
  if (e.trainings.length === 0) {
    ws.getCell(4, 1).value = '暂无培训记录'
    ws.mergeCells(4, 1, 4, 7)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.trainings.forEach((t: TrainingRecord, i) => {
      writeRow(ws, 4 + i, [
        t.name,
        t.date,
        t.type === '内部' ? '内部' : t.type === '外部' ? '外部' : t.type,
        trainingParty(t) || '—',
        t.duration ? `${t.duration} 小时` : '—',
        t.location ?? '—',
        t.remark ?? '—',
      ])
    })
  }
}

const buildAttachmentSheet = (wb: ExcelJS.Workbook, e: Employee) => {
  const ws = wb.addWorksheet('附件资料')
  ws.columns = [
    { width: 30 }, { width: 18 }, { width: 12 }, { width: 12 }, { width: 16 }, { width: 14 },
  ]
  writeTitle(ws, '附件资料 · Tab 8')
  writeHeader(ws, 3, ['文件名', '文件类型', '文件格式', '大小', '上传人', '上传时间'])
  if (e.attachments.length === 0) {
    ws.getCell(4, 1).value = '暂无附件'
    ws.mergeCells(4, 1, 4, 6)
    ws.getCell(4, 1).alignment = { horizontal: 'center' }
  } else {
    e.attachments.forEach((a: Attachment, i) => {
      const ext = a.name.split('.').pop()?.toUpperCase() || '其他'
      writeRow(ws, 4 + i, [a.name, a.category, ext, a.size, a.uploader, a.uploadDate])
    })
  }
}

/** 生成单个附件的模拟文本内容 */
const buildAttachmentContent = (e: Employee, a: Attachment): string => {
  const now = new Date()
  return [
    '============================================================',
    `  ${a.name}（${a.category}）`,
    '============================================================',
    '',
    `员工姓名：${e.name}`,
    `工    号：${e.employeeNo}`,
    `部    门：${e.department}`,
    `文件类型：${a.category}`,
    `文件大小：${a.size}`,
    `上传人：${a.uploader}`,
    `上传时间：${a.uploadDate}`,
    `导出时间：${now.toLocaleString('zh-CN')}`,
    '',
    '------------------------------------------------------------',
    '  说明：',
    '  本文件为详情页导出档案功能的模拟内容，用于演示 zip 打包与下载。',
    '  实际部署时请调用后端接口，由后端生成真实文件后回传。',
    '------------------------------------------------------------',
  ].join('\n')
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ProfileExportResult {
  /** zip 内文件总数（不含文件夹） */
  fileCount: number
  /** 触发下载的 zip 文件名 */
  zipName: string
}

/**
 * 构建单个员工的 9 sheet Excel，返回 xlsx 二进制数据
 * 详情页导出 / 列表页批量导出共用
 */
export const buildEmployeeExcelBuffer = async (
  employee: Employee
): Promise<Uint8Array> => {
  const wb = new ExcelJS.Workbook()
  wb.creator = '员工 360° 档案'
  wb.created = new Date()
  buildHomeSheet(wb, employee)
  buildBasicInfoSheet(wb, employee)
  buildFamilySheet(wb, employee)
  buildWorkHistorySheet(wb, employee)
  buildEducationSheet(wb, employee)
  buildContractSheet(wb, employee)
  buildRegularizationSheet(wb, employee)
  buildTrainingSheet(wb, employee)
  buildAttachmentSheet(wb, employee)
  // exceljs 返回 Node Buffer，这里转成标准 Uint8Array（浏览器 / JSZip 通用）
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

/** 详情页：导出员工档案为 zip（含 9 sheet Excel + 所有附件原文件） */
export const downloadEmployeeProfile = async (
  employee: Employee
): Promise<ProfileExportResult> => {
  // 1. 生成 Excel
  const excelBuffer = await buildEmployeeExcelBuffer(employee)

  // 2. 打包 zip
  const zip = new JSZip()
  const date = new Date().toISOString().slice(0, 10)
  const safeName = sanitizeName(employee.name)
  const excelName = `员工档案_${safeName}_${date}.xlsx`
  zip.file(excelName, excelBuffer)

  const folder = zip.folder('附件')
  let attachCount = 0
  if (folder) {
    for (const a of employee.attachments) {
      folder.file(a.name, buildAttachmentContent(employee, a))
      attachCount++
    }
  }

  const zipName = `员工档案_${safeName}_${date}.zip`
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
  triggerDownload(blob, zipName)

  return {
    fileCount: 1 + attachCount, // Excel + 附件
    zipName,
  }
}
