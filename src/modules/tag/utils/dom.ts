/**
 * DOM 工具函数
 */

/**
 * 查找块元素
 */
export function findBlockElement(node: Node): HTMLElement | null {
  let current = node
  let depth = 0
  const maxDepth = 10

  while (current && depth < maxDepth) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement
      const nodeId = element.getAttribute('data-node-id')
      const dataType = element.getAttribute('data-type')

      if (nodeId && dataType && !element.classList.contains('protyle-wysiwyg')) {
        return element
      }
    }
    current = current.parentNode!
    depth++
  }

  return null
}

/**
 * 检查块是否包含复杂样式
 */
export function hasComplexStyles(blockElement: HTMLElement): boolean {
  try {
    const innerHTML = blockElement.innerHTML

    // 检查内联样式
    if (innerHTML.includes('style=')) {
      return true
    }

    // 检查代码块
    if (
      blockElement.getAttribute('data-type') === 'code'
      || blockElement.querySelector('code')
      || blockElement.classList.contains('code-block')
      || innerHTML.includes('hljs')
    ) {
      return true
    }

    // 检查数学公式
    if (
      blockElement.getAttribute('data-type') === 'mathBlock'
      || blockElement.querySelector('.katex')
      || innerHTML.includes('\\(')
      || innerHTML.includes('\\[')
      || innerHTML.includes('katex')
    ) {
      return true
    }

    return false
  }
  catch {
    return true
  }
}

/**
 * 检查是否在编辑区域内
 * 使用白名单方式：只允许在 protyle-wysiwyg 或 protyle-content 容器内
 */
export function isInEditArea(element: HTMLElement): boolean {
  let current: HTMLElement | null = element
  let depth = 0
  const maxDepth = 15

  while (current && depth < maxDepth) {
    const className = String(current.className || '')

    // 白名单：只要在这些编辑器容器内就认为是编辑区域
    if (
      className.includes('protyle-wysiwyg')
      || className.includes('protyle-content')
    ) {
      return true
    }

    // 到达 body 标签停止查找
    if (current.tagName === 'BODY') {
      return false
    }

    current = current.parentElement
    depth++
  }

  return false
}

/**
 * 查找标签元素
 */
export function findTagElement(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element
  let depth = 0
  const maxDepth = 6

  while (current && depth < maxDepth) {
    const dataType = current.getAttribute('data-type')
    const className = String(current.className || '')
    const textContent = current.textContent?.trim() || ''

    if (isDocumentTag(current, dataType, className, textContent)) {
      return current
    }

    current = current.parentElement
    depth++
  }

  return null
}

/**
 * 判断是否是文档中的真实标签
 * 使用白名单方式：只认可在编辑区内的标签元素
 */
function isDocumentTag(
  element: HTMLElement,
  dataType: string | null,
  className: string,
  textContent: string,
): boolean {
  // 白名单：必须在编辑区域内
  const editorContainer = element.closest('.protyle-wysiwyg, .protyle-content')
  if (!editorContainer) {
    return false
  }

  // 1. SiYuan 官方标签格式：data-type="tag"
  if (dataType === 'tag') {
    return true
  }

  // 2. #标签# 格式
  if (element.tagName === 'SPAN' && textContent.match(/^#[^#\s<>]+#$/)) {
    return true
  }

  // 3. className 包含 'tag' 的情况
  if (className.includes('tag')) {
    return true
  }

  return false
}

/**
 * 提取文本内容
 */
export function extractTextContent(htmlContent: string): string {
  if (!htmlContent)
    return ''

  try {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    return tempDiv.textContent || tempDiv.innerText || ''
  }
  catch {
    return htmlContent.replace(/<[^>]*>/g, '')
  }
}


