import Logger from '@shared/utils/logger'
import {
  getFrontend,
  Plugin,
} from "siyuan"
import PluginInfoString from '@/../plugin.json'
import {
  destroy,
  init,
} from '@/main'
import "@/index.scss"

let PluginInfo = {
  version: '',
}
try {
  PluginInfo = PluginInfoString
} catch (error) {
  Logger.error('Plugin info parse error: ', error)
}
const {
  version,
} = PluginInfo

export default class SiyuanTagPro extends Plugin {
  // Run as mobile
  public isMobile: boolean
  // Run in browser
  public isBrowser: boolean
  // Run as local
  public isLocal: boolean
  // Run in Electron
  public isElectron: boolean
  // Run in window
  public isInWindow: boolean
  public platform: SyFrontendTypes
  public readonly version = version

  async onload() {
    const frontEnd = getFrontend()
    this.platform = frontEnd as SyFrontendTypes
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile"
    this.isBrowser = frontEnd.includes('browser')
    this.isLocal =
      location.href.includes('127.0.0.1')
      || location.href.includes('localhost')
    this.isInWindow = location.href.includes('window.html')

    try {
      require("@electron/remote")
        .require("@electron/remote/main")
      this.isElectron = true
    } catch {
      this.isElectron = false
    }

    Logger.info('标签增强插件已加载', `v${version}`)

    init(this)
  }

  onunload() {
    Logger.info('标签增强插件已卸载')
    destroy()
  }

  openSetting() {
    // 插件设置
    Logger.log('打开插件设置')
  }
}
