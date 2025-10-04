/**
 * 标签事件处理器
 * 负责处理标签相关的DOM事件
 * 重构：使用 EventManager，支持清理，简化移动端逻辑
 */

import type { TagManager } from '../core/TagManager'
import Logger from '../../utils/logger'
import { EventManager } from '../core/EventManager'
import {
  CONFIG,
  hasTextSelection,
  throttle,
} from '../utils/helpers'

export class TagEventHandler {
  private manager: TagManager
  private eventManager: EventManager

  // 移动端状态
  private lastTouchTime = 0
  private lastTouchTarget: HTMLElement | null = null
  private touchStartTime = 0
  private hasMoved = false
  private lastLongPressTime = 0

  constructor(manager: TagManager) {
    this.manager = manager
    this.eventManager = new EventManager()
  }

  /**
   * 设置块点击监听
   */
  setupBlockClickListener(): void {
    // 桌面版：监听右键
    this.eventManager.addEventListener(
      document,
      'contextmenu',
      this.handleContextMenu.bind(this),
      { capture: true },
    )

    // 手机版：监听触摸事件
    this.setupMobileListeners()

    Logger.log('✅ 块点击监听已注册')
  }

  /**
   * 清理所有事件监听器
   */
  cleanup(): void {
    this.eventManager.cleanup()
    Logger.log('✅ TagEventHandler 已清理')
  }

  /**
   * 处理右键菜单事件
   */
  private handleContextMenu(e: Event): void {
    const event = e as MouseEvent
    const target = event.target as HTMLElement

    Logger.log('🎯 检测到 contextmenu 事件')

    // 检查文本选中
    if (hasTextSelection()) {
      Logger.log('检测到文本选中，不显示标签面板')
      return
    }

    event.preventDefault()
    event.stopPropagation()

    this.manager.onBlockClick(target)
  }

  /**
   * 设置移动端监听器
   */
  private setupMobileListeners(): void {
    // touchstart
    this.eventManager.addEventListener(
      document,
      'touchstart',
      this.handleTouchStart.bind(this),
      {
        passive: true,
        capture: true,
      },
    )

    // touchmove - 使用节流优化性能
    const throttledTouchMove = throttle(
      this.handleTouchMove.bind(this),
      CONFIG.TOUCH_MOVE_THROTTLE,
    )

    this.eventManager.addEventListener(
      document,
      'touchmove',
      throttledTouchMove,
      {
        passive: true,
        capture: true,
      },
    )

    // touchend
    this.eventManager.addEventListener(
      document,
      'touchend',
      this.handleTouchEnd.bind(this),
      {
        passive: false,
        capture: true,
      },
    )
  }

  /**
   * 处理 touchstart
   */
  private handleTouchStart(): void {
    this.touchStartTime = Date.now()
    this.hasMoved = false
  }

  /**
   * 处理 touchmove
   */
  private handleTouchMove(): void {
    this.hasMoved = true
  }

  /**
   * 处理 touchend
   */
  private handleTouchEnd(e: Event): void {
    const event = e as TouchEvent
    const target = event.target as HTMLElement
    const currentTime = Date.now()
    const touchDuration = currentTime - this.touchStartTime
    const timeSinceLastTouch = currentTime - this.lastTouchTime
    const timeSinceLastLongPress = currentTime - this.lastLongPressTime

    Logger.log(`📱 touchend: duration=${touchDuration}ms, moved=${this.hasMoved}`)

    // 长按冷却期
    if (timeSinceLastLongPress < CONFIG.LONG_PRESS_COOLDOWN) {
      Logger.log('📱 长按冷却期内，禁用双击')
      this.resetTouchState()
      return
    }

    // 长按或移动，不算点击
    if (touchDuration > CONFIG.LONG_PRESS_THRESHOLD || this.hasMoved) {
      Logger.log('📱 长按或移动，记录长按时间')
      this.lastLongPressTime = currentTime
      this.resetTouchState()
      return
    }

    // 检查文本选中
    if (hasTextSelection()) {
      Logger.log('📱 检测到文本选中，禁用双击')
      this.lastLongPressTime = currentTime
      this.resetTouchState()
      return
    }

    // 查找块元素
    const { findBlockElement } = require('../utils/dom')
    const blockElement = findBlockElement(target)

    if (blockElement) {
      // 检查双击
      if (this.lastTouchTarget === blockElement && timeSinceLastTouch < CONFIG.DOUBLE_TAP_DELAY) {
        Logger.log('📱 检测到双击！')

        event.preventDefault()

        Logger.log('📱 双击触发，显示标签面板')
        this.manager.onBlockClick(target)

        // 重置
        this.resetTouchState()
      }
      else {
        // 记录第一次点击
        this.lastTouchTime = currentTime
        this.lastTouchTarget = blockElement
        Logger.log('📱 记录第一次点击')
      }
    }
  }

  /**
   * 重置触摸状态
   */
  private resetTouchState(): void {
    this.lastTouchTime = 0
    this.lastTouchTarget = null
  }
}
