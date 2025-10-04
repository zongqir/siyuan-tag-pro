import type {
  Plugin,
} from 'siyuan'
import {
  TagClickManager,
  TagManager,
} from '@modules/tag'
import Logger from '@shared/utils/logger'
import { createApp } from 'vue'
import App from './App.vue'

let plugin = null
let tagManager: TagManager | null = null
let tagClickManager: TagClickManager | null = null

export function usePlugin(pluginProps?: Plugin): Plugin {
  if (pluginProps) {
    plugin = pluginProps
  }
  if (!plugin && !pluginProps) {
    Logger.error('need bind plugin')
  }
  return plugin
}

let app = null
export function init(pluginInstance: Plugin) {
  // bind plugin hook
  usePlugin(pluginInstance)

  const div = document.createElement('div')
  div.classList.toggle('siyuan-tag-pro-app')
  div.id = pluginInstance.name
  app = createApp(App)
  app.mount(div)
  document.body.appendChild(div)

  // Initialize tag modules
  Logger.log('🚀 Initializing tag modules...')
  tagManager = new TagManager()
  tagClickManager = new TagClickManager()

  // Initialize tag manager (for adding tags)
  tagManager.initialize()

  // Initialize tag click manager (for searching tags)
  tagClickManager.initialize()

  Logger.log('✅ Tag modules initialized')
}

export function destroy() {
  Logger.log('🧹 开始清理插件资源...')

  // 清理 tag 模块（重要：先清理事件监听器）
  if (tagManager) {
    tagManager.cleanup()
    tagManager = null
  }

  if (tagClickManager) {
    tagClickManager.cleanup()
    tagClickManager = null
  }

  // 清理 Vue 应用
  if (app) {
    app.unmount()
    app = null
  }

  // 清理 DOM
  const pluginInstance = usePlugin()
  if (pluginInstance) {
    const div = document.getElementById(pluginInstance.name)
    if (div) {
      document.body.removeChild(div)
    }
  }

  Logger.log('✅ 插件资源清理完成')
}
