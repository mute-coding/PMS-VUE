# PMS-VUE：工作項目管理系統

固定版面的個人工作台，用來集中整理公司與學校的工作項目，並在每個項目留下多筆備忘與工作紀錄。

## 目前版本

主頁提供摘要、分類篩選、搜尋、工作項目表格、快速新增、項目詳情與明暗模式切換。項目列表可直接開啟備忘表單；每次新增會保留為獨立紀錄，依時間顯示並可搜尋。明暗偏好會保存在瀏覽器。這是**靜態前端示範**：預設資料位於 `app/pages/index.vue`，新增與編輯只保留在瀏覽器目前頁面；重新整理即重設，尚未連接資料庫，也不會跨裝置同步。

## 啟動

需 Node.js 22 以上與 pnpm。

```powershell
pnpm install
pnpm dev
```

開啟 http://127.0.0.1:3000。

## 檢查

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

介面設計、RWD 與互動驗收見 [DESIGN.md](./DESIGN.md)；前後端開發規則見 [AGANTS.md](./AGANTS.md)。
