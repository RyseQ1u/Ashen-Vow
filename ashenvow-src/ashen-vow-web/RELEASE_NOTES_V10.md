# Ashen Vow V1.0 — Release Notes

## Scope

- First-run guide (six steps); readable again from the main navigation.
- Built-in encyclopedia with five sections: heroes, skills, monsters, regions, trinket sets.
- Twelve earned achievements, with a migration path for V0.1–V0.9 saves.
- IndexedDB snapshot checksum for accidental corruption detection, plus two rolling prior snapshots and explicit restore controls.
- JSON import/export retains V0.9 envelope/schemaVersion 1; new exports contain an integrity checksum, but legacy exports without one remain importable.
- Additional save validation for currency, supplies, dates and phase consistency.
- Narrow-screen layout for new utility screens.
- Reproducible balance-envelope audit; **not** evidence of a fully balanced game.

## What stayed unchanged

- Single-player, client-only Web game; no sign-in or server.
- Four-hero combat, three dungeon regions, existing content, settings and battle feedback.
- Existing game save schemaVersion 1 for backwards compatibility.

## Quality checks

- 96 / 96 automated Node tests passed (including rolling-backup tests using an in-memory IndexedDB test double).
- Chromium scripted clicks passed: guide, five encyclopedia tabs, achievements, camp, expedition map, combat, archive UI; zero page-script exceptions observed.
- Economic reference audit: 27 difficulty/region/plan configurations × 12 deterministic fixtures.
- True browser-origin IndexedDB persistence **not** verified in this constrained test environment. Local HTTP navigation is blocked by browser policy; run the checklist below on your own machine.

## Local acceptance checklist

1. Back up V0.9 with the existing Export JSON button.
2. Open V1.0 at the same stable local URL where applicable, or import the JSON into V1.0.
3. Create/continue a save, complete at least one action, and wait for "已自动保存".
4. Refresh, close, and reopen at the same URL; verify heroes, gold, region, and achievements remain intact.
5. Perform two different actions, then visit Archive and verify two backups are available. Restore the earlier snapshot and confirm the earlier resources are recovered.
6. Export JSON again, then import it into an unused slot.

## Important limits

- Browser data deletion, private browsing, or changing file-origin/domain can erase or isolate all IndexedDB snapshots. Downloaded JSON backups are the only offline external recovery channel.
- Snapshot checksums are non-cryptographic (FNV-1a) and detect common unintended changes; they do not prevent malicious tampering.
- Restoring a snapshot overwrites the selected save slot. The interface asks for confirmation.
- Balance testing compares a fixed reference haul; real-world player balance, long-duration stability and broad browser compatibility require real-world testing.
