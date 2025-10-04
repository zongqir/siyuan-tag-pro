/**
 * 标签点击管理器
 * 负责处理标签点击后的搜索面板
 * 重构：使用 EventManager，优化事件监听策略
 */

import type {
  SearchScope,
} from '../types'
import Logger from '@shared/utils/logger'
import { TagSearchPanel } from '../ui/TagSearchPanel'
import { EventManager } from './EventManager'
import { TagSearch } from './TagSearch'

export class TagClickManager {
  private isInitialized = false
  private currentScope: SearchScope = 'notebook'
  private searchManager: TagSearch
  private panel: TagSearchPanel
  private eventManager: EventManager

  constructor() {
    this.searchManager = new TagSearch()
    this.panel = new TagSearchPanel()
    this.eventManager = new EventManager()
  }

  /**
   * 初始化
   * 注意：已禁用自动点击监听，面板功能保留供外部调用
   */
  initialize(): void {
    if (this.isInitialized) {
      return
    }

    // 不再自动注册点击监听器
    // this.setupTagClickListener()
    this.isInitialized = true
    Logger.log('✅ 标签点击管理器初始化完成（点击监听已禁用）')
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
   * 显示标签搜索面板
   * 公开方法，供外部调用
   */
  public async showTagSearchPanel(
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
