import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:width===390?844:1000},hasTouch:width===390,isMobile:width===390});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
    await page.locator('.invitation-scene[data-state=waiting]').waitFor();
    await page.locator('#open-invitation').press('Enter');
    await page.locator('.invitation-scene').waitFor({state:'detached'});
    const couple=page.locator('.floating-couple');
    const defaultWidth=(await couple.boundingBox()).width;
    assert.equal(await couple.getAttribute('data-size'),'medium');
    await page.locator('#couple-smaller').click();
    assert.ok((await couple.boundingBox()).width<defaultWidth,'Visitor can shrink the whole group');
    assert.equal(await page.locator('#couple-smaller').isDisabled(),true);
    assert.equal(await couple.evaluate(el=>el.style.left),'','Size buttons do not start dragging');
    await page.locator('#couple-larger').click();
    await page.locator('#couple-larger').click();
    assert.ok((await couple.boundingBox()).width>defaultWidth,'Visitor can enlarge the whole group');
    assert.equal(await page.locator('#couple-larger').isDisabled(),true);
    await page.locator('#couple-smaller').click();
    assert.equal(await couple.locator('time').textContent(),'June 12, 2027');
    const secondsBefore=await couple.locator('[data-countdown=seconds]').textContent();
    await page.waitForTimeout(1200);
    assert.notEqual(await couple.locator('[data-countdown=seconds]').textContent(),secondsBefore,'Floating countdown updates live');
    assert.equal(await page.evaluate(()=>['days','hours','minutes','seconds'].every(id=>document.getElementById(id).textContent===document.querySelector(`[data-countdown="${id}"]`).textContent)),true,'Both countdowns stay synchronized');
    const initial=await couple.boundingBox();
    assert.equal(await page.locator('.dance-section,.pin-spacer').count(),0,'No pinned dance section');
    const poses=[];
    for(const progress of [.1,.45,.8]){
      await page.evaluate(progress=>{
        const dance=ScrollTrigger.getById('wedding-dance');
        window.scrollTo({top:dance.start+(dance.end-dance.start)*progress,behavior:'instant'});
      },progress);
      await page.waitForTimeout(1200);
      const box=await couple.boundingBox();
      assert.ok(Math.abs(box.y-initial.y)<2 && Math.abs(box.x-initial.x)<2,'Couple remains fixed during scroll');
      poses.push(await page.locator('#bride-body').getAttribute('transform'));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    assert.ok(new Set(poses).size>1,`Dancing changes with scrolling at ${width}px`);
    const dx=width===390?-120:-250,dy=-140;
    const x=initial.x+initial.width/2,y=initial.y+initial.height/2;
    if(width===390){
      const cdp=await page.context().newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y:y+dy*i/10}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else{
      await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:12});await page.mouse.up();
    }
    await page.waitForTimeout(300);
    const moved=await couple.boundingBox();
    assert.ok(Math.abs(moved.x-(initial.x+dx))<3&&Math.abs(moved.y-(initial.y+dy))<3,'Mouse/touch drag moves the couple');
    await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(1000);
    const preserved=await couple.boundingBox();
    assert.ok(Math.abs(preserved.x-moved.x)<2&&Math.abs(preserved.y-moved.y)<2,'Dragged position persists while scrolling');
    await couple.focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(250);
    assert.ok((await couple.boundingBox()).x<moved.x,'Keyboard movement');
    await page.screenshot({path:`test-results/floating-${width}.png`});
    await page.setViewportSize({width:320,height:500});await page.waitForTimeout(250);
    const clamped=await couple.boundingBox();assert.ok(clamped.x>=0&&clamped.y>=0&&clamped.x+clamped.width<=320&&clamped.y+clamped.height<=500,'Resize keeps couple inside screen');
    await page.locator('#couple-larger').click();await page.waitForTimeout(250);
    const resized=await couple.boundingBox();assert.ok(resized.x+resized.width<=320&&resized.y+resized.height<=500,'Enlarging a dragged group keeps it inside screen');
    await page.reload({waitUntil:'networkidle'});
    await page.locator('.invitation-scene[data-state=waiting]').waitFor();
    await page.locator('#open-invitation').press('Enter');
    await page.locator('.invitation-scene').waitFor({state:'detached'});
    assert.equal(await couple.getAttribute('data-size'),'large','Visitor size preference survives reload');
    assert.deepEqual(errors,[]);await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto('http://localhost:3000',{waitUntil:'networkidle'});
  await reduced.locator('#open-invitation').click();
  await reduced.locator('.invitation-scene').waitFor({state:'detached'});
  assert.equal(await reduced.locator('.dance-art').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await reduced.locator('.couple-content').evaluate(el=>getComputedStyle(el).animationName),'none');
  const pose=await reduced.locator('#bride-body').getAttribute('transform');
  await reduced.evaluate(()=>window.scrollTo(0,2000));
  assert.equal(await reduced.locator('#bride-body').getAttribute('transform'),pose);
  const initial=await reduced.locator('.floating-couple').boundingBox();
  await reduced.locator('.floating-couple').focus();await reduced.keyboard.press('ArrowLeft');
  assert.ok((await reduced.locator('.floating-couple').boundingBox()).x<initial.x);
  console.log('PASS: persistent floating couple, scroll dancing, mouse and touch dragging, keyboard movement, resize bounds, mobile layout, reduced motion, and no browser errors.');
}finally{await browser.close();}
