# ColorQuest 1.1

An original, lightweight color-by-reference game by Sandeep Kumar. Complete 18 interactive SVG pictures, earn stars, and unlock the next picture. Touch, mouse and keyboard controls; hints, zoom, number guide, undo and per-picture progress.

## Development and public demo

Node.js 20.19+ or 22.12+ is required.

    npm ci
    npm run dev
    npm run build
    npm run preview

Host the CONTENTS of `dist/` for the public playable URL requested by the interest form. This build has no remote dependencies. Saves stay in the current browser. If browser storage is unavailable, the game still works for the session. Legacy saves from version 1.0 migrate automatically.

Vercel: import the project, choose the Vite preset, use `npm run build`, output `dist`. GitHub Pages: deploy the contents of `dist` using Pages Actions. `base: './'` supports repository subdirectories. Open the actual public URL in a private browser and a phone before entering it in the form. Public web demo published and verified at https://sandeep37-s.github.io/colorquest/. The Pages workflow in .github/workflows/pages.yml tests, builds and publishes game changes on master.

## YouTube build

    npm run build:youtube
    npm run preview:youtube -- --port 5175

Upload the CONTENTS of `dist-youtube/` when you have YouTube developer access and are preparing an ingestion/test release. Do not confuse this with `dist/`. The YouTube entry loads `https://www.youtube.com/game_api/v1` before game code. Outside YouTube, the official SDK is a no-op and the game uses local browser saves. In `ytgame.IN_PLAYABLES_ENV`, the game:

- Shows an explicit loading screen and sends `firstFrameReady` before `gameReady`.
- Waits for `loadData` before permitting saves or gameplay. Loading errors show a retry screen and never overwrite cloud progress.
- Uses only `loadData`/`saveData` for persistence, serializes writes, coalesces pending snapshots, reports save failures, and supports retry.
- Supports versioned saves and the original unversioned save format; rejects newer unsupported formats and invalid cloud JSON without overwriting them.
- Obeys `isAudioEnabled`/`onAudioEnabledChange`. The in-game Effects control only affects synthesized sound effects and cannot override YouTube mute. Audio starts only after interaction; muting stops active tones.
- Obeys `onPause`/`onResume` for input, effects and CSS animations. Finishes a pending save at the pause boundary when possible and holds subsequent queued writes until resume. Does not register the Page Visibility API in YouTube's environment.
- Keeps app assets relative, makes no third-party calls except the required SDK, collects no personal player information, and has no external links, login, ads, sharing prompts or quit button.

SDK loading failure shows reconnect/reload controls. Corrupt cloud data is preserved for investigation; it is not silently erased. Score reporting is optional and intentionally omitted; collection stars are stored in the game's save.

## Controls and progression

Choose a color and activate a region. White regions also need painting. A region counts only when its assigned color matches its target; repainting to an incorrect color decreases progress. All regions must match to finish. Three stars require >=90% painting accuracy, two >=65%; otherwise one. Mistakes never block correction. Each picture saves independently. The last completion explicitly reports that the collection is finished. Previously finished pictures remain replayable.

Tab moves between controls and regions; Enter/Space activates them. Escape closes native dialogs. The optional number guide labels palette colors and regions for players who find color matching difficult. Zoom helps with small shapes. Reduced motion disables transitions/animations.

## Tests

    npm test
    npm run check:bundles

The browser scripts require Microsoft Edge, or change their Playwright channel to an installed browser:

    npm run dev -- --port 5173
    npm run test:browser

For production platform integration tests, start the YouTube preview at port 5175, then run:

    npm run test:integration

27 automated logic/state/platform tests pass. End-to-end checks cover all 18 sequential completions, unlocks, album, per-picture persistence, five common viewports, number guide, zoom, keyboard, undo and mobile touch. The YouTube production build is tested under the official documented CSP with a MOCK SDK: readiness order, cloud-only persistence, cross-session restoration, load/save failure and retry, platform mute, pause and startup pause, Escape, and extreme aspect ratios down to 225 px width. These are local tests, NOT an official certification result. Bundle checks cover filename/file-count/size limits, relative entry paths and SDK ordering.

## Source map

- `src/levels.js`, `src/extra-levels.js`: original vector illustrations shared by reference and canvas.
- `src/state.js`: validation, backward compatibility, sequential unlocks, per-picture sessions.
- `src/platform.js`: isolated SDK and browser persistence adapter, queue and lifecycle handling.
- `src/bootstrap.js`: loading, recovery and readiness lifecycle.
- `src/main.js`, `src/style.css`: game, UI, audio and responsive layouts.
- `public/icon.svg`: original game icon.
- `tests/`: logic, platform mocks, browser checks and bundle checks.
- `submission/`: proposed listing text, credits, local test report and artwork candidates.

## Before official distribution

The game is not certified, publicly hosted on GitHub Pages, and no acceptance or placement is promised. You still need:

1. Access/selection through YouTube's interest and partner process.
2. The official Playables SDK Test Suite and developer-portal/ingested-build checks; local mocks do not replace those.
3. Physical Android/iOS, Chrome, Safari and Firefox verification, actual account/device cloud-save portability, slow-network startup and interrupted-save tests in YouTube.
4. Current portal-required metadata, approved listing artwork and any partner agreements. Candidate artwork sizes here are preparation examples; confirm exact portal dimensions.
5. Confirmation of ownership and licensing authority by Sandeep Kumar. All included game geometry, icon and UI were created for this project; no third-party game art, copyrighted characters, fonts or sampled audio are bundled. No trademark clearance or legal review is claimed.

Official references checked 17 October 2026:

- https://developers.google.com/youtube/gaming/playables/certification/requirements
- https://developers.google.com/youtube/gaming/playables/certification/requirements_integration
- https://developers.google.com/youtube/gaming/playables/certification/requirements_design
- https://developers.google.com/youtube/gaming/playables/certification/requirements_stability
- https://developers.google.com/youtube/gaming/playables/certification/requirements_privacydata
- https://developers.google.com/youtube/gaming/playables/certification/requirements_i18n_l10n
- https://developers.google.com/youtube/gaming/playables/certification/requirements_accessibility
- https://developers.google.com/youtube/gaming/playables/reference/sdk
- https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide
