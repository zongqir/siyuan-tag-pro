/**
 * 标签点击管理器
 * 负责处理标签点击后的搜索面板
 * 重构：使用 EventManager，优化事件监听策略
 */

import type {
  SearchScope,
} from '../types'
import Logger from '../../utils/logger'
import { TagSearchPanel } from '../ui/TagSearchPanel'
import {
  findTagElement,
  isInEditArea,
} from '../utils/dom'
import { CONFIG } from '../utils/helpers'
import { EventManager } from './EventManager'
import { TagRenderer } from './TagRenderer'
import { TagSearch } from './TagSearch'

export class TagClickManager {
  private isInitialized = false
  private currentScope: SearchScope = 'notebook'
  private searchManager: TagSearch
  private renderer: TagRenderer
  private panel: TagSearchPanel
  private eventManager: EventManager

  constructor() {
    this.searchManager = new TagSearch()
    this.renderer = new TagRenderer()
    this.panel = new TagSearchPanel()
    this.eventManager = new EventManager()
  }

  /**
   * 初始化
   */
  initialize(): void {
    if (this.isInitialized) {
      return
    }

    setTimeout(() => {
      this.setupTagClickListener()
      this.isInitialized = true
      Logger.log('✅ 标签点击管理器初始化完成')
    }, CONFIG.INIT_DELAY)
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    Logger.log('🧹 开始清理 TagClickManager...')

    this.eventManager.cleanup()
    this.isInitialized = false

    Logger.log('✅ TagClickManager 已清理')
  }

  /**
   * 设置标签点击监听
   * 优化：只监听编辑区域，而不是整个 document
   */
  private setupTagClickListener(): void {
    // 使用事件委托，监听 click 事件
    this.eventManager.addEventListener(
      document,
      'click',
      this.handleClick.bind(this),
      { capture: true },
    )

    // 监听 mousedown 防止默认行为
    this.eventManager.addEventListener(
      document,
      'mousedown',
      this.handleMouseDown.bind(this),
      { capture: true },
    )

    Logger.log('✅ 标签点击监听已注册')
  }

  /**
   * 处理点击事件
   */
  private handleClick(e: Event): void {
    const event = e as MouseEvent
    const target = event.target as HTMLElement

    // 快速判断：不在编辑区域直接返回
    if (!isInEditArea(target)) {
      return
    }

    const tagElement = findTagElement(target)

    if (tagElement) {
      Logger.log('🏷️ 检测到标签点击')

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const tagText = tagElement.textContent?.trim() || ''
      Logger.log('标签内容:', tagText)

      // 异步显示面板，避免阻塞
      setTimeout(() => {
        this.showTagSearchPanel(tagText)
      }, 0)
    }
  }

  /**
   * 处理 mousedown 事件
   */
  private handleMouseDown(e: Event): void {
    const event = e as MouseEvent
    const target = event.target as HTMLElement

    // 快速判断：不在编辑区域直接返回
    if (!isInEditArea(target)) {
      return
    }

    const tagElement = findTagElement(target)

    if (tagElement) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
  }

  /**
   * 显示标签搜索面板
   */
  private async showTagSearchPanel(
    tagText: string,
    scope: SearchScope = this.currentScope,
    availableTags?: string[],
  ): Promise<void> {
    Logger.log('🔍 开始标签搜索')
    Logger.log('标签文本:', tagText)
    Logger.log('搜索范围:', scope)

    try {
      // 获取可用标签
      if (!availableTags) {
        Logger.log('📋 获取可用标签...')
        availableTags = await this.searchManager.getAllAvailableTags(scope)
      }

      // 搜索
      const results = await this.searchManager.searchByTag(tagText, scope)
      Logger.log('搜索结果数量:', results.length)

      // 分组
      const groupedResults = this.searchManager.groupByDocument(results)

      // 显示面板
      this.panel.show(
        tagText,
        groupedResults,
        scope,
        availableTags,
        (blockId) => {
          this.navigateToBlock(blockId)
        },
        (newScope) => {
          Logger.log('🔄 切换搜索范围:', newScope)
          this.showTagSearchPanel(tagText, newScope, availableTags)
        },
        (newTag) => {
          Logger.log('🔄 切换标签:', newTag)
          this.showTagSearchPanel(newTag, scope, availableTags)
        },
      )

      Logger.log('========== 标签搜索结束 ==========')
    }
    catch (error) {
      Logger.error('标签搜索失败:', error)
    }
  }

  /**
   * 跳转到指定块
   */
  private navigateToBlock(blockId: string): void {
    Logger.log('🔗 跳转到块:', blockId)
    const url = `siyuan://blocks/${blockId}`
    window.location.href = url
  }
}
