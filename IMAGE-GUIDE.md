# Photography and replacement guide

Emma & James and the event are fictional demonstration content. These photographs are atmospheric stock scenes, not documentary images of the couple, their relationship, or the proposed venue. Keep the visible demo notice until authentic client content has replaced the sample story. The original `garden.png` and `florals.png` assets predate this update; this guide does not establish their provenance.

## Sources and license

The eight photographs below were downloaded from Unsplash on October 10, 2026. Each source page identified the image as free under the [Unsplash License](https://unsplash.com/license), which permits downloading, modifying, and using photographs, including commercially. None is an Unsplash+ asset. Photographer credit is appreciated. Check additional permissions when introducing recognizable people, trademarks, artwork, or private property into a client's commercial use.

| Local filename stem | Photographer | Source | Scene |
| --- | --- | --- | --- |
| `tuscany` | Luca Micheli | [Original photograph](https://unsplash.com/photos/r9RW20TrQ0Y) | Cypress-lined road in Tuscany at sunset |
| `coffee` | Olena Bohovyk | [Original photograph](https://unsplash.com/photos/AbFiYWiTf_k) | Two cups of coffee with latte art |
| `cafe` | Clifford | [Original photograph](https://unsplash.com/photos/VobvKmG-StA) | Wooden cafe table and hanging lamps |
| `coast` | Oliver Sherwin | [Original photograph](https://unsplash.com/photos/f6n6cRpjtnE) | Positano sea view between pastel buildings |
| `sunset` | Alan Jiang | [Original photograph](https://unsplash.com/photos/iW06DUcrhSY) | Tuscan farmhouse in evening light |
| `ceremony` | Eryk Piotr Munk | [Original photograph](https://unsplash.com/photos/QV_uommyHdU) | Empty outdoor ceremony chairs and arch |
| `aperitivo` | Andrew Ling | [Original photograph](https://unsplash.com/photos/Hq40CpnPJeA) | Two aperitivo drinks in Milan |
| `dinner` | Ben Atkins | [Original photograph](https://unsplash.com/photos/zjJiX9txwRU) | Reception table with flowers and glassware |

## Local assets

All runtime photographs are stored in `dist/assets/photos/`. Each stem has 640, 1280, and 1920 pixel wide variants in AVIF and WebP, for example `tuscany-1280.avif`. The provider's image encoder generated the local files at AVIF quality 42 and WebP quality 58 with aspect ratio preserved. There is no runtime hotlink dependency. All eight 640px WebP images were visually inspected. The complete 48-file library is about 10.5 MB; responsive picture selection loads a single appropriate format/size per photograph, not the whole library.

`dist/assets/photos/sources.json` records original URLs, photographer names, suggested factual alt text, dimensions, and byte sizes for every local variant. Landscape images are best for full-screen scenes. The cafe, coast, aperitivo, and dinner images are portrait oriented and suit prints and memory cards.

## Replace with client photographs

1. Obtain the photographer's permission and the couple's consent. Retain original, full-resolution files outside the public `dist/` directory. Remove sensitive EXIF location metadata from exports.
2. Choose a coherent set: landscape hero, portrait cafe/meeting memory, two or three travel moments, landscape proposal, ceremony, refreshments, reception, and closing scene. Use real captions only when verified by the couple.
3. Export each replacement at widths 640, 1280, and 1920 in both AVIF and WebP, preserving its aspect ratio. Do not upscale an undersized source. For a new stem, use the exact `name-width.format` convention above. Check faces and important details at both phone and desktop crops.
4. Place exports in `dist/assets/photos/`. Edit image stems and descriptive alt text in the single content file `dist/story-config.js`. Update all dates, story captions, venue, deadline, and logistics there as well. A scene's image stem does not include the width or extension.
5. Run `node build.mjs` to regenerate the HTML, then preview with `npm run dev`. Review the opening, every scene, and image crops at narrow and wide widths. Verify the generated picture dimensions match replacement aspect ratios if an image's orientation changes.
6. Update this credit table and `sources.json` with the replacement ownership/source details. Remove the sample notice only when the complete invitation is real and verified. Never label unrelated stock subjects as the client couple.

Only preload the opening photograph. Keep below-the-fold photographs lazy loaded and retain explicit image dimensions or reserved aspect ratios to prevent layout shift.

## Generated couple portrait — October 12, 2026

The envelope now uses a newly generated, entirely fictional sample couple. It is not a photograph of real Emma and James. The entrance visibly identifies it as AI-generated. Generated with the **built-in image_gen tool**, not the API/CLI fallback.

Saved project assets: `dist/assets/photos/couple-demo-640.avif`, `couple-demo-640.webp`, `couple-demo-1024.avif`, and `couple-demo-1024.webp`. These use the original 2:3 aspect ratio, with no upscaling. The 640px AVIF is about 34 KB. The stock-photo license table above applies only to the eight stock scenes, not this generated portrait.

Edit `couplePortrait`, `couplePortraitAlt`, and `portraitCaption` in `dist/story-config.js` to replace the portrait. Export client replacements at 640/1024px, or update the portrait branch of `build.mjs` for a different size set. The same portrait is reused on the keepsake and inside the invitation card.

Final generation prompt:

> Use case: photorealistic-natural. Create an editorial engagement photograph for a FICTIONAL DEMO wedding invitation, no actual people or celebrity likenesses. A fictional adult couple, Emma and James, late twenties, laughing softly together in a Tuscan olive grove at golden hour. Emma has shoulder-length loose dark brown hair, an ivory linen dress; James has short wavy brown hair, a cream linen shirt. Natural believable faces, affectionate candid closeness, restrained warm European film photography, fine grain, soft olive and champagne colors, subtle backlight, authentic skin texture. Portrait-oriented composition, waist-up couple in the central upper two thirds, surrounding olive leaves and softly out-of-focus sunlit hills. Sophisticated wedding editorial photo, not illustration or advertising. No lettering, no borders, no watermarks, no additional people. This will be printed as a photograph tucked into a tactile ivory envelope and shown as a cinematic entrance portrait.
