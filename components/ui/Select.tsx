import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Folder } from 'lucide-react'

interface Option {
  value: string
  label: string
  color?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '请选择',
  label,
  disabled = false,
  className = ''
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom')
  const selectRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  console.log('🚀 Select组件渲染:', { value, optionsLength: options.length, isOpen })

  // 专门监听value变化
  useEffect(() => {
    console.log('� Seleect组件value变化:', {
      newValue: value,
      selectedOption: selectedOption?.label,
      allOptions: options.map(o => ({ value: o.value, label: o.label }))
    })
  }, [value])

  // 调试日志 - 组件状态变化
  useEffect(() => {
    console.log('🔍 Select组件状态:', {
      isOpen,
      value,
      selectedOption: selectedOption?.label,
      optionsCount: options.length,
      highlightedIndex
    })
  }, [isOpen, value, selectedOption, options.length, highlightedIndex])

  // 计算下拉框位置
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownHeight = Math.min(240, options.length * 40 + 16) // 估算下拉框高度

      // 优先从上方弹出，如果上方空间不够且下方空间更大，则从下方弹出
      if (spaceAbove >= dropdownHeight || (spaceAbove > spaceBelow && spaceAbove >= 100)) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen, options.length])

  // 点击外部关闭下拉框 - 暂时禁用以测试选项点击
  useEffect(() => {
    console.log('⚠️ 点击外部关闭功能已暂时禁用，用于调试')
    // 暂时完全禁用点击外部关闭功能
    return
  }, [isOpen])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : options.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value)
            setIsOpen(false)
            setHighlightedIndex(-1)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, highlightedIndex, options, onChange])

  // 滚动到高亮项
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleToggle = (event?: React.MouseEvent) => {
    console.log('🔄 handleToggle被调用:', {
      disabled,
      currentIsOpen: isOpen,
      willOpen: !isOpen,
      eventTarget: event?.target,
      eventType: event?.type
    })

    if (!disabled) {
      const newIsOpen = !isOpen
      setIsOpen(newIsOpen)

      if (newIsOpen) {
        // 打开时高亮当前选中项
        const currentIndex = options.findIndex(option => option.value === value)
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : -1)
        console.log('📂 下拉框打开，高亮索引:', currentIndex)
      } else {
        console.log('📁 下拉框关闭')
      }
    } else {
      console.log('🚫 Select被禁用，无法切换')
    }
  }

  const handleOptionClick = (optionValue: string) => {
    console.log('🎯 handleOptionClick被调用:', {
      optionValue,
      currentValue: value,
      selectedOption: options.find(o => o.value === optionValue),
      onChange: typeof onChange
    })

    try {
      // 立即调用onChange
      console.log('📞 调用onChange回调函数...')
      onChange(optionValue)
      console.log('✅ onChange调用成功')

      // 延迟关闭下拉框，确保onChange先执行
      setTimeout(() => {
        console.log('📁 关闭下拉框...')
        setIsOpen(false)
        setHighlightedIndex(-1)
        console.log('✅ 下拉框已关闭')
      }, 50)
    } catch (error) {
      console.error('❌ handleOptionClick执行出错:', error)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}

      {/* 选择框 */}
      <div
        ref={selectRef}
        className={`
          relative w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-300 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-60'}
          ${isOpen ? 'ring-2 ring-opacity-20' : ''}
        `}
        style={{
          background: 'var(--bg-accent)',
          borderColor: isOpen ? 'var(--accent-color)' : 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
        }}
        onClick={(e) => {
          console.log('🔄 Select主容器被点击:', { target: e.target, currentTarget: e.currentTarget })
          handleToggle(e)
        }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
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

      {/* 下拉选项 */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full rounded-xl border shadow-lg max-h-60 overflow-y-auto custom-select-dropdown ${dropdownPosition === 'top' ? 'mb-1 bottom-full' : 'mt-1 top-full'
            }`}
          style={{
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
          onClick={(e) => {
            console.log('🛑 下拉框容器被点击，阻止冒泡')
            // 阻止下拉框容器的点击事件冒泡
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            console.log('🛑 下拉框容器mousedown，阻止冒泡')
            // 也阻止mousedown事件冒泡
            e.stopPropagation()
          }}
        >
          <div ref={optionsRef} className="py-2">
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`
                  select-option px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 flex items-center space-x-2
                  ${highlightedIndex === index ? 'transform scale-[0.98]' : ''}
                  ${value === option.value ? 'font-medium' : ''}
                `}
                style={{
                  background: highlightedIndex === index
                    ? 'var(--bg-accent)'
                    : value === option.value
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'transparent',
                  color: value === option.value ? 'var(--accent-color)' : 'var(--text-primary)'
                }}
                onMouseDown={(e) => {
                  console.log('🖱️ 选项mousedown事件:', {
                    option: option.value,
                    label: option.label,
                    eventType: e.type,
                    button: e.button,
                    target: e.target
                  })

                  // 立即阻止事件传播
                  e.preventDefault()
                  e.stopPropagation()
                  e.nativeEvent.stopImmediatePropagation()

                  // 立即处理选项点击
                  handleOptionClick(option.value)
                }}
                onClick={(e) => {
                  console.log('🖱️ 选项click事件 (备用):', {
                    option: option.value,
                    label: option.label
                  })

                  // 立即阻止事件传播
                  e.preventDefault()
                  e.stopPropagation()
                  e.nativeEvent.stopImmediatePropagation()

                  // 立即处理选项点击
                  handleOptionClick(option.value)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
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
                {value === option.value && (
                  <Check size={14} style={{ color: 'var(--accent-color)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}