# Repository Guidelines

## Project Structure & Module Organization
The Uni-App client keeps its entry files at the root: `App.vue`, `main.js`, `manifest.json`, and `pages.json`. Feature views live under `pages/`, with each feature owning its own folder (for example, `pages/index/index.vue` for the landing view). Shared assets belong in `static/`, and cross-cutting styles or tokens should extend `uni.scss` so visual changes propagate consistently.

## Build, Test, and Development Commands
Use the HBuilderX CLI for every integration step. `npx hbx-cli dev --platform mp-weixin` launches the WeChat Mini Program sandbox with hot reload, while `npx hbx-cli build mp-weixin --minimize` emits an optimized package for upload inside the `dist/build/mp-weixin` directory.

## Coding Style & Naming Conventions
Components and pages should be PascalCase (`BookingCard.vue`) and sit in directories that mirror the user flow (`pages/booking`, `pages/confirm`, etc.). Prefer `<script setup lang="ts">` (or the Vue 3 composition API) for new work, keep template indentation at two spaces, and stick to single quotes inside scripts to match the existing `main.js`. Centralize colors, spacing, and radius tokens in `uni.scss`, and import shared mixins instead of redefining inline styles.

## Testing Guidelines
There is no automated harness yet, so every pull request must include steps for manual verification in the WeChat Developer Tools (e.g., “navigate to `pages/index`, create a booking, cancel it”). When introducing logic-heavy modules, add lightweight smoke tests under a future `tests/` folder using Vitest or Jest and name files `<feature>.spec.ts` to align with common Vue tooling. Record device/OS combos you touched so regressions can be triaged quickly.

## Commit & Pull Request Guidelines
Existing history follows a short, imperative subject line (`Add booking calendar state`) with optional detail paragraphs describing scope. Keep commits focused on a single concern, reference issue IDs when applicable, and include config/schema diffs (such as `pages.json` edits) in the same commit as the feature that depends on them. Pull requests should describe the scenario, list test evidence or screenshots from the WeChat simulator, and call out any required backend flags so reviewers can reproduce the change without guesswork.

## Configuration Notes
Treat `manifest.json` as the canonical source for app identifiers and capability flags; avoid editing it inside the WeChat IDE because those edits are not easily diffable. Route declarations and tab bar updates must be reflected in `pages.json`, so accompany structural changes with a quick tree that shows where the new page sits inside `pages/`.
