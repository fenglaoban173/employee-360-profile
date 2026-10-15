<template>
  <div class="login-container">
    <div class="login-card">
      <h2>员工360档案</h2>
      <div class="login-form">
        <a-input v-model="form.username" placeholder="用户名" size="large" class="mb-16">
          <template #prefix><icon-user /></template>
        </a-input>
        <a-input-password v-model="form.password" placeholder="密码" size="large" class="mb-16">
          <template #prefix><icon-lock /></template>
        </a-input-password>
        <a-button type="primary" long size="large" :loading="loading" @click="handleLogin">
          登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456',
})

const handleLogin = async () => {
  console.log('handleLogin called, username:', form.username)
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    userStore.setToken('mock_token_' + Date.now())
    userStore.setUserInfo({
      id: 1,
      userName: form.username,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + form.username,
      email: form.username + '@example.com',
      role: 'admin',
      permissions: ['material:read', 'material:write', 'creative:manage', 'audit:read'],
    })
    console.log('Login simulated, token set')
    Message.success('登录成功')
    await nextTick()
    router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    Message.error('登录出错')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #1a1a1a;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
