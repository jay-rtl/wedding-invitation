// The logo exit prepares the opaque envelope scene; completion enables it.
// Only a guest action can call open().
(() => {
  const scene=document.getElementById('invitation-scene');
  const button=document.getElementById('open-invitation');
  if(!scene||!button){document.documentElement.classList.remove('invitation-locked');return;}
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animated=Boolean(window.gsap)&&!reduced;
  const background=[...document.querySelectorAll('body > header, body > main, body > footer, body > .floating-couple')];
  const previousInert=background.map(node=>node.inert);
  const float=scene.querySelector('.envelope-float');
  const shadow=scene.querySelector('.envelope-shadow');
  const flap=scene.querySelector('.envelope-flap');
  const seal=scene.querySelector('.wax-seal');
  const card=scene.querySelector('.invitation-card');
  const hint=scene.querySelector('.envelope-hint');
  const announcement=scene.querySelector('.envelope-announcement');
  let state='loading',floating,shadowMotion,hintMotion,openingTimeline;
  let revealed=false;
  scene.hidden=false;
  background.forEach(node=>{node.inert=true;});
  document.documentElement.classList.add('invitation-locked');
  const setState=value=>{state=value;scene.dataset.state=value;};
  const revealHome=()=>{
    if(revealed)return;
    revealed=true;
    document.documentElement.classList.add('invitation-revealing');
    document.dispatchEvent(new Event('wedding:reveal'));
  };
  const finish=()=>{
    if(state==='opened')return;
    revealHome();setState('opened');
    [floating,shadowMotion,hintMotion].forEach(animation=>animation?.kill());
    button.removeEventListener('click',open);
    scene.removeEventListener('keydown',trapFocus);
    scene.hidden=true;scene.remove();
    background.forEach((node,i)=>{node.inert=previousInert[i];});
    document.documentElement.classList.remove('invitation-locked','invitation-revealing');
    if(window.ScrollTrigger)ScrollTrigger.refresh();
    const heading=document.querySelector('.hero h1');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
    document.dispatchEvent(new Event('wedding:opened'));
  };
  function prepare(){
    if(state==='loading')scene.classList.add('is-prepared');
  }
  function show(){
    if(state!=='loading')return;
    setState('waiting');button.disabled=false;
    if(animated){
      floating=gsap.fromTo(float,{y:0,rotation:-.65},{y:-12,rotation:.85,duration:3.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
      shadowMotion=gsap.fromTo(shadow,{scaleX:1,opacity:.45},{scaleX:.9,opacity:.3,duration:3.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
      hintMotion=gsap.to(scene.querySelector('.hint-arrow'),{y:-4,duration:1.6,repeat:-1,yoyo:true,ease:'sine.inOut'});
    }
    button.focus({preventScroll:true});
  }
  function open(){
    if(state!=='waiting')return;
    setState('opening');button.disabled=true;scene.focus({preventScroll:true});
    announcement.textContent="You're Invited. To Celebrate Our Wedding. Emma and James.";
    [floating,shadowMotion,hintMotion].forEach(animation=>animation?.pause());
    if(animated){
      openingTimeline=gsap.timeline({onComplete:finish});
      openingTimeline.to(float,{y:0,rotation:0,duration:.35,ease:'power2.out'},0)
        .to(button,{scale:.975,duration:.16,ease:'power2.out'},0)
        .to(button,{scale:1.02,duration:.3,ease:'power2.out'},.16)
        .to(hint,{opacity:0,duration:.25},0)
        .to(scene.querySelector('.scene-intro'),{opacity:0,duration:.35},.2)
        .to(seal,{scale:1.08,y:2,duration:.2,ease:'power2.out'},.3)
        .to(seal,{scale:.9,y:32,rotation:14,autoAlpha:0,duration:.4,ease:'power2.in'},.5)
        .to(flap,{rotationX:-178,duration:1,ease:'power2.inOut'},.72)
        .set(flap,{zIndex:1},1.32)
        .set(card,{autoAlpha:1},1.32)
        .to(card,{yPercent:-68,duration:1.15,ease:'power3.out'},1.4)
        .fromTo(scene.querySelectorAll('.card-copy>span'),{y:8,opacity:0},{y:0,opacity:1,duration:.6,stagger:.14,ease:'power2.out'},2.05)
        .to(shadow,{opacity:.18,duration:.6},2)
        .call(revealHome,[],3.6)
        .to(scene,{opacity:0,duration:.8,ease:'power2.inOut'},3.7);
    }else{
      // Reduced motion and unavailable-GSAP fallback keep the same deliberate
      // interaction, readable card, and order without a 3D or floating effect.
      hint.style.opacity='0';scene.querySelector('.scene-intro').style.opacity='0';seal.style.visibility='hidden';
      flap.style.transform='rotateX(-178deg)';flap.style.zIndex='1';
      card.style.opacity='1';card.style.visibility='visible';card.style.transform='translateY(-68%)';
      scene.querySelectorAll('.card-copy>span').forEach(node=>{node.style.opacity='1';});
      if(window.gsap){
        openingTimeline=gsap.timeline({onComplete:finish}).call(revealHome,[],1.2).to(scene,{opacity:0,duration:.2},1.3);
      }else{
        // This delay follows the click; the waiting envelope has no timer.
        window.setTimeout(finish,1500);
      }
    }
  }
  function trapFocus(event){
    if(event.key!=='Tab')return;
    event.preventDefault();
    (state==='waiting'?button:scene).focus({preventScroll:true});
  }
  button.addEventListener('click',open);
  scene.addEventListener('keydown',trapFocus);
  window.WeddingEnvelope={prepare,show,get state(){return state;}};
})();
