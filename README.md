# SiYuan Tag Pro - Enhanced Tag Management Plugin

[简体中文](./README_zh_CN.md)

A powerful tag management plugin for SiYuan Note, providing quick tag insertion and intelligent search capabilities.

## ✨ Key Features

### 🏷️ Quick Tag Insertion

- **Easy Operation**: Right-click/long-press on a block in read-only mode to quickly add tags
- **8 Preset Tags**:
  - ⭐ Important - Mark important content
  - 🔥 Difficult - Mark challenging knowledge points
  - ⚡ Mistake - Record error-prone areas
  - 💭 Memory - Content that needs to be memorized
  - 🔍 Explore - Content for further research
  - ✅ Check - Content that needs review
  - ✍️ Practice - Knowledge points for practice
  - ❓ Question - Content with questions
- **Safety Protection**: Multiple checks ensure tags are only added in safe states
- **Style Protection**: Automatically detects complex styles to avoid format damage

### 🔍 Intelligent Tag Search

- **One-Click Search**: Click any tag to instantly display all content containing that tag
- **Multiple Search Scopes**:
  - 📄 Current Doc - Search only the current document
  - 📁 Sub Docs - Search current document and all its subdocuments
  - 📚 Notebook - Search the entire notebook
- **Grouped by Document**: Search results are intelligently grouped by document
- **Quick Navigation**: Click search results to instantly jump to the corresponding block
- **Tag Switching**: Quickly switch to other tags in the search panel

### 🎨 Beautiful Interface

- **Modern Design**: Built with Tailwind CSS, clean and elegant interface
- **Smooth Animations**: Rich transition animation effects for a smooth user experience
- **Responsive Layout**: Perfect support for desktop and mobile devices
- **Theme Adaptation**: Automatically adapts to SiYuan's theme colors

## 📦 Installation

### Method 1: Install from Marketplace (Recommended)

1. Open SiYuan Note
2. Go to `Settings` → `Marketplace` → `Plugins`
3. Search for "Tag Pro"
4. Click `Download` and enable the plugin

### Method 2: Manual Installation

1. Download the latest `package.zip` from [Releases](https://github.com/Wetoria/siyuan-tag-pro/releases)
2. Extract to SiYuan's plugin directory `<workspace>/data/plugins/`
3. Restart SiYuan Note
4. Enable the plugin in `Settings` → `Marketplace` → `Downloaded`

## 🚀 Usage

### Adding Tags

1. Lock the document (enter read-only mode)
2. Right-click (or long-press) on the block where you want to add a tag
3. Select the tag you want to add
4. The tag will be automatically added to the end of the block

### Searching Tags

1. Click any tag in the document
2. The search panel automatically opens, showing all content containing that tag
3. Use the scope selector at the top to switch search ranges
4. Click search results to jump to the corresponding location
5. Use the tag dropdown menu to switch to other tags

## ⚙️ Development

### Requirements

- Node.js 18+
- pnpm 10+

### Development Steps

```bash
# Clone repository
git clone https://github.com/Wetoria/siyuan-tag-pro.git
cd siyuan-tag-pro

# Install dependencies
pnpm install

# Copy configuration file
cp .env.example .env

# Edit VITE_SIYUAN_WORKSPACE_PATH in .env to your SiYuan workspace path

# Start development mode
pnpm dev
```

### Build for Production

```bash
# Build production version
pnpm build

# Automatically create version and release
pnpm release:patch  # Patch version 0.0.1 -> 0.0.2
pnpm release:minor  # Minor version 0.0.1 -> 0.1.0
pnpm release:major  # Major version 0.0.1 -> 1.0.0
```

## 🛠️ Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS + SCSS
- **Package Manager**: pnpm

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version update details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT License](./LICENSE)

## 🙏 Acknowledgments

- [SiYuan Note](https://github.com/siyuan-note/siyuan) - Excellent note-taking software
- [plugin-sample-vite-vue](https://github.com/siyuan-note/plugin-sample-vite-vue) - Plugin template

---

If this plugin helps you, please Star ⭐ to support!
