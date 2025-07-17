import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return
    
    // 添加点击动画效果
    const button = e.currentTarget
    button.style.animation = 'buttonPress 0.2s ease'
    setTimeout(() => {
      button.style.animation = ''
    }, 200)
    
    onClick?.(e)
  }

  // 基础样式
  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-300',
    'focus:outline-none relative overflow-hidden cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50',
    fullWidth ? 'w-full' : '',
    isPressed ? 'transform scale-95' : '',
    className
  ].filter(Boolean).join(' ')

  // 变体样式
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary'
      case 'secondary':
        return 'btn-secondary'
      case 'danger':
        return 'btn-danger'
      case 'outline':
        return 'btn-outline'
      case 'ghost':
        return 'btn-ghost'
      default:
        return 'btn-primary'
    }
  }

  // 尺寸样式
  const getSizeClasses = () => {
    const roundedClass = rounded ? 'rounded-full' : 'rounded-xl'
    
    switch (size) {
      case 'xs':
        return `px-2 py-1 text-xs ${roundedClass} gap-1`
      case 'sm':
        return `px-3 py-1.5 text-xs ${roundedClass} gap-1.5`
      case 'md':
        return `px-4 py-2 text-sm ${roundedClass} gap-2`
      case 'lg':
        return `px-6 py-3 text-base ${roundedClass} gap-2.5`
      case 'xl':
        return `px-8 py-4 text-lg ${roundedClass} gap-3`
      default:
        return `px-4 py-2 text-sm ${roundedClass} gap-2`
    }
  }

  const classes = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()}`

  // 图标尺寸映射
  const getIconSize = () => {
    switch (size) {
      case 'xs': return 12
      case 'sm': return 14
      case 'md': return 16
      case 'lg': return 18
      case 'xl': return 20
      default: return 16
    }
  }

  // 加载动画组件
  const LoadingSpinner = () => (
    <div 
      className="loading-spinner"
      style={{
        width: getIconSize(),
        height: getIconSize(),
        borderWidth: '2px'
      }}
    />
  )

  // 图标包装器
  const IconWrapper = ({ children }: { children: ReactNode }) => (
    <span 
      className="flex items-center justify-center transition-transform duration-200"
      style={{ 
        transform: loading ? 'scale(0)' : 'scale(1)',
        opacity: loading ? 0 : 1
      }}
    >
      {children}
    </span>
  )

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      
      {/* 左侧图标 */}
      {icon && iconPosition === 'left' && (
        <IconWrapper>{icon}</IconWrapper>
      )}
      
      {/* 文本内容 */}
      <span 
        className="transition-all duration-200"
        style={{ 
          opacity: loading ? 0.3 : 1,
          transform: loading ? 'translateY(2px)' : 'translateY(0)'
        }}
      >
        {children}
      </span>
      
      {/* 右侧图标 */}
      {icon && iconPosition === 'right' && (
        <IconWrapper>{icon}</IconWrapper>
      )}
      
      {/* 悬停光效 */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </div>
    </button>
  )
} 