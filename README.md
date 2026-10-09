# Emma & James wedding invitation

Hosted with GitHub Pages. Push changes to `main` to automatically deploy the contents of `dist/`. Deployment progress appears under the repository's Actions tab.

An ivory and olive wedding invitation with a generated Tuscan garden image, a GSAP animated monogram introduction, scroll reveals, image parallax, and a countdown that updates each second.

The illustrated bride and groom float in a fixed corner throughout the invitation. Scrolling smoothly controls their dance. Drag them anywhere with a mouse or finger; arrow keys also move them when focused. Their position stays inside the viewport and is preserved while scrolling. Reduced-motion visitors can still move the couple, with decorative animation disabled. Run `node verify-dance.mjs` to check the floating interaction in desktop and mobile Chrome.

Run `npm start` and open http://localhost:3000. No installation or build is required. To repeat browser checks after installing development dependencies, run `node verify.mjs` with Google Chrome installed at its default Windows location.

Personalize the names, date, location, story, schedule, and guest information in `dist/index.html`. Set the countdown date in `dist/app.js` using an ISO date with the venue's UTC offset. The sample wedding is June 12, 2027 at 4 PM in Tuscany (CEST, UTC+02:00).

The RSVP form validates input and saves responses in the visitor's browser only. It does not send responses or collect them centrally. Connect a real RSVP service before using this for guests.

The illustration depicts a fictional setting; Villa Oliva and the couple's details are sample content. Animation respects reduced-motion preferences. GSAP is vendored locally; fonts load from Google Fonts with system font fallbacks.
