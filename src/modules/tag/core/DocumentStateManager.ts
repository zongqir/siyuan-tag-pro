/**
 * 文档状态管理器
 * 统一管理文档只读/可编辑状态检查，避免重复代码
 * 参考 highlight_assistant 的实现
 */

import { getActiveEditor } from 'siyuan'
import Logger from '@shared/utils/logger'

export type DocumentState = 'readonly' | 'editable' | 'unknown'

export class DocumentStateManager {
  private cachedState: DocumentState | null = null
  private cacheTime = 0
  private cacheTimeout = 100 // 缓存 100ms，减少重复查询

  /**
   * 获取当前激活文档的锁按钮
   * 使用思源官方 getActiveEditor(false) API（v3.3.0+）
   */
  private getCurrentActiveReadonlyButton(): HTMLElement | null {
    try {
      const currentEditor = getActiveEditor(false)
      const currentProtyle = currentEditor?.protyle
      
      if (!currentProtyle?.element) {
        return null
      }
      
      const readonlyButton = currentProtyle.element.querySelector(
        '.protyle-breadcrumb > button[data-type="readonly"]'
      ) as HTMLButtonElement
      
      return readonlyButton
    }
    catch (error) {
      Logger.error('获取锁按钮失败:', error)
      return null
    }
  }

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
      const readonlyBtn = this.getCurrentActiveReadonlyButton()
      
      if (!readonlyBtn) {
        // 找不到锁按钮，假设可编辑
        this.cachedState = 'editable'
        this.cacheTime = now
        return 'editable'
      }

      // 判断逻辑：
      // 1. 优先使用 data-subtype 属性
      //    - "unlock" → 可编辑
      //    - 其他 → 只读
      // 2. 兜底使用图标判断
      const subtype = readonlyBtn.dataset.subtype || ''
      const iconHref = readonlyBtn.querySelector('use')?.getAttribute('xlink:href') || ''
      
      let isReadonly: boolean
      
      if (subtype) {
        // 优先使用 data-subtype
        isReadonly = subtype !== 'unlock'
      }
      else {
        // 兜底使用图标判断
        isReadonly = iconHref !== '#iconUnlock'
      }

      this.cachedState = isReadonly ? 'readonly' : 'editable'
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
   * 切换文档只读状态
   * @returns 切换后的状态
   */
  async toggleReadonly(): Promise<DocumentState> {
    try {
      const readonlyBtn = this.getCurrentActiveReadonlyButton()
      
      if (!readonlyBtn) {
        Logger.warn('未找到锁按钮，无法切换状态')
        return 'unknown'
      }

      // 点击按钮切换状态
      readonlyBtn.click()
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // 清除缓存，重新获取状态
      this.clearCache()
      const newState = this.getState()
      
      Logger.log('✅ 已切换状态:', newState)
      return newState
    }
    catch (error) {
      Logger.error('切换状态失败:', error)
      return 'unknown'
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedState = null
    this.cacheTime = 0
  }
}

