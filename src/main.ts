import type {
  Plugin,
} from 'siyuan'
import { createApp } from 'vue'
import App from './App.vue'
import { TagManager, TagClickManager } from './tag'

let plugin = null
let tagManager: TagManager | null = null
let tagClickManager: TagClickManager | null = null

export function usePlugin(pluginProps?: Plugin): Plugin {
  console.log('usePlugin', pluginProps, plugin)
  if (pluginProps) {
    plugin = pluginProps
  }
  if (!plugin && !pluginProps) {
    console.error('need bind plugin')
  }
  return plugin
}

let app = null
export function init(pluginInstance: Plugin) {
  // bind plugin hook
  usePlugin(pluginInstance)

  const div = document.createElement('div')
  div.classList.toggle('plugin-sample-vite-vue-app')
  div.id = pluginInstance.name
  app = createApp(App)
  app.mount(div)
  document.body.appendChild(div)

  // Initialize tag modules
  console.log('🚀 Initializing tag modules...')
  tagManager = new TagManager()
  tagClickManager = new TagClickManager()

  // Initialize tag manager (for adding tags)
  tagManager.initialize()

  // Initialize tag click manager (for searching tags)
  tagClickManager.initialize()

  console.log('✅ Tag modules initialized')
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
