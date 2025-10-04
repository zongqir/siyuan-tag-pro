/**
 * 统一日志工具
 * 用于全局日志管理
 */

class Logger {
  private prefix = '[TagPro]'
  private debugMode = false

  /**
   * 开启调试模式
   */
  enableDebug(): void {
    this.debugMode = true
    this.log('✅ 调试模式已开启')
  }

  /**
   * 关闭调试模式
   */
  disableDebug(): void {
    this.debugMode = false
  }

  /**
   * 普通日志
   */
  log(...args: any[]): void {
    if (this.debugMode) {
      console.log(this.prefix, ...args)
    }
  }

  /**
   * 错误日志（始终输出）
   */
  error(...args: any[]): void {
    console.error(this.prefix, '❌', ...args)
  }

  /**
   * 警告日志
   */
  warn(...args: any[]): void {
    if (this.debugMode) {
      console.warn(this.prefix, '⚠️', ...args)
    }
  }

  /**
   * 信息日志
   */
  info(...args: any[]): void {
    console.info(this.prefix, 'ℹ️', ...args)
  }
}

export default new Logger()

