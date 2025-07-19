import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LogOut } from 'lucide-react'

interface User {
    email: string
    id: string
}

interface UserAvatarProps {
    user: User
    onSignOut: () => void
}

export function UserAvatar({ user, onSignOut }: UserAvatarProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, right: 0 })
    const avatarRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isMouseOverRef = useRef(false)

    // 获取邮箱首字母
    const getInitial = (email: string) => {
        return email.charAt(0).toUpperCase()
    }

    // 计算tooltip位置
    const calculateTooltipPosition = () => {
        if (avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect()
            setTooltipPosition({
                top: rect.bottom + 8, // 头像底部 + 8px间距
                right: window.innerWidth - rect.right // 从右边对齐
            })
        }
    }

    // 清理定时器
    const clearHideTimeout = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
        }
    }

    // 显示tooltip
    const showTooltipHandler = () => {
        clearHideTimeout()
        isMouseOverRef.current = true
        calculateTooltipPosition()
        setShowTooltip(true)
    }

    // 隐藏tooltip（延迟）
    const hideTooltipHandler = () => {
        isMouseOverRef.current = false
        clearHideTimeout()
        hideTimeoutRef.current = setTimeout(() => {
            if (!isMouseOverRef.current) {
                setShowTooltip(false)
            }
        }, 150) // 增加延迟时间到150ms
    }

    // 点击外部关闭tooltip
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                avatarRef.current &&
                !avatarRef.current.contains(event.target as Node) &&
                (!tooltipRef.current || !tooltipRef.current.contains(event.target as Node))
            ) {
                clearHideTimeout()
                setShowTooltip(false)
                isMouseOverRef.current = false
            }
        }

        if (showTooltip) {
            document.addEventListener('click', handleClickOutside)
            return () => {
                document.removeEventListener('click', handleClickOutside)
            }
        }
    }, [showTooltip])

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            clearHideTimeout()
        }
    }, [])

    return (
        <div className="relative" style={{ zIndex: 9999 }}>
            {/* 用户头像 */}
            <div
                ref={avatarRef}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-300 hover:scale-110"
                style={{
                    background: 'var(--accent-color)',
                    color: 'white',
                    position: 'relative',
                    zIndex: 10000
                }}
                onMouseEnter={showTooltipHandler}
                onMouseLeave={hideTooltipHandler}
                onClick={() => {
                    if (!showTooltip) {
                        showTooltipHandler()
                    } else {
                        clearHideTimeout()
                        setShowTooltip(false)
                        isMouseOverRef.current = false
                    }
                }}
            >
                {getInitial(user.email)}
            </div>

            {/* Hover提示框 - 使用Portal渲染到body */}
            {showTooltip && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed w-48 rounded-xl border shadow-lg overflow-hidden"
                    style={{
                        top: tooltipPosition.top,
                        right: tooltipPosition.right,
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 999999 // 使用非常高的z-index
                    }}
                    onMouseEnter={() => {
                        clearHideTimeout()
                        isMouseOverRef.current = true
                    }}
                    onMouseLeave={hideTooltipHandler}
                >
                    {/* 用户信息 */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold"
                                style={{
                                    background: 'var(--accent-color)',
                                    color: 'white'
                                }}
                            >
                                {getInitial(user.email)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                    {user.email}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    已登录
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 退出按钮 */}
                    <div className="p-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onSignOut()
                                setShowTooltip(false)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-150"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            <LogOut size={14} />
                            <span>退出登录</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}