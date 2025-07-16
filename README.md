# 智能书签管理器 2.0

基于 Plasmo Framework + Supabase 构建的现代化浏览器书签管理扩展。

## 🚀 功能特性

### 核心功能
- ✅ **用户认证**：Google OAuth 登录
- ✅ **书签管理**：创建、编辑、删除书签
- ✅ **智能分组**：自定义分组和颜色标签
- ✅ **实时同步**：跨设备云端同步
- ✅ **搜索过滤**：快速查找书签
- ✅ **批量操作**：导入导出书签
- ✅ **快捷键支持**：便捷的键盘操作

### 界面特性
- 🎨 **现代化设计**：基于 Tailwind CSS
- 🌙 **明暗主题**：支持主题切换
- 📱 **响应式布局**：适配不同屏幕尺寸
- 🎯 **网格/列表视图**：多种展示方式
- ⚡ **流畅动画**：优雅的交互效果

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Plasmo Framework
- **样式处理**：Tailwind CSS
- **后端服务**：Supabase
- **数据库**：PostgreSQL
- **认证服务**：Supabase Auth
- **图标库**：Lucide React

## 📦 项目结构

```
bookmark-online/
├── components/           # React 组件
│   └── ui/              # 基础 UI 组件
├── hooks/               # 自定义 Hook
│   ├── useAuth.ts       # 认证管理
│   └── useBookmarks.ts  # 书签管理
├── lib/                 # 工具库
│   └── supabase.ts      # Supabase 客户端
├── types/               # TypeScript 类型定义
├── contents/            # 内容脚本
├── popup.tsx            # 弹出窗口页面
├── newtab.tsx           # 新标签页页面
├── background.ts        # 后台服务脚本
├── style.css            # 全局样式
└── package.json         # 项目配置
```

## 🏗️ 开发设置

### 1. 环境要求
- Node.js 16.14.x 或更高版本
- npm 或 pnpm
- Chrome 浏览器

### 2. 安装依赖
```bash
cd bookmark-online
npm install
# 或
pnpm install
```

### 3. 环境变量设置
创建 `.env.local` 文件：
```env
PLASMO_PUBLIC_SUPABASE_URL=your_supabase_url
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 数据库设置
在 Supabase 中执行以下 SQL 创建表：

```sql
-- 创建用户分组表
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#0ea5e9',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建书签表
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_group_id ON bookmarks(group_id);
CREATE INDEX idx_groups_user_id ON groups(user_id);

-- 启用 RLS（行级安全）
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Users can only access their own groups" ON groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### 5. 开发模式
```bash
npm run dev
# 或
pnpm dev
```

### 6. 构建项目
```bash
npm run build
# 或
pnpm build
```

## 🔧 扩展安装

### 开发环境
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome-mv3-dev` 文件夹

### 生产环境
1. 运行 `npm run build` 构建项目
2. 打包 `build/chrome-mv3-prod` 文件夹
3. 提交到 Chrome Web Store

## 📋 使用说明

### 快捷键
- `Ctrl+Shift+B`：快速添加当前页面为书签
- `Ctrl+Shift+M`：打开书签管理器

### 右键菜单
- 右键页面：添加到书签
- 右键选中文本：将选中内容添加为书签

### 界面操作
- 点击扩展图标：打开快捷操作面板
- 新标签页：完整的书签管理界面
- 搜索：实时搜索书签标题和URL
- 分组：创建自定义分组和颜色标签

## 🌟 高级功能

### 数据同步
- 自动云端同步，支持多设备访问
- 实时数据更新，无需手动刷新
- 支持离线访问（缓存机制）

### 批量操作
- 导入 HTML 格式书签文件
- 导入 JSON 格式书签文件
- 批量编辑和删除

### 主题支持
- 明亮主题和暗黑主题
- 自动跟随系统主题
- 自定义主题颜色

## 🐛 故障排除

### 常见问题
1. **登录失败**：检查 Supabase 配置和网络连接
2. **同步问题**：确认 RLS 策略配置正确
3. **样式问题**：检查 Tailwind CSS 构建是否正常

### 调试模式
```bash
# 启用详细日志
npm run dev -- --verbose

# 清除缓存
npm run clean
npm run build
```

## 📊 性能优化

- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理大量书签
- 图片懒加载和缓存机制
- 数据库查询优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎯 路线图

- [ ] 团队协作功能
- [ ] 书签标签系统
- [ ] 智能推荐算法
- [ ] 移动端支持
- [ ] API 接口开放
- [ ] 插件生态系统

## 📞 支持

如果您遇到任何问题或有建议，请：
- 创建 [Issue](https://github.com/your-username/bookmark-online/issues)
- 发送邮件至 support@example.com
- 加入我们的讨论组

---

**智能书签管理器 2.0** - 让书签管理更加智能和高效！ 