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
