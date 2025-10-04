/**
 * 标签管理器
 * 负责标签添加和管理
 * 重构：解耦职责，使用 DocumentStateManager，支持清理
 */

import type { PresetTag } from '../types'
import Logger from '../../utils/logger'
import { PRESET_TAGS } from '../constants/presetTags'
import { TagDialog } from '../ui/TagDialog'
import { TagEventHandler } from '../ui/TagEventHandler'
import {
  findBlockElement,
  hasComplexStyles,
} from '../utils/dom'
import {
  CONFIG,
  hasTextSelection,
} from '../utils/helpers'
import { DocumentStateManager } from './DocumentStateManager'

export class TagManager {
  private isInitialized = false
  private dialog: TagDialog
  private eventHandler: TagEventHandler
  private stateManager: DocumentStateManager

  constructor() {
    this.dialog = new TagDialog()
    this.eventHandler = new TagEventHandler(this)
    this.stateManager = new DocumentStateManager()
  }

  /**
   * 初始化
   */
  initialize(): void {
    Logger.log('🚀 标签管理器初始化...')

    // 使用更合理的延迟
    setTimeout(() => {
      this.eventHandler.setupBlockClickListener()
      this.isInitialized = true
      Logger.log('✅ 标签管理器初始化完成')
    }, CONFIG.INIT_DELAY)
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    Logger.log('🧹 开始清理 TagManager...')

    this.eventHandler.cleanup()
    this.isInitialized = false

    Logger.log('✅ TagManager 已清理')
  }

  /**
   * 显示标签面板
   */
  async showTagPanel(blockElement: HTMLElement): Promise<void> {
    const blockId = blockElement.getAttribute('data-node-id')
    const blockText = blockElement.textContent?.substring(0, 50) || ''

    Logger.log('显示标签面板:', {
      blockId,
      blockText,
    })

    // 检查复杂样式
    if (hasComplexStyles(blockElement)) {
      this.dialog.showStyleWarning()
      return
    }

    // 显示标签选择对话框
    const selectedTag = await this.dialog.showTagSelection(blockText, Array.from(PRESET_TAGS))

    if (selectedTag) {
      Logger.log('📤 用户选择标签:', selectedTag.name)

      // 检查文档状态 - 使用 DocumentStateManager
      if (this.stateManager.isEditable()) {
        Logger.error('🛡️ 文档处于可编辑状态，拒绝添加标签')
        this.dialog.showEditableWarning()
        return
      }

      // 添加标签
      await this.performAddTag(blockElement, selectedTag)
    }
  }

  /**
   * 执行添加标签
   */
  private async performAddTag(blockElement: HTMLElement, tag: PresetTag): Promise<void> {
    try {
      Logger.log('🏷️ 开始添加标签...')

      const blockId = blockElement.getAttribute('data-node-id')
      if (!blockId) {
        throw new Error('未找到块ID')
      }

      // 获取可编辑区域
      const contentDiv = blockElement.querySelector('div[contenteditable]') as HTMLElement

      if (!contentDiv) {
        throw new Error('未找到可编辑的内容区域')
      }

      // 获取当前HTML内容
      let currentHTML = contentDiv.innerHTML.trim()
      currentHTML = currentHTML.replace(/\u200B+$/, '') // 移除零宽空格

      // 构建标签DOM
      const tagContent = `${tag.emoji}${tag.name}`
      const tagDOM = `<span data-type="tag">${tagContent}</span>`

      // 添加标签
      let newContent = currentHTML

      if (newContent && !newContent.endsWith(' ') && !newContent.endsWith('&nbsp;')) {
        newContent += ' '
      }

      newContent += tagDOM

      Logger.log('新DOM内容:', newContent)

      // 更新块
      const { updateBlock } = await import('../../api')
      await updateBlock('dom', newContent, blockId)

      Logger.log('✅ 标签添加成功:', {
        blockId,
        tagName: tag.name,
        emoji: tag.emoji,
      })
    }
    catch (error) {
      Logger.error('❌ 标签添加失败:', error)
      throw error
    }
  }

  /**
   * 处理块元素点击
   */
  onBlockClick(target: HTMLElement): void {
    const blockElement = findBlockElement(target)

    if (blockElement) {
      // 检查文本选中
      if (hasTextSelection()) {
        Logger.log('检测到文本选中，不显示标签面板')
        return
      }

      // 检查只读状态 - 使用 DocumentStateManager
      if (this.stateManager.isReadonly()) {
        Logger.log('右键/长按无文本选中，显示标签面板')
        this.showTagPanel(blockElement)
      }
    }
  }
}
