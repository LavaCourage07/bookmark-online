import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Folder, Plus, X } from 'lucide-react'

interface Option {
  value: string
  label: string
  color?: string
}

interface PopupSelectProps {
  defaultValue?: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  onSelectRef?: (element: HTMLSelectElement | null) => void
  onOpenChange?: (isOpen: boolean) => void
  onCreateGroup?: (groupName: string) => Promise<string> // 新增：创建分组的回调，返回新分组的ID
}

export function PopupSelect({
  defaultValue = '',
  onChange,
  options,
  placeholder = '请选择',
  onSelectRef,
  onOpenChange,
  onCreateGroup
}: PopupSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const hiddenSelectRef = useRef<HTMLSelectElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === selectedValue)

  // 当输入框显示时自动聚焦
  useEffect(() => {
    if (isCreatingGroup && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreatingGroup])

  // 处理创建新分组
  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !onCreateGroup || isCreating) return

    setIsCreating(true)
    try {
      const newGroupId = await onCreateGroup(newGroupName.trim())

      // 选择新创建的分组
      setSelectedValue(newGroupId)
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = newGroupId
      }
      onChange(newGroupId)

      // 重置状态
      setNewGroupName('')
      setIsCreatingGroup(false)
      setIsOpen(false)

      // 通知父组件下拉框已关闭
      if (onOpenChange) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('创建分组失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // 取消创建分组
  const handleCancelCreate = () => {
    setNewGroupName('')
    setIsCreatingGroup(false)
  }

  // 将隐藏的select元素传递给父组件
  useEffect(() => {
    if (onSelectRef && hiddenSelectRef.current) {
      onSelectRef(hiddenSelectRef.current)
    }
  }, [onSelectRef])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // 通知父组件下拉框已关闭
        if (onOpenChange) {
          onOpenChange(false)
        }
      }
    }

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)

      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isOpen, onOpenChange])

  const handleOptionClick = (optionValue: string) => {
    console.log('🎯 PopupSelect选项点击:', { optionValue, selectedValue })

    // 更新本地状态（用于UI显示）
    setSelectedValue(optionValue)

    // 更新隐藏的select元素的值
    if (hiddenSelectRef.current) {
      hiddenSelectRef.current.value = optionValue
    }

    // 调用onChange回调
    onChange(optionValue)

    // 关闭下拉框
    setIsOpen(false)

    // 通知父组件下拉框已关闭
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  return (
    <div className="relative" ref={selectRef}>
      {/* 隐藏的原生select，用于表单提交 */}
      <select
        ref={hiddenSelectRef}
        defaultValue={defaultValue}
        style={{ display: 'none' }}
        onChange={(e) => {
          // 这个不会被触发，因为我们手动控制值
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 自定义的选择框UI */}
      <div
        className={`
          relative w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-300 cursor-pointer
          hover:border-opacity-60
          ${isOpen ? 'ring-2 ring-opacity-20' : ''}
        `}
        style={{
          background: 'var(--bg-accent)',
          borderColor: isOpen ? 'var(--accent-color)' : 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
        }}
        onClick={() => {
          const newIsOpen = !isOpen
          setIsOpen(newIsOpen)
          // 通知父组件下拉框状态变化
          if (onOpenChange) {
            onOpenChange(newIsOpen)
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedOption ? (
              <>
                {selectedOption.color && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedOption.color }}
                  />
                )}
                {!selectedOption.color && selectedOption.value && (
                  <Folder size={14} style={{ color: 'var(--text-muted)' }} />
                )}
                <span className="truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </div>

      {/* 下拉选项 - 始终在下方展示，新建分组固定在底部 */}
      {isOpen && (
        <div
          className="absolute z-50 w-full rounded-xl border shadow-lg custom-select-dropdown flex flex-col"
          style={{
            top: 'calc(100% + 8px)', // 选择框下方8px处开始
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '200px' // 最大高度200px
          }}
        >
          {/* 可滚动的选项列表 */}
          <div className="flex-1 overflow-y-auto py-2" style={{ maxHeight: onCreateGroup ? '140px' : '180px' }}>
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 flex items-center space-x-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedValue === option.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                }}
                style={{
                  background: selectedValue === option.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: selectedValue === option.value ? 'var(--accent-color)' : 'var(--text-primary)'
                }}
                onClick={() => handleOptionClick(option.value)}
              >
                {/* 分组颜色指示器或图标 */}
                {option.color ? (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                ) : option.value ? (
                  <Folder size={14} style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <div className="w-3 h-3 flex-shrink-0" />
                )}

                {/* 选项文本 */}
                <span className="flex-1 truncate">{option.label}</span>

                {/* 选中状态指示器 */}
                {selectedValue === option.value && (
                  <Check size={14} style={{ color: 'var(--accent-color)' }} />
                )}
              </div>
            ))}

          </div>

          {/* 固定在底部的新增分组功能 */}
          {onCreateGroup && (
            <div className="border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
              <div className="px-4 py-2.5">
                {!isCreatingGroup ? (
                  /* 新增分组按钮 */
                  <div
                    className="flex items-center space-x-2 text-sm cursor-pointer transition-all duration-150 px-2 py-1 rounded-lg"
                    style={{ color: 'var(--accent-color)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsCreatingGroup(true)
                    }}
                  >
                    <Plus size={14} />
                    <span>新建分组</span>
                  </div>
                ) : (
                  /* 新增分组输入框 */
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateGroup()
                        } else if (e.key === 'Escape') {
                          handleCancelCreate()
                        }
                      }}
                      placeholder="输入分组名称"
                      className="flex-1 text-sm border-none outline-none bg-transparent"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateGroup()
                      }}
                      disabled={!newGroupName.trim() || isCreating}
                      className="p-1 rounded transition-colors disabled:opacity-50"
                      style={{ color: 'var(--accent-color)' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--bg-hover)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {isCreating ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelCreate()
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}