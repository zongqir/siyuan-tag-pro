import type {
  Plugin,
} from 'siyuan'
import { createApp } from 'vue'
import App from './App.vue'
import {
  TagClickManager,
  TagManager,
} from './tag'
import Logger from './utils/logger'

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
  if (app) {
    app.unmount()
  }
  const pluginInstance = usePlugin()
  if (pluginInstance) {
    const div = document.getElementById(pluginInstance.name)
    if (div) {
      document.body.removeChild(div)
    }
  }

  // Clean up tag modules
  tagManager = null
  tagClickManager = null
}
