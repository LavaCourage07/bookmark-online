import { useState, useEffect } from 'react'
import { Plus, Settings, BookOpen, Chrome, Moon, Sun, Mail, Lock, Download, Upload } from 'lucide-react'
import { useAuth } from '~hooks/useAuth'
import { useBookmarks } from '~hooks/useBookmarks'
import { Button } from '~components/ui/Button'
import { Input } from '~components/ui/Input'
import '~style.css'

function IndexPopup() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { createBookmark, groups, getCurrentPageInfo, importBrowserBookmarks, importing } = useBookmarks(user?.id || null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [pageInfo, setPageInfo] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    groupId: ''
  })

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    isSignUp: false
  })

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  // 获取当前页面信息
  useEffect(() => {
    if (user) {
      getCurrentPageInfo().then((info: any) => {
        setPageInfo(info)
        setFormData({
          title: info.title || '',
          url: info.url || '',
          groupId: ''
        })
      })
    }
  }, [user, getCurrentPageInfo])

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // 添加书签
  const handleAddBookmark = async () => {
    if (!formData.title || !formData.url) return

    try {
      await createBookmark({
        title: formData.title,
        url: formData.url,
        group_id: formData.groupId || null,
        favicon: pageInfo?.favicon || null
      })
      setShowAddForm(false)
      // 显示成功消息
      setTimeout(() => {
        window.close()
      }, 1000)
    } catch (error) {
      console.error('添加书签失败:', error)
    }
  }

  // 打开书签管理页面
  const openBookmarkManager = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') })
    }
  }

  // 处理导入书签
  const handleImportBookmarks = async () => {
    const result = await importBrowserBookmarks()
    setImportMessage(result.message)
    
    // 3秒后清除消息
    setTimeout(() => {
      setImportMessage(null)
    }, 3000)
  }

  if (authLoading) {
    return (
      <div className="w-80 h-64 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="w-80 min-h-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold">智能书签</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {user && (
            <button
              onClick={openBookmarkManager}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-4">
        {user ? (
          <div className="space-y-4">
            {/* 用户信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Chrome size={20} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700"
              >
                退出
              </button>
            </div>

            {/* 导入消息 */}
            {importMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2">
                <p className="text-sm text-green-700 dark:text-green-300">{importMessage}</p>
              </div>
            )}

            {/* 导入书签按钮 */}
            <Button
              onClick={handleImportBookmarks}
              disabled={importing}
              className="w-full"
              variant="secondary"
              icon={importing ? <div className="loading-spinner" /> : <Download size={16} />}
            >
              {importing ? '导入中...' : '导入浏览器书签'}
            </Button>

            {/* 当前页面信息 */}
            {pageInfo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  {pageInfo.favicon && (
                    <img 
                      src={pageInfo.favicon} 
                      alt="" 
                      className="w-5 h-5 mt-0.5 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {pageInfo.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {pageInfo.url}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 添加书签按钮 */}
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full"
                icon={<Plus size={16} />}
              >
                添加当前页面
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="书签标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  placeholder="书签URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">选择分组</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <Button onClick={handleAddBookmark} className="flex-1">
                    保存
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}

            {/* 快捷操作 */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={openBookmarkManager}
                className="w-full"
                icon={<BookOpen size={16} />}
              >
                书签管理
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="py-4">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-lg font-semibold mb-2">欢迎使用智能书签</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loginForm.isSignUp ? '创建新账户' : '登录后即可开始管理您的书签'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="密码"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (loginForm.isSignUp) {
                    await signUp(loginForm.email, loginForm.password)
                  } else {
                    await signIn(loginForm.email, loginForm.password)
                  }
                }}
                className="w-full"
                disabled={!loginForm.email || !loginForm.password}
                icon={loginForm.isSignUp ? <Mail size={16} /> : <Lock size={16} />}
              >
                {loginForm.isSignUp ? '注册' : '登录'}
              </Button>
              
              <button
                onClick={() => setLoginForm({ ...loginForm, isSignUp: !loginForm.isSignUp })}
                className="text-sm text-primary-600 hover:text-primary-700 w-full"
              >
                {loginForm.isSignUp ? '已有账户？点击登录' : '没有账户？点击注册'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup 