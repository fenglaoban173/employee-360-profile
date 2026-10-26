/**
 * 通用格式化 / 脱敏工具
 */

import type { EmployeeStatus } from '@/views/employee-profile/data'

/**
 * 在职状态文案
 * 实习生员工口径不同：未转正叫「实习期」，转正后叫「在职」
 * 其他类别：试用期叫「试用期」，已转正叫「已转正」
 */
export const employeeStatusText = (
  status: EmployeeStatus,
  employeeCategory?: string,
): string => {
  if (employeeCategory === '实习生员工') {
    return { active: '在职', probation: '实习期', leave: '休假', resigned: '离职' }[status]
  }
  return { active: '已转正', probation: '试用期', leave: '休假', resigned: '离职' }[status]
}

/**
 * 身份证号脱敏：保留前 6 位 + 后 4 位，中间用 11 个 * 替代
 * 非 18 位字符串原样返回（防止空值/异常数据被破坏）
 */
export const maskIdCard = (id: string): string => {
  if (!id || id.length !== 18) return id
  return `${id.slice(0, 6)}***********${id.slice(-4)}`
}

/**
 * 手机号脱敏：保留前 3 位 + 后 4 位，中间用 4 个 * 替代
 * （11 位手机号 → "前3 + 4* + 后4"）
 * 自动剥离常见分隔符（空格 / 横线 / 括号），所以 "138-0001-0001"、"138 0001 0001" 都能正确脱敏
 * 剥离后非 11 位原样返回
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return phone
  const digits = phone.replace(/[\s\-()]/g, '')
  if (digits.length !== 11) return phone
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`
}

/**
 * 解析时间字符串
 * 兼容 'YYYY-MM-DD HH:mm'（飞书同步的审批时间格式）和 ISO 字符串
 * 注意：Safari 不认空格分隔的日期时间，统一转成 'YYYY-MM-DDTHH:mm' 再解析
 */
const parseDateTime = (time: string): Date | null => {
  if (!time) return null
  const normalized = time.replace(' ', 'T')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

/**
 * 相对时间：刚刚 / N 分钟前 / N 小时前 / N 天前 / N 个月前 / N 年前
 */
export const relativeTime = (time: string): string => {
  const t = parseDateTime(time)
  if (!t) return '—'
  const diff = Date.now() - t.getTime()
  if (diff < 0) return '刚刚'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}

/**
 * 简短绝对时间：9月9日 11:07
 */
export const formatShortDateTime = (time: string): string => {
  const t = parseDateTime(time)
  if (!t) return '—'
  const month = t.getMonth() + 1
  const day = t.getDate()
  const hh = String(t.getHours()).padStart(2, '0')
  const mm = String(t.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hh}:${mm}`
}
