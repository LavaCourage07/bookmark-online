import { useState } from 'react'
import { Edit2, Trash2, ExternalLink, BookOpen, Copy, Check } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string | null
  group_id?: string | null
  is_favorite?: boolean
  created_at?: string
}

interface Group {
  id: string
  name: string
  color: string | null
}

interface BookmarkCardProps {
  bookmark: Bookmark
  groups: Group[]
  viewMode?: 'grid' | 'list'
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (bookmark: Bookmark) => void
  onClick?: (bookmark: Bookmark) => void
}

export function BookmarkCard({
  bookmark,
  groups,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onClick
}: BookmarkCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const group = groups.find(g => g.id === bookmark.group_id)
  const groupColor = group?.color || 'var(--accent-color)'
  
  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是操作按钮，不触发卡片点击
    if ((e.target as HTMLElement).closest('.bookmark-actions')) {
      return
    }
    
    if (onClick) {
      onClick(bookmark)
    } else {
      window.open(bookmark.url, '_blank')
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(bookmark)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(bookmark)
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(bookmark.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = bookmark.url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getFaviconUrl = () => {
    if (imageError || !bookmark.favicon) {
      try {
        const domain = new URL(bookmark.url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {
        return null
      }
    }
    return bookmark.favicon
  }

  if (viewMode === 'list') {
    return (
      <div 
        className="bookmark-card-list"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          {/* Favicon */}
          <div className="flex-shrink-0 mr-3">
            {getFaviconUrl() ? (
              <img 
                src={getFaviconUrl()!}
                alt="" 
                className="w-5 h-5 rounded"
                onError={handleImageError}
              />
            ) : (
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--bg-accent)' }}>
                <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {bookmark.title}
              </h3>
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {bookmark.url}
            </p>
            
            {/* Group indicator */}
            {group && (
              <div className="flex items-center space-x-1 mt-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: groupColor }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {group.name}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="bookmark-actions flex items-center space-x-1 ml-4">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="action-button"
                title="编辑书签"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="action-button action-button-danger"
                title="删除书签"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={handleCopy}
              className="action-button"
              title={copied ? '已复制!' : '复制链接'}
              style={{
                backgroundColor: copied ? '#10b981' : undefined,
                color: copied ? 'white' : undefined
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleClick}
              className="action-button"
              title="在新标签页打开"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div 
      className="bookmark-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      {/* Group indicator bar */}
      {/* {group && (
        <div 
          className="absolute top-0 left-0 w-full h-1 rounded-t-lg" 
          style={{ background: groupColor }}
        />
      )} */}
      
      {/* Content */}
      <div className="mt-2">
        <div className="flex items-start space-x-3 mb-3">
          {/* Favicon */}
          <div className="flex-shrink-0">
            {getFaviconUrl() ? (
              <img 
                src={getFaviconUrl()!}
                alt="" 
                className="w-6 h-6 rounded"
                onError={handleImageError}
              />
            ) : (
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--bg-accent)' }}>
                <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>
          
          {/* Title and URL */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>
              {bookmark.title}
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {bookmark.url}
            </p>
          </div>
        </div>
        
        {/* Group tag */}
        {group && (
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: groupColor }}
            />
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ 
              backgroundColor: `${groupColor}20`,
              color: groupColor
            }}>
              {group.name}
            </span>
          </div>
        )}
      </div>
      
      {/* Actions overlay */}
      {showActions && (
        <div className="bookmark-actions absolute bottom-3 right-3 flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="action-button"
              title="编辑书签"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="action-button action-button-danger"
              title="删除书签"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="action-button"
            title={copied ? '已复制!' : '复制链接'}
            style={{
              backgroundColor: copied ? '#10b981' : undefined,
              color: copied ? 'white' : undefined
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}

    </div>
  )
}