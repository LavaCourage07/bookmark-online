import type { InputHTMLAttributes, ReactNode } from 'react'
import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  showPasswordToggle?: boolean
  loading?: boolean
  clearable?: boolean
  onClear?: () => void
}

export function Input({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  disabled = false,
  required = false,
  showPasswordToggle = false,
  loading = false,
  clearable = false,
  onClear,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 检查是否有值
  useEffect(() => {
    setHasValue(Boolean(value && String(value).length > 0))
  }, [value])

  // 处理焦点事件
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  // 处理清除按钮
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
      
      // 触发 onChange 事件
      const event = new Event('input', { bubbles: true })
      inputRef.current.dispatchEvent(event)
    }
    onClear?.()
  }

  // 切换密码显示
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // 获取输入框类型
  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password'
    }
    return type
  }

  // 获取尺寸样式
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1.5 text-xs'
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'md':
        return 'px-4 py-2.5 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
    }
  }

  // 获取变体样式
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return 'input-filled'
      case 'outlined':
        return 'input-outlined'
      default:
        return 'form-input'
    }
  }

  // 获取状态样式
  const getStateClasses = () => {
    if (error) return 'input-error animate-shake'
    if (success) return 'input-success'
    if (isFocused) return 'input-focused'
    return ''
  }

  // 图标尺寸
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 14
      case 'sm': return 16
      case 'md': return 18
      case 'lg': return 20
      default: return 18
    }
  }

  const inputClasses = [
    getVariantClasses(),
    getSizeClasses(),
    getStateClasses(),
    leftIcon ? 'pl-10' : '',
    (rightIcon || showPasswordToggle || clearable || loading) ? 'pr-10' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="w-full">
      {/* 标签 */}
      {label && (
        <label 
          className="block text-sm font-medium mb-2 transition-colors duration-200"
          style={{ 
            color: error ? '#ef4444' : success ? '#10b981' : 'var(--text-primary)'
          }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 输入框容器 */}
      <div className="relative">
        {/* 左侧图标 */}
        {leftIcon && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
            style={{ 
              color: error ? '#ef4444' : success ? '#10b981' : isFocused ? 'var(--accent-color)' : 'var(--text-muted)'
            }}
          >
            {leftIcon}
          </div>
        )}

        {/* 输入框 */}
        <input
          ref={inputRef}
          type={getInputType()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClasses}
          disabled={disabled}
          required={required}
          {...props}
        />

        {/* 右侧图标区域 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* 加载状态 */}
          {loading && (
            <div 
              className="loading-spinner"
              style={{
                width: getIconSize() - 2,
                height: getIconSize() - 2,
                borderWidth: '2px'
              }}
            />
          )}

          {/* 清除按钮 */}
          {clearable && hasValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ 
                background: 'var(--bg-accent)',
                color: 'var(--text-muted)'
              }}
            >
              <span className="text-xs">×</span>
            </button>
          )}

          {/* 密码切换按钮 */}
          {showPasswordToggle && type === 'password' && !loading && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="transition-colors duration-200 hover:scale-110"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? (
                <EyeOff size={getIconSize()} />
              ) : (
                <Eye size={getIconSize()} />
              )}
            </button>
          )}

          {/* 状态图标 */}
          {!loading && !showPasswordToggle && (
            <>
              {error && (
                <AlertCircle 
                  size={getIconSize()} 
                  style={{ color: '#ef4444' }}
                />
              )}
              {success && !error && (
                <CheckCircle 
                  size={getIconSize()} 
                  style={{ color: '#10b981' }}
                />
              )}
              {rightIcon && !error && !success && (
                <div style={{ color: isFocused ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                  {rightIcon}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 帮助文本和错误信息 */}
      <div>
        {error && (
          <p className="mt-1 min-h-[1.25rem] text-sm animate-slideDown" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1 min-h-[1.25rem] text-sm animate-slideDown" style={{ color: '#10b981' }}>
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p className="mt-1 min-h-[1.25rem] text-sm" style={{ color: 'var(--text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    </div>
  )
} 