<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const route = useRoute()
const { login } = useMockAuth()
const loginError = ref('')

const fields: AuthFormField[] = [{
  name: 'username',
  type: 'text',
  label: '帳號',
  placeholder: '請輸入帳號',
  autocomplete: 'username',
  required: true
}, {
  name: 'password',
  type: 'password',
  label: '密碼',
  placeholder: '請輸入密碼',
  autocomplete: 'current-password',
  required: true
}]

const schema = z.object({
  username: z.string('請輸入帳號').min(1, '請輸入帳號'),
  password: z.string('請輸入密碼').min(8, '密碼至少需要 8 個字元')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loginError.value = ''
  if (!login(payload.data.username, payload.data.password)) {
    loginError.value = '帳號或密碼錯誤。'
    return
  }

  await navigateTo('/')
}

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

useSeoMeta({ title: '登入｜PMS', description: '工作項目管理系統登入頁面。' })
</script>

<template>
  <main class="login-page">
    <div class="login-topbar">
      <span class="login-page-label">PMS 工作空間</span>
      <button
        type="button"
        class="login-theme-button"
        :aria-label="isDark ? '切換為淺色模式' : '切換為深色模式'"
        :title="isDark ? '切換為淺色模式' : '切換為深色模式'"
        @click="toggleColorMode"
      >
        <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" aria-hidden="true" />
      </button>
    </div>

    <div class="login-content">
      <UPageCard class="login-card w-full max-w-md">
        <UAuthForm
          :schema="schema"
          title="登入"
          description="工作項目管理系統"
          :fields="fields"
          :submit="{ label: '登入' }"
          @submit="onSubmit"
        >
          <template #leading>
            <div class="login-brand" aria-label="PMS 標誌">
              <span class="brand-mark"><UIcon name="i-lucide-layers-3" aria-hidden="true" /></span>
              <span class="login-brand-name">PMS</span>
            </div>
          </template>
          <template #validation>
            <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
            <p v-else-if="route.query.expired === '1'" class="login-error" role="alert">
              登入已逾時，請重新登入。
            </p>
          </template>
          <template #footer>
            <p class="login-note">示範帳號：admin／密碼：administrator</p>
            <p class="login-note">這是前端模擬登入；資料仍只保留在目前頁面。</p>
          </template>
        </UAuthForm>
      </UPageCard>
    </div>
  </main>
</template>

<style scoped>
.login-page{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--page);color:var(--text-primary)}
.login-topbar{width:min(100%,1500px);margin:0 auto;padding:20px clamp(16px,4.3vw,72px);display:flex;align-items:center;justify-content:space-between;gap:16px}
.login-page-label{color:var(--text-primary);font-size:16px;font-weight:700}
.login-theme-button{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--border);border-radius:11px;background:var(--surface);color:var(--text-primary);font-size:20px}
.login-content{flex:1;display:flex;align-items:center;justify-content:center;padding:24px 16px 72px}
.login-card{min-width:0;border:1px solid var(--border);box-shadow:0 12px 32px #0F172A0D}
.login-brand{display:flex;align-items:center;gap:10px}
.login-brand .brand-mark{flex:none;width:48px;height:48px;font-size:27px}
.login-brand-name{font-size:23px;font-weight:800;letter-spacing:-.04em;color:var(--text-primary)}
.login-note{margin:0;color:var(--text-secondary);font-size:14px;line-height:1.6}
.login-note+.login-note{margin-top:6px}
.login-error{margin:0 0 12px;color:#B91C1C;font-size:14px;font-weight:700;line-height:1.5}
.login-card :deep(input){min-height:48px;font-size:16px}
.login-card :deep(button[type="submit"]){min-height:48px;font-size:16px}
:global(html.dark) .login-error{color:#FCA5A5}
:global(html.dark) .login-card{background:var(--surface)}
@media(max-width:599px){.login-content{align-items:flex-start;padding-top:clamp(24px,10vh,80px)}.login-card{max-width:100%}}
</style>
