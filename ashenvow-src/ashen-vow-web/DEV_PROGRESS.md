## V1.0 验收进展

- 96 项自动化测试通过；浏览器交互测试通过。
- 324 个固定参考收益场景通过；仅检验经济收益曲线，不能代表完整平衡性。
- 真实来源 IndexedDB 关闭重开持久化仍待本机手动验收。

# Development Progress — V0.9

Status: playable standalone Web prototype, ready for local acceptance.

## Implemented
- Combat presentation-only telemetry (`src/presentation.js`) with deterministic unit deltas and action log handling.
- Damage/heal/stress/status overlays, critical flashes, skill banner and current combat narration.
- Six narrative encounter illustrations using CSS-only original motifs and regional atmosphere.
- Audio volume slider and combat animation pace (slow/normal/fast), saved only in localStorage.
- Respect for reduced-motion controls; animation cleanup on screen rerender.
- Standalone HTML builder and offline art packaging updated to V0.9.
- 80 tests passed (74 inherited + 6 new), plus isolated Chromium interaction checks.

## Still needs verification on player's machine
- Import an exported V0.8 JSON backup into V0.9.
- Close and reopen from a stable http://127.0.0.1:5173 origin, then check IndexedDB recovery.
- Experience battle sound with sound enabled and change volume on a physical browser.

## Limitations
- Original JavaScript + CSS prototype (not yet React/Phaser).
- No backend/online accounts; clearing browser data can erase saves.
- Container Chromium security restrictions prevent real file/http navigation and persisted-store E2E verification.

## V1.1 (Phase 0–4 refactor, 2026-10-28)
- Phase 0: extracted `src/data/tables.js`, consolidated `isValidSave`, JSDoc `types.js`, `design-spec.md`.
- Phase 1: skill cards with category tags (damage/defense/buff/finisher), basic attack + end turn, initiative portrait strip, hero panel, target highlight; shortcuts 1-4/A/Space/Esc.
- Phase 2: camp scene overview with building float-cards, quick actions (heal/forge/train/upgrade), left rail nav (camp/heroes/archive), bottom team strip + reserve row + depart CTA.
- Phase 3: two-stage map entry (select → preview → enter), node intel panel (encounters/rewards/risk skulls/recommended power vs team power), node proper names, four supplies (torch/bandage/potion/sigil) with capacity caps, map team strip.
- Phase 4: main menu four action cards, player profile (夜烬旅者 + derived Lv), bottom-left save card, unified brand logo, footer version.
- Tests: 107 passed (96 inherited + 11 new across battle-actions-v11 / map-preview-v11 / extended ui-smoke).
- Balance audit: 27 configs x 12 seeds, base healing 20 / prayer 17 — unchanged from V1.0 baseline.

### Remaining (Phase 5, art pass)
- Scene art x8, class/enemy illustrations, skill card faces, icon set, BGM/SFX pack (see design-spec.md §8).
- Real-browser IndexedDB persist/reload still unverified (same open risk as V1.0).

### Phase 5 art pass (2026-10-28)
- Scene SVG art x9: ashen-landing, ember-camp, crypt/mire/forge-depths (map panels), event-chamber + 3 inherited battle arenas; all auto-inlined by build-standalone.js.
- Skill card faces: per-category glow/texture (damage/defense/buff/finisher/attack) via CSS gradients.
- Ambient BGM: WebAudio synthesized pad (4 detuned osc + LFO), settings toggle「环境音乐」, volume-linked, offline-safe (no media files).
- Standalone: 288KB, 10 inlined scene instances (landing reused on result screen), 107/107 tests green.

### Final status V1.1
- Phases 0–5 delivered. Remaining human verification: real-browser IndexedDB persist/reload; optional playtest balance pass with art in place.

### Android 封装 + 窄屏营地修复（2026-10-28）
- 新增 `android/` 原生壳工程（WebView + 虚拟域名 `appassets.androidplatform.net` 映射 assets），包名 `com.ashenvow.game`，versionName 1.1.0 / versionCode 11000，零权限离线运行。
- 构建产物：debug 3.5 MB、release 3.4 MB（已签名）；在 API 37 模拟器完成安装、冷启动、四界面走查、IndexedDB 落盘与强停重装后的存档恢复验证。
- 修复 `style.css` 窄屏营地右侧裁切：`.camp-layout` 单列轨道由 `1fr` 改为 `minmax(0, 1fr)`，并给 `.camp-stage/.camp-overview/.camp-scene` 补 `min-width:0`，队伍卡改横向滚动（浏览器端同样生效）。
- 回归：`node --test tests/*.test.js` 110/110 通过；单文件产物重建后 4,358,540 字节。

### 手机单屏操控优化（2026-10-29）
- 问题定位（390×844 实测）：战斗页总高 2150px，战场在 404–917、技能卡在 1291–1700；在 y=994 选中技能后战场顶部变为 -590，每次行动需上下各滑约 600px 才能"选技能→点目标"。地图选中节点后「进入节点」在 y≈1543，距当前位置约 1400px；营地「出发」在 y=1605–1749（1.9 屏），建筑卡竖排 725px；地图节点点击区仅 39×55px。
- 战斗：改为 `100dvh` 三段式（战况条 / 战场 flex / 技能坞），页面纵向零滚动。技能坞 4 卡横排（54px 高，保留分类色条与名称），主操作 44px，单位情报压缩成单行横滑条，战报移入浮层（原 `.combat-log` 在手机上隐藏，`full-log` 浮层保留全部功能）。390×844 实测 docH=844，战场 461px；360×640 战场 315px。
- 地图：`svg` viewBox 裁至实际内容（`0 55 885 415`）、最小宽度 700px，节点点击区 49×68px；节点情报与「进入节点」改为 36vh 底部面板（矮屏 34vh），CTA 吸底，选中后无需滚动即可进入。
- 营地：「出发」改固定底栏（64px），建筑两列排布，营地高度 1919 → 1168px；事件页压缩装饰，两个选项同屏（844 → 844）。
- 回归：桌面 1280/1024/768 版式不变（arena 344、报告按钮 display:none）；`node --test tests/*.test.js` 110/110 通过；单文件产物重建 4,380,708 字节，已同步到 `android/app/src/main/assets/www/index.html` 与根目录网页版。
- 已知限制：761–1040px 平板仍用原多屏布局；英雄/档案页签仍是长页面；地图在 ≤640px 高度机型需纵向平移约 130px 才能看全三层。

### 全应用统一竖屏（2026-10-29 第二轮）
- 原生壳本就 `screenOrientation="portrait"`；问题在网页层：>760px 会切回桌面多栏，平板竖屏与大屏窗口是第二套排法。
- 断点归零：29 处 `@media (max-width: N)` 改为 `@media all`，只保留 `max-height` 与 `prefers-*`。CSS 顶部有说明段。
- 大屏收栏：≥601px 时 `.app-frame` 固定 560px 居中；`position:fixed` 的出发栏/地图情报/战报浮层/噪点层显式对齐 560px。
- 横屏：手机横屏（高度 ≤520）显示转屏提示层；平板横屏不拦截。
- 修掉两处真实阻塞：`.main`(z-index:1) 低于 `.site-footer`(2)，滚到底时页脚盖住「出发」按钮无法点击；320px 下情报条标题与属性重叠、技能名截成“夜幕…”。
- 实测：320/360/390/412/768/1024/1440 七档，战斗页 scrollHeight 恒等于视口高，全部页面无横向溢出；`node --test` 110/110。
- 未验证：真机横竖屏切换（安卓已锁竖屏，WebView 不触发重建）；旧 WebView(<105) 对 `dvh` 与 `:has` 的降级表现。

### 触控与按键布局方案落地（2026-10-29 第三轮）
依据 `触控与按键布局方案.md` 的 P0/P1/P2 清单执行，只改 `src/ui.js`、`style.css`、`index.html`（viewport-fit）与 `tests/`。

- 战斗（P0）：技能坞重排为「技能卡一排 ≥64pt → 普攻/结束回合各 64pt（间距 16pt）→ 次级行 44×44」。普攻不再占技能卡格子（原来 5 张卡挤在 4 列里会折行）；技能卡列数改 `auto-fit minmax(86px,1fr)`，按真实技能数（每职业 3 项）等分。
- 长按确认（P0）：`data-hold` + 450ms 进度环（conic-gradient + mask，rAF 回填 `--hold`），提前抬起或滑开即取消；松手后 320ms 内吞掉补发的 click。快速点按不会结束回合。
- 手势阈值（P1）：位移 <8pt 才触发；8–24pt 记死区；≥24pt 视为滑动，均不触发核心决策。
- 地图（P0）：节点加 `r=40` 透明热区（实测 63×63px，原 49×68 的视觉圆不变）；「进入节点」CTA 64pt 吸底；撤退从底部面板移到 D 区左上 44×44（面板只留一个主操作）。
- 营地（P0）：出发键 64pt、快捷动作 48pt、侧导航 44pt；底部留白改 `104px + safe-area`。
- 左右手（P1）：设置页「惯用手」右手/左手，`localStorage av-hand` 持久化；镜像技能卡阅读顺序（序号仍随技能）、主操作行落点、次级键顺序、营地出发栏/导航/页签、地图角位。只翻交互层，立绘/战场/地图不翻。
- 安全区（P1）：`viewport-fit=cover` + `--safe-top/--safe-bottom`，战斗顶栏、技能坞、出发栏、地图面板统一避让。
- 反馈与埋点（P2）：A 区键按下 70ms 缩放到 0.96 + 金框；命中/暴击加 haptic；设置页新增「触控诊断」只读计数（长按完成/取消/死区拦截，存 localStorage `av-touch-diag`，不上报）。
- 其他屏：事件选项 ≥56pt、结算返回营地 64pt、主菜单改 2×2 入口卡 + 主 CTA 落到菜单最底部。
- 实测（CDP + chromium 148，设备模拟）：390×844 战斗 docH=844（零滚动）、arena 409、dock 198、卡 116×64、主键 172×64/间距 16、次级 44×44；320×568 arena 220；360×640 arena 292；768×1024 arena 589。地图 CTA 340×64 固定在 y=757（无需滚动）；事件两选项 56pt 同屏。
- 交互实测：60ms 点按不结束回合、520ms 长按推进回合、30px 滑动不触发、点技能卡正常选中、点战报正常开浮层。
- 偏差（已在交付说明中列明）：战斗屏不放撤退/绷带（引擎 `retreat`/`useBandage` 仅 map 阶段生效，engine.js 冻结）；技能卡实为 3 张（文档按 4 张写）；<360 保留 4 列不转 2×2（4 列每张仍 ≥64×70，2×2 会让技能坞高度翻倍吃掉战场）；营地侧导航仍是顶部横向 sticky 而非左侧纵向栏。
- 回归：`node --test tests/*.test.js` 120/120（新增 `tests/touch-layout.test.js` 4 项：技能坞结构、镜像顺序、地图热区与撤退位、营地/惯用手入口）；单文件产物 4,455,120 字节，已同步 android assets 与根目录网页版。

### 修复：地图上点不到「药剂/圣徽」（2026-10-30）
- 现象：地图探索时无法用药剂/圣徽回血，点按钮没反应。
- 根因（非本轮触控改动引入）：`mapTeamStrip()` 渲染在 `.map-aside` 之后，而 `.map-aside` 是 `position:fixed; bottom:0; max-height:36vh; z-index:30` 的情报面板。390×844 实测：面板顶 540，队伍条顶 542 —— 整条队伍条（含 8 个补给键）正好被面板盖住 2px 起，初始既不可见也不可点，必须先把页面向下滚 266px 才露出来。`document.elementFromPoint()` 在按钮中心拿到的是面板里的 `.muted` 节点，不是按钮。
- 修复：把队伍条改成面板上方的常驻条（`position:fixed; bottom:calc(var(--map-sheet-h) + 6px); z-index:29`），单行横滑（4 人各 158pt 宽，药剂/圣徽 44×44）；情报面板保持 36vh 完整，不再被挤压。`syncMobileLayout()` 的地图区高度计算同步扣掉这条（`stripH+6`）。
- 顺带修掉的地图头部问题：5 个补给芯片把标题列压到 20pt 宽，320 下标题逐字换行占 5 行、地图只剩 100px；改为标题单行省略、≤400 时芯片收成纯数字（隐藏小字标签），头部从 210 → 170。
- 实测（CDP，390×844）：补给条 463–534、情报面板 540–844、CTA 757–821 全部可见；8 个补给键中前 4 个（前两位英雄）`elementFromPoint` 命中自身；点击药剂后 38/48 → 48/48、药剂 3 → 2。320×568 同样可见（地图区仅 160pt，需纵向平移，属该尺寸既有约束）。
- 回归：121/121（新增「地图补给条 4 人各带药剂/圣徽且受伤时可用」1 项）；单文件 4,458,126 字节，三处产物一致。
