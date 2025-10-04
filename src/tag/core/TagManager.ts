/**
 * 标签管理器
 * 负责标签添加和管理
 */

import type { PresetTag } from '../types'
import { PRESET_TAGS } from '../constants/presetTags'
import { findBlockElement, hasComplexStyles } from '../utils/dom'
import Logger from '../utils/logger'
import { TagDialog } from '../ui/TagDialog'
import { TagEventHandler } from '../ui/TagEventHandler'

declare global {
  interface Window {
    siyuan?: any
  }
}

export class TagManager {
  private isInitialized = false
  private debugMode = false
  private dialog: TagDialog
  private eventHandler: TagEventHandler

  constructor() {
    this.dialog = new TagDialog()
    this.eventHandler = new TagEventHandler(this)
  }

  /**
   * 开启调试模式
   */
  enableDebug(): void {
    this.debugMode = true
    Logger.log('✅ 调试模式已开启')
  }

  /**
   * 关闭调试模式
   */
  disableDebug(): void {
    this.debugMode = false
    Logger.log('❌ 调试模式已关闭')
  }

  /**
   * 初始化
   */
  initialize(): void {
    Logger.log('🚀 标签管理器初始化...')

    this.eventHandler.setupBlockClickListener()

    setTimeout(() => {
      this.isInitialized = true
      Logger.log('✅ 标签管理器初始化完成')
    }, 2000)
  }

  /**
   * 显示标签面板
   */
  async showTagPanel(blockElement: HTMLElement): Promise<void> {
    const blockId = blockElement.getAttribute('data-node-id')
    const blockText = blockElement.textContent?.substring(0, 50) || ''

    Logger.log('显示标签面板:', { blockId, blockText })

    // 检查复杂样式
    if (hasComplexStyles(blockElement)) {
      this.dialog.showStyleWarning()
      return
    }

    // 显示标签选择对话框
    const selectedTag = await this.dialog.showTagSelection(blockText, Array.from(PRESET_TAGS))

    if (selectedTag) {
      Logger.log('📤 用户选择标签:', selectedTag.name)

      // 检查文档状态
      if (this.isDocumentEditable()) {
        Logger.error('🛡️ 文档处于可编辑状态，拒绝添加标签')
        this.dialog.showEditableWarning()
        return
      }

      // 添加标签
      await this.performAddTag(blockElement, selectedTag)
    }
  }

  /**
   * 检查文档是否可编辑
   */
  private isDocumentEditable(): boolean {
    try {
      const editors = window.siyuan?.getAllEditor?.() || []

      for (const editor of editors) {
        if (editor?.protyle?.disabled === false) {
          return true
        }
      }

      return false
    }
    catch (error) {
      Logger.error('检查文档状态失败:', error)
      return false
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
      currentHTML = currentHTML.replace(/​+$/, '') // 移除零宽空格

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
      const result = await updateBlock('dom', newContent, blockId)

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
      const selection = window.getSelection()
      const selectedText = selection ? selection.toString().trim() : ''

      if (selectedText.length > 0) {
        Logger.log('检测到文本选中，不显示标签面板')
        return
      }

      // 检查只读状态
      const isDocReadonly = this.isDocumentReadonly()

      if (isDocReadonly) {
        Logger.log('右键/长按无文本选中，显示标签面板')
        this.showTagPanel(blockElement)
      }
    }
  }

  /**
   * 检查文档是否只读
   */
  private isDocumentReadonly(): boolean {
    try {
      const editors = window.siyuan?.getAllEditor?.() || []

      for (const editor of editors) {
        if (editor?.protyle?.disabled === true) {
          return true
        }
      }

      return false
    }
    catch (error) {
      Logger.error('检查只读状态失败:', error)
      return false
    }
  }
}


