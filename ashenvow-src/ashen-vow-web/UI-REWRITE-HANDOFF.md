# UI 重写 · 执行手册（Phase 5–10）

> 交给 deepseek-flash 逐屏执行。本文档只含「做什么、改哪里、怎么验证」，不含讨论。
> 详细背景与阶段拆解见：`C:\Users\YYKJ\.workbuddy\plans\swift-vortex-einstein-2GSLjL6Q.md`

---

## 0. 接手状态

- Phase 0–4 已完成（git 提交 `0816e60` → `ca318a4`），114 项测试全绿。
- **你从 Phase 5 开始**，按顺序做到 Phase 10。
- 工作目录：`C:/Users/YYKJ/WorkBuddy/网页优化/ashenvow-src/ashen-vow-web`
- 改的文件只有两个：`src/ui.js`、`style.css`。其余一律不碰。

## 1. 设计方向（每次改屏都问自己这两句）

1. **重梳信息层级**：这一屏「玩家现在该做的唯一决策」是什么？让它最显眼；其余信息降级或收纳。
2. **统一视觉语言**：用 token（见下）替换魔法数字；按钮/卡片/间距全站一致。

## 2. 全局铁律（违反任何一条 = 本阶段作废重做）

1. **只改 `src/ui.js` 和 `style.css`**。`src/engine.js`、`src/data/tables.js`、`src/storage.js`、`src/presentation.js` 一行不可动。
2. **UI 状态不得写入 `game` 对象**。禁止出现 `game.view`、`game.campSection`、`game.chosenSkill`、`game.tab` 等。
3. **65 个 data-action 名一个都不能改、不能删、不能加**。清单见文末附录 A。
4. **战斗时序不可动**：`commitBattleAction` 内部顺序必须是 `battleSnapshot(before) → change() → render() → visualImpact(before)`。
5. **这些 CSS 标识必须保留**：`battlePage` 函数、类名 `combat-inspector`/`enemy-intents`/`journal-page`/`combat-action-report`、文案「战斗表现节奏」。
6. **版式约束不退回**：禁止加回 `@media (max-width:N)`；保留 560px 竖栏、战斗 `100dvh` 三段式零滚动、地图 36vh 情报面板、营地 64px 固定出发栏、横屏 `rotate-hint`。
7. **零依赖**：`import` 只允许 `./engine.js`/`./storage.js`/`./presentation.js`，不引入任何 npm 包或 CDN。
8. **英文名保持 `Ashen Vow`**，包名保持 `com.ashenvow.game`。
9. **全局变量名不改**：`game/slot/view/campSection/campTab/mapSelectedNode/chosenSkill/inspectUnitId/render/actionRun` 等（测试直接引用）。
10. **不拆 ui.js** 成多文件。

## 3. 可用的 design token（在 style.css 的 `:root` 里，直接引用）

```
颜色：--bg --black --surface --surface2 --border --gold --gold-light --cream --text --muted --red --olive --dim
间距：--sp-1(4px) --sp-2(8px) --sp-3(12px) --sp-4(16px) --sp-5(20px) --sp-6(24px) --sp-7(32px) --sp-8(40px) --sp-9(48px) --sp-10(64px)
圆角：--r-sm(4px) --r-md(8px) --r-lg(14px) --r-pill(999px)
字号：--fs-xs(10) --fs-sm(12) --fs-base(15) --fs-md(17) --fs-lg(21) --fs-xl(29) --fs-2xl(40) --fs-3xl(46)
阴影：--shadow-panel --shadow-card
z-index：--z-grain(50) --z-overlay(90) --z-toast(99)
版式：--frame-max(560px) --depart-h(64px) --map-intel-h(36vh)
```

## 4. 改一个屏的统一套路（5 步）

1. 打开 `src/ui.js`，找到该屏渲染函数（函数名见各屏说明）。
2. 改 HTML 结构：**主操作升级**（更大/更亮/更靠前）、**次要信息降级**（收纳、缩小、缩短文案）。**绝不动 `data-action` 值和 `data-id`/`data-slot` 传参**。
3. 在 `style.css` **末尾追加**新样式，第一行写注释 `/* UI 重设计 · Phase N xxx */`，用 token 不用裸数字。
4. 跑自检（见下）。
5. git 提交。

## 5. 每阶段末尾自检命令（逐条执行，全过才算完成）

```bash
cd C:/Users/YYKJ/WorkBuddy/网页优化/ashenvow-src/ashen-vow-web

# ① 只改了白名单文件
git -C C:/Users/YYKJ/WorkBuddy/网页优化 diff --name-only
#    结果只能出现：ashenvow-src/ashen-vow-web/src/ui.js、style.css、tests/、tools/build-standalone.js

# ② UI 状态没写进 game
grep -nE "game\.(view|campSection|campTab|chosenSkill|mapSelectedNode|inspectUnitId|chosenActiveHero|chosenEquipHero|codexTab|fullLogOpen)" src/ui.js
#    应无输出

# ③ 测试全绿
node --test tests/*.test.js

# ④ 构建 + 哨兵通过
node tools/build-standalone.js
node --test tests/standalone.test.js

# ⑤ 同步产物（三处保持一致）
cp ../ashen-vow-play-v1.0.html ../../android/app/src/main/assets/www/index.html
cp ../ashen-vow-play-v1.0.html ../../灰烬誓约-网页版-V1.1.html

# ⑥ 提交
git -C C:/Users/YYKJ/WorkBuddy/网页优化 add -A
git -C C:/Users/YYKJ/WorkBuddy/网页优化 commit -m "Phase N: ..."
```

## 6. 各屏任务

### Phase 5 — 设置 / 指南 / 图鉴 / 存档（utility 四屏，低风险）

| 屏 | 函数 | 主操作 | 改法 |
|---|---|---|---|
| 设置 | `settingsPage()` | 各开关、节奏选择、音量 | 统一开关视觉与间距；保留文案「战斗表现节奏」；保留 action `setting-*`/`pace`/`fullscreen` |
| 指南 | `guidePage()` | 底部「明白了」按钮 | 精简每步文字密度；保留 action `tutorial-done` |
| 图鉴 | `codexPage()` | 5 个 tab 切换 | 统一卡片视觉；保留 action `codex-tab` 与 `data-id` |
| 存档 | `savesPage()` | 每槽「继续游戏/创建新游戏」 | 主操作按钮强化；保留 action `new/load/delete/export/import/restore` 与 `data-slot`/`data-age`；保留 `id="import-file"` |

### Phase 6 — 营地（最大屏，拆 3 子步，每子步单独提交）

- **6.1 总览**：函数 `campOverview()`（含 `campBuildingChip`/`campTeamStrip`/`campReserveStrip`/`campQuickActions`/`campSidebar`）。主操作是「出发」（已是固定底栏，保留 64px）。建筑卡、快捷动作、队伍条统一视觉。
- **6.2 英雄管理**：函数 `heroHub()` 分发到 `rosterPage`/`trinketsPage`/`talentsPage`/`skillTrainingPage`，含 `heroCard`。主操作是各卡内的动作按钮。
- **6.3 档案**：函数 `archiveHub()` 分发到 `journalPage`/`achievementsPage`/`townPage`。保留类名 `journal-page`。

> 营地 action 共 28 个（见附录 A），逐一保留。

### Phase 7 — 地图

- 函数：`mapPage()`（含 `mapNodeDetail`/`mapTeamStrip`）。
- 主操作：「进入节点」（已在 36vh 底部面板，CTA 吸底，保留）。
- 保留 action `node/enter-node/use-potion/use-sigil`；保留 `syncMobileLayout()` 的 viewBox 裁切与横向居中逻辑。

### Phase 8 — 事件 + 结算

- 函数：`eventPage()`、`resultPage()`。
- 主操作：事件的选择按钮 `choice`、结算的「返回营地」`camp`。
- 保留 action `choice`/`camp`；保留 `eventPresentation` 的 motif 视觉分支。

### Phase 9 — 战斗（最高风险，拆 2 子步）

- **9.1 战场 + 单位情报**：函数 `battlePage()` 外壳 + `unitCard`/`combatUnitInfo`/`statusBadges`。保留类名 `combat-inspector`/`enemy-intents`/`combat-action-report`。
- **9.2 技能坞 + 战报**：函数 `battleSkillCard`/`battleBasicCard`/`battleHeroPanel`/`fullLogOverlay`。保留 action `skill/basic-attack/end-turn/full-log/close-log/copy-log/unit/skip/bandage`。
- **绝不碰 `commitBattleAction` 和 `visualImpact` 的内部顺序**。
- 保留三段式零滚动（战况条 → 战场 flex → 技能坞）。

### Phase 10 — 收尾

1. 重写 `tests/ui-smoke.test.js`：删除旧 class/文案断言，改为「各屏 render 不抛异常 + 关键 action 存在」。可直接复用 `tests/harness.js` 的 `loadUI`/`FROZEN_ACTIONS`。
2. `tests/standalone.test.js` 只保留不朽标识断言（`battlePage` + `combat-inspector`/`enemy-intents`/`journal-page`/`combat-action-report`/`战斗表现节奏`）。
3. 全量测试 + 构建 + 同步产物 + 提交。

---

## 附录 A：65 个 data-action（不可增删改名）

```
导航(8)：nav-menu nav-game nav-saves nav-settings nav-guide nav-codex codex-tab tutorial-done
存档(6)：new load delete export import restore
设置(7)：setting-sound setting-music setting-motion setting-text setting-log pace fullscreen
营地(28)：building plan region difficulty train-skill skill-branch treat-trait pray talent-hero talent camp-tab camp-section quick-heal hero-focus active-choice equip-hero recruit swap-hero dismiss equip unequip salvage heal upgrade forge move buy expedition
地图(4)：node enter-node use-potion use-sigil
事件(1)：choice
战斗/结算(11)：retreat camp skip full-log close-log copy-log end-turn basic-attack skill unit bandage
```

## 附录 B：样板参照（Phase 4 已做的「重梳信息层级」）

- `src/ui.js` → `homePage()`：主操作 `landing-cta`（全宽金色大按钮）+ 次要入口 `landing-cards`（三列紧凑卡）。
- `style.css` 末尾 → `/* UI 重设计 · Phase 4 ... */` 注释块：用 `var(--sp-*)`/`var(--r-*)`/`var(--gold)` 而非裸数字。

后续每屏照这个套路改。
