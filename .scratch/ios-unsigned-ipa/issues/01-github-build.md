# Build unsigned iPhone IPA on GitHub Actions

Status: ready-for-agent

Create a manually triggered macOS build in `longlo2k3/nhipdem`. Checkout the
existing `mobile` gitlink from `longlo2k3/mobile`, generate the Expo iOS project,
archive an unsigned Release app for physical devices, and upload a verified IPA.
No Apple credentials, paid EAS build, store submission, or schedule changes.

Acceptance: the archive contains an arm64 iPhoneOS app and its JavaScript bundle;
the uploaded IPA passes ZIP validation. Installation and seven-day refresh use
the user's free Apple ID through AltStore Classic.

## Comments

- Local Windows checks can validate configuration and app code; the actual
  archive and sideloading require GitHub macOS and the user's iPhone respectively.
- 2026-11-03: workflow and submodule configuration pushed to `main`. All 10
  existing tests, schedule sync validation, TypeScript, and YAML parsing passed.
- First run on `macos-26` stayed queued without an assigned runner and was
  canceled. Retried with the standard `macos-latest` pool:
  https://github.com/longlo2k3/nhipdem/actions/runs/41494623558
- Latest observed status: queued, no runner assigned, no steps executed. No IPA
  exists yet. Native compilation, artifact verification, and installation remain
  unverified; inspect this run before declaring the task complete.
- Follow-up: the run failed during recursive checkout because `mobile` is private
  and the default workflow token cannot read another private repository. Replaced
  recursive checkout with a separate pinned checkout using an encrypted read-only
  deploy key restricted to `mobile`. The source remains private. Selected the
  standard Intel macOS pool after GitHub reported arm64 capacity constraints.
