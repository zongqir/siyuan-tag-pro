/**
 * 标签搜索结果渲染器
 * 负责渲染标签搜索结果
 */

import type {
  GroupedResults,
  TagSearchResult,
} from '../types'
import Logger from '@shared/utils/logger'
import {
  extractTextContent,
  formatTimestamp,
  highlightTag,
} from '../utils/format'

export class TagRenderer {
  private collapsedNodes = new Set<string>()

  /**
   * 渲染分组结果
   */
  renderGroupedResults(
    container: HTMLElement,
    groupedResults: GroupedResults,
    tagText: string,
    onBlockClick: (blockId: string) => void,
  ): void {
    const docCount = Object.keys(groupedResults).length

    if (docCount === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-gray-400">
          <div class="text-5xl mb-4">🔍</div>
          <div class="text-lg font-medium mb-2">未找到包含标签的内容</div>
          <div class="text-sm">标签: <span class="bg-blue-100 px-2 py-1 rounded">${tagText}</span></div>
        </div>
      `
      return
    }

    // 按文档名排序
    const sortedDocs = Object.values(groupedResults).sort((a, b) => {
      return a.docName.localeCompare(b.docName)
    })

    Logger.log('📄 渲染文档数:', sortedDocs.length)

    sortedDocs.forEach((docGroup) => {
      const docElement = this.createDocumentGroup(docGroup, tagText, onBlockClick)
      container.appendChild(docElement)
    })
  }

  /**
   * 创建文档组元素
   */
  private createDocumentGroup(
    docGroup: GroupedResults[string],
    tagText: string,
    onBlockClick: (blockId: string) => void,
  ): HTMLElement {
    const docElement = document.createElement('div')
    docElement.className = 'mb-3 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md'

    const isExpanded = !this.collapsedNodes.has(docGroup.docId)

    // 文档标题头部
    const headerElement = document.createElement('div')
    headerElement.className = 'bg-gradient-to-r from-gray-50 to-white p-3 border-b border-gray-200 flex items-center justify-between cursor-pointer transition-all duration-300 hover:from-blue-50 hover:to-gray-50'

    headerElement.innerHTML = `
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <span class="text-sm text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}">${isExpanded ? '▼' : '▶'}</span>
        <span class="text-blue-500 text-sm">📄</span>
        <span class="font-medium text-gray-700 truncate flex-1 min-w-0">${docGroup.docName}</span>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <span class="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">${docGroup.blocks.length}结果</span>
      </div>
    `

    // 块列表容器
    const blocksContainer = document.createElement('div')
    blocksContainer.className = `p-2 ${isExpanded ? 'block' : 'hidden'}`

    // 渲染块列表
    docGroup.blocks.forEach((block, blockIndex) => {
      const blockElement = this.createBlockItem(block, blockIndex, tagText, onBlockClick)
      blocksContainer.appendChild(blockElement)
    })

    // 展开/折叠功能
    headerElement.addEventListener('click', (e) => {
      e.stopPropagation()
      const isCurrentlyExpanded = !this.collapsedNodes.has(docGroup.docId)
      const arrow = headerElement.querySelector('span')

      if (isCurrentlyExpanded) {
        this.collapsedNodes.add(docGroup.docId)
        arrow!.classList.remove('rotate-90')
        blocksContainer.classList.add('hidden')
      }
      else {
        this.collapsedNodes.delete(docGroup.docId)
        arrow!.classList.add('rotate-90')
        blocksContainer.classList.remove('hidden')
      }
    })

    docElement.appendChild(headerElement)
    docElement.appendChild(blocksContainer)

    return docElement
  }

  /**
   * 创建块项目元素
   */
  private createBlockItem(
    block: TagSearchResult,
    index: number,
    tagText: string,
    onBlockClick: (blockId: string) => void,
  ): HTMLElement {
    const blockElement = document.createElement('div')
    blockElement.className = 'p-3 my-1 rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-white to-gray-50 cursor-pointer transition-all duration-300 hover:from-blue-50 hover:to-gray-50 hover:translate-x-2 hover:scale-105 hover:shadow-lg relative overflow-hidden'

    const cleanContent = extractTextContent(block.content)
    const highlightedContent = highlightTag(cleanContent, tagText)

    const updatedTime = block.ial?.updated || block.updated || '未知时间'
    const timeDisplay = formatTimestamp(updatedTime)

    blockElement.innerHTML = `
      <div class="text-sm leading-relaxed mb-1 text-gray-700 truncate">
        ${highlightedContent}
      </div>
      <div class="text-xs text-gray-400 text-right">
        ${timeDisplay}
      </div>
    `

    blockElement.addEventListener('click', () => {
      onBlockClick(block.id)
    })

    return blockElement
  }
}


