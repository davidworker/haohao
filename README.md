# 好好運作｜前端切版練習

以 [好好運作](https://haohao.lovetech.tw/) 為基準的單頁切版練習。內容區由本地 JSON 帶入，聯絡表單與詢問統計接到 Google Apps Script。

## 技術棧

- HTML
- CSS（自訂變數、Grid / Flex、響應式）
- Vue 3 Composition API（`assets/vue.global.prod.js`，掛載 `#app`）
- Chart.js 4（CDN，詢問統計圖表）

沒有打包流程，也沒有套件管理。用靜態伺服器開啟 `index.html` 即可預覽。

## 本地預覽

此專案的 Live Server 埠號設在 `5501`（見 `.vscode/settings.json`）。

用 VS Code Live Server 開啟 `index.html`，或在專案根目錄執行：

```bash
python3 -m http.server 5501
```

再開啟 `http://127.0.0.1:5501/`。

直接用 `file://` 開啟時，瀏覽器會擋掉 `fetch`，頁面內容與統計都不會載入。

## 目錄

```text
index.html          版面與 Vue 模板
style.css           樣式
app.js              資料載入、表單、統計圖表
api/                各區塊的靜態 JSON
assets/             圖檔、favicon、Vue 全域檔
```

## 頁面區塊

| 錨點 | 資料來源 | 說明 |
| --- | --- | --- |
| `#hero` | 寫在 HTML | 主標與行動按鈕 |
| `#pain` | `api/pains.json` | 使用者卡點 |
| `#services` | `api/services.json` | 服務項目 |
| `#process` | `api/processes.json` | 合作方式 |
| `#about` | `api/abouts.json` | 關於好好運作 |
| `#partners` | `api/partners.json` | 合作夥伴 |
| `#faq` | `api/faqs.json` | 常見問題 |
| `#contact` | 表單狀態在 `app.js` | 聯絡表單 |
| `#stats` | Google Apps Script | 近 7 天詢問統計 |
| `#footer` | 寫在 HTML | 頁尾 |

`app.js` 在掛載後以 `fetch` 讀取上述 JSON，再用 `v-for` 渲染。序號由 `prefixNumber` 補成兩位數。

## 聯絡表單

必填：稱呼、聯絡方式、對應聯絡欄位、需求類型、狀況說明、隱私同意。

- 聯絡方式為 Email、電話或 Line，只顯示對應欄位。
- `website` 是蜜罐欄位，有值時不送出。
- 送出目標是 Google Apps Script（`submitGAS`）。`submitFormData` 指向 `book.niceinfos.com` 的 `contact.php`，目前未啟用。

## 詢問統計

頁面載入時向同一個 Apps Script 索取近 7 天彙總（`action=stats`），再用 Chart.js 畫出：

- 每日詢問量（長條圖）
- 需求類型、聯絡方式、處理狀態（圓餅圖）

統計只顯示分類與數量，不顯示個別聯絡資料。
