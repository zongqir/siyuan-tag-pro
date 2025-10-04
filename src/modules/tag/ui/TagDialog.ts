/**
 * 标签对话框UI
 * 负责标签选择对话框的显示
 */

import type { PresetTag } from '../types'

export class TagDialog {
  /**
   * 显示样式警告
   */
  showStyleWarning(): void {
    const overlay = this.createOverlay()
    const dialog = document.createElement('div')
    dialog.className = 'bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center transform scale-90 animate-scale-in'

    dialog.innerHTML = `
      <div class="text-6xl mb-4">🎨</div>
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">检测到复杂样式</h2>
      <div class="text-gray-600 text-base mb-6">
        <p class="mb-3">这个块包含以下内容之一：</p>
        <ul class="text-left mb-3 space-y-2">
          <li>🎨 内联样式 (style属性)</li>
          <li>💻 代码块或代码高亮</li>
          <li>📐 数学公式</li>
        </ul>
        <p class="text-red-500 font-semibold">为避免破坏格式，已阻止添加标签操作</p>
      </div>
      <button class="btn-primary px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105">
        我知道了
      </button>
    `

    const cleanup = () => {
      overlay.remove()
    }

    const button = dialog.querySelector('button')
    button?.addEventListener('click', cleanup)

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup()
    })

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    setTimeout(cleanup, 3000)
  }

  /**
   * 显示文档可编辑警告
   */
  showEditableWarning(): void {
    const overlay = this.createOverlay()
    const dialog = document.createElement('div')
    dialog.className = 'bg-white p-8 rounded-xl shadow-2xl border border-red-200 max-w-lg w-full text-center transform scale-90 animate-scale-in'

    dialog.innerHTML = `
      <div class="text-6xl mb-4">🛡️</div>
      <h2 class="text-2xl font-semibold mb-4 text-red-600">兜底防御触发</h2>
      <div class="text-gray-600 text-base mb-6">
        <p class="mb-3">检测到文档处于<strong>可编辑状态</strong></p>
        <p class="text-red-500 font-semibold mb-3">为保护数据安全，已阻止标签操作</p>
        <p class="text-sm text-gray-500">请先锁定文档后再进行标签操作</p>
      </div>
      <button class="btn-danger px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105">
        我知道了
      </button>
    `

    const cleanup = () => {
      overlay.remove()
    }

    const button = dialog.querySelector('button')
    button?.addEventListener('click', cleanup)

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup()
    })

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    setTimeout(cleanup, 3000)
  }

  /**
   * 显示标签选择对话框
   */
  showTagSelection(blockText: string, tags: readonly PresetTag[]): Promise<PresetTag | null> {
    return new Promise((resolve) => {
      const overlay = this.createOverlay()
      const dialog = document.createElement('div')
      dialog.className = 'bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up'

      const displayText = blockText.length > 60 ? `${blockText.substring(0, 60)}...` : blockText

      dialog.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">🏷️</span>
          <span class="text-2xl font-semibold">快速打标签</span>
        </div>
        <div class="text-sm text-gray-600 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-l-4 border-blue-500 max-h-20 overflow-y-auto">
          ${displayText}
        </div>
        <div id="tags-grid" class="grid grid-cols-2 gap-4 mb-6"></div>
        <button id="cancel-btn" class="w-full py-4 border-2 border-gray-200 bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-100 hover:border-gray-300">
          取消
        </button>
      `

      const tagsGrid = dialog.querySelector('#tags-grid')!

      tags.forEach((tag, index) => {
        const tagButton = document.createElement('button')
        tagButton.className = 'p-5 border-2 border-transparent bg-gradient-to-br rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg'
        tagButton.style.cssText = `
          background: linear-gradient(135deg, ${tag.color}18, ${tag.color}28);
          animation: slide-up ${0.35 + index * 0.06}s cubic-bezier(0.34, 1.56, 0.64, 1);
        `

        tagButton.innerHTML = `
          <div class="flex items-center justify-center gap-3">
            <span class="text-2xl">${tag.emoji}</span>
            <span class="font-semibold text-base">${tag.name}</span>
          </div>
        `

        tagButton.addEventListener('mouseenter', () => {
          tagButton.style.borderColor = tag.color
          tagButton.style.boxShadow = `0 12px 28px ${tag.color}50`
        })

        tagButton.addEventListener('mouseleave', () => {
          tagButton.style.borderColor = 'transparent'
          tagButton.style.boxShadow = 'none'
        })

        tagButton.addEventListener('click', () => {
          tagButton.style.transform = 'scale(0.96)'
          setTimeout(() => {
            resolve(tag)
            overlay.remove()
          }, 120)
        })

        tagsGrid.appendChild(tagButton)
      })

      const cleanup = () => {
        overlay.remove()
      }

      const cancelButton = dialog.querySelector('#cancel-btn')
      cancelButton?.addEventListener('click', () => {
        resolve(null)
        cleanup()
      })

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          resolve(null)
          cleanup()
        }
      })

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          resolve(null)
          cleanup()
        }
      })

      overlay.appendChild(dialog)
      document.body.appendChild(overlay)
    })
  }

  /**
   * 创建遮罩层
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[99999] flex items-center justify-center p-5 animate-fade-in'
    return overlay
  }
}


