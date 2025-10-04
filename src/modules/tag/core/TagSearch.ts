/**
 * 标签搜索管理器
 * 负责标签搜索和结果分组
 */

import type {
  DocInfo,
  GroupedResults,
  SearchScope,
  TagSearchResult,
} from '../types'
import Logger from '@shared/utils/logger'
import { fetchSyncPost } from 'siyuan'
import { extractTextContent } from '../utils/dom'
import { extractDocName } from '../utils/format'

declare global {
  interface Window {
    siyuan?: {
      notebooks?: Array<{ id: string, name: string }>
      getAllEditor?: () => Array<{
        protyle?: {
          block?: {
            rootID?: string
          }
        }
      }>
    }
  }
}

export class TagSearch {
  private debugMode = false

  /**
   * 开启调试模式
   */
  enableDebug(): void {
    this.debugMode = true
  }

  /**
   * 关闭调试模式
   */
  disableDebug(): void {
    this.debugMode = false
  }

  /**
   * 调试日志
   */
  private debugLog(...args: any[]): void {
    if (this.debugMode) {
      Logger.log(...args)
    }
  }

  /**
   * 获取当前文档信息
   */
  async getCurrentDocInfo(): Promise<DocInfo | null> {
    try {
      Logger.log('🔍 开始获取当前文档信息...')

      // 方法1: 通过 getAllEditor 获取
      try {
        const editors = (window as any).siyuan?.getAllEditor?.() || []
        Logger.log('方法1 - 找到', editors.length, '个编辑器')

        for (const editor of editors) {
          if (editor?.protyle?.block?.rootID) {
            const rootID = editor.protyle.block.rootID
            const response = await fetchSyncPost('/api/block/getBlockInfo', { id: rootID })

            if (response.code === 0 && response.data) {
              Logger.log('✅ 方法1成功！')
              return {
                docId: rootID,
                notebookId: response.data.box || '',
                docPath: response.data.path || '',
              }
            }
          }
        }
      }
      catch (error) {
        Logger.error('方法1异常:', error)
      }

      // 方法2: 从文档根块获取
      const rootBlock = document.querySelector('.protyle-wysiwyg [data-type="NodeDocument"][data-node-id]')

      if (rootBlock) {
        const docId = rootBlock.getAttribute('data-node-id')

        if (docId) {
          const response = await fetchSyncPost('/api/block/getBlockInfo', { id: docId })

          if (response.code === 0 && response.data && response.data.rootID && response.data.box) {
            Logger.log('✅ 方法2成功！')
            return {
              docId: response.data.rootID,
              notebookId: response.data.box,
              docPath: response.data.path || '',
            }
          }
        }
      }

      // 方法3: 从任意块获取
      const anyBlocks = document.querySelectorAll('.protyle-wysiwyg [data-node-id]')

      for (let i = 0; i < anyBlocks.length; i++) {
        const block = anyBlocks[i]
        const blockId = block.getAttribute('data-node-id')

        if (blockId) {
          const response = await fetchSyncPost('/api/block/getBlockInfo', { id: blockId })

          if (response.code === 0 && response.data && response.data.rootID && response.data.box) {
            return {
              docId: response.data.rootID,
              notebookId: response.data.box,
              docPath: response.data.path || '',
            }
          }
          else if (response.code === 0 && response.data && response.data.rootID) {
            const docResponse = await fetchSyncPost('/api/block/getBlockInfo', { id: response.data.rootID })

            if (docResponse.code === 0 && docResponse.data && docResponse.data.rootID && docResponse.data.box) {
              return {
                docId: response.data.rootID,
                notebookId: docResponse.data.box,
                docPath: docResponse.data.path || '',
              }
            }
          }
        }
      }

      Logger.log('❌ 无法获取当前文档信息')
      return null
    }
    catch (error) {
      Logger.error('❌ 获取文档信息失败:', error)
      return null
    }
  }

  /**
   * 根据范围获取搜索路径
   */
  private async getSearchPaths(scope: SearchScope): Promise<string[]> {
    Logger.log('📂 获取搜索路径, 范围:', scope)

    const docInfo = await this.getCurrentDocInfo()
    Logger.log('当前文档信息:', docInfo)

    if (!docInfo)
      return []

    switch (scope) {
      case 'doc': {
        try {
          const response = await fetchSyncPost('/api/block/getBlockInfo', { id: docInfo.docId })

          if (response.code === 0 && response.data) {
            const box = response.data.box
            const path = response.data.path.startsWith('/') ? response.data.path.substring(1) : response.data.path
            const fullPath = `${box}/${path}`

            Logger.log('✅ 本文档路径:', fullPath)
            return [fullPath]
          }
        }
        catch (error) {
          Logger.error('❌ 获取文档路径失败:', error)
        }
        return []
      }

      case 'subdocs': {
        try {
          const response = await fetchSyncPost('/api/block/getBlockInfo', { id: docInfo.docId })

          if (response.code === 0 && response.data) {
            const box = response.data.box
            const path = response.data.path.startsWith('/') ? response.data.path.substring(1) : response.data.path
            const pathWithoutExt = path.endsWith('.sy') ? path.substring(0, path.length - 3) : path
            const fullDirPath = `${box}/${pathWithoutExt}`

            Logger.log('✅ 文档及子文档路径:', fullDirPath)
            return [fullDirPath]
          }
        }
        catch (error) {
          Logger.error('❌ 获取文档目录路径失败:', error)
        }
        return []
      }

      case 'notebook':
        Logger.log('✅ 笔记本ID:', docInfo.notebookId)
        return [docInfo.notebookId]

      default:
        return []
    }
  }

  /**
   * 递归展开块树
   */
  private flattenBlocks(blocks: any[]): any[] {
    const result: any[] = []

    for (const block of blocks) {
      if (block.type !== 'NodeDocument') {
        result.push(block)
      }

      if (block.children && Array.isArray(block.children) && block.children.length > 0) {
        result.push(...this.flattenBlocks(block.children))
      }
    }

    return result
  }

  /**
   * 获取所有可用标签
   */
  async getAllAvailableTags(scope: SearchScope = 'notebook'): Promise<string[]> {
    Logger.log('📋 获取可用标签, 范围:', scope)

    try {
      const paths = await this.getSearchPaths(scope)

      const requestBody: any = {
        query: '#',
        method: 0,
        types: {
          document: true,
          heading: true,
          list: true,
          listItem: true,
          codeBlock: false,
          htmlBlock: false,
          mathBlock: true,
          table: true,
          blockquote: true,
          superBlock: true,
          paragraph: true,
          video: false,
          audio: false,
          iframe: false,
          widget: false,
          thematicBreak: false,
        },
        page: 1,
        pageSize: 100,
        groupBy: 1,
      }

      if (paths.length > 0) {
        requestBody.paths = paths
      }

      const response = await fetchSyncPost('/api/search/fullTextSearchBlock', requestBody)

      if (!response || response.code !== 0) {
        Logger.error('❌ 标签搜索失败:', response)
        return []
      }

      const blocks = this.flattenBlocks(response.data.blocks || [])
      const tagSet = new Set<string>()

      blocks.forEach((block) => {
        let content = block.markdown || block.content || ''

        if (!block.markdown && block.content) {
          content = extractTextContent(block.content)
        }

        const tagMatches = content.match(/#[^#\s<>]+#/g)
        if (tagMatches) {
          tagMatches.forEach((tag) => {
            const cleanTag = tag.replace(/^#|#$/g, '')
            const finalTag = cleanTag.replace(/&[^;]+;/g, '').trim()
            if (finalTag && !finalTag.includes('<') && !finalTag.includes('>')) {
              tagSet.add(finalTag)
            }
          })
        }
      })

      const availableTags = Array.from(tagSet).sort()
      Logger.log('🏷️ 找到可用标签:', availableTags)

      return availableTags
    }
    catch (error) {
      Logger.error('❌ 获取标签失败:', error)
      return []
    }
  }

  /**
   * 搜索包含指定标签的块
   */
  async searchByTag(tagText: string, scope: SearchScope = 'notebook'): Promise<TagSearchResult[]> {
    try {
      Logger.log('🔍 开始搜索标签:', tagText, '范围:', scope)

      // 清理标签文本
      const cleanedText = tagText
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\u00A0/g, ' ')
        .trim()

      // 确保标签格式
      let searchQuery = cleanedText
      if (!searchQuery.startsWith('#')) {
        searchQuery = `#${searchQuery}`
      }
      if (!searchQuery.endsWith('#')) {
        searchQuery = `${searchQuery}#`
      }

      const paths = await this.getSearchPaths(scope)

      const requestBody: any = {
        query: searchQuery,
        method: 0,
        types: {
          document: true,
          heading: true,
          list: false,
          listItem: false,
          codeBlock: true,
          htmlBlock: true,
          mathBlock: true,
          table: true,
          blockquote: false,
          superBlock: false,
          paragraph: true,
          embedBlock: false,
          databaseBlock: true,
          video: true,
          audio: true,
          iframe: true,
          widget: true,
          thematicBreak: true,
        },
        groupBy: 1,
        orderBy: 0,
        page: 1,
        pageSize: 100,
      }

      if (paths.length > 0) {
        requestBody.paths = paths
      }

      const response = await fetchSyncPost('/api/search/fullTextSearchBlock', requestBody)

      if (response.code === 0 && response.data && response.data.blocks) {
        const flattenedBlocks = this.flattenBlocks(response.data.blocks)

        const blocks: TagSearchResult[] = flattenedBlocks.map((block: any) => ({
          id: block.id,
          content: block.content || '',
          markdown: block.markdown || '',
          hpath: block.hPath || '',
          path: block.path || '',
          box: block.box || '',
          rootID: block.rootID || '',
          parentID: block.parentID || '',
          created: block.created || '',
          updated: block.updated || block.ial?.updated || '',
        }))

        Logger.log('✅ 搜索成功，找到', blocks.length, '个结果')
        return blocks
      }

      Logger.log('⚠️ 未找到结果')
      return []
    }
    catch (error) {
      Logger.error('❌ 搜索失败:', error)
      return []
    }
  }

  /**
   * 将结果按文档分组
   */
  groupByDocument(results: TagSearchResult[]): GroupedResults {
    Logger.log('📊 开始文档分组, 结果数:', results.length)

    const grouped: GroupedResults = {}

    results.forEach((block) => {
      const docId = block.rootID

      if (!grouped[docId]) {
        const docName = extractDocName(block.hpath)
        grouped[docId] = {
          docId,
          docName,
          docPath: block.hpath,
          notebookId: block.box,
          blocks: [],
        }
      }

      grouped[docId].blocks.push(block)
    })

    Logger.log('📊 分组完成:', Object.keys(grouped).length, '个文档')
    return grouped
  }
}

