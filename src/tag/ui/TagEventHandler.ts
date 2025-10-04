/**
 * 标签事件处理器
 * 负责处理标签相关的DOM事件
 */

import Logger from '../utils/logger'
import type { TagManager } from '../core/TagManager'

export class TagEventHandler {
  private manager: TagManager

  constructor(manager: TagManager) {
    this.manager = manager
  }

  /**
   * 设置块点击监听
   */
  setupBlockClickListener(): void {
    // 桌面版：监听右键
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement

      Logger.log('🎯 检测到 contextmenu 事件')

      const selection = window.getSelection()
      const selectedText = selection ? selection.toString().trim() : ''

      if (selectedText.length > 0) {
        Logger.log('检测到文本选中，不显示标签面板')
        return
      }

      e.preventDefault()
      e.stopPropagation()

      this.manager.onBlockClick(target)
    }, true)

    // 手机版：监听双击
    this.setupMobileDoubleTap()

    Logger.log('✅ 块点击监听已注册')
  }

  /**
   * 设置移动端双击监听
   */
  private setupMobileDoubleTap(): void {
    let lastTouchTime = 0
    let lastTouchTarget: HTMLElement | null = null
    let touchStartTime = 0
    let hasMoved = false
    let lastLongPressTime = 0
    const doubleTapDelay = 300
    const longPressThreshold = 500
    const longPressCooldown = 1000

    document.addEventListener('touchstart', () => {
      touchStartTime = Date.now()
      hasMoved = false
    }, { passive: true, capture: true })

    document.addEventListener('touchmove', () => {
      hasMoved = true
    }, { passive: true, capture: true })

    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement
      const currentTime = Date.now()
      const touchDuration = currentTime - touchStartTime
      const timeSinceLastTouch = currentTime - lastTouchTime
      const timeSinceLastLongPress = currentTime - lastLongPressTime

      Logger.log(`📱 touchend: duration=${touchDuration}ms, moved=${hasMoved}`)

      // 长按冷却期
      if (timeSinceLastLongPress < longPressCooldown) {
        Logger.log('📱 长按冷却期内，禁用双击')
        lastTouchTime = 0
        lastTouchTarget = null
        return
      }

      // 长按或移动，不算点击
      if (touchDuration > longPressThreshold || hasMoved) {
        Logger.log('📱 长按或移动，记录长按时间')
        lastLongPressTime = currentTime
        lastTouchTime = 0
        lastTouchTarget = null
        return
      }

      // 检查文本选中
      const selection = window.getSelection()
      const selectedText = selection ? selection.toString().trim() : ''
      if (selectedText.length > 0) {
        Logger.log('📱 检测到文本选中，禁用双击')
        lastLongPressTime = currentTime
        lastTouchTime = 0
        lastTouchTarget = null
        return
      }

      // 查找块元素
      const { findBlockElement } = require('../utils/dom')
      const blockElement = findBlockElement(target)

      if (blockElement) {
        // 检查双击
        if (lastTouchTarget === blockElement && timeSinceLastTouch < doubleTapDelay) {
          Logger.log('📱 检测到双击！')

          e.preventDefault()

          Logger.log('📱 双击触发，显示标签面板')
          this.manager.onBlockClick(target)

          // 重置
          lastTouchTime = 0
          lastTouchTarget = null
        }
        else {
          // 记录第一次点击
          lastTouchTime = currentTime
          lastTouchTarget = blockElement
          Logger.log('📱 记录第一次点击')
        }
      }
    }, { passive: false, capture: true })
  }
}


