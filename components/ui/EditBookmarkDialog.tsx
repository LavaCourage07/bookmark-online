import { useState, useEffect } from 'react'
import { Edit2, X, BookOpen } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'

interface Bookmark {
    id: string
    title: string
    url: string
    favicon?: string | null
    group_id?: string | null
}

interface Group {
    id: string
    name: string
    color: string | null
}

interface EditBookmarkDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, updates: Partial<Bookmark>) => Promise<void>
    bookmark: Bookmark | null
    groups: Group[]
}

export function EditBookmarkDialog({
    isOpen,
    onClose,
    onSave,
    bookmark,
    groups
}: EditBookmarkDialogProps) {
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        group_id: ''
    })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (bookmark && isOpen) {
            setFormData({
                title: bookmark.title,
                url: bookmark.url,
                group_id: bookmark.group_id || ''
            })
            setErrors({})
        }
    }, [bookmark, isOpen])

    if (!isOpen || !bookmark) return null

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.title.trim()) {
            newErrors.title = '请输入书签标题'
        }

        if (!formData.url.trim()) {
            newErrors.url = '请输入书签URL'
        } else {
            try {
                new URL(formData.url)
            } catch {
                newErrors.url = '请输入有效的URL地址'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setSaving(true)
            await onSave(bookmark.id, {
                title: formData.title.trim(),
                url: formData.url.trim(),
                group_id: formData.group_id || null
            })
            onClose()
        } catch (error) {
            console.error('保存书签失败:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave()
        }
    }

    return (
        <div className="modal">
            <div className="modal-content w-[500px]">
                {/* 头部 */}
                <div className="flex items-center justify-between p-6" style={{
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: 'var(--accent-color)',
                                color: 'white'
                            }}
                        >
                            <Edit2 size={18} />
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            编辑书签
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
                <div className="p-6 space-y-4" onKeyDown={handleKeyDown}>
                    {/* 书签预览 */}
                    <div className="flex items-center space-x-3 p-3 rounded-xl" style={{
                        background: 'var(--bg-accent)',
                        border: '1px solid var(--border-color)'
                    }}>
                        {bookmark.favicon ? (
                            <img
                                src={bookmark.favicon}
                                alt=""
                                className="w-6 h-6 rounded"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.nextElementSibling?.classList.remove('hidden')
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-6 h-6 rounded flex items-center justify-center ${bookmark.favicon ? 'hidden' : ''}`}
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {bookmark.title}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {bookmark.url}
                            </p>
                        </div>
                    </div>

                    {/* 表单 */}
                    <div className="space-y-4">
                        <Input
                            label="书签标题"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="输入书签标题"
                            error={errors.title}
                            required
                        />
                        <Input
                            label="书签URL"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://example.com"
                            error={errors.url}
                            required
                        />

                        <Select
                            label="分组"
                            value={formData.group_id}
                            onChange={(value) => {
                                console.log('EditDialog: 接收到分组选择', { 
                                    value, 
                                    currentFormData: formData,
                                    groups: groups.map(g => ({ id: g.id, name: g.name }))
                                })
                                setFormData(prev => ({ ...prev, group_id: value }))
                            }}
                            placeholder="选择分组"
                            options={[
                                { value: '', label: '未分组' },
                                ...groups.map(group => ({
                                    value: group.id,
                                    label: group.name,
                                    color: group.color || undefined
                                }))
                            ]}
                        />
                    </div>

                    {/* 快捷键提示 */}
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        按 Ctrl+Enter 快速保存
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 p-6" style={{
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        loading={saving}
                    >
                        保存更改
                    </Button>
                </div>
            </div>
        </div>
    )
}