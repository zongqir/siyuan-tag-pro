# 标签模块 (Tag Module)

## 概述

这是从 highlight 项目中抽离和重构的标签业务模块，采用模块化设计，每个文件不超过400行代码。

## 模块结构

```
src/tag/
├── core/                    # 核心功能模块
│   ├── TagManager.ts        # 标签管理器 - 标签添加和管理
│   ├── TagSearch.ts         # 标签搜索 - 搜索和结果处理
│   ├── TagRenderer.ts       # 标签渲染器 - 结果展示
│   └── TagClickManager.ts   # 标签点击管理 - 点击事件处理
│
├── ui/                      # UI组件模块
│   ├── TagDialog.ts         # 标签对话框 - 选择和警告对话框
│   ├── TagEventHandler.ts   # 事件处理器 - DOM事件监听
│   └── TagSearchPanel.ts    # 搜索面板 - 搜索结果展示
│
├── utils/                   # 工具函数模块
│   ├── logger.ts           # 日志工具
│   ├── dom.ts              # DOM操作工具
│   └── format.ts           # 格式化工具
│
├── constants/              # 常量定义
│   └── presetTags.ts       # 预设标签配置
│
├── types/                  # 类型定义
│   └── index.ts           # TypeScript类型定义
│
├── styles/                 # 样式文件
│   └── index.scss         # 模块样式
│
└── index.ts               # 模块入口文件
```

## 核心功能

### 1. TagManager (标签管理器)
- **功能**：负责为文档块添加标签
- **特性**：
  - 支持右键/双击快速添加标签
  - 预设8种常用标签（重点、难点、易错等）
  - 检测复杂样式（代码块、数学公式等）并阻止操作
  - 文档只读状态检查，保护数据安全
- **文件大小**：~250行

### 2. TagSearch (标签搜索)
- **功能**：搜索包含指定标签的所有块
- **特性**：
  - 支持三种搜索范围：本文档、文档及子文档、本笔记本
  - 自动获取当前文档信息
  - 结果按文档分组
  - 获取所有可用标签列表
- **文件大小**：~380行

### 3. TagRenderer (标签渲染器)
- **功能**：渲染标签搜索结果
- **特性**：
  - 按文档分组显示
  - 可折叠/展开文档组
  - 标签高亮显示
  - 时间格式化显示
- **文件大小**：~290行

### 4. TagClickManager (标签点击管理)
- **功能**：处理标签点击后的搜索面板显示
- **特性**：
  - 只在编辑区域内响应标签点击
  - 支持范围切换
  - 支持标签筛选
  - 结果实时更新
- **文件大小**：~150行

## UI组件

### 1. TagDialog (标签对话框)
- **功能**：显示标签选择和警告对话框
- **特性**：
  - 美观的标签选择界面
  - 样式警告提示
  - 可编辑状态警告
  - 支持键盘快捷键（ESC关闭）
- **文件大小**：~180行

### 2. TagEventHandler (事件处理器)
- **功能**：处理标签相关的DOM事件
- **特性**：
  - 桌面版右键支持
  - 移动端双击支持
  - 长按检测和冷却机制
  - 文本选择检测
- **文件大小**：~140行

### 3. TagSearchPanel (搜索面板)
- **功能**：显示标签搜索结果面板
- **特性**：
  - 响应式设计（支持移动端）
  - 标签筛选器
  - 范围选择器
  - 统计信息显示
- **文件大小**：~210行

## 工具函数

### 1. logger.ts
- 统一的日志输出工具
- 支持不同级别的日志（log, error, warn, info）

### 2. dom.ts
- DOM操作相关工具函数
- 包括：查找块元素、检查样式、标签元素识别等

### 3. format.ts
- 格式化相关工具函数
- 包括：时间格式化、HTML转义、标签高亮等

## 技术栈

- **TypeScript**：类型安全的JavaScript超集
- **Tailwind CSS**：实用优先的CSS框架
- **SiYuan API**：思源笔记API

## 使用方式

```typescript
import {
  TagClickManager,
  TagManager,
} from './tag'

// 初始化标签管理器
const tagManager = new TagManager()
tagManager.initialize()

// 初始化标签点击管理器
const tagClickManager = new TagClickManager()
tagClickManager.initialize()

// 开启调试模式（可选）
tagManager.enableDebug()
tagClickManager.enableDebug()
```

## 设计原则

1. **模块化**：每个模块职责单一，文件不超过400行
2. **可维护性**：清晰的代码结构和注释
3. **可扩展性**：易于添加新功能和标签类型
4. **类型安全**：使用TypeScript提供完整的类型定义
5. **用户体验**：美观的UI和流畅的交互

## 特色功能

### 1. 智能检测
- 自动检测复杂样式（代码块、数学公式等）
- 文档只读状态检查
- 文本选择检测

### 2. 多平台支持
- 桌面版：右键菜单
- 移动版：双击手势
- 响应式UI设计

### 3. 搜索范围控制
- 本文档：只搜索当前文档
- 文档及子文档：搜索当前文档和所有子文档
- 本笔记本：搜索整个笔记本

### 4. 结果展示优化
- 按文档分组
- 可折叠展开
- 标签高亮
- 时间显示

## 未来计划

- [ ] 支持自定义标签
- [ ] 标签统计分析
- [ ] 标签云展示
- [ ] 标签批量操作
- [ ] 标签导入导出

## 维护说明

### 添加新标签
编辑 `constants/presetTags.ts`：

```typescript
export const PRESET_TAGS: readonly PresetTag[] = [
  // 现有标签...
  {
    id: 'new-tag',
    name: '新标签',
    color: '#ff0000',
    emoji: '🔥',
  },
]
```

### 修改搜索逻辑
编辑 `core/TagSearch.ts` 中的 `searchByTag` 方法。

### 自定义UI样式
编辑 `styles/index.scss` 添加自定义样式。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License


