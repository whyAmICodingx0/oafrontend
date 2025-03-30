# OA System - Frontend (Vue 3)

這是 OA 系統的前端，使用 Vue 3 開發，與 Django REST API 串接，呈現請假、公告、出勤與部門圖表等資訊。具備登入驗證、權限控管與 API 整合功能，並以暗色主題打造簡潔易用的 UI。

## 安裝與啟動
```bash
git clone https://github.com/你的帳號/oa_frontend.git
cd oa_frontend
npm install
npm run serve
```

## 後端 API 位置設定
請修改 `.env` 設定 API base URL，例如：
```
VITE_API_URL=http://localhost:8000/api/
```

## 主要功能
- 員工請假申請與審核流程視覺化
- 通知公告列表與已讀狀態
- 部門統計長條圖（ECharts）
- 天氣查詢（整合第三方 API）
- 使用者登入 / 登出 / 權限導向頁面
