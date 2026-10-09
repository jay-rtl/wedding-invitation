// Personalize the sample invitation here. This date includes the wedding's UTC offset.
const WEDDING = { date: '2027-06-12T16:00:00+02:00', timeZone: 'Europe/Rome', names: 'Emma & James' };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const timeNodes = ['days','hours','minutes','seconds'].map(id => [...document.querySelectorAll(`#${id}, [data-countdown="${id}"]`)]);
const floatingDate = document.getElementById('floating-wedding-date');
if (floatingDate) {
  floatingDate.dateTime = WEDDING.date;
  floatingDate.textContent = new Intl.DateTimeFormat('en-US', {month:'long',day:'numeric',year:'numeric',timeZone:WEDDING.timeZone}).format(new Date(WEDDING.date));
}
let previous = [];
function updateCountdown() {
  const remaining = Math.max(0, new Date(WEDDING.date).getTime() - Date.now());
  const total = Math.floor(remaining / 1000);
  const values = [Math.floor(total/86400), Math.floor(total%86400/3600), Math.floor(total%3600/60), total%60];
  values.forEach((value, index) => {
    if (previous[index] === value) return;
    timeNodes[index].forEach(node => {
      node.textContent = String(value).padStart(index === 0 ? 3 : 2, '0');
      if (previous.length && hasGSAP && !reduceMotion) gsap.fromTo(node, {y:node.hasAttribute('data-countdown')?2:5,opacity:.55}, {y:0,opacity:1,duration:.4,ease:'power2.out',overwrite:true});
    });
  });
  previous = values;
  if (remaining === 0) {
    document.querySelector('.countdown-caption').textContent = 'Our wedding day is here. Let the celebration begin!';
    const floatingMessage = document.getElementById('floating-wedding-message');
    if (floatingMessage) floatingMessage.hidden = false;
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener('visibilitychange', () => {if (!document.hidden) updateCountdown();});

let homepageRevealed=false;
function revealWeddingHomepage() {
  if(homepageRevealed)return;
  homepageRevealed=true;
  if(!hasGSAP||reduceMotion)return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline()
    .from('.header',{y:-15,opacity:0,duration:.65},0)
    .from('.hero-top,.hero-title',{y:25,opacity:0,duration:.9,stagger:.15,ease:'power3.out'},.1)
    .from('.hero-image',{clipPath:'inset(12% 0 0 0)',opacity:0,duration:1.1,ease:'power3.out'},.2)
    .from('.image-copy>*',{y:20,opacity:0,duration:.8,stagger:.1,ease:'power3.out'},.4);
  gsap.utils.toArray('.reveal').forEach(element => gsap.from(element,{y:32,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 91%',once:true}}));
  gsap.fromTo('.hero-image>img',{scale:1.06,yPercent:-3},{scale:1.12,yPercent:5,ease:'none',scrollTrigger:{trigger:'.hero-image',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.to('.scroll-cue',{y:6,duration:1.5,yoyo:true,repeat:-1,ease:'sine.inOut'});
}
document.addEventListener('wedding:reveal',revealWeddingHomepage,{once:true});

if (hasGSAP && !reduceMotion) {
  const entrance = document.querySelector('.entrance');
  entrance.classList.add('active');
  const timeline = gsap.timeline({onComplete:()=>{entrance.remove();window.WeddingEnvelope?.show();}});
  const circle = entrance.querySelector('circle');
  const length = circle.getTotalLength();
  gsap.set(circle, {strokeDasharray:length,strokeDashoffset:length});
  timeline.to(circle,{strokeDashoffset:0,duration:1.15,ease:'power2.inOut'})
    .from('.entrance-mark>span',{opacity:0,y:15,duration:.8,ease:'power3.out'},.25)
    .from('.entrance p',{opacity:0,y:8,duration:.6},.6)
    .to('.entrance-mark,.entrance p',{opacity:0,y:-18,duration:.5,stagger:.06},1.5)
    .to(entrance,{yPercent:-100,duration:.9,ease:'power3.inOut',onStart:()=>window.WeddingEnvelope?.prepare()},1.75);
}else{
  document.querySelector('.entrance')?.remove();
  window.WeddingEnvelope?.show();
}

document.querySelectorAll('.accordions details').forEach(details=>{
  details.addEventListener('toggle',()=>{
    if(details.open&&hasGSAP&&!reduceMotion)gsap.fromTo(details.querySelector('div'),{opacity:0,y:-6},{opacity:1,y:0,duration:.35,ease:'power2.out',overwrite:true});
  });
});

const form = document.getElementById('rsvp-form');
const attendance = form.elements.attendance;
attendance.addEventListener('change',()=>{form.elements.guests.disabled=attendance.value==='no';});
form.addEventListener('submit',event=>{
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  data.name = data.name.trim();
  const message = document.getElementById('form-message');
  if (!data.name) {form.elements.name.setCustomValidity('Please enter your name.');form.elements.name.reportValidity();return;}
  try {
    localStorage.setItem('emma-james-rsvp', JSON.stringify({...data,savedAt:new Date().toISOString()}));
    message.textContent=data.attendance==='yes'?`Thank you, ${data.name}! Your acceptance is saved on this device. This sample form does not send a response to the couple.`:`Thank you, ${data.name}. Your response is saved on this device. This sample form does not send a response to the couple.`;
    if(hasGSAP&&!reduceMotion) gsap.fromTo(message,{opacity:0,y:8},{opacity:1,y:0,duration:.5});
  } catch { message.textContent='Your browser could not save this response. Please allow local storage and try again.'; }
  message.focus({preventScroll:true});
});
form.elements.name.addEventListener('input',()=>form.elements.name.setCustomValidity(''));
try {
  const saved=JSON.parse(localStorage.getItem('emma-james-rsvp') || 'null');
  if(saved){for(const key of ['name','email','attendance','guests','note']) if(saved[key]&&form.elements[key]) form.elements[key].value=saved[key];form.elements.guests.disabled=saved.attendance==='no';}
} catch { /* Form remains usable when local storage is unavailable. */ }
