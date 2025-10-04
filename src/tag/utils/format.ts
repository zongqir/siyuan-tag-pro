/**
 * 格式化工具函数
 */

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: string): string {
  if (!timestamp || timestamp === '未知时间')
    return '未知时间'

  try {
    // SiYuan时间戳格式：20241001182024
    const year = timestamp.substring(0, 4)
    const month = timestamp.substring(4, 6)
    const day = timestamp.substring(6, 8)
    const hour = timestamp.substring(8, 10)
    const minute = timestamp.substring(10, 12)

    return `${year}/${month}/${day} ${hour}:${minute}`
  }
  catch (error) {
    return timestamp
  }
}

/**
 * 转义HTML
 */
export function escapeHtml(text: string): string {
  if (!text)
    return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 转义正则表达式
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 提取文档名
 */
export function extractDocName(hpath: string): string {
  if (!hpath)
    return '未知文档'
  const parts = hpath.split('/')
  return parts[parts.length - 1] || '未知文档'
}

/**
 * 提取文本内容（去除HTML标签）
 */
export function extractTextContent(html: string): string {
  if (!html)
    return ''
  
  // 创建临时DOM元素来解析HTML
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 高亮文本中的标签
 */
export function highlightTag(text: string, tagText: string): string {
  if (!tagText)
    return escapeHtml(text)

  const escapedText = escapeHtml(text)
  const escapedTag = escapeRegExp(tagText)
  const regex = new RegExp(`(${escapedTag})`, 'gi')

  return escapedText.replace(
    regex,
    '<mark style="background: linear-gradient(135deg, var(--b3-theme-primary-light) 0%, var(--b3-theme-primary-lighter) 100%); color: var(--b3-theme-primary); padding: 2px 6px; border-radius: 6px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">$1</mark>',
  )
}

