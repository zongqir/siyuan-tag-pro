/**
 * 文档状态管理器
 * 统一管理文档只读/可编辑状态检查，避免重复代码
 */

import Logger from '../../utils/logger'

declare global {
  interface Window {
    siyuan?: {
      getAllEditor?: () => Array<{
        protyle?: {
          disabled?: boolean
        }
      }>
    }
  }
}

export type DocumentState = 'readonly' | 'editable' | 'unknown'

export class DocumentStateManager {
  private cachedState: DocumentState | null = null
  private cacheTime = 0
  private cacheTimeout = 100 // 缓存 100ms，减少重复查询

  /**
   * 获取当前文档状态
   */
  getState(): DocumentState {
    const now = Date.now()

    // 使用缓存
    if (this.cachedState && (now - this.cacheTime) < this.cacheTimeout) {
      return this.cachedState
    }

    // 查询状态
    try {
      const editors = window.siyuan?.getAllEditor?.() || []

      if (editors.length === 0) {
        this.cachedState = 'unknown'
        this.cacheTime = now
        return 'unknown'
      }

      // 检查是否有只读编辑器
      const hasReadonly = editors.some((editor) => editor?.protyle?.disabled === true)
      const hasEditable = editors.some((editor) => editor?.protyle?.disabled === false)

      if (hasReadonly && !hasEditable) {
        this.cachedState = 'readonly'
      }
      else if (hasEditable && !hasReadonly) {
        this.cachedState = 'editable'
      }
      else {
        // 混合状态，取第一个编辑器的状态
        this.cachedState = editors[0]?.protyle?.disabled === true ? 'readonly' : 'editable'
      }

      this.cacheTime = now
      return this.cachedState
    }
    catch (error) {
      Logger.error('获取文档状态失败:', error)
      this.cachedState = 'unknown'
      this.cacheTime = now
      return 'unknown'
    }
  }

  /**
   * 检查文档是否只读
   */
  isReadonly(): boolean {
    return this.getState() === 'readonly'
  }

  /**
   * 检查文档是否可编辑
   */
  isEditable(): boolean {
    return this.getState() === 'editable'
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedState = null
    this.cacheTime = 0
  }
}

