## V1.0 — 导引、图鉴、成就、存档可靠性

- 初次游戏引导，随时查阅的游戏百科与 12 项成就。
- 当前存档的轻量完整性校验，两级回滚快照、恢复与 JSON 备份兼容。
- 本地设置异常处理、窄屏样式及数值区间回归审计。
- 新增 16 项自动化测试，累计 96 项。

# CHANGELOG

## V0.9 — Combat and Event Presentation

- Added pure combat telemetry layer for per-action damage, healing, stress, status, summons and log deltas.
- Added hit flash, critical light wash, caster nameplate and updated action report in combat scene.
- Added six event visual motifs and three regional stage palettes, with no changes to event outcomes.
- Added configurable synth-audio volume and three cosmetic animation speeds; user/system reduced-motion support.
- Preserved IndexedDB save schema v1 and compatibility with V0.1–V0.8.
- 80 Node tests passed. Chromium UI smoke passed under isolated page injection; storage persistence not verified.

# CHANGELOG

## V0.8 — Expedition Experience and Economy

- Add oracle and caravan encounters with gated economy choices.
- Add enemy attack tendency forecasts to combat UI; predictions are not exact target guarantees.
- Add last-20 expedition report records and camp journal view.
- Add emergency support for two consecutive defeated runs and insufficient resources.
- Add large text and compact combat log toggles, saved in localStorage.
- Retain schema v1 compatibility; 74 tests pass.

# Changelog

## V0.7 — 2026-10-26

- Implemented 36 mutually exclusive specialization paths across 18 skills, with training gates, respec costs, combat scaling and save persistence.
- Added four equippable two-piece relic sets with stat bonuses and two on-enter-battle effects.
- Added deterministic end-of-expedition trait evolution and camp treatment of negative traits.
- Introduced differentiated faction resistances for poison, bleed, stun and weakness; improved backline targeting by ranged opponents.
- Implemented persistent regional threat tiers from repeated victories, with gradual HP/attack/reward scaling.
- Migrated V0.1–V0.6 saves by additive fields without bumping save schema.
- 64 Node tests and isolated Chromium UI interaction checks passed. Real-origin IndexedDB close/reopen test is still outstanding.

## V0.6 — 2026-10-22

- Added three dungeon difficulty levels, enemy scaling, initial stress and end-of-run reward multipliers.
- Added training for 18 skills (two levels each), active combat scaling and camp skill panels.
- Added seeded positive traits and negative quirks, plus distinct stress crises and recovery.
- Introduced shrine, ambush and sealed-cache room encounters.
- Expanded trinket bases and affixes to 12 each, including mixed-positive-negative modifiers.
- Added additive migration for prior saves without schema version changes.
- 49 automated tests pass; isolated Chromium click-through test covers training, difficulty, all three special encounters and retreat.


## V0.5 — 2026-10-22

- Introduced three independently selectable regions: Sunken Crypt, Blighted Mire, Cinder Forge.
- Added twelve enemies including two new regional bosses, each biome-specific combat pool and elite traits.
- Implemented periodic regional combat hazards, phased boss escalation with reinforcements, and regional event narratives.
- Introduced region gold/shard reward multipliers and persistent per-region victory counters.
- Added two self-contained SVG backgrounds and dynamic battle, map, and event styling.
- Preserved schemaVersion 1 compatibility with V0.1–V0.4 saves, including mid-run and mid-battle save migration.
- Expanded automated test suite to 40 cases; smoke-tested the three regional flows in isolated Chromium.

## V0.4

- Town upgrades, hero talents, expedition tactics, reserve healing, watchtower scouting.

## V0.3

- Recruit and reserve management, trinkets, additional skills and enemies.

## V0.2

- Revamped gothic combat presentation, effects, equipment and formation.

## V0.1

- Initial playable adventure with squad combat, maps, events, camp, and browser saves.
