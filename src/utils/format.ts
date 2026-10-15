/**
 * 通用格式化 / 脱敏工具
 */

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
