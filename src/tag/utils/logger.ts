/**
 * 日志工具
 */

class Logger {
  private prefix = '[TagPro]'

  log(...args: any[]): void {
    console.log(this.prefix, ...args)
  }

  error(...args: any[]): void {
    console.error(this.prefix, ...args)
  }

  warn(...args: any[]): void {
    console.warn(this.prefix, ...args)
  }

  info(...args: any[]): void {
    console.info(this.prefix, ...args)
  }
}

export default new Logger()


