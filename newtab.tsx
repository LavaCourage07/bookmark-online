import { useState, useEffect } from 'react'
import { BookOpen, Chrome, Plus, Search, Grid, List, Moon, Sun, LogOut, Mail, Lock, Download, Upload, Folder, Edit, Trash2, X, GripVertical } from 'lucide-react'
import { useAuth } from '~hooks/useAuth'
import { useBookmarks } from '~hooks/useBookmarks'
import { Button } from '~components/ui/Button'
import { Input } from '~components/ui/Input'
import '~style.css'

function NewTabPage() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { bookmarks, groups, loading: bookmarkLoading, importBrowserBookmarks, importing, createGroup, updateGroup, deleteGroup } = useBookmarks(user?.id || null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null) // null 表示显示所有书签
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [groupForm, setGroupForm] = useState({
    name: '',
    color: '#0ea5e9'
  })
  
  // 拖拽相关状态
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null)
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    isSignUp: false
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

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
      setGroupForm({ name: '', color: '#0ea5e9' })
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

  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroupId(groupId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', groupId)
  }

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverGroupId(groupId)
  }

  const handleDragLeave = () => {
    setDragOverGroupId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault()
    
    if (!draggedGroupId || draggedGroupId === targetGroupId) {
      setDraggedGroupId(null)
      setDragOverGroupId(null)
      return
    }

    try {
      // 找到源分组和目标分组
      const sourceGroup = groups.find(g => g.id === draggedGroupId)
      const targetGroup = groups.find(g => g.id === targetGroupId)
      
      if (!sourceGroup || !targetGroup) return

      // 获取当前排序后的分组列表
      const sortedGroups = [...groups].sort((a, b) => a.order_index - b.order_index)
      
      // 找到新的插入位置
      const targetIndex = sortedGroups.findIndex(g => g.id === targetGroupId)
      const sourceIndex = sortedGroups.findIndex(g => g.id === draggedGroupId)
      
      // 重新排序分组
      const newGroups = [...sortedGroups]
      const [movedGroup] = newGroups.splice(sourceIndex, 1)
      newGroups.splice(targetIndex, 0, movedGroup)
      
      // 更新所有分组的 order_index
      const updatePromises = newGroups.map((group, index) => 
        updateGroup(group.id, { order_index: index })
      )
      
      await Promise.all(updatePromises)
      
    } catch (error) {
      console.error('拖拽排序失败:', error)
    } finally {
      setDraggedGroupId(null)
      setDragOverGroupId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedGroupId(null)
    setDragOverGroupId(null)
  }

  // 排序后的分组列表
  const sortedGroups = [...groups].sort((a, b) => a.order_index - b.order_index)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <BookOpen size={64} className="mx-auto text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              欢迎使用智能书签管理器
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen size={24} className="text-primary-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                智能书签管理器
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索书签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-md text-gray-400 hover:text-red-600"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 - 分组列表 */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">分组</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGroupForm(true)}
                icon={<Plus size={16} />}
              >
                新建
              </Button>
            </div>
            
            {/* 全部书签 */}
            <div
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer mb-2 ${
                selectedGroupId === null 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedGroupId(null)}
            >
              <BookOpen size={16} />
              <span className="flex-1">全部书签</span>
              <span className="text-sm text-gray-500">{bookmarks.length}</span>
            </div>
            
            {/* 未分组书签 */}
            {bookmarks.filter(b => !b.group_id).length > 0 && (
              <div
                className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer mb-2 ${
                  selectedGroupId === 'ungrouped'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedGroupId('ungrouped')}
              >
                <Folder size={16} />
                <span className="flex-1">未分组</span>
                <span className="text-sm text-gray-500">{bookmarks.filter(b => !b.group_id).length}</span>
              </div>
            )}
            
            {/* 分组列表 - 支持拖拽排序 */}
            <div className="space-y-1">
              {sortedGroups.map(group => (
                <div
                  key={group.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, group.id)}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer group transition-all duration-200 ${
                    selectedGroupId === group.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${
                    draggedGroupId === group.id
                      ? 'opacity-50 scale-95'
                      : ''
                  } ${
                    dragOverGroupId === group.id && draggedGroupId !== group.id
                      ? 'border-2 border-dashed border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : ''
                  }`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  {/* 拖拽手柄 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} className="text-gray-400" />
                  </div>
                  
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color || '#6b7280' }}
                  />
                  <span className="flex-1 truncate">{group.name}</span>
                  <span className="text-sm text-gray-500">
                    {bookmarks.filter(b => b.group_id === group.id).length}
                  </span>
                  
                  {/* 编辑/删除按钮 */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditGroup(group)
                      }}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id)
                      }}
                      className="p-1 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 导入消息 */}
            {importMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <p className="text-sm text-green-700 dark:text-green-300">{importMessage}</p>
              </div>
            )}

            {/* 操作栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedGroupId === null ? '全部书签' : 
                   selectedGroupId === 'ungrouped' ? '未分组' : 
                   selectedGroup?.name || '书签'}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredBookmarks.length} 个书签
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleImportBookmarks}
                  disabled={importing}
                  variant="secondary"
                  icon={importing ? <div className="loading-spinner" /> : <Download size={16} />}
                >
                  {importing ? '导入中...' : '导入浏览器书签'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  icon={viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                >
                  {viewMode === 'grid' ? '列表' : '网格'}
                </Button>
              </div>
            </div>

            {/* 书签显示 */}
            {bookmarkLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading-spinner" />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? '没有找到匹配的书签' : 
                   selectedGroupId === null ? '暂无书签' : 
                   selectedGroupId === 'ungrouped' ? '暂无未分组书签' : 
                   `${selectedGroup?.name || '该分组'}暂无书签`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery ? '尝试修改搜索关键词' : '添加您的第一个书签或导入浏览器书签开始使用'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleImportBookmarks}
                    disabled={importing}
                    icon={importing ? <div className="loading-spinner" /> : <Download size={18} />}
                  >
                    {importing ? '导入中...' : '导入浏览器书签'}
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {filteredBookmarks.map(bookmark => (
                  <div 
                    key={bookmark.id} 
                    className={`bookmark-card ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''}`}
                    onClick={() => window.open(bookmark.url, '_blank')}
                  >
                    <div className={`${viewMode === 'list' ? 'flex items-center space-x-3 flex-1' : 'flex items-start space-x-3'}`}>
                      {bookmark.favicon && (
                        <img 
                          src={bookmark.favicon} 
                          alt="" 
                          className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${viewMode === 'list' ? 'text-base' : 'text-sm'} truncate mb-1`}>
                          {bookmark.title}
                        </h3>
                        <p className={`${viewMode === 'list' ? 'text-sm' : 'text-xs'} text-gray-500 dark:text-gray-400 truncate`}>
                          {bookmark.url}
                        </p>
                        {/* 显示书签所属分组 */}
                        {bookmark.group_id && viewMode === 'list' && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: groups.find(g => g.id === bookmark.group_id)?.color || '#6b7280' }}
                            />
                            <span className="text-xs text-gray-400">
                              {groups.find(g => g.id === bookmark.group_id)?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 分组创建/编辑模态框 */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingGroup ? '编辑分组' : '新建分组'}
              </h3>
              <button
                onClick={() => {
                  setShowGroupForm(false)
                  setEditingGroup(null)
                  setGroupForm({ name: '', color: '#0ea5e9' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分组名称
                </label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="输入分组名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分组颜色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={groupForm.color}
                    onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                    className="w-12 h-12 border border-gray-300 rounded-md"
                  />
                  <Input
                    value={groupForm.color}
                    onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupForm(false)
                  setEditingGroup(null)
                  setGroupForm({ name: '', color: '#0ea5e9' })
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
    </div>
  )
}

export default NewTabPage 