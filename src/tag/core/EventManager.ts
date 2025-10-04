/**
 * 事件管理器
 * 统一管理所有事件监听器，确保可以正确清理，防止内存泄漏
 */

import Logger from '../../utils/logger'

interface EventListener {
  target: EventTarget
  event: string
  handler: EventListenerOrEventListenerObject
  options?: AddEventListenerOptions
}

export class EventManager {
  private listeners: EventListener[] = []
  private isDestroyed = false

  /**
   * 注册事件监听器
   */
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ): void {
    if (this.isDestroyed) {
      Logger.error('EventManager 已销毁，无法添加监听器')
      return
    }

    target.addEventListener(event, handler, options)

    this.listeners.push({
      target,
      event,
      handler,
      options,
    })

    Logger.log(`✅ 注册事件监听器: ${event}`, options)
  }

  /**
   * 移除特定的事件监听器
   */
  removeEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
  ): void {
    target.removeEventListener(event, handler)

    const index = this.listeners.findIndex(
      (listener) =>
        listener.target === target
        && listener.event === event
        && listener.handler === handler,
    )

    if (index !== -1) {
      this.listeners.splice(index, 1)
      Logger.log(`🗑️ 移除事件监听器: ${event}`)
    }
  }

  /**
   * 清理所有事件监听器
   */
  cleanup(): void {
    if (this.isDestroyed) {
      return
    }

    Logger.log(`🧹 开始清理 ${this.listeners.length} 个事件监听器...`)

    for (const listener of this.listeners) {
      try {
        listener.target.removeEventListener(
          listener.event,
          listener.handler,
          listener.options,
        )
      }
      catch (error) {
        Logger.error('移除监听器失败:', error)
      }
    }

    this.listeners = []
    this.isDestroyed = true

    Logger.log('✅ 事件监听器清理完成')
  }

  /**
   * 获取当前监听器数量
   */
  getListenerCount(): number {
    return this.listeners.length
  }
}

