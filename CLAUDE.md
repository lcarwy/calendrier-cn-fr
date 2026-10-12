# CLAUDE.md — 中法双轨日历（仓库名暂定 `calendrier-cn-fr`，应用显示名暂定 "Calendrier franco-chinois"）

> 本文件是项目的需求与规则说明，每次会话都会读入。改动需求或规则时同步更新本文件。
> 状态：**第一期开发中**，进度见 §16。GitHub 账号 `lcarwy`，仓库 `lcarwy/calendrier-cn-fr`（公开），网址 https://lcarwy.github.io/calendrier-cn-fr/
> 本机 `gh` 不在 PATH 里，用完整路径 `C:\Program Files\GitHub CLI\gh.exe`（Bash 里是 `"/c/Program Files/GitHub CLI/gh.exe"`）。
> 用户不熟悉 GitHub：涉及 GitHub 的操作由 Claude 用 `gh` CLI 完成，并用简单的话解释每一步；登录、建账号等需要用户本人在浏览器完成。

## 1. 项目概述

一个部署在 GitHub Pages 上的纯静态 PWA 日历，面向在法国生活/工作、同时关心中国日历的人，以及他们的**法国同事和朋友**。**界面语言为法语**（见 §10）。

月视图同时显示：
- 中国法定节假日：**放假日（休）** 与 **调休补班日（班）** 必须清晰区分
- 法国 jours fériés：可选地区（第一期：Métropole、Alsace-Moselle）
- 二十四节气、农历日期、传统节日
- 用户自定义事件

## 2. 不可违背的原则

1. **Local-first**：个人数据（事件、设置）只存在用户浏览器（IndexedDB / localStorage）。不做账号、不做后端、不上传任何个人数据。
2. **运行时零第三方请求**：不加统计/埋点，不从 CDN 加载字体或脚本，节假日数据随站点一起部署（同源）。只用系统字体。
3. **离线可用**：PWA 安装后断网也能查看所有已打包年份的日历和自己的事件。
4. **数据可携带**：用户必须能导出/导入完整备份（JSON）。iOS Safari 未安装到主屏的站点，7 天不访问可能被清空存储——UI 要提示安装和定期备份，并调用 `navigator.storage.persist()`。
5. **准确性优先**：中国调休只用官方数据，**绝不推算**；数据不确定时宁可显示"未公布"。

## 3. 技术栈

| 层 | 选择 | 说明 |
|---|---|---|
| 构建 | Vite + TypeScript（`strict`） | |
| UI | Preact + `@preact/signals` | 体积小（~4KB），写法同 React |
| 样式 | 原生 CSS + CSS 变量，CSS Grid 做月格 | 支持浅色/深色（`prefers-color-scheme`） |
| 农历/节气/传统节日 | `tyme4ts`（6tail，MIT） | lunar-javascript 作者的新一代 TS 库；**只通过 `src/domain/lunar` 适配层调用**，便于替换 |
| 中国节假日 | 构建期同步的静态 JSON（来源见 §5） | 不在运行时请求第三方 |
| 法国节假日 | 代码计算（复活节算法 + 规则表） | 任意年份可算，无需 API |
| 存储 | IndexedDB（`idb`）存事件；localStorage 存设置 | 带 `schemaVersion` 和迁移 |
| PWA | `vite-plugin-pwa`（Workbox） | `registerType: 'autoUpdate'` |
| 测试 | Vitest | 领域逻辑必须有单测 |
| 部署 | GitHub Actions → GitHub Pages | `vite.config.ts` 的 `base` 设为 `/<仓库名>/` |

包管理用 npm，Node 24 LTS。当前主版本（2026-10）：Vite 8、Preact 11、TypeScript 7（原生编译器）、Vitest 5、Prettier 3。

## 4. 目录结构（规划）

```
├─ CLAUDE.md
├─ index.html
├─ vite.config.ts
├─ public/                  # 图标、manifest 资源
├─ scripts/
│  └─ sync-cn-holidays.ts   # 拉取 + 校验 + 规范化中国节假日数据
├─ src/
│  ├─ main.tsx
│  ├─ app/                  # 根组件、全局状态（signals）
│  ├─ components/           # MonthView, DayCell, DayDetail, EventEditor, Settings…
│  ├─ domain/               # 纯函数，不得依赖 DOM / 存储 / UI
│  │  ├─ date/              # PlainDate 工具、月格、ISO 周
│  │  ├─ cn-holidays/
│  │  ├─ fr-holidays/
│  │  ├─ lunar/             # tyme4ts 适配层
│  │  ├─ events/            # 事件展开（重复规则）
│  │  └─ day-info.ts        # getDayInfo()：合并所有图层
│  ├─ data/cn-holidays/     # 生成文件，勿手改（见 §5.4 例外）
│  ├─ storage/              # IndexedDB、设置、备份导入导出
│  ├─ i18n/                 # zh（第一期）、fr、en
│  └─ styles/
└─ .github/workflows/
   ├─ deploy.yml            # push main → 构建 → Pages
   └─ sync-cn-holidays.yml  # 定时同步，有变化则开 PR
```

**架构核心**：`getDayInfo(date, settings) → DayInfo` 是唯一的合并点，UI 只消费 `DayInfo`，不直接调用各数据源。

```ts
interface DayInfo {
  date: PlainDate;              // 'YYYY-MM-DD'
  weekday: 1..7;                // 1 = 周一
  isoWeek: number;
  lunar: { monthLabel: string; dayLabel: string; isLeapMonth: boolean; isFirstDay: boolean };
  solarTerm?: SolarTermInfo;
  cnFestivals: Festival[];      // 传统节日 + 公历节日
  cnHoliday?: { name: string; kind: 'off' | 'work' | 'statutory-unpublished' };
  frHolidays: FrHoliday[];
  events: EventOccurrence[];
}
```

## 5. 中国法定节假日与调休

### 5.1 数据来源

- **权威来源**：国务院办公厅每年发布的《关于 YYYY 年部分节假日安排的通知》（gov.cn）。
  - 发布时间惯例：上一年 10–12 月（2025 年版：2024-11-12；2026 年版：2025-11-04）。
  - **2027 年版截至 2026-10-13 尚未发布**，预计 2026 年 11 月前后。
- **机器可读来源**：[NateScarlet/holiday-cn](https://github.com/NateScarlet/holiday-cn)（MIT），每日自动抓取国务院通知，每年一个 `YYYY.json`：
  ```json
  { "year": 2026, "papers": ["https://www.gov.cn/..."], "days": [{ "name": "春节", "date": "2026-02-14", "isOffDay": false }] }
  ```
  拉取地址：`https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/{year}.json`
- **备用核对**：gov.cn 原文。holiday-cn 滞后或出错时，以原文手工录入（见 §5.4）。

### 5.2 holiday-cn 的坑（同步脚本必须处理）

- **未公布年份也有文件**：如 `2027.json` 存在但 `papers` 和 `days` 都是空数组 → 视为"未公布"，不能当作"该年没有假期"。
- **年份按通知标题归属，不按日期**：某年通知可能包含上一年 12 月的日期（如元旦补班）。客户端必须把所有年份的文件合并成一个 `date → entry` 映射再查询，不能只查当年文件。
- **只列出通知明确提到的日期**：与假期相连但通知没写的普通周末可能不在列表里。
- `isOffDay: false` 的条目就是补班日。

### 5.3 同步流程（每年更新机制）

1. `.github/workflows/sync-cn-holidays.yml` 每天定时运行（成本低；通知发布时间不固定，偶尔也有年中临时调整）。
2. 运行 `scripts/sync-cn-holidays.ts`：拉取 `当前年-1` 到 `当前年+1` 的文件 → 校验 → 规范化写入 `src/data/cn-holidays/YYYY.json`。
3. 有变化时用 `peter-evans/create-pull-request` 开 PR，PR 正文附 gov.cn 原文链接，**人工对照原文后合并**；合并后 `deploy.yml` 自动发布，PWA 下次打开时自动更新。
4. GITHUB_TOKEN 创建的 PR 不会触发其他 workflow，所以**校验必须在同步 workflow 内完成**，失败则不开 PR 并让 workflow 报错。
5. 仓库设置需开启 "Allow GitHub Actions to create and approve pull requests"。

**校验规则**（任一失败即中止，不开 PR）：
- `papers` 非空，且链接域名为 `gov.cn`（否则视为未公布，跳过该年）
- 日期合法、唯一、已排序
- 每个补班日（`isOffDay: false`）必须是周六或周日
- 节日名称属于已知集合（元旦、春节、清明节、劳动节、端午节、中秋节、国庆节）；出现未知名称（如 2015 年抗战胜利纪念日）只**警告**，PR 中标注
- 每个已知节日的法定日必须被标为放假（如 2025 年起 5 月 1、2 日）
- 不得删除已发布年份的数据，除非上游 `papers` 也变了（年中调整），PR 中显式说明

### 5.4 规范化数据格式（`src/data/cn-holidays/YYYY.json`）

```json
{
  "year": 2026,
  "status": "published",
  "source": "holiday-cn",
  "papers": ["https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm"],
  "syncedAt": "2025-11-05T03:00:00Z",
  "days": [{ "date": "2026-02-14", "name": "春节", "kind": "work" }]
}
```
- `kind`: `"off"`（休）| `"work"`（班）
- 例外：上游长期滞后时可手工录入，`source` 设为 `"manual"` 并填 gov.cn 链接；同步脚本遇到 `manual` 文件不覆盖，只在上游数据不一致时在 PR 里报差异。

### 5.5 显示规则

- 放假日：角标 **休**（红色系）；补班日：角标 **班**（深灰/黑色系）。补班日是需要上班的周末，必须醒目。
- **未公布年份**：按现行《全国年节及纪念日放假办法》（2025-01-01 起施行）只标出法定节日本身，`kind = 'statutory-unpublished'`，显示"法定节日（安排未公布）"，**不显示休/班角标，不推算调休**：
  - 元旦 1/1；春节 农历除夕至正月初三（4 天）；清明 清明节气当日；劳动节 5/1–5/2；端午 五月初五；中秋 八月十五；国庆 10/1–10/3（共 13 天）
- 部分公民节日（妇女节 3/8、青年节 5/4、儿童节 6/1、建军节 8/1）只作为节日显示，不标"休"。
- 已公布年份一律以数据为准，不与上述规则混用。

## 6. 法国 jours fériés

### 6.1 规则（代码计算）

复活节用格里历算法（Meeus/Jones/Butcher）。规则表每条带 `zones` 和可选 `since` / `until` 年份，以便法律变更时版本化。

| 名称 | 日期 | 地区 |
|---|---|---|
| Jour de l'An | 1/1 | 全部 |
| Vendredi saint | 复活节 −2 | **仅 Alsace-Moselle** |
| Lundi de Pâques | 复活节 +1 | 全部 |
| Fête du Travail | 5/1 | 全部 |
| Victoire 1945 | 5/8 | 全部 |
| Ascension | 复活节 +39 | 全部 |
| Lundi de Pentecôte | 复活节 +50 | 全部 |
| Fête nationale | 7/14 | 全部 |
| Assomption | 8/15 | 全部 |
| Toussaint | 11/1 | 全部 |
| Armistice 1918 | 11/11 | 全部 |
| Noël | 12/25 | 全部 |
| Saint-Étienne | 12/26 | **仅 Alsace-Moselle** |

- 第一期支持 `metropole`、`alsace-moselle`；海外省（各自的废奴纪念日等）后续按需加入，同样要有测试。
- **férié ≠ chômé**：法律上只有 5 月 1 日必须带薪休息，其余是否放假取决于集体协议/公司惯例。Lundi de Pentecôte 常作为 *journée de solidarité* 需上班。详情面板要注明；假期规划器要允许用户勾选哪些 férié 实际放假。

### 6.2 测试基准

官方数据集 `https://calendrier.api.gouv.fr/jours-feries/{zone}/{annee}.json`（Licence Ouverte，依据 Code du travail L3133-1 起）。开发时下载若干年份存为 `tests/fixtures`，单测逐年比对；**运行时不调用该 API**。

## 7. 农历、节气、传统节日

- **时区**：节气时刻和农历初一按**北京时间（UTC+8）**计算，日期显示遵循中国历法惯例。某些节气在巴黎时间可能落在前一天——格子显示中国日期，详情面板同时显示北京时间与巴黎时间。
- **格子副标题优先级**：传统节日 > 节气 > 农历月首（显示月名，如"十月""闰六月""腊月"）> 农历日（"初八""廿三"）。
- **闰月**：传统节日只在非闰月出现（闰五月初五不是端午）。
- **除夕** = 正月初一的前一天（腊月可能只有 29 天），不能写成"腊月三十"。
- 第一期显示的传统节日：春节、元宵、龙抬头、端午、七夕、中元、中秋、重阳、腊八、小年（默认腊月廿三，北方习俗；南方廿四，后续可设置）、除夕；节气型节日：清明、冬至。
- 公历节日（情人节、植树节、教师节等）作为可关闭图层，第一期默认关闭。

## 8. 日期与时间编码规则（防 bug）

- 所有"日历日期"用 `PlainDate`（`'YYYY-MM-DD'` 字符串或 `{y, m, d}`），**没有时区**。
- **禁止** `new Date('YYYY-MM-DD')`（按 UTC 解析）和 `date.toISOString().slice(0, 10)`（法国 UTC+1/+2，本地午夜会变成前一天）。日期运算统一走 `src/domain/date`。
- 周一为一周第一天（中法一致），可选显示 ISO 周数（法国常用 "semaine 42"）。
- 月视图固定 6 行 × 7 列 = 42 格。

## 9. 自定义事件

```ts
interface CalendarEvent {
  id: string;              // crypto.randomUUID()
  title: string;
  start: PlainDate;
  end?: PlainDate;         // 含当天（inclusive）；导出 .ics 时转为不含的 DTEND
  time?: string;           // 'HH:mm'，浮动时间（不带时区），第一期可选
  color?: ColorKey;        // 预设色板
  notes?: string;
  recurrence?: { freq: 'yearly' };  // 预留：'monthly' | 'weekly' | 'lunar-yearly'（农历生日）
  createdAt: string;       // ISO 时间戳
  updatedAt: string;
}
```
- 2 月 29 日的每年重复事件，平年显示在 2 月 28 日。
- 备份格式：`{ app: "calendrier-cn-fr", schemaVersion, exportedAt, settings, events }`。导入时让用户选"合并（按 id，`updatedAt` 新者胜）"或"替换"。

## 10. UI / UX 规则

- 移动优先：手机上月格紧凑，点击某天弹出详情底部抽屉；桌面端详情在侧栏。
- 颜色不能是唯一区分手段：中国用"休/班"文字角标，法国用 "FR" 标签或固定标记。**不要用国旗 emoji**（Windows 不显示国旗）。
- 视觉约定：中国假日红色系，补班深灰，法国假日蓝色系，今天高亮。
- 每个日格有 `aria-label` 汇总当日信息；支持方向键切换日期。
- 所有 UI 文案走 i18n（`t('key')`），**第一期只做法语**（`src/i18n/fr.ts`），不得把任何语言的文案硬编码进组件。节假日、节气、传统节日名称以 key + 多语言名称（fr / zh / en）存储。
- **法语界面下中国内容的显示**（默认方案，用户可调整）：
  - 菜单、按钮、设置、图例、提示：全部法语。
  - 中国节假日名称用法语（如 *Nouvel An chinois*、*Fête de la mi-automne*、*Fête nationale (Chine)*），详情面板附汉字。
  - 日格里的农历日（"初八"）、节气（"清明"）和 **休 / 班** 角标保留汉字（短，适合小格子）。图例用法语解释：休 = *jour chômé en Chine*，班 = *jour travaillé (rattrapage)*；`aria-label` 用法语。
  - 详情面板给出法语全称 + 拼音 + 汉字，如 *Qīngmíng 清明 — « Clarté pure », 5ᵉ terme solaire*；农历日期写成 *8ᵉ jour du 9ᵉ mois lunaire*。
  - 法语排版：日期格式 `lundi 13 octobre 2026`，月份/星期首字母小写，冒号、问号前用不换行空格。
- 路由用 hash 或不分路由（GitHub Pages 无服务端重写，深链接会 404）。
- iOS 没有安装提示事件：检测到 iOS Safari 且未安装时，显示"分享 → 添加到主屏幕"的引导。

## 11. 编码约定

- `src/domain/**` 必须是纯函数，100% 可单测，不引用 DOM、存储或 Preact。
- 新增或修改节假日规则、日期工具、数据同步脚本，必须同时加/改测试。
- 关键测试锚点（必须通过）：
  - 2026 中国：春节 2/15–2/23 休，2/14、2/28 班；国庆 10/1–10/7 休，9/20、10/10 班
  - 2026 法国：Lundi de Pâques 4/6，Ascension 5/14，Lundi de Pentecôte 5/25
  - 2026 农历：正月初一 2/17，除夕 2/16，中秋 9/25
- 依赖保持最少；新增运行时依赖前说明理由和体积。
- 代码注释用中文，标识符用英文；提交信息用英文，保持简洁。
- 测试文件与源文件同目录，命名 `*.test.ts`。
- 提交前必须通过：`npm run format:check`、`npm test`、`npm run build`（CI 也跑这三步，任何一步失败就不会发布）。
- git 作者用 GitHub 匿名邮箱（已在本仓库 local config 设置），不要用用户的私人邮箱。

## 12. 常用命令

```bash
npm run dev           # 本地开发
npm run build         # 类型检查 + 生产构建
npm run preview       # 预览构建结果（测试 PWA 用这个，不用 dev）
npm test              # Vitest
npm run format        # Prettier 格式化
npm run format:check  # 检查格式（CI 用）
npm run sync:cn       # 手动同步中国节假日数据（第 3 步完成后可用）
```

push 到 `main` 会触发 `.github/workflows/deploy.yml`：格式检查 → 测试 → 构建 → 发布到 Pages。

## 13. 路线图

**第一期（MVP）**：月视图（中/法/农历/节气/传统节日 + 事件）、日详情、设置（法国地区、图层开关、主题）、事件增删改（含每年重复）、JSON 备份导入导出、PWA 离线 + 安装、GitHub Pages 自动部署、中国节假日自动同步 PR。界面仅法语。

**后续**：
- **假期规划器**：输入剩余 congés payés 与 RTT，在指定时间段内找"花最少假换最长连休"的方案（桥接 ponts）。注意 CP 有 *jours ouvrables*（周一至周六，年 30 天）和 *jours ouvrés*（周一至周五，年 25 天）两种计法，需让用户选择；允许勾选哪些 férié 实际放假；可选"与中国假期重叠"目标（如春节回国）。
- **.ics 导出/订阅**：
  - 公共日历（中国假日含调休、法国各地区假日、节气）在构建时生成静态 `.ics` 发布到 Pages，可用 `webcal://` 订阅，随数据更新自动刷新。
  - 个人事件无服务器，**只能导出为 .ics 文件**（一次性），不能订阅。
  - 遵循 RFC 5545：CRLF、75 字节折行、全天事件 `VALUE=DATE` 且 DTEND 不含当天、稳定 UID。农历重复事件无法用标准 RRULE 表达，导出时展开为未来 N 年的单次事件。
- **增加中文、英文界面**（法语已在第一期完成）。
- 农历生日（`lunar-yearly` 重复）、海外省地区、法国学校假期（zones A/B/C）、周视图、"中法同休/错休"高亮。

## 14. 发布载体（别人怎么用）

- **网页**：发布在 `https://<GitHub用户名>.github.io/calendrier-cn-fr/`。任何设备的浏览器打开即用，不用安装，也不用注册。分享这个链接即可。
- **"安装"成应用（PWA）**：同一个网页可以添加到主屏幕，之后有自己的图标、全屏打开、离线可用。
  - Android（Chrome）：菜单 → *Installer l'application*（或页面上的安装按钮）
  - iPhone/iPad（**必须用 Safari**）：分享 → *Sur l'écran d'accueil*
  - 电脑（Chrome / Edge）：地址栏右侧的安装图标；Mac Safari：文件 → 添加到程序坞
- **不上架** App Store / Google Play（需要开发者账号、年费和审核，第一期不做）。
- **数据不跨设备**：local-first 意味着每台设备、每个浏览器各存各的。手机上加的事件不会出现在电脑上，换设备要用"导出/导入备份"。这一点要在应用里写明。
- **后续可选**：.ics 订阅（同事可以在自己的 Google / Apple / Outlook 日历里直接看到中法假期，不用打开网站）；自定义域名（约 10 €/年）。
- **中国大陆访问**：`github.io` 在大陆时快时慢、偶尔打不开。目标用户主要在法国，第一期不处理；若国内亲友也要用，再考虑镜像部署。

## 15. 数据与许可

- holiday-cn：MIT；tyme4ts：MIT；法国官方数据集：Licence Ouverte (Etalab)。"关于"页面注明来源。
- 本项目采用 MIT 许可。GitHub Pages 免费版需要公开仓库——仓库里只有代码和公共数据，没有任何用户数据。

## 16. 第一期进度

每完成一步就勾选并提交。

- [x] 0. 初始化：git、Vite + Preact + TS、Vitest、Prettier、GitHub 仓库、Pages 自动部署（占位页）
- [ ] 1. 日期基础层 `src/domain/date`：PlainDate 工具、42 格月视图、ISO 周
- [ ] 2. 法国假日计算（metropole、alsace-moselle）+ 官方数据集比对测试
- [ ] 3. 中国假日同步脚本 + 校验 + 2020 年起的数据 + 未公布年份显示
- [ ] 4. 农历 / 节气 / 传统节日适配层（tyme4ts）
- [ ] 5. `getDayInfo` 合并层
- [ ] 6. 月视图 UI、日详情、移动端、深色模式、图例
- [ ] 7. 设置（法国地区、图层开关、主题）+ 持久化
- [ ] 8. 自定义事件：IndexedDB、增删改、多日、每年重复
- [ ] 9. 备份导出/导入、`storage.persist()`、iOS 安装引导
- [ ] 10. PWA：manifest、图标、离线缓存、更新
- [ ] 11. 中国数据定时同步 workflow（开 PR）
- [ ] 12. 验收：iPhone Safari / Android Chrome 真机，对照 gov.cn 原文
