import JSZip from 'jszip'
import type { Employee, AttachmentCategory } from '@/views/employee-profile/data'
import { employeeStatusText } from '@/utils/format'

interface ExportInput {
  /** 已勾选的员工（已按列表顺序） */
  employees: Employee[]
  /** 每位员工的微调配置（key 不存在 = 沿用统一） */
  employeeSelections: Record<number, AttachmentCategory[]>
  /** 统一配置 */
  unifiedCategories: AttachmentCategory[]
}

interface ExportResult {
  /** 生成的 zip 内文件总数（不含文件夹） */
  fileCount: number
  /** 生成的 Excel 档案份数（每位员工一份） */
  excelCount: number
  /** 触发下载的 zip 文件名 */
  zipName: string
}

/** 移除 Windows / Unix 文件名非法字符 */
const sanitizeName = (name: string): string => {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '未命名'
}

/** 决定该员工某个导出项的最终文件名（优先用 mock data 中同名附件，去扩展名后拼上员工名） */
const buildFileName = (employee: Employee, category: AttachmentCategory): string => {
  const existing = employee.attachments.find(a => a.category === category)
  const baseName = existing?.name
    ? existing.name.replace(/\.[^.]+$/, '')
    : category
  return `${baseName}_${employee.name}.txt`
}

/** 生成单份「模拟文件」的文本内容（前端 mock 阶段） */
const buildFileContent = (employee: Employee, category: AttachmentCategory): string => {
  const now = new Date()
  const lines = [
    '============================================================',
    `  ${category}（模拟文件）`,
    '============================================================',
    '',
    `员工姓名：${employee.name}`,
    `工    号：${employee.employeeNo}`,
    `部    门：${employee.department}`,
    `岗    位：${employee.position}`,
    `员工类别：${employee.employeeCategory}`,
    `在职状态：${employeeStatusText(employee.status, employee.employeeCategory)}`,
    `文件分类：${category}`,
    `导出时间：${now.toLocaleString('zh-CN')}`,
    '',
    '------------------------------------------------------------',
    '  说明：',
    '  本文件为前端批量导出功能的模拟内容，用于演示 zip 打包与下载。',
    '  实际部署时请调用后端接口，由后端生成真实文件后回传。',
    '------------------------------------------------------------',
    '',
  ]
  return lines.join('\n')
}

/**
 * 触发浏览器下载一个 Blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 延迟释放，避免某些浏览器在 click 还没处理完时回收 URL
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 批量导出员工档案为 zip
 * - 每个员工 = 一个以「员工姓名」命名的文件夹
 * - 文件夹内 = 1 份 9 sheet 的 Excel 档案 + 该员工最终勾选的导出项对应的 .txt 模拟文件
 * - 导出项为空的员工仍会导出（至少含 Excel 档案），保证档案不缺失
 */
export const downloadBatchExport = async (input: ExportInput): Promise<ExportResult> => {
  // 动态引入：exceljs 体积较大（~1MB），只在真正导出时才加载，不进列表页首屏包
  const { buildEmployeeExcelBuffer } = await import('@/utils/profileExport')

  const zip = new JSZip()
  let fileCount = 0
  let excelCount = 0
  let employeeCount = 0

  for (const emp of input.employees) {
    // 微调优先；未自定义的员工 fallback 到统一配置
    const categories = input.employeeSelections[emp.id] ?? input.unifiedCategories

    const safeName = sanitizeName(emp.name)
    const folder = zip.folder(safeName)
    if (!folder) continue

    employeeCount++

    // 每位员工都附带一份 9 sheet 的 Excel 档案（与详情页「导出档案」内容一致）
    const excelBuffer = await buildEmployeeExcelBuffer(emp)
    folder.file(`员工档案_${safeName}.xlsx`, excelBuffer)
    fileCount++
    excelCount++

    for (const cat of categories) {
      folder.file(buildFileName(emp, cat), buildFileContent(emp, cat))
      fileCount++
    }
  }

  const date = new Date().toISOString().slice(0, 10)
  const zipName = `员工档案批量导出_${employeeCount}人_${fileCount}份_${date}.zip`

  // 生成 zip（默认 STORE 压缩，文本文件压缩率不高但生成最快）
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  triggerDownload(blob, zipName)

  return { fileCount, excelCount, zipName }
}
