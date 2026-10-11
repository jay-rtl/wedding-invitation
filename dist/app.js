// Progressive enhancement: the generated HTML is complete before this script runs.
const WEDDING = window.WEDDING;
const media = matchMedia("(prefers-reduced-motion: reduce)");
const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
const timeNodes = ["days", "hours", "minutes", "seconds"].map((id) => [
  ...document.querySelectorAll(`#${id},[data-countdown="${id}"]`),
]);
const floatingDate = document.getElementById("floating-wedding-date");
floatingDate.dateTime = WEDDING.date;
floatingDate.textContent = WEDDING.dateLabel;
function updateCountdown() {
  const total = Math.max(
    0,
    Math.floor((new Date(WEDDING.date) - Date.now()) / 1000),
  );
  const values = [
    Math.floor(total / 86400),
    Math.floor((total % 86400) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ];
  values.forEach((value, i) =>
    timeNodes[i].forEach(
      (node) =>
        (node.textContent = String(value).padStart(i === 0 ? 3 : 2, "0")),
    ),
  );
  if (!total)
    document.querySelector(".countdown-caption").textContent =
      "Our next chapter has begun.";
}
let clock;
function startClock() {
  clearInterval(clock);
  updateCountdown();
  if (!document.hidden) clock = setInterval(updateCountdown, 1000);
}
startClock();
document.addEventListener("visibilitychange", startClock);
const menu = document.getElementById("main-nav"),
  toggle = document.getElementById("menu-toggle");
function closeMenu() {
  menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("is-open", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a,button")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    toggle.focus();
  }
});
matchMedia("(min-width:701px)").addEventListener("change", closeMenu);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".header")) closeMenu();
});
const form = document.getElementById("rsvp-form"),
  attendance = form.elements.attendance;
attendance.addEventListener("change", () => {
  form.elements.guests.disabled = attendance.value === "no";
  if (attendance.value === "yes" && !form.elements.guests.value)
    form.elements.guests.value = "1";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  data.name = data.name.trim();
  if (!data.name) {
    form.elements.name.setCustomValidity("Please enter your name.");
    form.elements.name.reportValidity();
    return;
  }
  if (data.attendance === "no") data.guests = "0";
  const message = document.getElementById("form-message");
  try {
    localStorage.setItem(
      "emma-james-rsvp",
      JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
    );
    message.textContent = `Thank you, ${data.name}. Your demo response is saved on this device only. Nothing has been sent to the couple.`;
  } catch {
    message.textContent =
      "This browser could not save your response. Nothing has been sent. Please enable browser storage and try again.";
  }
  message.focus({ preventScroll: true });
});
form.elements.name.addEventListener("input", () =>
  form.elements.name.setCustomValidity(""),
);
try {
  const saved = JSON.parse(localStorage.getItem("emma-james-rsvp") || "null");
  if (saved) {
    for (const k of ["name", "email", "attendance", "guests", "note"])
      if (saved[k] && form.elements[k] && !(k === "guests" && saved[k] === "0"))
        form.elements[k].value = saved[k];
    form.elements.guests.disabled = saved.attendance === "no";
  }
} catch {}
// One matchMedia owner ensures pins and inline transforms are reverted on resize or preference changes.
let motion;
function setupMotion() {
  if (!hasGSAP) return;
  gsap.registerPlugin(ScrollTrigger);
  motion?.revert();
  motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(
      ".hero .full-photo",
      { clipPath: "inset(0 48% 0 48%)" },
      { clipPath: "inset(0 0% 0 0%)", duration: 1.4, ease: "power3.inOut" },
    );
    gsap.from(".hero-copy", {
      opacity: 0,
      y: 24,
      duration: 1.2,
      delay: 0.3,
      clearProps: "opacity",
    });
    gsap.to(".hero .full-photo img", {
      yPercent: 9,
      scale: 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.fromTo(
      ".main-print",
      { rotation: -9, y: 60 },
      {
        rotation: 0,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".story",
          start: "top 85%",
          end: "center center",
          scrub: 1,
        },
      },
    );
    gsap.fromTo(
      ".support-print",
      { rotation: 14, y: 70 },
      {
        rotation: 7,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".story",
          start: "top 60%",
          end: "bottom 85%",
          scrub: 1,
        },
      },
    );
    gsap.fromTo(
      ".promise .full-photo",
      { clipPath: "inset(15% 8% 15% 8%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: {
          trigger: ".promise",
          start: "top 90%",
          end: "top 15%",
          scrub: 1,
        },
      },
    );
    gsap.from(".promise-copy", {
      y: 30,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: ".promise-copy", start: "top 90%", once: true },
    });
    gsap.fromTo(
      ".formal-card",
      { rotationX: 12, y: 60 },
      {
        rotationX: 0,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".formal-card",
          start: "top 90%",
          end: "top 25%",
          scrub: 1,
        },
      },
    );
    document
      .querySelectorAll(".timeline picture")
      .forEach((p, i) =>
        gsap.from(p, {
          clipPath: i % 2 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)",
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: p, start: "top 90%", once: true },
        }),
      );
    gsap.fromTo(
      ".closing-flower",
      { rotation: -12 },
      {
        rotation: 12,
        ease: "none",
        scrollTrigger: {
          trigger: ".closing",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
  });
  motion.add(
    "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
    () => {
      const track = document.querySelector(".gallery-track");
      track.classList.add("is-pinned");
      const galleryTravel = gsap.to(track, {
        x: () =>
          -Math.max(0, track.scrollWidth - innerWidth + innerWidth * 0.06),
        ease: "none",
        scrollTrigger: {
          id: "memories",
          trigger: ".moments-pin",
          start: "top 78px",
          end: () => "+=" + Math.min(1000, innerWidth * 0.65),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      track.querySelectorAll('.gallery-photo').forEach((photo, index) => {
        gsap.fromTo(photo,
          { rotationY: index % 2 ? -4 : 4, scale: .97, transformPerspective: 1200 },
          { rotationY: 0, scale: 1, ease: 'none', scrollTrigger: {
            trigger: photo, containerAnimation: galleryTravel,
            start: 'left right', end: 'center center', scrub: true,
          } });
      });
      return () => track.classList.remove("is-pinned");
    },
  );
  motion.add('(max-width: 700px) and (prefers-reduced-motion: no-preference)',()=>{
    const cards=gsap.utils.toArray('.gallery-photo');
    gsap.from('.hero h1',{rotationX:20,scale:.87,duration:1.65,ease:'power3.out',transformPerspective:1000});
    gsap.from('.hero-line',{y:35,opacity:0,duration:1.2,delay:.55});
    cards.forEach((card,index)=>{
      gsap.fromTo(card,{rotation:index%2?7:-7,scale:.87,y:65},
        {rotation:index%2?1.5:-1.5,scale:1,y:0,ease:'none',scrollTrigger:{
          trigger:card,start:'top 95%',end:'top 24%',scrub:.55,invalidateOnRefresh:true}});
      gsap.fromTo(card.querySelector('img'),{scale:1.2,yPercent:5},
        {scale:1.03,yPercent:-2,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:.7}});
    });
    gsap.fromTo('.main-print img',{scale:1.18,yPercent:5},{scale:1,yPercent:0,ease:'none',scrollTrigger:{trigger:'.memory-desk',start:'top 90%',end:'center 40%',scrub:.7}});
    gsap.fromTo('.desk-note',{x:35,rotation:15,opacity:0},{x:0,rotation:7,opacity:1,duration:.9,scrollTrigger:{trigger:'.memory-desk',start:'top 85%',toggleActions:'play none none reverse'}});
    gsap.fromTo('.promise .full-photo img',{scale:1.25,yPercent:4},{scale:1.05,yPercent:-3,ease:'none',scrollTrigger:{trigger:'.promise',start:'top bottom',end:'bottom top',scrub:.8}});
    gsap.fromTo('.promise h2',{x:-28},{x:12,ease:'none',scrollTrigger:{trigger:'.promise',start:'top 50%',end:'bottom 30%',scrub:.8}});
    document.querySelectorAll('.event-caption').forEach((caption,index)=>gsap.from(caption,{x:index%2?25:-25,opacity:0,duration:.8,scrollTrigger:{trigger:caption,start:'top 94%',toggleActions:'play none none reverse'}}));
    gsap.fromTo('.closing .full-photo img',{scale:1.18,yPercent:5},{scale:1,yPercent:0,ease:'none',scrollTrigger:{trigger:'.closing',start:'top bottom',end:'bottom bottom',scrub:.7}});
    gsap.from('.closing-copy h2',{y:45,opacity:0,duration:1.2,scrollTrigger:{trigger:'.closing',start:'top 55%',toggleActions:'play none none reverse'}});
  });
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  refresh();
}
document.addEventListener("wedding:opened", setupMotion, { once: true });
window.addEventListener(
  "load",
  () => {
    if (!document.documentElement.classList.contains("invitation-locked"))
      setupMotion();
  },
  { once: true },
);
window.addEventListener("pagehide", () => {
  motion?.revert();
  clearInterval(clock);
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    startClock();
    setupMotion();
  }
});
const header = document.querySelector(".header");
new IntersectionObserver(
  (entries) =>
    header.classList.toggle("is-scrolled", !entries[0].isIntersecting),
  { rootMargin: "-80px 0px 0px 0px" },
).observe(document.querySelector(".hero"));
const tilt = document.querySelector(".print-tilt");
tilt.addEventListener("pointermove", (event) => {
  if (media.matches || event.pointerType !== "mouse") return;
  const r = tilt.getBoundingClientRect();
  tilt.style.transform = `rotateX(${(event.clientY - r.top - r.height / 2) / 80}deg) rotateY(${(event.clientX - r.left - r.width / 2) / 65}deg)`;
});
tilt.addEventListener("pointerleave", () => (tilt.style.transform = ""));
// A quiet table of contents and an accessible photographic interlude.
const chapters=[['story',WEDDING.copy.beginningLabel],['moments',WEDDING.copy.momentsLabel],['promise',WEDDING.copy.promiseLabel],['invitation',WEDDING.copy.invitationLabel]];
const ribbon=document.createElement('nav');ribbon.className='chapter-ribbon';ribbon.setAttribute('aria-label','Story chapters');
chapters.forEach(([id,label],i)=>{const link=document.createElement('a');link.href='#'+id;const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');const title=document.createElement('span');title.textContent=label.split('/').pop().trim().toLowerCase();link.append(number,title);ribbon.append(link)});
document.querySelector('.hero').after(ribbon);
const chapterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){ribbon.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}),{rootMargin:'-20% 0px -50% 0px'});
chapters.forEach(([id])=>chapterObserver.observe(document.getElementById(id)));
const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.querySelector('.header').append(progress);
if(hasGSAP){const progressMotion=gsap.matchMedia();progressMotion.add('(prefers-reduced-motion: no-preference)',()=>{gsap.fromTo(progress,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'main',start:'top top',end:'bottom bottom',scrub:true}})});window.addEventListener('pagehide',()=>progressMotion.revert())}
if(typeof HTMLDialogElement!=='undefined'){
 const memories=[...document.querySelectorAll('.memory-print,.gallery-photo')];
 const viewer=document.createElement('dialog');viewer.className='memory-viewer';viewer.setAttribute('aria-label','Memory photographs');
 const mediaPanel=document.createElement('div');mediaPanel.className='viewer-media';
 const caption=document.createElement('p');caption.className='viewer-caption';caption.setAttribute('aria-live','polite');
 const controls=document.createElement('div');controls.className='viewer-controls';
 const control=(label,text,action)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);button.textContent=text;button.addEventListener('click',action);return button};
 let selected=0;
 const show=index=>{selected=(index+memories.length)%memories.length;const figure=memories[selected];const picture=figure.querySelector('picture').cloneNode(true);picture.querySelectorAll('[sizes]').forEach(n=>n.sizes='90vw');picture.querySelector('img').loading='eager';mediaPanel.replaceChildren(picture);caption.textContent=String(selected+1).padStart(2,'0')+' / '+String(memories.length).padStart(2,'0')+' — '+figure.dataset.memoryCaption};
 controls.append(control('Previous photograph','←',()=>show(selected-1)),control('Close photo viewer','Close ×',()=>viewer.close()),control('Next photograph','→',()=>show(selected+1)));
 viewer.append(mediaPanel,caption,controls);document.body.append(viewer);
 memories.forEach((figure,index)=>{figure.dataset.memoryCaption=figure.querySelector('figcaption').textContent.trim();const button=control('Enlarge photograph: '+figure.querySelector('img').alt,'↗',()=>{show(index);viewer.showModal();document.documentElement.classList.add('memory-open')});button.className='memory-open-button';figure.append(button)});
 viewer.addEventListener('close',()=>document.documentElement.classList.remove('memory-open'));
 viewer.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(selected+(event.key==='ArrowRight'?1:-1))}});
 viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close()});
 let touchX=null;mediaPanel.addEventListener('touchstart',event=>touchX=event.touches[0].clientX,{passive:true});mediaPanel.addEventListener('touchend',event=>{if(touchX!==null&&Math.abs(event.changedTouches[0].clientX-touchX)>65)show(selected+(event.changedTouches[0].clientX<touchX?1:-1));touchX=null},{passive:true});
}
