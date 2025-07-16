// 后台脚本 - 处理扩展的后台逻辑
import { supabase } from '~lib/supabase'

class BackgroundManager {
  constructor() {
    this.init()
  }

  init() {
    // 扩展安装时的初始化
    chrome.runtime.onInstalled.addListener(() => {
      this.initializeExtension()
    })

    // 监听来自内容脚本的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse)
      return true // 保持消息通道开放
    })

    // 监听快捷键
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command)
    })

    // 监听标签页更新
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab)
      }
    })

    // 设置右键菜单
    this.setupContextMenu()
  }

  async initializeExtension() {
    console.log('智能书签管理器已安装')
    
    // 检查用户认证状态
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('用户已登录:', user.email)
        this.createDefaultGroups(user.id)
      }
    } catch (error) {
      console.error('检查用户状态失败:', error)
    }
  }

  async createDefaultGroups(userId: string) {
    const defaultGroups = [
      { name: '工作', color: '#0ea5e9' },
      { name: '学习', color: '#10b981' },
      { name: '娱乐', color: '#f59e0b' },
      { name: '工具', color: '#8b5cf6' },
      { name: '社交', color: '#ec4899' }
    ]

    try {
      // 检查是否已经有分组
      const { data: existingGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (!existingGroups || existingGroups.length === 0) {
        // 创建默认分组
        await supabase
          .from('groups')
          .insert(
            defaultGroups.map((group, index) => ({
              user_id: userId,
              name: group.name,
              color: group.color,
              order_index: index
            }))
          )
        console.log('默认分组已创建')
      }
    } catch (error) {
      console.error('创建默认分组失败:', error)
    }
  }

  handleMessage(request: any, sender: any, sendResponse: any) {
    switch (request.action) {
      case 'addBookmark':
        this.addBookmark(request.bookmark)
          .then(result => sendResponse({ success: true, data: result }))
          .catch(error => sendResponse({ success: false, error: error.message }))
        break
      
      case 'getCurrentTab':
        this.getCurrentTab()
          .then(tab => sendResponse({ success: true, data: tab }))
          .catch(error => sendResponse({ success: false, error: error.message }))
        break
      
      case 'openBookmarkManager':
        this.openBookmarkManager()
        sendResponse({ success: true })
        break
      
      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
  }

  handleCommand(command: string) {
    switch (command) {
      case 'quick-add-bookmark':
        this.quickAddBookmark()
        break
      
      case 'open-bookmark-manager':
        this.openBookmarkManager()
        break
    }
  }

  async handleTabUpdate(tabId: number, tab: any) {
    // 可以在这里添加自动检测和建议书签的逻辑
    // 比如检测是否是常访问的网站
  }

  setupContextMenu() {
    chrome.contextMenus.create({
      id: 'add-bookmark',
      title: '添加到书签',
      contexts: ['page']
    })

    chrome.contextMenus.create({
      id: 'add-selection-bookmark',
      title: '将选中内容添加为书签',
      contexts: ['selection']
    })

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab)
    })
  }

  async handleContextMenuClick(info: any, tab: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let title = tab.title
    let url = tab.url

    if (info.menuItemId === 'add-selection-bookmark' && info.selectionText) {
      title = info.selectionText.substring(0, 100)
    }

    try {
      await this.addBookmark({
        title,
        url,
        favicon: tab.favIconUrl,
        user_id: user.id
      })
      
      // 显示成功通知
      this.showNotification('书签已添加', `已添加: ${title}`)
    } catch (error) {
      console.error('添加书签失败:', error)
      this.showNotification('添加失败', '请稍后重试')
    }
  }

  async addBookmark(bookmark: any) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert(bookmark)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCurrentTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          resolve(tabs[0])
        } else {
          reject(new Error('No active tab found'))
        }
      })
    })
  }

  async quickAddBookmark() {
    try {
      const tab = await this.getCurrentTab() as any
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 打开登录页面
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') })
        return
      }

      await this.addBookmark({
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
        user_id: user.id
      })

      this.showNotification('书签已添加', `已添加: ${tab.title}`)
    } catch (error) {
      console.error('快速添加书签失败:', error)
      this.showNotification('添加失败', '请稍后重试')
    }
  }

  openBookmarkManager() {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') })
  }

  showNotification(title: string, message: string) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/assets/icon.png',
      title: title,
      message: message
    })
  }
}

// 初始化后台管理器
new BackgroundManager() 