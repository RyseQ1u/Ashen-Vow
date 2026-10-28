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
