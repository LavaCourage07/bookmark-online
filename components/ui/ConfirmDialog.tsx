import { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'danger',
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: '#ef4444',
          confirmVariant: 'danger' as const
        }
      case 'warning':
        return {
          iconColor: '#f59e0b',
          confirmVariant: 'primary' as const
        }
      case 'info':
        return {
          iconColor: '#3b82f6',
          confirmVariant: 'primary' as const
        }
      default:
        return {
          iconColor: '#ef4444',
          confirmVariant: 'danger' as const
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div className="modal">
      <div className="modal-content w-96">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6" style={{
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: `${typeStyles.iconColor}20`,
                color: typeStyles.iconColor
              }}
            >
              {icon || <AlertTriangle size={20} />}
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: 'var(--bg-accent)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 p-6" style={{
          borderTop: '1px solid var(--border-color)'
        }}>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={typeStyles.confirmVariant}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}