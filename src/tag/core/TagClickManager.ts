/**
 * 标签点击管理器
 * 负责处理标签点击后的搜索面板
 */

import type { GroupedResults, SearchScope } from '../types'
import { findTagElement, isInEditArea } from '../utils/dom'
import Logger from '../utils/logger'
import { TagRenderer } from './TagRenderer'
import { TagSearch } from './TagSearch'
import { TagSearchPanel } from '../ui/TagSearchPanel'

export class TagClickManager {
  private isInitialized = false
  private debugMode = false
  private currentScope: SearchScope = 'notebook'
  private searchManager: TagSearch
  private renderer: TagRenderer
  private panel: TagSearchPanel

  constructor() {
    this.searchManager = new TagSearch()
    this.renderer = new TagRenderer()
    this.panel = new TagSearchPanel()
  }

  /**
   * 开启调试模式
   */
  enableDebug(): void {
    this.debugMode = true
    this.searchManager.enableDebug()
    Logger.log('✅ 调试模式已开启')
  }

  /**
   * 关闭调试模式
   */
  disableDebug(): void {
    this.debugMode = false
    this.searchManager.disableDebug()
    Logger.log('❌ 调试模式已关闭')
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
    }, 2000)
  }

  /**
   * 设置标签点击监听
   */
  private setupTagClickListener(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement

      if (!isInEditArea(target)) {
        return
      }

      const tagElement = findTagElement(target)

      if (tagElement) {
        Logger.log('🏷️ 检测到标签点击')

        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        const tagText = tagElement.textContent?.trim() || ''
        Logger.log('标签内容:', tagText)

        setTimeout(() => {
          this.showTagSearchPanel(tagText)
        }, 0)

        return false
      }
    }, true)

    document.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement

      if (!isInEditArea(target)) {
        return
      }

      const tagElement = findTagElement(target)

      if (tagElement) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }, true)

    Logger.log('✅ 标签点击监听已注册')
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

  /**
   * 跳转到指定块
   */
  private navigateToBlock(blockId: string): void {
    Logger.log('🔗 跳转到块:', blockId)
    const url = `siyuan://blocks/${blockId}`
    window.location.href = url
  }
}


