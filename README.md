# Emma & James — a Tuscan wedding story

A fictional editorial wedding invitation, built on the original static HTML/CSS/JavaScript site. Local GSAP/ScrollTrigger and the original illustrated dancing couple are retained. No framework, WebGL engine, RSVP backend, or deployment service was added.

## Local preview

```powershell
npm.cmd install --cache .local/npm-cache
npm.cmd start
```

Open **http://127.0.0.1:3000**. Starting the server regenerates `dist/index.html`. Stop with Ctrl+C. Node is required; deployment itself is static.

## Edit the invitation

Edit **`dist/story-config.js`** for names, date and venue timezone, display dates, RSVP deadline, story titles and captions, image stems and alt text, schedule, venue and guest information. Then run `npm.cmd run build` (or restart `npm.cmd start`).

`src/index.template.html` retains the envelope layers and illustrated couple. `src/rsvp.html` contains form markup. `build.mjs` composes static sections from the configuration into `dist/index.html`; do not edit the generated HTML directly. Layout and motion are in `dist/styles.css`, `dist/app.js`, `dist/envelope.js`, and `dist/dance.js`. Original envelope/illustration styles and vendored GSAP remain in place.

Keep the ISO countdown instant and human-readable date/time fields consistent. Current sample: **June 12, 2027, 4:00 PM CEST (Europe/Rome)**. Ceremony 4:00 PM; aperitivo 5:00 PM; dinner and dancing 6:30 PM. RSVP deadline May 1, 2027.

Villa Oliva is a fictional demonstration venue. Address, shuttle arrangements, and accessibility provisions remain explicitly unconfirmed. `mapUrl` is empty; only add a map after verifying a real venue/address. The envelope features a labeled AI-generated fictional couple portrait; the story photographs illustrate atmosphere rather than the people or venue. See **[IMAGE-GUIDE.md](IMAGE-GUIDE.md)** for licenses, photographer credits, and client-photo replacement. Original generated PNG assets remain preserved but are not used by the new experience.

## Interaction behavior

- First visit in a tab presents the envelope immediately. Click/tap it, use Enter/Space, or choose Skip intro. Escape skips too. Repeated activation cannot start overlapping sequences.
- A session preference skips the opening on reload. **Open invitation** in navigation replays it at any time. Storage-disabled browsers remain usable.
- Desktop motion uses a short horizontal gallery pin; phones use animated overlapping photo prints with native vertical scrolling, with native horizontal scrolling at tablet widths. Reduced motion removes pins and decorative motion. No GSAP still leaves the complete invitation readable.
- The companion starts expanded on every visit, with expand, close, size, and full-surface dragging. Arrow keys move it when focused. Drag anywhere on the couple or countdown; buttons remain clickable. Touch gestures outside the widget retain native page scrolling. Your dragged position overrides automatic RSVP docking. Its position is clamped to the viewport; size preferences persist; minimize/close apply to the current visit. It remains visible throughout the story and docks above RSVP while guests respond; restore a manually closed companion using the footer control.
- Accordions use native keyboard/screen-reader controls. Persistent navigation exposes story, celebration, details and RSVP on desktop and mobile.
- RSVP validates name, email, attendance, and stores the result under `emma-james-rsvp` in **this browser only**. Success explicitly says nothing was sent. A storage failure displays an error. No personal data leaves this static site. Replace this flow with a verified backend before collecting real guest responses.
- Without JavaScript, event/story HTML and navigation remain available. The inactive demo form is hidden with an explanation; it never submits accidentally to the static host.
- Fonts retain the existing Google Fonts connection with system fallbacks. Photos and animation libraries are local. There is no audio or analytics.

The chapter index links directly to the four story scenes. A restrained progress line follows the story. Photo arrow controls open a full-screen memory viewer with previous/next buttons, arrow keys, swipe navigation, Escape to close, and focus restoration. Reduced-motion settings disable the decorative transitions.

## Verification

Run the server in one terminal, then in another:

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd test
git diff --check
```

Tests use Playwright and installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Override `CHROME_PATH` if needed, or `TEST_URL` to test another local base URL. Screenshots are saved in ignored `test-results/`.

Checks cover 1440/900/390/320px layouts, decoded local photos, internal navigation, overflow, accordion keyboard interaction, RSVP validation/save/restore/decline, unavailable storage, no JavaScript, unavailable GSAP, intro focus/scroll lock, skip/replay/duplicate activation, pin cleanup when reduced motion changes, countdown synchronization, mouse/touch drag, keyboard movement, viewport clamping, minimize persistence, close/restore, and RSVP clearance. This is browser emulation in desktop Chrome, not physical iPhone/Android or Safari certification. No lint script exists; `check` validates JavaScript syntax. Performance design does not substitute for production Core Web Vitals measurements.

## GitHub Pages deployment — only when authorized

The existing `.github/workflows` workflow uploads **`dist/`** on a push to **`main`**. All links and assets use local fragments or relative paths, so the `/wedding-invitation/` project prefix is supported.

1. Update config/photos, then run build, syntax and browser tests above.
2. Review `git diff` and include generated `dist/index.html`, config, scripts, styles, and local photo variants in the commit.
3. Only when ready to publish, commit and push to `main`; inspect the Actions deployment result.
4. Check the published envelope, photo loading, mobile navigation and RSVP demo disclosure.

The release workflow rebuilds the static HTML and checks JavaScript before publishing. Confirm the current release in the repository Actions tab.
