import { useState, useEffect } from 'react'
import { Plus, Settings, BookOpen, Chrome, Moon, Sun, Mail, Lock, Download } from 'lucide-react'
import { useAuth } from '~hooks/useAuth'
import { useBookmarks } from '~hooks/useBookmarks'
import { Button } from '~components/ui/Button'
import { Input } from '~components/ui/Input'
import { Select } from '~components/ui/Select'
import { ThemeProvider, useTheme } from '~components/ThemeProvider'
import '~style.css'

function PopupContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { createBookmark, groups, getCurrentPageInfo, importBrowserBookmarks, importing } = useBookmarks(user?.id || null)
  const { theme, toggleTheme } = useTheme()
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
    <div className="w-96 min-h-[480px]" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-5 border-b" style={{
        borderColor: 'var(--border-color)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)'
      }}>
        <h1 className="text-xl font-semibold" style={{
          background: 'var(--accent-color)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          智能书签
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: 'var(--bg-accent)',
              color: 'var(--text-secondary)'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {user && (
            <button
              onClick={openBookmarkManager}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--bg-accent)',
                color: 'var(--text-secondary)'
              }}
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
                <Chrome size={20} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                退出
              </button>
            </div>

            {/* 导入消息 */}
            {importMessage && (
              <div className="rounded-xl p-3 animate-slide-in" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <p className="text-sm text-green-600">{importMessage}</p>
              </div>
            )}

            {/* 导入书签按钮 */}
            {/* <Button
              onClick={handleImportBookmarks}
              disabled={importing}
              className="w-full"
              variant="secondary"
              icon={importing ? <div className="loading-spinner w-4 h-4" /> : <Download size={16} />}
            >
              {importing ? '导入中...' : '导入浏览器书签'}
            </Button> */}

            {/* 当前页面信息 */}
            {pageInfo && (
              <div className="rounded-xl p-3" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className="flex items-start space-x-3">
                  {pageInfo.favicon && (
                    <img
                      src={pageInfo.favicon}
                      alt=""
                      className="w-5 h-5 mt-0.5 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {pageInfo.title}
                    </h3>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
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
                <Select
                  value={formData.groupId}
                  onChange={(value) => {
                    console.log('Popup: 接收到分组选择', { 
                      value, 
                      currentFormData: formData,
                      groups: groups.map(g => ({ id: g.id, name: g.name }))
                    })
                    setFormData(prev => ({ ...prev, groupId: value }))
                  }}
                  placeholder="选择分组"
                  options={[
                    { value: '', label: '未分组' },
                    ...groups.map(group => ({
                      value: group.id,
                      label: group.name,
                      color: group.color || undefined
                    }))
                  ]}
                />
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
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {/* <Button
                variant="outline"
                onClick={openBookmarkManager}
                className="w-full"
                icon={<BookOpen size={16} />}
              >
                书签管理
              </Button> */}
              <Button
                onClick={handleImportBookmarks}
                disabled={importing}
                className="w-full"
                variant="secondary"
                icon={importing ? <div className="loading-spinner w-4 h-4" /> : <Download size={16} />}
              >
                {importing ? '同步中...' : '同步当前浏览器书签'}
              </Button>
              {/* 批量导入 */}
            </div>

          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="py-4">
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>欢迎使用智能书签</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                className="text-sm w-full transition-colors hover:opacity-80"
                style={{ color: '#6366f1' }}
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

function IndexPopup() {
  return (
    <ThemeProvider>
      <PopupContent />
    </ThemeProvider>
  )
}

export default IndexPopup 