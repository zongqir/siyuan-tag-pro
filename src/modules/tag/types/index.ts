/**
 * 标签模块类型定义
 */

/**
 * 标签搜索结果
 */
export interface TagSearchResult {
  id: string
  content: string
  markdown: string
  hpath: string
  path: string
  box: string
  rootID: string
  parentID: string
  created: string
  updated: string
  ial?: {
    updated?: string
  }
}

/**
 * 搜索范围
 */
export type SearchScope = 'doc' | 'subdocs' | 'notebook'

/**
 * 分组结果
 */
export interface GroupedResults {
  [docId: string]: {
    docId: string
    docName: string
    docPath: string
    notebookId: string
    blocks: TagSearchResult[]
  }
}

/**
 * 预设标签
 */
export interface PresetTag {
  id: string
  name: string
  color: string
  emoji: string
}

/**
 * 文档信息
 */
export interface DocInfo {
  docId: string
  notebookId: string
  docPath: string
}


