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
 */
export function isInEditArea(element: HTMLElement): boolean {
  let current: HTMLElement | null = element
  let depth = 0
  const maxDepth = 15

  while (current && depth < maxDepth) {
    const className = String(current.className || '')
    const id = String(current.id || '')

    // 检查是否在编辑区域
    if (
      className.includes('protyle-wysiwyg')
      || className.includes('protyle-content')
      || (className.includes('protyle') && className.includes('fn__flex-1'))
    ) {
      return true
    }

    // 排除系统UI区域
    if (
      className.includes('toolbar')
      || className.includes('dock')
      || className.includes('fn__flex-shrink')
      || className.includes('layout__wnd')
      || className.includes('block__icon')
      || id.includes('toolbar')
      || id.includes('dock')
    ) {
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
 */
function isDocumentTag(
  element: HTMLElement,
  dataType: string | null,
  className: string,
  textContent: string,
): boolean {
  // SiYuan标签
  if (dataType === 'tag') {
    return true
  }

  // 排除系统UI元素
  if (
    className.includes('toolbar')
    || className.includes('dock')
    || className.includes('menu')
    || className.includes('dialog')
    || className.includes('breadcrumb')
    || className.includes('layout-tab-container')
    || className.includes('file-tree')
    || className.includes('sy__backlink')
  ) {
    return false
  }

  // #标签#格式
  if (element.tagName === 'SPAN' && textContent.match(/^#[^#\s<>]+#$/)) {
    const parentContainer = element.closest('.protyle-wysiwyg, .protyle-content')
    if (parentContainer) {
      return true
    }
  }

  // className包含tag的情况
  if (className.includes('tag')) {
    if (element.closest('.protyle-wysiwyg, .protyle-content')) {
      return true
    }
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


