import { useState } from 'react'
import { BookOpen, Folder, Plus, Edit, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/Button'

interface Group {
  id: string
  name: string
  color: string | null
  order_index: number
}

interface Bookmark {
  id: string
  group_id?: string | null
}

interface SidebarProps {
  groups: Group[]
  bookmarks: Bookmark[]
  selectedGroupId: string | null
  onSelectGroup: (groupId: string | null) => void
  onAddGroup: () => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (groupId: string) => void
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  groups,
  bookmarks,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onUpdateGroup,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null)
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null)

  // 获取分组的书签数量
  const getGroupBookmarkCount = (groupId: string) => {
    return bookmarks.filter(b => b.group_id === groupId).length
  }

  // 获取未分组书签数量
  const getUngroupedBookmarkCount = () => {
    return bookmarks.filter(b => !b.group_id).length
  }

  // 排序后的分组列表
  const sortedGroups = [...groups].sort((a, b) => a.order_index - b.order_index)

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
      const targetIndex = sortedGroups.findIndex(g => g.id === targetGroupId)
      const sourceIndex = sortedGroups.findIndex(g => g.id === draggedGroupId)
      
      // 重新排序分组
      const newGroups = [...sortedGroups]
      const [movedGroup] = newGroups.splice(sourceIndex, 1)
      newGroups.splice(targetIndex, 0, movedGroup)
      
      // 更新所有分组的 order_index
      const updatePromises = newGroups.map((group, index) => 
        onUpdateGroup(group.id, { order_index: index })
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

  if (isCollapsed) {
    return (
      <div className="sidebar sidebar-collapsed">
        <div className="p-2">
          {/* 展开按钮 */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="sidebar-toggle-btn mb-4"
              title="展开侧边栏"
            >
              <ChevronRight size={18} />
            </button>
          )}
          
          {/* 简化的分组图标 */}
          <div className="space-y-2">
            <button
              onClick={() => onSelectGroup(null)}
              className={`sidebar-item-collapsed ${selectedGroupId === null ? 'active' : ''}`}
              title="全部书签"
            >
              <BookOpen size={18} />
              <span className="sidebar-badge">{bookmarks.length}</span>
            </button>
            
            {getUngroupedBookmarkCount() > 0 && (
              <button
                onClick={() => onSelectGroup('ungrouped')}
                className={`sidebar-item-collapsed ${selectedGroupId === 'ungrouped' ? 'active' : ''}`}
                title="未分组"
              >
                <Folder size={18} />
                <span className="sidebar-badge">{getUngroupedBookmarkCount()}</span>
              </button>
            )}
            
            {sortedGroups.map(group => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`sidebar-item-collapsed ${selectedGroupId === group.id ? 'active' : ''}`}
                title={group.name}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: group.color || 'var(--accent-color)' }}
                />
                <span className="sidebar-badge">{getGroupBookmarkCount(group.id)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sidebar">
      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            分组
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onAddGroup}
              icon={<Plus size={16} />}
            >
              新建
            </Button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="sidebar-toggle-btn"
                title="收起侧边栏"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* 全部书签 */}
        <div
          className={`sidebar-item ${selectedGroupId === null ? 'active' : ''}`}
          onClick={() => onSelectGroup(null)}
        >
          <div className="sidebar-item-content">
            <BookOpen size={16} style={{ color: 'var(--accent-color)' }} />
            <span className="sidebar-item-text">全部书签</span>
          </div>
          <span className="sidebar-item-count">{bookmarks.length}</span>
        </div>
        
        {/* 未分组书签 */}
        {getUngroupedBookmarkCount() > 0 && (
          <div
            className={`sidebar-item ${selectedGroupId === 'ungrouped' ? 'active' : ''}`}
            onClick={() => onSelectGroup('ungrouped')}
          >
            <div className="sidebar-item-content">
              <Folder size={16} style={{ color: 'var(--accent-color)' }} />
              <span className="sidebar-item-text">未分组</span>
            </div>
            <span className="sidebar-item-count">{getUngroupedBookmarkCount()}</span>
          </div>
        )}
        
        {/* 分组列表 */}
        <div className="mt-4 space-y-1">
          {sortedGroups.map((group, index) => (
            <div
              key={group.id}
              draggable
              onDragStart={(e) => handleDragStart(e, group.id)}
              onDragOver={(e) => handleDragOver(e, group.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, group.id)}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setHoveredGroupId(group.id)}
              onMouseLeave={() => setHoveredGroupId(null)}
              className={`sidebar-group-item ${selectedGroupId === group.id ? 'active' : ''}`}
              style={{
                '--item-index': index,
                opacity: draggedGroupId === group.id ? 0.5 : 1,
                transform: draggedGroupId === group.id ? 'scale(0.95)' : 'scale(1)',
                borderStyle: dragOverGroupId === group.id && draggedGroupId !== group.id ? 'dashed' : 'solid',
                borderWidth: dragOverGroupId === group.id && draggedGroupId !== group.id ? '2px' : '1px',
                borderColor: dragOverGroupId === group.id && draggedGroupId !== group.id ? 'var(--accent-color)' : 'transparent'
              } as React.CSSProperties}
              onClick={() => onSelectGroup(group.id)}
            >
              {/* 拖拽手柄 */}
              <div className="sidebar-drag-handle">
                <GripVertical size={14} />
              </div>
              
              {/* 分组内容 */}
              <div className="sidebar-item-content">
                {/* <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color || 'var(--accent-color)' }}
                /> */}
                <span className="sidebar-item-text">{group.name}</span>
              </div>     
              
              {/* 操作按钮 */}
              {hoveredGroupId === group.id && (
                <div className="sidebar-group-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditGroup(group)
                    }}
                    className="sidebar-action-btn"
                    title="编辑分组"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteGroup(group.id)
                    }}
                    className="sidebar-action-btn sidebar-action-btn-danger"
                    title="删除分组"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              <span className="sidebar-item-count ml-1">
                {getGroupBookmarkCount(group.id)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}