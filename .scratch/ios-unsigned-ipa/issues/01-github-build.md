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
