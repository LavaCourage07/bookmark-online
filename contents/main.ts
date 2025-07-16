// 内容脚本 - 在网页中注入的脚本
export {}

class ContentManager {
  private notificationContainer: HTMLElement | null = null

  constructor() {
    this.init()
  }

  init() {
    // 添加快捷键支持
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    
    // 监听来自后台脚本的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse)
      return true
    })

    // 创建通知容器
    this.createNotificationContainer()
  }

  handleKeyDown(e: KeyboardEvent) {
    // Ctrl+Shift+B 快速添加书签
    if (e.ctrlKey && e.shiftKey && e.key === 'B') {
      e.preventDefault()
      this.quickAddBookmark()
    }

    // Ctrl+Shift+M 打开书签管理器
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault()
      this.openBookmarkManager()
    }
  }

  handleMessage(request: any, sender: any, sendResponse: any) {
    switch (request.action) {
      case 'getPageInfo':
        sendResponse({
          success: true,
          data: this.getPageInfo()
        })
        break
      
      case 'showNotification':
        this.showNotification(request.title, request.message, request.type)
        sendResponse({ success: true })
        break
      
      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
  }

  getPageInfo() {
    return {
      title: document.title,
      url: window.location.href,
      favicon: this.getFavicon(),
      description: this.getDescription(),
      keywords: this.getKeywords()
    }
  }

  getFavicon(): string {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement ||
                   document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement ||
                   document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement

    if (favicon && favicon.href) {
      return favicon.href
    }

    return `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=32`
  }

  getDescription(): string {
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement
    return description ? description.content : ''
  }

  getKeywords(): string {
    const keywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
    return keywords ? keywords.content : ''
  }

  async quickAddBookmark() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'addBookmark',
        bookmark: {
          ...this.getPageInfo(),
          timestamp: Date.now()
        }
      })

      if (response.success) {
        this.showNotification('成功', '书签已添加', 'success')
      } else {
        this.showNotification('失败', response.error || '添加书签失败', 'error')
      }
    } catch (error) {
      console.error('快速添加书签失败:', error)
      this.showNotification('失败', '添加书签失败，请重试', 'error')
    }
  }

  openBookmarkManager() {
    chrome.runtime.sendMessage({
      action: 'openBookmarkManager'
    })
  }

  createNotificationContainer() {
    this.notificationContainer = document.createElement('div')
    this.notificationContainer.id = 'bookmark-notifications'
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      pointer-events: none;
    `
    document.body.appendChild(this.notificationContainer)
  }

  showNotification(title: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (!this.notificationContainer) return

    const notification = document.createElement('div')
    notification.style.cssText = `
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 8px;
      max-width: 300px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      opacity: 0;
      transform: translateX(100%);
    `

    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 12px; opacity: 0.9;">${message}</div>
    `

    // 添加关闭按钮
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    closeBtn.onclick = () => this.removeNotification(notification)

    notification.appendChild(closeBtn)
    this.notificationContainer.appendChild(notification)

    // 添加样式
    if (!document.getElementById('bookmark-notification-styles')) {
      const styles = document.createElement('style')
      styles.id = 'bookmark-notification-styles'
      styles.textContent = `
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `
      document.head.appendChild(styles)
    }

    // 显示动画
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(0)'
    }, 10)

    // 自动消失
    setTimeout(() => {
      this.removeNotification(notification)
    }, 5000)
  }

  removeNotification(notification: HTMLElement) {
    notification.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }

  // 检测页面变化
  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      // 可以在这里添加页面变化检测逻辑
      // 比如检测是否有新的可书签化内容
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
}

// 初始化内容管理器
new ContentManager() 