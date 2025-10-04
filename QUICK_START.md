# 快速开始指南

## 项目概述

这是一个思源笔记标签增强插件，从highlight项目中抽离并重构了标签业务，实现了模块化设计。

## 功能特性

### 1. 快速打标签
- 右键点击块（桌面版）或双击块（移动版）
- 选择预设标签（重点、难点、易错、记忆等8种）
- 自动添加到块末尾

### 2. 标签搜索
- 点击任意标签
- 自动展示包含该标签的所有块
- 支持三种搜索范围：
  - 📄 本文档
  - 📁 本文档及子文档
  - 📚 本笔记本

### 3. 智能保护
- 自动检测复杂样式（代码块、数学公式等）
- 文档只读状态检查
- 防止误操作

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发模式

```bash
# 监听文件变化并自动构建
pnpm dev
```

### 3. 生产构建

```bash
# 构建插件
pnpm build
```

### 4. 发布版本

```bash
# 自动发布（根据提交信息判断版本号）
pnpm release

# 手动发布
pnpm release:manual

# 发布补丁版本（x.x.1）
pnpm release:patch

# 发布小版本（x.1.x）
pnpm release:minor

# 发布大版本（1.x.x）
pnpm release:major
```

## 配置说明

### 环境变量

创建 `.env` 文件：

```env
# 思源工作空间路径（可选，用于开发模式自动部署）
VITE_SIYUAN_WORKSPACE_PATH=C:/SiYuan/workspace
```

### Tailwind CSS

已配置好Tailwind CSS，可以在组件中直接使用：

```typescript
element.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center'
```

## 使用方法

### 基础使用

1. **添加标签**
   - 桌面：右键点击文档块
   - 移动：双击文档块
   - 选择标签

2. **搜索标签**
   - 点击文档中的任意标签
   - 查看搜索结果
   - 点击结果跳转到对应块

3. **切换范围**
   - 在搜索面板中点击"本文档"、"子文档"或"笔记本"
   - 自动重新搜索

4. **筛选标签**
   - 在搜索面板中使用标签下拉菜单
   - 快速切换到其他标签的搜索结果

### 高级用法

#### 1. 自定义标签

编辑 `src/tag/constants/presetTags.ts`：

```typescript
export const PRESET_TAGS: readonly PresetTag[] = [
  { id: 'custom', name: '自定义', color: '#ff0000', emoji: '🎯' },
  // 添加更多标签...
]
```

#### 2. 开启调试模式

在 `src/main.ts` 中：

```typescript
tagManager.enableDebug()
tagClickManager.enableDebug()
```

#### 3. 修改样式

编辑 `src/tag/styles/index.scss` 或直接修改组件中的Tailwind类名。

## 项目结构

```
src/tag/
├── core/           # 核心功能（业务逻辑）
├── ui/             # UI组件（界面展示）
├── utils/          # 工具函数（辅助功能）
├── constants/      # 常量定义（配置）
├── types/          # 类型定义（TypeScript）
└── styles/         # 样式文件（SCSS）
```

详细结构请查看 [标签模块README](src/tag/README.md)

## 开发说明

### 代码规范

- 每个文件不超过400行
- 使用TypeScript编写
- 使用ESLint检查代码质量
- 使用Tailwind CSS管理样式

### 模块职责

1. **core/** - 核心业务逻辑
   - TagManager: 标签添加管理
   - TagSearch: 标签搜索
   - TagRenderer: 结果渲染
   - TagClickManager: 点击事件管理

2. **ui/** - UI组件
   - TagDialog: 对话框
   - TagEventHandler: 事件处理
   - TagSearchPanel: 搜索面板

3. **utils/** - 工具函数
   - logger: 日志
   - dom: DOM操作
   - format: 格式化

### 添加新功能

1. 确定功能属于哪个模块（core/ui/utils）
2. 在对应目录创建文件
3. 在 `index.ts` 中导出
4. 更新类型定义

### 调试技巧

1. 开启调试模式：
```typescript
tagManager.enableDebug()
tagClickManager.enableDebug()
```

2. 查看浏览器控制台日志（F12）

3. 使用思源开发者工具

## 常见问题

### Q: 为什么右键没有反应？
A: 确保文档处于只读状态（锁定状态）。

### Q: 为什么标签点击没有反应？
A: 确保标签格式正确（#标签名#）。

### Q: 如何修改预设标签？
A: 编辑 `src/tag/constants/presetTags.ts`。

### Q: 样式不生效？
A: 检查Tailwind CSS配置，确保 `tailwind.config.js` 正确。

### Q: 如何查看详细日志？
A: 开启调试模式并查看浏览器控制台。

## 相关文档

- [标签模块README](src/tag/README.md) - 模块详细说明
- [重构说明](REFACTORING.md) - 重构过程和改进
- [项目目标](wiki/项目目标.md) - 项目目标和痛点
- [技术选型](wiki/技术选型.md) - 技术栈说明

## 技术支持

如有问题，请：
1. 查看文档
2. 查看控制台日志
3. 提交Issue

## 许可证

MIT License

---

**祝使用愉快！** 🎉


