<template>
  <a-layout class="main-layout">
    <!-- Sidebar -->
    <a-layout-sider
      :width="240"
      :collapsed="collapsed"
      :collapsed-width="64"
      collapsible
      @collapse="handleCollapse"
      class="sidebar"
    >
      <div class="logo">
        <div class="logo-img" v-if="!collapsed">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
            <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="1.5" fill="none"/>
            <path d="M16 8V24" stroke="white" stroke-width="1.5"/>
            <path d="M8 12L24 20" stroke="white" stroke-width="1.5"/>
            <path d="M24 12L8 20" stroke="white" stroke-width="1.5"/>
            <circle cx="16" cy="16" r="3" fill="white" opacity="0.8"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7C3AED"/>
                <stop offset="1" stop-color="#A855F7"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span v-else class="logo-icon">M</span>
        <h1 v-if="!collapsed" class="logo-text">OA系统</h1>
      </div>

      <a-menu
        :selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        @menu-item-click="handleMenuClick"
        :style="{ width: '100%' }"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <a-sub-menu v-if="route.children?.length" :key="route.path">
            <template #icon>
              <component :is="getIcon(route.meta?.icon as string | undefined)" />
            </template>
            <template #title>{{ route.meta?.title }}</template>
            <a-menu-item
              v-for="child in route.children"
              :key="child.path"
            >
              <template #icon>
                <component :is="getIcon(child.meta?.icon as string | undefined)" />
              </template>
              {{ child.meta?.title }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="route.path">
            <template #icon>
              <component :is="getIcon(route.meta?.icon as string | undefined)" />
            </template>
            {{ route.meta?.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- Header -->
      <a-layout-header class="header">
        <div class="header-left">
          <a-button
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <icon-menu-fold v-if="!collapsed" />
            <icon-menu-unfold v-else />
          </a-button>
          <breadcrumb-nav />
        </div>
        
        <div class="header-right">
          <!-- User -->
          <a-dropdown trigger="click">
            <a-button type="text" class="user-btn">
              <a-avatar :size="32" class="user-avatar">
                <img :src="userStore.avatar" alt="avatar" />
              </a-avatar>
              <span class="user-name">{{ userStore.userName }}</span>
              <icon-down />
            </a-button>
            <template #content>
              <a-doption @click="handleLogout">
                <icon-export /> 退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  IconMenuFold,
  IconMenuUnfold,
  IconDown,
  IconExport,
  IconUser,
} from '@arco-design/web-vue/es/icon'
import BreadcrumbNav from './components/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const collapsed = ref(false)
const openKeys = ref<string[]>([])

const selectedKeys = computed(() => [route.path])

const menuRoutes = computed(() => {
  const layoutRoute = router.getRoutes().find(r => r.name === 'Layout')
  return (
    layoutRoute?.children
      ?.filter((r) => r.meta?.title && !r.meta?.hideInMenu)
      .map((r) => ({
        ...r,
        // 同样过滤掉子级中的 hideInMenu
        children: r.children?.filter((c) => !c.meta?.hideInMenu),
      })) || []
  )
})

const iconMap: Record<string, any> = {
  'icon-user': IconUser,
}

const getIcon = (iconName?: string) => {
  if (!iconName) return null
  return iconMap[iconName] || iconName
}

const handleCollapse = (val: boolean) => {
  collapsed.value = val
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const handleMenuClick = (key: string) => {
  router.push(key)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

watch(
  () => route.path,
  (newPath) => {
    const parentPath = newPath.split('/').slice(0, 2).join('/')
    if (parentPath !== newPath && !openKeys.value.includes(parentPath)) {
      openKeys.value.push(parentPath)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0 16px;
    border-bottom: 1px solid var(--color-neutral-3);

    .logo-img {
      width: 32px;
      height: 32px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--color-primary-6), var(--color-primary-4));
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-neutral-10);
      margin: 0;
      white-space: nowrap;
    }
  }

  :deep(.arco-menu) {
    padding: 8px;
  }
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: v-bind('collapsed ? "64px" : "240px"');
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 99;
  transition: left 0.2s;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 18px;
      color: var(--color-neutral-8);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-search {
      width: 240px;
    }

    .action-btn {
      font-size: 20px;
      color: var(--color-neutral-8);
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;

      .user-avatar {
        border: 2px solid var(--color-neutral-3);
      }

      .user-name {
        font-size: 14px;
        color: var(--color-neutral-10);
      }
    }
  }
}

.content {
  margin-left: v-bind('collapsed ? "64px" : "240px"');
  margin-top: 64px;
  transition: margin-left 0.2s;
}
</style>
