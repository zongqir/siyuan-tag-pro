# 故障排除指南

## 问题：Tailwind CSS 导入错误

### 错误信息
```
[vite:css] [sass] Missing "./base" specifier in "tailwindcss" package
```

### 原因
Tailwind CSS 4.x 版本改变了导入语法，与传统的 `@import` 方式不兼容。

### 解决方案

已进行以下修复：

1. **降级 Tailwind CSS 到 3.x 版本**
   ```json
   // package.json
   "tailwindcss": "^3.4.0"  // 从 4.1.14 降级
   ```

2. **更新样式导入方式**
   ```scss
   // src/index.scss
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @import './tag/styles/index.scss';  // 本地文件仍使用 @import
   ```

3. **更新 Tailwind 配置**
   ```js
   // tailwind.config.js
   export default {
     content: [
       './src/**/*.{vue,js,ts,jsx,tsx,html}',
     ],
     theme: {
       extend: {},
     },
     plugins: [],
     corePlugins: {
       preflight: true,
     },
   }
   ```

## 验证修复

运行以下命令验证是否修复成功：

### 1. 清理并重新安装依赖
```bash
pnpm install
```

### 2. 尝试构建
```bash
pnpm build
```

如果成功，应该在配置的输出目录看到构建文件。

### 3. 运行开发模式
```bash
pnpm dev
```

应该看到类似输出：
```
vite v6.x.x building for production...
watching for file changes...
build started...
✓ XX modules transformed.
```

## 常见问题

### Q1: 仍然报 Tailwind 错误？
**A:** 尝试删除 node_modules 和锁文件后重新安装：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q2: 样式没有生效？
**A:** 确保：
1. `tailwind.config.js` 中的 `content` 路径正确
2. `postcss.config.js` 配置了 tailwindcss 和 autoprefixer
3. `src/index.scss` 正确导入了 Tailwind 指令

### Q3: 构建很慢？
**A:** 这是正常的，Tailwind CSS 需要扫描所有文件来生成样式。开发模式下会更快。

### Q4: 想使用 Tailwind CSS 4.x？
**A:** 如果要使用 4.x 版本，需要：
1. 使用 `@import "tailwindcss"` 代替 `@tailwind` 指令
2. 更新配置文件为 CSS 文件 `tailwind.config.css`
3. 参考官方文档：https://tailwindcss.com/docs/v4-beta

## 当前配置

### 依赖版本
- Tailwind CSS: 3.4.0
- PostCSS: 8.5.6
- Autoprefixer: 10.4.21
- Sass: 1.62.1
- Vite: 6.2.1

### 配置文件
- `tailwind.config.js` - Tailwind 配置
- `postcss.config.js` - PostCSS 配置
- `src/index.scss` - 样式入口
- `vite.config.ts` - Vite 配置

## 替代方案

如果不想使用 Tailwind CSS，可以：

1. **移除 Tailwind**
```bash
pnpm remove tailwindcss postcss autoprefixer
```

2. **更新 src/index.scss**
```scss
// 移除 Tailwind 指令
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

// 只保留本地样式
@import './tag/styles/index.scss';

.plugin-sample-vite-vue-app {
  // Your styles
}
```

3. **更新组件**
将组件中的 Tailwind 类名改为自定义 CSS 类或内联样式。

## 需要帮助？

如果问题仍未解决：
1. 检查浏览器控制台是否有错误
2. 查看构建输出的详细信息
3. 提交 Issue 并附上错误信息

## 参考资料

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 配置](https://vitejs.dev/config/)
- [PostCSS 配置](https://postcss.org/)
- [Sass 文档](https://sass-lang.com/documentation)


