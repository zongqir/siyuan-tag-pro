/**
 * 标签搜索面板UI
 * 负责显示标签搜索结果面板
 */

import type {
  GroupedResults,
  SearchScope,
} from '../types'
import Logger from '../../utils/logger'
import { TagRenderer } from '../core/TagRenderer'

export class TagSearchPanel {
  private renderer: TagRenderer

  constructor() {
    this.renderer = new TagRenderer()
  }

  /**
   * 显示搜索面板
   */
  show(
    tagText: string,
    groupedResults: GroupedResults,
    scope: SearchScope,
    availableTags: string[],
    onBlockClick: (blockId: string) => void,
    onScopeChange: (scope: SearchScope) => void,
    onTagChange: (tag: string) => void,
  ): void {
    Logger.log('🎨 开始渲染搜索面板...')

    const overlay = this.createOverlay()
    const panel = this.createPanel()
    const header = this.createHeader(
      tagText,
      groupedResults,
      scope,
      availableTags,
      onScopeChange,
      onTagChange,
    )
    const content = this.createContent()

    // 渲染结果
    this.renderer.renderGroupedResults(content, groupedResults, tagText, onBlockClick)

    const footer = this.createFooter()

    const cleanup = () => {
      overlay.remove()
    }

    footer.querySelector('button')?.addEventListener('click', cleanup)

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cleanup()
    })

    panel.appendChild(header)
    panel.appendChild(content)
    panel.appendChild(footer)
    overlay.appendChild(panel)
    document.body.appendChild(overlay)

    Logger.log('✅ 搜索面板已显示')
  }

  /**
   * 创建遮罩层
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 animate-fade-in'
    return overlay
  }

  /**
   * 创建面板容器
   */
  private createPanel(): HTMLElement {
    const isMobile = window.innerWidth <= 768
    const panel = document.createElement('div')
    panel.className = `bg-white rounded-2xl shadow-2xl max-w-[90vw] ${isMobile ? 'w-full' : 'w-[800px]'} max-h-[85vh] flex flex-col overflow-hidden animate-slide-in`
    return panel
  }

  /**
   * 创建头部
   */
  private createHeader(
    tagText: string,
    groupedResults: GroupedResults,
    scope: SearchScope,
    availableTags: string[],
    onScopeChange: (scope: SearchScope) => void,
    onTagChange: (tag: string) => void,
  ): HTMLElement {
    const header = document.createElement('div')
    header.className = `p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white`

    const totalResults = Object.values(groupedResults).reduce((sum, doc) => sum + doc.blocks.length, 0)
    const docCount = Object.keys(groupedResults).length

    const titleDiv = document.createElement('div')
    titleDiv.className = 'flex items-center justify-between mb-4'
    titleDiv.innerHTML = `
      <div class="text-sm text-gray-500">
        ${docCount}文档 ${totalResults}结果
      </div>
    `

    header.appendChild(titleDiv)

    // 控制栏
    const controls = document.createElement('div')
    controls.className = `flex items-stretch gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1 border border-gray-200`

    // 标签筛选器
    if (availableTags.length > 0) {
      const tagFilter = document.createElement('div')
      tagFilter.className = 'flex items-center bg-white rounded-lg px-2 py-1 flex-1 min-w-0 border border-gray-200'

      const tagSelect = document.createElement('select')
      tagSelect.className = `w-full px-3 py-2 border-none bg-transparent text-blue-600 text-sm font-semibold cursor-pointer outline-none`

      const currentOption = document.createElement('option')
      currentOption.value = tagText
      currentOption.textContent = tagText.length > 12 ? `${tagText.substring(0, 12)}...` : tagText
      currentOption.selected = true
      tagSelect.appendChild(currentOption)

      availableTags.forEach((tag) => {
        if (tag !== tagText) {
          const option = document.createElement('option')
          option.value = tag
          option.textContent = tag.length > 12 ? `${tag.substring(0, 12)}...` : tag
          tagSelect.appendChild(option)
        }
      })

      tagSelect.addEventListener('change', (e) => {
        const newTag = (e.target as HTMLSelectElement).value
        if (newTag && newTag !== tagText) {
          onTagChange(newTag)
        }
      })

      tagFilter.appendChild(tagSelect)
      controls.appendChild(tagFilter)
    }

    // 范围选择器
    const scopeSelector = this.createScopeSelector(scope, onScopeChange)
    controls.appendChild(scopeSelector)

    header.appendChild(controls)

    return header
  }

  /**
   * 创建范围选择器
   */
  private createScopeSelector(
    currentScope: SearchScope,
    onScopeChange: (scope: SearchScope) => void,
  ): HTMLElement {
    const isMobile = window.innerWidth <= 768
    const container = document.createElement('div')
    container.className = 'flex gap-1 flex-shrink-0'

    const scopes: Array<{ value: SearchScope, label: string }> = [
      {
        value: 'doc',
        label: '本文档',
      },
      {
        value: 'subdocs',
        label: '子文档',
      },
      {
        value: 'notebook',
        label: '笔记本',
      },
    ]

    scopes.forEach((scopeOption) => {
      const button = document.createElement('button')
      const isActive = scopeOption.value === currentScope

      button.className = `px-${isMobile ? '3' : '4'} py-2 text-${isMobile ? 'xs' : 'sm'} font-semibold rounded-lg transition-all duration-300 ${
        isActive
          ? 'bg-white text-blue-600 shadow-sm'
          : 'bg-transparent text-gray-500 hover:bg-white hover:text-blue-600'
      }`

      button.textContent = scopeOption.label

      button.addEventListener('click', () => {
        if (scopeOption.value !== currentScope) {
          onScopeChange(scopeOption.value)
        }
      })

      container.appendChild(button)
    })

    return container
  }

  /**
   * 创建内容区
   */
  private createContent(): HTMLElement {
    const isMobile = window.innerWidth <= 768
    const content = document.createElement('div')
    content.className = `flex-1 overflow-y-auto p-${isMobile ? '3' : '5'}`
    return content
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const isMobile = window.innerWidth <= 768
    const footer = document.createElement('div')
    footer.className = `p-4 border-t border-gray-200 bg-gray-50`

    footer.innerHTML = `
      <button class="w-full py-${isMobile ? '3' : '4'} border-2 border-gray-200 bg-white text-gray-700 rounded-xl text-${isMobile ? 'sm' : 'base'} font-semibold transition-all duration-300 hover:bg-gray-100 hover:border-gray-300">
        关闭
      </button>
    `

    return footer
  }
}


