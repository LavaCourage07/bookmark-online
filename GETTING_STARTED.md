# 快速上手指南

## 🚀 立即开始

### 1. 环境准备
确保你的开发环境已安装：
- Node.js 16.14.x 或更高版本
- npm 或 pnpm
- Chrome 浏览器

### 2. 安装依赖
```bash
# 使用npm
npm install

# 或使用pnpm（推荐）
pnpm install
```

### 3. 环境配置
创建 `.env.local` 文件：
```env
PLASMO_PUBLIC_SUPABASE_URL=your_supabase_url
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 加载到Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `build/chrome-mv3-dev` 文件夹

## 🎯 主要功能

### 弹出窗口 (popup.tsx)
- 用户登录/登出
- 快速添加当前页面为书签
- 选择书签分组
- 跳转到完整管理界面

### 新标签页 (newtab.tsx)
- 书签网格/列表展示
- 实时搜索功能
- 分组管理
- 书签编辑和删除
- 主题切换

### 快捷操作
- `Ctrl+Shift+B`: 快速添加书签
- `Ctrl+Shift+M`: 打开书签管理器
- 右键菜单: 添加书签选项

## 🔧 开发指南

### 添加新组件
1. 在 `components/ui/` 下创建新组件
2. 使用 TypeScript 和 React
3. 遵循现有的样式规范

### 修改样式
- 使用 Tailwind CSS 类
- 在 `style.css` 中添加自定义样式
- 支持明暗主题

### 添加新功能
1. 在 `hooks/` 中创建自定义 Hook
2. 更新 `types/index.ts` 添加类型定义
3. 在页面组件中使用新功能

## 📚 相关文档

- [详细README](README.md) - 完整项目介绍
- [快速设置](setup.md) - 详细设置步骤
- [项目结构](PROJECT_STRUCTURE.md) - 架构说明
- [重构总结](PROJECT_SUMMARY.md) - 升级内容

## 🐛 常见问题

**Q: 扩展无法加载？**
A: 检查构建是否成功，确保选择了正确的文件夹

**Q: 登录失败？**
A: 确认 Supabase 配置正确，检查网络连接

**Q: 样式显示异常？**
A: 重新构建项目，清除浏览器缓存

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

---

开始你的智能书签管理之旅！ 🌟 