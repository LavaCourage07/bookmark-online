import { useState, useEffect } from 'react'
import { supabase } from '~lib/supabase'
import type { Bookmark, Group, CreateBookmarkData, CreateGroupData } from '~types'

export function useBookmarks(userId: string | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  // 加载书签
  const loadBookmarks = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载书签失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载分组
  const loadGroups = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载分组失败')
    }
  }

  // 创建书签
  const createBookmark = async (bookmarkData: CreateBookmarkData) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          ...bookmarkData,
          user_id: userId
        })
        .select()
        .single()

      if (error) throw error
      setBookmarks(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建书签失败')
    }
  }

  // 更新书签
  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setBookmarks(prev => prev.map(b => b.id === id ? data : b))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新书签失败')
    }
  }

  // 删除书签
  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除书签失败')
    }
  }

  // 创建分组
  const createGroup = async (groupData: CreateGroupData) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          user_id: userId,
          order_index: groupData.order_index || groups.length
        })
        .select()
        .single()

      if (error) throw error
      setGroups(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建分组失败')
    }
  }

  // 更新分组
  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setGroups(prev => prev.map(g => g.id === id ? data : g))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新分组失败')
    }
  }

  // 删除分组
  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGroups(prev => prev.filter(g => g.id !== id))
      
      // 将该分组的书签移动到默认分组
      setBookmarks(prev => prev.map(b => 
        b.group_id === id ? { ...b, group_id: null } : b
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除分组失败')
    }
  }

  // 获取当前页面信息
  const getCurrentPageInfo = async () => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0]
          resolve({
            title: tab.title || '',
            url: tab.url || '',
            favicon: tab.favIconUrl || ''
          })
        })
      } else {
        resolve({
          title: document.title || '',
          url: window.location.href || '',
          favicon: ''
        })
      }
    })
  }

  // 批量导入书签
  const importBookmarks = async (bookmarksData: CreateBookmarkData[]) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert(bookmarksData.map(b => ({ ...b, user_id: userId })))
        .select()

      if (error) throw error
      setBookmarks(prev => [...data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入书签失败')
    }
  }

  // 获取浏览器书签
  const getBrowserBookmarks = async () => {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          const flatBookmarks: any[] = []
          
          const traverseBookmarks = (nodes: any[], folderName = '') => {
            nodes.forEach((node) => {
              if (node.url) {
                // 这是一个书签
                flatBookmarks.push({
                  title: node.title,
                  url: node.url,
                  folderName: folderName,
                  dateAdded: node.dateAdded
                })
              } else if (node.children) {
                // 这是一个文件夹
                const currentFolder = node.title || folderName
                traverseBookmarks(node.children, currentFolder)
              }
            })
          }
          
          traverseBookmarks(bookmarkTreeNodes)
          resolve(flatBookmarks)
        })
      } else {
        reject(new Error('Chrome bookmarks API not available'))
      }
    })
  }

  // 导入浏览器书签
  const importBrowserBookmarks = async () => {
    if (!userId) return { success: false, message: '用户未登录' }
    
    try {
      setImporting(true)
      setError(null)
      
      // 获取浏览器书签
      const browserBookmarks = await getBrowserBookmarks() as any[]
      
      if (browserBookmarks.length === 0) {
        return { success: true, message: '没有找到浏览器书签' }
      }
      
      // 获取现有书签的URL列表用于去重
      const { data: existingBookmarks } = await supabase
        .from('bookmarks')
        .select('url')
        .eq('user_id', userId)
      
      const existingUrls = new Set(existingBookmarks?.map(b => b.url) || [])
      
      // 过滤出新书签
      const newBookmarks = browserBookmarks.filter(bookmark => 
        !existingUrls.has(bookmark.url)
      )
      
      if (newBookmarks.length === 0) {
        return { success: true, message: '没有新书签需要导入' }
      }
      
      // 创建或获取分组
      const folderGroups = new Map<string, string>()
      
      // 获取现有分组
      const { data: existingGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
      
      // 创建分组映射
      existingGroups?.forEach(group => {
        folderGroups.set(group.name, group.id)
      })
      
      // 为新文件夹创建分组
      const uniqueFolders = [...new Set(newBookmarks.map(b => b.folderName).filter(Boolean))]
      
      for (const folderName of uniqueFolders) {
        if (!folderGroups.has(folderName)) {
          const { data: newGroup } = await supabase
            .from('groups')
            .insert({
              user_id: userId,
              name: folderName,
              color: '#6b7280', // 灰色作为默认颜色
              order_index: (existingGroups?.length || 0) + uniqueFolders.indexOf(folderName)
            })
            .select()
            .single()
          
          if (newGroup) {
            folderGroups.set(folderName, newGroup.id)
          }
        }
      }
      
      // 批量插入书签
      const bookmarksToInsert = newBookmarks.map(bookmark => ({
        user_id: userId,
        title: bookmark.title || '未命名书签',
        url: bookmark.url,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`,
        group_id: bookmark.folderName ? folderGroups.get(bookmark.folderName) : null
      }))
      
      const { data: insertedBookmarks, error: insertError } = await supabase
        .from('bookmarks')
        .insert(bookmarksToInsert)
        .select()
      
      if (insertError) throw insertError
      
      // 更新本地状态
      setBookmarks(prev => [...(insertedBookmarks || []), ...prev])
      
      // 更新分组状态
      const { data: updatedGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
      
      if (updatedGroups) {
        setGroups(updatedGroups)
      }
      
      return { 
        success: true, 
        message: `成功导入 ${newBookmarks.length} 个书签` 
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导入失败'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadBookmarks()
      loadGroups()
    }
  }, [userId])

  return {
    bookmarks,
    groups,
    loading,
    error,
    importing,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    createGroup,
    updateGroup,
    deleteGroup,
    getCurrentPageInfo,
    importBookmarks,
    importBrowserBookmarks,
    refresh: () => {
      loadBookmarks()
      loadGroups()
    }
  }
} 