// 用户类型
export interface User {
  id: string
  email: string
  created_at: string
}

// 书签类型
export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  favicon: string | null
  group_id: string | null
  created_at: string
  updated_at: string
}

// 分组类型
export interface Group {
  id: string
  user_id: string
  name: string
  color: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// 书签创建类型
export interface CreateBookmarkData {
  title: string
  url: string
  favicon?: string | null
  group_id?: string | null
}

// 分组创建类型
export interface CreateGroupData {
  name: string
  color?: string | null
  order_index?: number
}

// 主题类型
export type Theme = 'light' | 'dark'

// 认证状态
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// 书签状态
export interface BookmarkState {
  bookmarks: Bookmark[]
  groups: Group[]
  loading: boolean
  error: string | null
  currentFilter: string
  searchQuery: string
} 