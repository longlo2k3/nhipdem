# Verification — native app

Validated on Windows with Node.js 24:

- `npm test`: 8 tests pass (schedule fidelity, local dates, per-session isolation, backup validation, ordered writes and failed-write recovery).
- `npm run mobile:check`: schedule copy and TypeScript checks pass.
- `npx expo config --json`: project SDK is `58.0.0`, matching the user's iPhone Expo Go SDK.
- `npx expo install --check`: dependencies match Expo SDK 58.
- `npx expo-doctor`: 20/20 checks pass after the SDK 58 upgrade.
- `npx expo export --platform ios --output-dir dist-ios`: Hermes compilation succeeds. This verifies the iOS JavaScript bundle, not a signed native app.
- EAS project creation/linking succeeded for `@longvy/nhip-tap` (`8e188183-3845-454e-98ca-f992654745b9`).

## Remaining verification

- No physical iPhone or Apple iOS Simulator was connected for runtime/visual checks.
- No signed `.ipa`, TestFlight upload or store submission has been performed.
- Expo MCP config is present and OAuth login succeeded; tool availability in a new chat still needs runtime verification.
- Dependency installation after the SDK 58 upgrade reports 16 audit findings (13 moderate, 3 high). These findings remain unresolved; no forced audit fix was applied during the SDK migration.

User actions to validate on iPhone: open in Expo Go, enter a result, mark a set, switch plans, reopen app, export/import a backup, and pause/resume the rest timer.

## UI refresh and local rest library

- Existing automated tests: 8/8 pass; prescribed workout data remains identical.
- `npm run mobile:check`: TypeScript and schedule-copy checks pass.
- Local iOS export to `mobile/.preview-ios` succeeds and includes the bundled offline bell. This is a JavaScript bundle check, not a signed build or a device playback test.
- The workout journal keeps its existing storage and backup format. SQLite stores the rest-library catalog; imported media files live in the app's document directory.

Device checks still required for the new features:

1. Check all three tabs on a small iPhone and Android screen, including larger text settings and keyboard entry.
2. Start/pause/reset each timer preset. Let it finish twice while playing music, and twice while playing video; playback should pause and the bell should sound each time.
3. Switch tabs and background the app during playback; playback should pause. Let the timer expire while locked, then reopen; it should report completion once.
4. Import MP3/M4A and MP4 files, cancel the picker, and try unsupported/oversized files. Relaunch offline and play the saved files again.
5. Delete a selected file, reopen the app, and verify it stays deleted. Check that a failed import reports an error and preserves existing entries.
6. Export/import a workout backup and verify results remain intact; media is intentionally excluded from this JSON backup.

### Compact workout screen

- TypeScript/schedule checks and all 8 existing tests pass after the compact layout update.
- Removed the workout hero and repeated summary; date and rest action share a wrapping toolbar. Exercise headers retain prescribed targets and set progress while inputs can collapse. Notes can also collapse, with a saved-note preview.
- No device target is connected for screenshot verification. On a device, check expanding/collapsing each exercise, opening/collapsing all, retaining entered values across collapse and day changes, note editing, and the date/rest actions. Check narrow screens and larger system text.

### Delete workout history

- Added a separate delete action per history card with date/plan confirmation and cancel. It uses the existing ordered persistence writer and preserves other sessions.
- `npm test`: 10/10 pass, including deletion isolation, deletion of the last entry, and a delayed prior write not resurrecting a deleted entry. `npm run mobile:check` passes.
- On a device, verify cancel keeps the entry, confirm removes it, reopening the app keeps it deleted, and deleting the last entry shows the empty state. Device interaction is not yet verified.
