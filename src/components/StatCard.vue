<template>
  <div class="stat-card" :class="`theme-${theme}`">
    <div class="stat-icon">
      <component :is="iconComp" v-if="iconComp" />
    </div>
    <div class="stat-body">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value-row">
        <span class="stat-value">{{ displayValue }}</span>
        <span v-if="unit" class="stat-unit">{{ unit }}</span>
      </div>
      <div v-if="trend !== undefined && trend !== null" class="stat-trend">
        <component :is="trendIcon" :class="['trend-icon', trendClass]" />
        <span :class="['trend-value', trendClass]">{{ Math.abs(trend) }}%</span>
        <span class="trend-label">{{ trendLabel || '较上周期' }}</span>
      </div>
      <div v-else-if="subtext" class="stat-subtext">{{ subtext }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StatCard - 通用数据指标卡
 *
 * 用法:
 *   <StatCard icon="file" theme="primary" label="素材总数" :value="12847" :trend="12.5" trend-label="较昨日" />
 *   <StatCard icon="star" theme="warning" label="平均质量评分" :value="82.6" unit="分" />
 *   <StatCard icon="exclamation-circle" theme="error" label="不合规素材" :value="23" subtext="需立即处理" />
 */
import { computed, type Component } from 'vue'
import {
  IconFile,
  IconUpload,
  IconCheckCircle,
  IconClockCircle,
  IconStar,
  IconExclamationCircle,
  IconFire,
  IconStorage,
  IconEye,
  IconThunderbolt,
  IconUserGroup,
  IconHistory,
  IconExport,
  IconArrowRise,
  IconArrowFall,
} from '@arco-design/web-vue/es/icon'

type IconKey =
  | 'file'
  | 'upload'
  | 'check-circle'
  | 'clock-circle'
  | 'star'
  | 'exclamation-circle'
  | 'fire'
  | 'storage'
  | 'eye'
  | 'thunderbolt'
  | 'user-group'
  | 'history'
  | 'export'

type Theme = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'cyan'

const props = withDefaults(
  defineProps<{
    /** 预设图标名,业务侧无需关心组件导入 */
    icon: IconKey
    /** 主题色 */
    theme?: Theme
    /** 指标名称 */
    label: string
    /** 数值 */
    value: number | string
    /** 单位(可选,如 "分"、"元"、"个") */
    unit?: string
    /** 环比百分比(正涨绿、负跌红) */
    trend?: number
    /** 环比说明文案,如 "较昨日" */
    trendLabel?: string
    /** 底部辅助文案(与 trend 二选一) */
    subtext?: string
    /** 是否对 value 做千分位格式化(默认 true) */
    format?: boolean
  }>(),
  {
    theme: 'primary',
    format: true,
  },
)

const ICON_MAP: Record<IconKey, Component> = {
  file: IconFile as unknown as Component,
  upload: IconUpload as unknown as Component,
  'check-circle': IconCheckCircle as unknown as Component,
  'clock-circle': IconClockCircle as unknown as Component,
  star: IconStar as unknown as Component,
  'exclamation-circle': IconExclamationCircle as unknown as Component,
  fire: IconFire as unknown as Component,
  storage: IconStorage as unknown as Component,
  eye: IconEye as unknown as Component,
  thunderbolt: IconThunderbolt as unknown as Component,
  'user-group': IconUserGroup as unknown as Component,
  history: IconHistory as unknown as Component,
  export: IconExport as unknown as Component,
}

const iconComp = computed(() => ICON_MAP[props.icon])

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (!props.format) return String(props.value)
  return props.value.toLocaleString('zh-CN')
})

const trendClass = computed(() => {
  if (props.trend === undefined || props.trend === null) return ''
  return props.trend >= 0 ? 'trend-up' : 'trend-down'
})

const trendIcon = computed(() => {
  if (props.trend === undefined || props.trend === null) return null
  return props.trend >= 0 ? IconArrowRise : IconArrowFall
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.stat-card {
  background: $color-neutral-1;
  border-radius: $border-radius-lg;
  padding: $spacing-5;
  display: flex;
  align-items: flex-start;
  gap: $spacing-4;
  box-shadow: $shadow-sm;
  transition: transform $transition-base, box-shadow $transition-base;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: $border-radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .stat-body {
    flex: 1;
    min-width: 0;
  }

  .stat-label {
    font-size: $font-size-caption;
    color: $color-neutral-7;
    line-height: 1.2;
  }

  .stat-value-row {
    margin-top: $spacing-2;
    display: flex;
    align-items: baseline;
    gap: $spacing-1;
  }

  .stat-value {
    font-size: $font-size-title;
    font-weight: $font-weight-bold;
    color: $color-neutral-10;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  .stat-unit {
    font-size: $font-size-caption;
    color: $color-neutral-7;
    margin-left: 2px;
  }

  .stat-trend,
  .stat-subtext {
    margin-top: $spacing-2;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-caption;
  }

  .stat-subtext {
    color: $color-neutral-7;
  }

  .trend-icon {
    font-size: 12px;
  }

  .trend-value {
    font-weight: $font-weight-medium;
    font-variant-numeric: tabular-nums;

    &.trend-up {
      color: $color-success-6;
    }

    &.trend-down {
      color: $color-error-6;
    }
  }

  .trend-label {
    color: $color-neutral-7;
    margin-left: $spacing-1;
  }

  // 主题色
  &.theme-primary .stat-icon {
    background: $color-primary-1;
    color: $color-primary-6;
  }

  &.theme-success .stat-icon {
    background: $color-success-1;
    color: $color-success-6;
  }

  &.theme-warning .stat-icon {
    background: $color-warning-1;
    color: $color-warning-6;
  }

  &.theme-error .stat-icon {
    background: $color-error-1;
    color: $color-error-6;
  }

  &.theme-info .stat-icon {
    background: rgba($color-info-6, 0.1);
    color: $color-info-6;
  }

  &.theme-purple .stat-icon {
    background: rgba($color-video, 0.1);
    color: $color-video;
  }

  &.theme-cyan .stat-icon {
    background: rgba($color-image, 0.1);
    color: $color-image;
  }
}
</style>