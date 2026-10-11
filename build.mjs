import { readFile, writeFile, mkdir } from "node:fs/promises";
import vm from "node:vm";
const scope = { window: {} };
vm.runInNewContext(await readFile("dist/story-config.js", "utf8"), scope);
const c = scope.window.WEDDING;
const e = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const sources = JSON.parse(
  await readFile("dist/assets/photos/sources.json", "utf8"),
);
const photo = (id, alt, cls = "", eager = false) =>
  id===c.couplePortrait ? `<picture class="${cls}"><source type="image/avif" srcset="assets/photos/${id}-640.avif 640w, assets/photos/${id}-1024.avif 1024w" sizes="(max-width:700px) 185px, 245px"><img src="assets/photos/${id}-640.webp" srcset="assets/photos/${id}-640.webp 640w, assets/photos/${id}-1024.webp 1024w" sizes="(max-width:700px) 185px, 245px" alt="${e(alt)}" width="1024" height="1536" decoding="async"></picture>` :
  `<picture class="${cls}"><source type="image/avif" srcset="assets/photos/${id}-640.avif 640w, assets/photos/${id}-1280.avif 1280w, assets/photos/${id}-1920.avif 1920w" sizes="${cls === "full-photo" ? "100vw" : "(max-width: 700px) 100vw, 55vw"}"><img src="assets/photos/${id}-1280.webp" srcset="assets/photos/${id}-640.webp 640w, assets/photos/${id}-1280.webp 1280w, assets/photos/${id}-1920.webp 1920w" sizes="${cls === "full-photo" ? "100vw" : "(max-width: 700px) 100vw, 55vw"}" alt="${e(alt)}" width="1280" height="${sources.find((p) => p.name === id)?.variants.find((v) => v.width === 1280)?.height || 960}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
const main = `
<section class="hero" id="home" aria-labelledby="hero-title">${photo(c.hero.image, c.hero.alt, "full-photo", true)}<div class="hero-shade"></div><div class="hero-top eyebrow"><span>${e(c.copy.heroEyebrow)}</span><span>${e(c.location)} / ${new Date(c.date).getUTCFullYear()}</span></div><div class="hero-copy"><p class="eyebrow">${e(c.dayLabel)} · ${e(c.dateLabel)}</p><h1 id="hero-title">${e(c.names).replace("&amp;", "<em>&amp;</em>")}</h1><p class="hero-line">${e(c.hero.title)}</p></div><div class="hero-bottom"><span class="demo-label">${e(c.demo)}</span><a href="#story" class="scroll-cue">Our story <span>↓</span></a><a href="#invitation">The invitation ↗</a></div></section>
<section class="story section" id="story"><div class="chapter-heading"><span class="eyebrow">${e(c.copy.beginningLabel)}</span><h2>${e(c.beginning.title)}</h2><p>${e(c.beginning.caption)}</p></div><div class="memory-desk"><figure class="memory-print main-print"><div class="print-tilt">${photo(c.beginning.image, c.beginning.alt)}<figcaption>${e(c.beginning.printCaption)}</figcaption></div></figure><figure class="memory-print support-print">${photo(c.beginning.support, c.beginning.supportAlt)}<figcaption>${e(c.beginning.supportCaption)}</figcaption></figure><span class="desk-note">${e(c.beginning.note)}</span></div></section>
<section class="moments" id="moments"><div class="moments-pin"><div class="chapter-heading"><span class="eyebrow">${e(c.copy.momentsLabel)}</span><h2>${e(c.moments.title)}</h2><p>${e(c.moments.caption)}</p></div><div class="gallery-track" tabindex="0" role="region" aria-label="Photo memories">${c.moments.photos.map((p, i) => `<figure class="gallery-photo">${photo(p.image, p.alt)}<figcaption><span>0${i + 1}</span>${e(p.caption)}</figcaption></figure>`).join("")}</div><span class="gallery-note eyebrow">${e(c.copy.galleryNote)}</span></div></section>
<section class="promise" id="promise">${photo(c.promise.image, c.promise.alt, "full-photo")}<div class="promise-shade"></div><div class="promise-copy"><span class="eyebrow">${e(c.copy.promiseLabel)}</span><h2>${e(c.promise.title)}</h2><p>${e(c.promise.caption)}</p></div></section>
<section class="invitation-section section" id="invitation"><span class="eyebrow">${e(c.copy.invitationLabel)}</span><div class="formal-card"><span class="card-flower" aria-hidden="true">❦</span><h2>${e(c.invitation.title)}</h2><p>${e(c.invitation.caption)}</p><div class="invitation-names">${e(c.names)}</div><div class="event-date">${e(c.dayLabel)}<strong>${e(c.dateLabel)}</strong>${e(c.timeLabel)} · ${e(c.timeZoneLabel)}</div><h3>${e(c.venue)}</h3><p>${e(c.location)}</p><small>${e(c.venueNote)}</small><a class="dark-button" href="#rsvp">Kindly RSVP <span>↗</span></a></div><div class="countdown-section" id="countdown"><span class="eyebrow">${e(c.copy.countdownLabel)}</span><div class="countdown" aria-label="Time until the wedding">${["days", "hours", "minutes", "seconds"].map((k) => `<div><span id="${k}">00</span><small>${k}</small></div>`).join("")}</div><p class="countdown-caption">${e(c.dateLabel)} · ${e(c.timeLabel)} · ${e(c.timeZoneLabel)}</p></div></section>
<section class="celebration section" id="celebration"><div class="chapter-heading"><span class="eyebrow">${e(c.copy.celebrationLabel)}</span><h2>${e(c.celebrationTitle)}</h2></div><div class="timeline">${c.events.map((p, i) => `<article>${photo(p.image, p.alt)}<div class="event-caption"><span class="event-number">0${i + 1}</span><time>${e(p.time)}</time><h3>${e(p.title)}</h3><p>${e(p.place)}</p></div></article>`).join("")}</div></section>
<section class="details section" id="details"><div><span class="eyebrow">${e(c.copy.detailsLabel)}</span><h2>${e(c.copy.detailsTitle)}</h2><p>${e(c.copy.detailsCaption)}</p>${c.mapUrl ? `<a class="text-link" href="${e(c.mapUrl)}" target="_blank" rel="noopener">View verified venue map ↗</a>` : ""}</div><div class="accordions">${c.details.map((d, i) => `<details ${i === 0 ? "open" : ""}><summary><span>0${i + 1}</span>${e(d.title)}<b aria-hidden="true">+</b></summary><div>${e(d.text)}</div></details>`).join("")}</div></section>
<section class="rsvp section" id="rsvp"><div class="chapter-heading"><span class="eyebrow">${e(c.copy.rsvpLabel)}</span><h2>${e(c.copy.rsvpTitle)}</h2><p>Kindly respond by ${e(c.deadline)}.</p></div>{{FORM}}</section>
<section class="closing">${photo(c.closing.image, c.closing.alt, "full-photo")}<div class="closing-copy"><span aria-hidden="true" class="closing-flower">❦</span><h2>${e(c.closing.title)}<br><em>${e(c.names)}</em></h2><a href="#home">Back to the beginning ↑</a></div></section>`;
let template = await readFile("src/index.template.html", "utf8");
let form = await readFile("src/rsvp.html", "utf8");
template=template.replaceAll("{{COUPLE_PHOTO}}",photo(c.couplePortrait,c.couplePortraitAlt,"couple-portrait",true)).replaceAll("{{portraitCaption}}",e(c.portraitCaption));
template = template.replace("{{MAIN}}", main.replace("{{FORM}}", form));
template = template
  .replaceAll("{{INTRO_IMAGE}}", e(c.introImage))
  .replaceAll("{{NAMES}}", e(c.names))
  .replaceAll("{{DATE}}", e(c.dateLabel))
  .replaceAll("{{LOCATION}}", e(c.location));
template = template
  .replaceAll("Emma & James", e(c.names))
  .replaceAll("Emma and James", e(c.names))
  .replaceAll("June 12, 2027", e(c.dateLabel))
  .replaceAll("2027-06-12T16:00:00+02:00", e(c.date))
  .replaceAll("EMMA & JAMES", e(c.names.toUpperCase()));
for (const [key,value] of Object.entries(c.copy)) template=template.replaceAll('{{'+key+'}}',e(value));
const initials=c.names.split('&').map(name=>name.trim().charAt(0));
template=template.replace(/E(\s*<(?:span|i)>[\s\S]*?<\/(?:span|i)>\s*)J/g,(_,middle)=>e(initials[0])+middle+e(initials[1]||''));
await writeFile("dist/index.html", template.replace(/[ \t]+$/gm, ""));
console.log("Generated static invitation from story-config.js");
