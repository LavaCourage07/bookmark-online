# 快速设置指南

## 🚀 5分钟快速开始

### 步骤1：克隆项目
```bash
git clone <repository-url>
cd bookmark-online
```

### 步骤2：安装依赖
```bash
npm install
# 或使用 pnpm (推荐)
pnpm install
```

### 步骤3：设置Supabase

#### 3.1 创建Supabase项目
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取项目URL和匿名密钥

#### 3.2 配置环境变量
创建 `.env.local` 文件：
```env
PLASMO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 3.3 创建数据库表
在Supabase SQL编辑器中运行：

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

-- 启用行级安全 (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Users can only access their own groups" ON groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### 步骤4：配置Google OAuth

#### 4.1 创建Google OAuth应用
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google+ API
4. 创建OAuth 2.0客户端ID
5. 配置授权重定向URI

#### 4.2 在Supabase中配置
1. 打开Supabase项目设置
2. 选择"Authentication" → "Settings"
3. 在"Site URL"中添加：`chrome-extension://your-extension-id`
4. 在"OAuth Providers"中启用Google
5. 添加Google OAuth客户端ID和密钥

### 步骤5：开发模式
```bash
npm run dev
```

### 步骤6：安装扩展
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome-mv3-dev` 文件夹

## 🔧 常见问题解决

### Q1: 无法连接到Supabase
**解决方案：**
- 检查环境变量配置
- 确认Supabase项目URL和密钥正确
- 检查网络连接

### Q2: Google登录失败
**解决方案：**
- 确认Google OAuth配置正确
- 检查重定向URI设置
- 确认Supabase中的OAuth配置

### Q3: 扩展无法加载
**解决方案：**
- 检查构建是否成功
- 确认manifest.json配置正确
- 查看Chrome扩展错误日志

### Q4: 样式显示异常
**解决方案：**
- 重新构建项目
- 检查Tailwind CSS配置
- 清除浏览器缓存

## 📋 开发工具推荐

### 编辑器配置
推荐使用VSCode并安装以下扩展：
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### 浏览器开发工具
- Chrome DevTools
- React Developer Tools
- Redux DevTools (如果使用Redux)

## 🚀 部署到生产环境

### 构建生产版本
```bash
npm run build
```

### 发布到Chrome Web Store
1. 打包 `build/chrome-mv3-prod` 文件夹
2. 创建Chrome Web Store开发者账户
3. 上传扩展包
4. 填写扩展信息
5. 提交审核

### 更新环境变量
确保生产环境的环境变量配置正确：
```env
PLASMO_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## 📊 性能优化建议

1. **代码分割**：使用动态导入减少包大小
2. **图片优化**：使用WebP格式和懒加载
3. **缓存策略**：合理使用浏览器缓存
4. **数据库优化**：优化查询和索引
5. **监控工具**：使用性能监控工具

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写测试用例
4. 提交代码
5. 创建Pull Request

## 📞 获取帮助

如果遇到问题，可以：
- 查看项目文档
- 提交Issue
- 联系开发团队
- 加入社区讨论

---

**祝您使用愉快！** 🎉 