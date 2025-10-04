<template>
  <div class="siyuan-tag-pro-app">
    <!-- 标签增强插件 - 由 main.ts 中的 TagManager 和 TagClickManager 管理功能 -->
  </div>
</template>

<script setup lang="ts">
import { usePlugin } from '@/main'

const plugin = usePlugin()

// 插件图标
plugin.addTopBar({
  icon: 'iconTag',
  title: '标签增强',
  callback: () => {
    // 可以在这里添加快捷操作
    console.log('[TagPro] 标签增强插件')
  },
})
</script>

<style lang="scss" scoped>
.siyuan-tag-pro-app {
  pointer-events: none;
}
</style>

<!-- 全局样式 -->
<style lang="scss">
.siyuan-tag-pro-app {
  // 插件容器样式
}
</style>
