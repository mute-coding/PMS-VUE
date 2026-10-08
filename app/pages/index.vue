<script setup lang="ts">
type Area = '公司' | '學校'
type Status = '進行中' | '待開始' | '已完成'
type Priority = '高' | '中' | '低'
type Filter = '全部項目' | Area
interface MemoEntry { id: number, title: string, content: string, createdAt: string }
interface WorkItem { id: number, title: string, area: Area, project: string, status: Status, priority: Priority, dueDate: string, description: string, memos: MemoEntry[], logs: string[] }
const items = ref<WorkItem[]>([
  { id: 1, title: '整理第三季產品需求', area: '公司', project: '產品規劃', status: '進行中', priority: '高', dueDate: '2026-10-03', description: '彙整各部門回饋，準備下一次需求討論。', memos: [{ id: 1, title: '討論前確認', content: '先確認設計與工程的優先順序。', createdAt: '2026-09-30T09:00:00+08:00' }], logs: ['09/30 已收集業務團隊的需求清單。'] },
  { id: 2, title: '完成行動平台期中報告', area: '學校', project: '行動平台設計', status: '進行中', priority: '高', dueDate: '2026-10-06', description: '整理研究背景、系統架構與目前成果。', memos: [{ id: 2, title: '報告準備', content: '報告需附上操作流程畫面。', createdAt: '2026-09-29T14:00:00+08:00' }], logs: ['09/29 完成報告大綱。'] },
  { id: 3, title: '更新客戶訪談摘要', area: '公司', project: '使用者研究', status: '待開始', priority: '中', dueDate: '2026-10-09', description: '將近期訪談重點整理成可搜尋的摘要。', memos: [], logs: [] },
  { id: 4, title: '閱讀資料庫系統論文', area: '學校', project: '資料庫系統', status: '進行中', priority: '中', dueDate: '2026-10-12', description: '閱讀指定論文並整理三個討論問題。', memos: [{ id: 3, title: '閱讀重點', content: '留意實驗方法與限制。', createdAt: '2026-09-28T18:00:00+08:00' }], logs: ['09/28 已下載指定閱讀材料。'] },
  { id: 5, title: '整理每週例會待辦', area: '公司', project: '團隊協作', status: '已完成', priority: '低', dueDate: '2026-09-30', description: '確認本週會議待辦與負責人。', memos: [], logs: ['09/30 完成會議紀錄與分工。'] }
])
const activeFilter = ref<Filter>('全部項目')
const search = ref('')
const createOpen = ref(false)
const selectedItemId = ref<number | null>(null)
const newLog = ref('')
const memoTitle = ref('')
const memoContent = ref('')
const memoSearch = ref('')
const memoError = ref('')
const focusMemoOnOpen = ref(false)
let nextMemoId = 4
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
let returnFocusTo: HTMLElement | null = null
const form = reactive({ title: '', area: '公司' as Area, project: '', status: '待開始' as Status, priority: '中' as Priority, dueDate: '', description: '' })
const filteredItems = computed(() => items.value.filter((item) => {
  const keyword = search.value.trim().toLocaleLowerCase()
  return (activeFilter.value === '全部項目' || item.area === activeFilter.value) && (!keyword || `${item.title} ${item.project} ${item.description}`.toLocaleLowerCase().includes(keyword))
}))
const selectedItem = computed(() => items.value.find(item => item.id === selectedItemId.value))
const visibleMemos = computed(() => selectedItem.value?.memos
  .filter(memo => `${memo.title} ${memo.content}`.toLocaleLowerCase().includes(memoSearch.value.trim().toLocaleLowerCase()))
  .slice()
  .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id) || [])
const activeCount = computed(() => items.value.filter(item => item.status === '進行中').length)
const todayIso = ref('')
const todayLabel = ref('')
const weekEndExclusive = computed(() => {
  if (!todayIso.value) return ''
  const end = new Date(`${todayIso.value}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + 7)
  return end.toISOString().slice(0, 10)
})
const upcomingCount = computed(() => items.value.filter(item => item.status !== '已完成' && todayIso.value && item.dueDate >= todayIso.value && item.dueDate < weekEndExclusive.value).length)
const completedCount = computed(() => items.value.filter(item => item.status === '已完成').length)
function updateToday() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (type: string) => parts.find(item => item.type === type)?.value || ''
  todayIso.value = `${part('year')}-${part('month')}-${part('day')}`
  todayLabel.value = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric' }).format(now)
}
function formatDate(value: string) {
  if (!value) return '未設定'
  const [, month, day] = value.split('-')
  return `${Number(month)}/${Number(day)}`
}
function createItem() {
  if (!form.title.trim()) return
  items.value.unshift({ id: Date.now(), title: form.title.trim(), area: form.area, project: form.project.trim() || '未分類', status: form.status, priority: form.priority, dueDate: form.dueDate, description: form.description.trim(), memos: [], logs: [] })
  activeFilter.value = '全部項目'
  search.value = ''
  Object.assign(form, { title: '', area: '公司', project: '', status: '待開始', priority: '中', dueDate: '', description: '' })
  createOpen.value = false
}
function openDetail(id: number, focusMemo = false) {
  focusMemoOnOpen.value = focusMemo
  selectedItemId.value = id
}
function formatMemoTime(value: string) {
  return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
}
function addMemo() {
  if (!selectedItem.value) return
  const content = memoContent.value.trim()
  if (!content) {
    memoError.value = '請先輸入備忘內容。'
    return
  }
  selectedItem.value.memos.push({ id: nextMemoId++, title: memoTitle.value.trim(), content, createdAt: new Date().toISOString() })
  memoTitle.value = ''
  memoContent.value = ''
  memoSearch.value = ''
  memoError.value = ''
  nextTick(() => document.querySelector<HTMLTextAreaElement>('#memo-content')?.focus())
}
function addLog() {
  if (!selectedItem.value || !newLog.value.trim()) return
  const today = new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit' }).format(new Date())
  selectedItem.value.logs.unshift(`${today} ${newLog.value.trim()}`)
  newLog.value = ''
}
function handleDialogKeydown(event: KeyboardEvent) {
  if (!createOpen.value && !selectedItemId.value) return
  if (event.key === 'Escape') {
    createOpen.value = false
    selectedItemId.value = null
    return
  }
  if (event.key !== 'Tab') return
  const dialog = document.querySelector<HTMLElement>('.dialog, .detail-drawer')
  const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
watch([createOpen, selectedItemId], async ([isCreate, itemId], [wasCreate, wasItemId]) => {
  if ((isCreate || itemId) && !wasCreate && !wasItemId) {
    returnFocusTo = document.activeElement as HTMLElement
    await nextTick()
    document.querySelector<HTMLElement>(isCreate ? '.dialog input' : focusMemoOnOpen.value ? '#memo-content' : '.detail-drawer .icon-button')?.focus()
  } else if (!isCreate && !itemId && (wasCreate || wasItemId)) {
    memoTitle.value = ''
    memoContent.value = ''
    memoSearch.value = ''
    memoError.value = ''
    focusMemoOnOpen.value = false
    await nextTick()
    returnFocusTo?.focus()
    returnFocusTo = null
  }
})
onMounted(() => {
  updateToday()
  window.addEventListener('keydown', handleDialogKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', handleDialogKeydown))
useSeoMeta({ title: '工作總覽｜PMS', description: '集中管理公司與學校的工作項目、紀錄和備忘。' })
</script>

<template>
  <div class="app-shell">
    <aside
      class="sidebar"
      aria-label="主導覽"
    >
      <div class="brand">
        <span class="brand-mark"><UIcon name="i-lucide-layers-3" /></span><span><strong>PMS</strong><small>WORKSPACE</small></span>
      </div>
      <div class="sidebar-section-label">
        工作空間
      </div>
      <nav
        class="side-nav"
        aria-label="項目篩選"
      >
        <button
          type="button"
          :class="['nav-item', { active: activeFilter === '全部項目' }]"
          @click="activeFilter = '全部項目'"
        >
          <UIcon name="i-lucide-layout-dashboard" /><span class="nav-label">所有工作項目</span><span class="nav-count">{{ items.length }}</span>
        </button>
        <button
          type="button"
          :class="['nav-item', { active: activeFilter === '公司' }]"
          @click="activeFilter = '公司'"
        >
          <UIcon name="i-lucide-briefcase-business" /><span class="nav-label">公司工作</span><span class="nav-count">{{ items.filter(i => i.area === '公司').length }}</span>
        </button>
        <button
          type="button"
          :class="['nav-item', { active: activeFilter === '學校' }]"
          @click="activeFilter = '學校'"
        >
          <UIcon name="i-lucide-graduation-cap" /><span class="nav-label">學校作業</span><span class="nav-count">{{ items.filter(i => i.area === '學校').length }}</span>
        </button>
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-tip">
          <UIcon name="i-lucide-sparkles" /><strong>讓每件事都有位置</strong><p>快速建立項目，隨時留下工作紀錄與備忘。</p>
        </div><div class="profile">
          <span class="avatar">我</span><span><strong>我的工作空間</strong><small>個人管理中心</small></span><UIcon name="i-lucide-chevrons-up-down" />
        </div>
      </div>
    </aside>
    <main class="main-content">
      <div class="topbar">
        <div class="breadcrumb">
          工作空間 <UIcon name="i-lucide-chevron-right" /> <strong>工作總覽</strong>
        </div><div class="topbar-right">
          <span class="today"><UIcon name="i-lucide-calendar-days" /> {{ todayLabel || '今日' }}</span>
          <button
            class="theme-toggle"
            type="button"
            :aria-label="isDark ? '切換為淺色模式' : '切換為深色模式'"
            :title="isDark ? '切換為淺色模式' : '切換為深色模式'"
            @click="toggleColorMode"
          >
            <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" />
          </button>
          <span class="topbar-avatar">我</span>
        </div>
      </div>
      <div class="page-content">
        <div class="page-heading">
          <div>
            <div class="eyebrow">
              OVERVIEW <span /> 你的工作，一目了然
            </div><h1>工作總覽<span class="title-dot">.</span></h1><p>把公司與學校的待辦放在同一個地方，專注處理眼前重要的事。</p>
          </div><button
            class="primary-button heading-add"
            type="button"
            aria-label="建立工作項目"
            @click="createOpen = true"
          >
            <UIcon name="i-lucide-plus" /><span class="button-label">建立工作項目</span>
          </button>
        </div>
        <section
          class="summary-grid"
          aria-label="工作項目摘要"
        >
          <div class="summary-card">
            <div class="summary-icon purple">
              <UIcon name="i-lucide-list-todo" />
            </div><div>
              <span class="summary-label">所有項目</span><div class="summary-number">
                {{ items.length }}<small>個項目</small>
              </div>
            </div><UIcon
              class="summary-arrow"
              name="i-lucide-arrow-up-right"
            />
          </div>
          <div class="summary-card">
            <div class="summary-icon blue">
              <UIcon name="i-lucide-loader-circle" />
            </div><div>
              <span class="summary-label">進行中</span><div class="summary-number">
                {{ activeCount }}<small>個項目</small>
              </div>
            </div><UIcon
              class="summary-arrow"
              name="i-lucide-arrow-up-right"
            />
          </div>
          <div class="summary-card">
            <div class="summary-icon orange">
              <UIcon name="i-lucide-calendar-clock" />
            </div><div>
              <span class="summary-label">未來 7 天到期</span><div class="summary-number">
                {{ todayIso ? upcomingCount : '—' }}<small>個項目</small>
              </div>
            </div><UIcon
              class="summary-arrow"
              name="i-lucide-arrow-up-right"
            />
          </div>
          <div class="summary-card">
            <div class="summary-icon green">
              <UIcon name="i-lucide-circle-check" />
            </div><div>
              <span class="summary-label">已完成</span><div class="summary-number">
                {{ completedCount }}<small>個項目</small>
              </div>
            </div><UIcon
              class="summary-arrow"
              name="i-lucide-arrow-up-right"
            />
          </div>
        </section>
        <section
          class="work-section"
          aria-labelledby="work-title"
        >
          <div class="section-header">
            <div>
              <div class="section-kicker">
                YOUR WORK
              </div><h2 id="work-title">
                工作項目 <span class="count-pill">{{ filteredItems.length }}</span>
              </h2><p>整理、追蹤你目前手上的每一件事。</p>
            </div><button
              class="secondary-button section-add"
              type="button"
              aria-label="新增工作項目"
              @click="createOpen = true"
            >
              <UIcon name="i-lucide-plus" /><span class="button-label">新增項目</span>
            </button>
          </div>
          <div class="table-toolbar">
            <div
              class="filter-tabs"
              aria-label="篩選工作類別"
            >
              <button
                v-for="filter in (['全部項目', '公司', '學校'] as Filter[])"
                :key="filter"
                type="button"
                :class="{ selected: activeFilter === filter }"
                @click="activeFilter = filter"
              >
                {{ filter === '公司' ? '公司工作' : filter === '學校' ? '學校作業' : filter }}
              </button>
            </div><label class="search-field"><UIcon name="i-lucide-search" /><span class="sr-only">搜尋工作項目</span><input
              v-model="search"
              type="search"
              placeholder="搜尋工作項目..."
            ></label>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    工作項目
                  </th><th scope="col">
                    類別
                  </th><th scope="col">
                    狀態
                  </th><th scope="col">
                    優先順序
                  </th><th scope="col">
                    截止日期
                  </th><th
                    scope="col"
                    aria-label="查看詳情"
                  />
                </tr>
              </thead><tbody>
                <tr
                  v-for="item in filteredItems"
                  :key="item.id"
                >
                  <td>
                    <button
                      class="item-title"
                      type="button"
                      @click="openDetail(item.id)"
                    >
                      {{ item.title }}
                    </button><span class="item-project">{{ item.project }}</span><button
                      class="memo-shortcut"
                      type="button"
                      :aria-label="`在${item.title}新增備忘錄，已有${item.memos.length}筆`"
                      @click="openDetail(item.id, true)"
                    >
                      <UIcon name="i-lucide-sticky-note" />備忘錄 <span>{{ item.memos.length }}</span>
                    </button>
                  </td><td><span :class="['area-tag', item.area === '公司' ? 'company' : 'school']"><UIcon :name="item.area === '公司' ? 'i-lucide-briefcase-business' : 'i-lucide-graduation-cap'" />{{ item.area }}</span></td><td><span :class="['status-tag', item.status === '進行中' ? 'in-progress' : item.status === '已完成' ? 'done' : 'pending']"><span class="status-dot" />{{ item.status }}</span></td><td><span :class="['priority', item.priority === '高' ? 'high' : item.priority === '中' ? 'medium' : 'low']"><span class="priority-line" />{{ item.priority }}</span></td><td class="date-cell">
                    {{ formatDate(item.dueDate) }}
                  </td><td>
                    <button
                      class="row-action"
                      type="button"
                      :aria-label="`查看${item.title}`"
                      @click="openDetail(item.id)"
                    >
                      <UIcon name="i-lucide-arrow-up-right" />
                    </button>
                  </td>
                </tr><tr v-if="filteredItems.length === 0">
                  <td
                    colspan="6"
                    class="empty-state"
                  >
                    <UIcon name="i-lucide-search-x" /><strong>找不到符合的項目</strong><span>試試其他關鍵字或切換篩選條件。</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span>顯示 {{ filteredItems.length }} 筆工作項目</span><span>點選項目可查看紀錄與備忘 <UIcon name="i-lucide-arrow-right" /></span>
          </div>
        </section>
        <div class="static-note">
          <UIcon name="i-lucide-info" />目前為前端示範版本；新增的內容在重新整理頁面後會重設。
        </div>
      </div>
    </main>
    <div
      v-if="createOpen"
      class="overlay"
      @click.self="createOpen = false"
    >
      <section
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
      >
        <div class="dialog-top">
          <div>
            <span class="dialog-eyebrow">NEW WORK ITEM</span><h2 id="create-title">
              建立工作項目
            </h2><p>先記下重要的事，細節可以之後再補上。</p>
          </div><button
            class="icon-button"
            type="button"
            aria-label="關閉"
            @click="createOpen = false"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </div><form @submit.prevent="createItem">
          <label class="field"><span>項目名稱 <b>*</b></span><input
            v-model="form.title"
            required
            autofocus
            placeholder="例如：整理產品需求文件"
          ></label><div class="form-grid">
            <label class="field"><span>類別</span><select v-model="form.area"><option>公司</option><option>學校</option></select></label><label class="field"><span>所屬專案 / 課程</span><input
              v-model="form.project"
              placeholder="例如：產品規劃"
            ></label><label class="field"><span>狀態</span><select v-model="form.status"><option>待開始</option><option>進行中</option><option>已完成</option></select></label><label class="field"><span>優先順序</span><select v-model="form.priority"><option>高</option><option>中</option><option>低</option></select></label>
          </div><label class="field"><span>截止日期</span><input
            v-model="form.dueDate"
            type="date"
          ></label><label class="field"><span>簡短說明</span><textarea
            v-model="form.description"
            rows="3"
            placeholder="這個項目需要完成什麼？"
          /></label><div class="dialog-actions">
            <button
              class="text-button"
              type="button"
              @click="createOpen = false"
            >
              取消
            </button><button
              class="primary-button"
              type="submit"
            >
              <UIcon name="i-lucide-plus" />建立項目
            </button>
          </div>
        </form>
      </section>
    </div>
    <div
      v-if="selectedItem"
      class="overlay drawer-overlay"
      @click.self="selectedItemId = null"
    >
      <aside
        class="detail-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="selectedItem.title"
      >
        <div class="drawer-top">
          <span class="dialog-eyebrow">WORK ITEM DETAIL</span><button
            class="icon-button"
            type="button"
            aria-label="關閉詳情"
            @click="selectedItemId = null"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </div><h2>{{ selectedItem.title }}</h2><p class="detail-desc">
          {{ selectedItem.description || '尚未填寫項目說明。' }}
        </p><div class="detail-tags">
          <span :class="['area-tag', selectedItem.area === '公司' ? 'company' : 'school']">{{ selectedItem.area }}</span><span :class="['status-tag', selectedItem.status === '進行中' ? 'in-progress' : selectedItem.status === '已完成' ? 'done' : 'pending']"><span class="status-dot" />{{ selectedItem.status }}</span>
        </div><div class="detail-meta">
          <div><span>所屬專案</span><strong>{{ selectedItem.project }}</strong></div><div><span>截止日期</span><strong>{{ formatDate(selectedItem.dueDate) }}</strong></div><div><span>優先順序</span><strong>{{ selectedItem.priority }}</strong></div>
        </div><div class="detail-block">
          <h3><UIcon name="i-lucide-sticky-note" />新增備忘錄</h3>
          <form
            class="memo-form"
            @submit.prevent="addMemo"
          >
            <label class="field"><span>主題（選填）</span><input
              v-model="memoTitle"
              maxlength="80"
              placeholder="例如：本週會議重點"
            ></label>
            <label class="field"><span>備忘內容 <b>*</b></span><textarea
              id="memo-content"
              v-model="memoContent"
              rows="4"
              maxlength="3000"
              placeholder="記下需求、待辦或課堂重點"
              :aria-invalid="Boolean(memoError)"
              :aria-describedby="memoError ? 'memo-error' : undefined"
              @input="memoError = ''"
            /></label>
            <p
              v-if="memoError"
              id="memo-error"
              class="memo-error"
              role="alert"
            >
              {{ memoError }}
            </p>
            <p class="memo-hint">
              時間會自動記錄，每次新增都是獨立的一筆。
            </p>
            <button
              class="primary-button memo-submit"
              type="submit"
            >
              <UIcon name="i-lucide-plus" />新增備忘錄
            </button>
          </form>
          <div class="memo-list-heading">
            <h3><UIcon name="i-lucide-list" />備忘紀錄</h3><span>{{ selectedItem.memos.length }} 筆</span>
          </div>
          <label class="memo-search"><span class="sr-only">搜尋這件工作的備忘錄</span><input
            v-model="memoSearch"
            type="search"
            placeholder="搜尋這件工作的備忘"
          ></label>
          <div
            v-if="visibleMemos.length"
            class="memo-list"
          >
            <article
              v-for="memo in visibleMemos"
              :key="memo.id"
              class="memo-entry"
            >
              <time :datetime="memo.createdAt">{{ formatMemoTime(memo.createdAt) }}</time>
              <h4 v-if="memo.title">
                {{ memo.title }}
              </h4>
              <p>{{ memo.content }}</p>
            </article>
          </div>
          <p
            v-else
            class="no-memo"
          >
            {{ memoSearch ? '找不到符合的備忘錄。' : '還沒有備忘錄，寫下第一筆吧。' }}
          </p>
          <small>備忘錄僅保留在目前頁面；重新整理後會重設。</small>
        </div><div class="detail-block">
          <h3><UIcon name="i-lucide-notebook-pen" />工作紀錄</h3><form
            class="log-form"
            @submit.prevent="addLog"
          >
            <input
              v-model="newLog"
              placeholder="記下今天的進度..."
            ><button
              type="submit"
              aria-label="新增紀錄"
            >
              <UIcon name="i-lucide-plus" />
            </button>
          </form><div
            v-if="selectedItem.logs.length"
            class="log-list"
          >
            <p
              v-for="(log, index) in selectedItem.logs"
              :key="index"
            >
              {{ log }}
            </p>
          </div><p
            v-else
            class="no-log"
          >
            還沒有工作紀錄，寫下第一筆吧。
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
