import { useState } from 'react'
import { BookOpen, Search, Grid, List, Moon, Sun, LogOut, Mail, Lock, Download, X, Trash2 } from 'lucide-react'
import { useAuth } from '~hooks/useAuth'
import { useBookmarks } from '~hooks/useBookmarks'
import { Button } from '~components/ui/Button'
import { Input } from '~components/ui/Input'
import { BookmarkCard } from '~components/BookmarkCard'
import { Sidebar } from '~components/Sidebar'
import { EditBookmarkDialog } from '~components/ui/EditBookmarkDialog'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { ThemeProvider, useTheme } from '~components/ThemeProvider'
import '~style.css'

function NewTabContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { bookmarks, groups, loading: bookmarkLoading, importBrowserBookmarks, importing, createGroup, updateGroup, deleteGroup, updateBookmark, deleteBookmark } = useBookmarks(user?.id || null)
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null) // null 表示显示所有书签
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [groupForm, setGroupForm] = useState({
    name: '',
    color: '#6366f1'
  })

  // 编辑书签相关状态
  const [showEditBookmarkDialog, setShowEditBookmarkDialog] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<any>(null)

  // 删除书签确认对话框状态
  const [showDeleteBookmarkDialog, setShowDeleteBookmarkDialog] = useState(false)
  const [deletingBookmark, setDeletingBookmark] = useState<any>(null)



  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    isSignUp: false
  })

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroupId === null ||
      (selectedGroupId === 'ungrouped' && !bookmark.group_id) ||
      bookmark.group_id === selectedGroupId
    return matchesSearch && matchesGroup
  })

  // 获取选中分组的信息
  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  // 处理导入书签
  const handleImportBookmarks = async () => {
    const result = await importBrowserBookmarks()
    setImportMessage(result.message)

    // 3秒后清除消息
    setTimeout(() => {
      setImportMessage(null)
    }, 3000)
  }

  // 处理创建/编辑分组
  const handleGroupSubmit = async () => {
    if (!groupForm.name.trim()) return

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, {
          name: groupForm.name,
          color: groupForm.color
        })
      } else {
        await createGroup({
          name: groupForm.name,
          color: groupForm.color
        })
      }

      setShowGroupForm(false)
      setEditingGroup(null)
      setGroupForm({ name: '', color: '#6366f1' })
    } catch (error) {
      console.error('分组操作失败:', error)
    }
  }

  // 处理编辑分组
  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setGroupForm({
      name: group.name,
      color: group.color
    })
    setShowGroupForm(true)
  }

  // 处理删除分组
  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('确定要删除这个分组吗？分组内的书签将移到未分组。')) {
      try {
        await deleteGroup(groupId)
        if (selectedGroupId === groupId) {
          setSelectedGroupId(null)
        }
      } catch (error) {
        console.error('删除分组失败:', error)
      }
    }
  }

  // 处理编辑书签
  const handleEditBookmark = (bookmark: any) => {
    setEditingBookmark(bookmark)
    setShowEditBookmarkDialog(true)
  }

  // 处理保存书签编辑
  const handleSaveBookmark = async (id: string, updates: any) => {
    try {
      await updateBookmark(id, updates)
    } catch (error) {
      console.error('更新书签失败:', error)
      throw error
    }
  }

  // 处理删除书签请求 - 显示确认对话框
  const handleDeleteBookmark = (bookmark: any) => {
    setDeletingBookmark(bookmark)
    setShowDeleteBookmarkDialog(true)
  }

  // 确认删除书签
  const confirmDeleteBookmark = async () => {
    if (deletingBookmark) {
      try {
        await deleteBookmark(deletingBookmark.id)
      } catch (error) {
        console.error('删除书签失败:', error)
      }
    }
  }



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen page-container" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="modal-content max-w-md w-full">
            <div className="text-center p-6">
              <div className="empty-state-icon mb-4">
                <BookOpen size={64} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{
                background: 'var(--accent-color)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                欢迎使用智能书签管理器
              </h1>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {loginForm.isSignUp ? '创建新账户开始使用' : '登录后即可开始管理您的书签'}
              </p>

              <div className="space-y-4">
                <div className="space-y-3">
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
                  size="lg"
                  className="w-full"
                  disabled={!loginForm.email || !loginForm.password}
                  icon={loginForm.isSignUp ? <Mail size={20} /> : <Lock size={20} />}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* 头部 */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <BookOpen size={24} style={{ color: 'var(--accent-color)' }} />
            <h1 className="text-xl font-semibold" style={{
              background: 'var(--accent-color)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              智能书签
            </h1>
          </div>

          <div className="flex items-center space-x-4 h-full">
            <div className="relative flex items-center">
              <Input
                placeholder="搜索书签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64"
                size="xs"
              />
              <Search size={18} className="absolute right-3 z-10" style={{ color: 'var(--text-muted)' }} />
            </div>
            {/* <Input
                    placeholder="搜索书签xxx..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-72"
                  /> */}

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--bg-accent)',
                color: 'var(--text-secondary)'
              }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: 'var(--bg-accent)',
                  color: 'var(--text-secondary)'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <Sidebar
          groups={groups}
          bookmarks={bookmarks}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onAddGroup={() => setShowGroupForm(true)}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onUpdateGroup={updateGroup}
        />

        {/* 主内容区 */}
        <div className="flex-1 content-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 导入消息 */}
            {importMessage && (
              <div className="notification success mb-6">
                <p className="text-sm">{importMessage}</p>
              </div>
            )}

            {/* 操作栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedGroupId === null ? '全部书签' :
                    selectedGroupId === 'ungrouped' ? '未分组' :
                      selectedGroup?.name || '书签'}
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {filteredBookmarks.length} 个书签
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* <Button
                  onClick={handleImportBookmarks}
                  disabled={importing}
                  variant="secondary"
                  icon={importing ? <div className="loading-spinner" /> : <Download size={16} />}
                >
                  {importing ? '导入中...' : '导入浏览器书签'}
                </Button> */}
                <div className="flex rounded-xl overflow-hidden" style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-accent)'
                }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2 transition-all duration-200"
                    style={{
                      background: viewMode === 'grid' ? 'var(--accent-color)' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 transition-all duration-200"
                    style={{
                      background: viewMode === 'list' ? 'var(--accent-color)' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 书签显示 */}
            {bookmarkLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading-spinner" />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <BookOpen size={64} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {searchQuery ? '没有找到匹配的书签' :
                    selectedGroupId === null ? '暂无书签' :
                      selectedGroupId === 'ungrouped' ? '暂无未分组书签' :
                        `${selectedGroup?.name || '该分组'}暂无书签`}
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery ? '尝试修改搜索关键词' : '添加您的第一个书签或导入浏览器书签开始使用'}
                </p>
                {/* {!searchQuery && (
                  <Button
                    onClick={handleImportBookmarks}
                    disabled={importing}
                    icon={importing ? <div className="loading-spinner" /> : <Download size={18} />}
                  >
                    {importing ? '导入中...' : '导入浏览器书签'}
                  </Button>
                )} */}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'bookmarks-grid' : 'bookmarks-list'}>
                {filteredBookmarks.map((bookmark, index) => (
                  <div
                    key={bookmark.id}
                    style={{ '--card-index': index, '--item-index': index } as React.CSSProperties}
                  >
                    <BookmarkCard
                      bookmark={bookmark}
                      groups={groups}
                      viewMode={viewMode}
                      onClick={(bookmark) => window.open(bookmark.url, '_blank')}
                      onEdit={handleEditBookmark}
                      onDelete={handleDeleteBookmark}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 分组创建/编辑模态框 */}
      {showGroupForm && (
        <div className="modal">
          <div className="modal-content w-96">
            <div className="flex items-center justify-between p-4" style={{
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingGroup ? '编辑分组' : '新建分组'}
              </h3>
              <button
                onClick={() => {
                  setShowGroupForm(false)
                  setEditingGroup(null)
                  setGroupForm({ name: '', color: '#6366f1' })
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: 'var(--bg-accent)',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  分组名称
                </label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="输入分组名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  分组颜色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={groupForm.color}
                    onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                    className="w-12 h-12 rounded-xl border-2 cursor-pointer"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <Input
                    value={groupForm.color}
                    onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                    placeholder="#6366f1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-4" style={{
              borderTop: '1px solid var(--border-color)'
            }}>
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupForm(false)
                  setEditingGroup(null)
                  setGroupForm({ name: '', color: '#6366f1' })
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleGroupSubmit}
                disabled={!groupForm.name.trim()}
              >
                {editingGroup ? '更新' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑书签对话框 */}
      <EditBookmarkDialog
        isOpen={showEditBookmarkDialog}
        onClose={() => {
          setShowEditBookmarkDialog(false)
          setEditingBookmark(null)
        }}
        onSave={handleSaveBookmark}
        bookmark={editingBookmark}
        groups={groups}
      />

      {/* 删除书签确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteBookmarkDialog}
        onClose={() => {
          setShowDeleteBookmarkDialog(false)
          setDeletingBookmark(null)
        }}
        onConfirm={confirmDeleteBookmark}
        title="删除书签"
        message={`确定要删除书签"${deletingBookmark?.title || ''}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        icon={<Trash2 size={20} />}
      />
    </div>
  )
}

function IndexNewtab() {
  return (
    <ThemeProvider>
      <NewTabContent />
    </ThemeProvider>
  )
}

export default IndexNewtab 