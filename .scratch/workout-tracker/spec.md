# Nhịp Tập — Personal workout tracker

## Current delivery target

The user clarified that the deliverable is an installable iOS app developed from Windows.
Use React Native + Expo in `mobile/`, EAS cloud builds, and the official Expo MCP server.
The user has Expo but does not have Apple Developer. Support immediate trials in Expo Go;
signed iPhone builds and TestFlight remain dependent on Apple Developer enrollment.
Keep the original browser prototype available and preserve compatible JSON backups.

## Source and scope

The user supplied three screenshots containing a Monday, Wednesday, Friday workout schedule.
Preserve all 18 exercise entries, muscle descriptions, set counts, and repetition/time ranges.
`workout-plan.js` is the canonical schedule copied from those images.

## Acceptance criteria

- Vietnamese, responsive interface with one tab per training day.
- Choose a calendar date; track date and plan independently.
- Enter actual results per set and mark sets or whole exercises complete.
- Track each session's note, completed exercises, and completed sets.
- Persist in browser local storage with visible failure handling.
- Provide history, reopening past sessions, and validated JSON export/import.
- Provide a pauseable rest timer with 60, 90, 120 second presets.
- Run locally without an account, installation of packages, or publishing.

## Data conventions

- A session is uniquely identified by local date plus plan ID.
- A unilateral entry records repetitions per leg; completion means both legs.
- Time-based exercise entries are seconds.
- Backup import merges sessions, with imported records winning for matching IDs.
- Invalid or unreadable saved data must not be silently overwritten.
