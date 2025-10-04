/**
 * 预设标签配置
 */

import type { PresetTag } from '../types'

export const PRESET_TAGS: readonly PresetTag[] = [
  { id: 'important', name: '重点', color: '#ff4444', emoji: '⭐' },
  { id: 'difficult', name: '难点', color: '#ff9800', emoji: '🔥' },
  { id: 'mistake', name: '易错', color: '#9c27b0', emoji: '⚡' },
  { id: 'memory', name: '记忆', color: '#2196f3', emoji: '💭' },
  { id: 'explore', name: '挖掘', color: '#4caf50', emoji: '🔍' },
  { id: 'check', name: '检查', color: '#00bcd4', emoji: '✅' },
  { id: 'practice', name: '练习', color: '#8bc34a', emoji: '✍️' },
  { id: 'question', name: '疑问', color: '#ffc107', emoji: '❓' },
] as const


