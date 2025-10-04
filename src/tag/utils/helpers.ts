/**
 * 辅助工具函数
 */

/**
 * 检查是否有文本被选中
 */
export function hasTextSelection(): boolean {
  const selection = window.getSelection()
  const selectedText = selection ? selection.toString().trim() : ''
  return selectedText.length > 0
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    }
    else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 常量配置
 */
export const CONFIG = {
  // 初始化延迟
  INIT_DELAY: 1000, // 1秒，替代硬编码的 2000

  // 移动端配置
  DOUBLE_TAP_DELAY: 300,
  LONG_PRESS_THRESHOLD: 500,
  LONG_PRESS_COOLDOWN: 1000,

  // 缓存配置
  STATE_CACHE_TIMEOUT: 100,

  // 节流配置
  TOUCH_MOVE_THROTTLE: 50,
} as const

