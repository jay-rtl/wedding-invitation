import assert from 'node:assert/strict';
import {launch,base} from './test-helpers.mjs';
const browser=await launch();
try{
for(const width of [1440,390,320]){
 const page=await browser.newPage({viewport:{width,height:844},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#skip-intro').click();await page.emulateMedia({reducedMotion:'reduce'});
 const widget=page.locator('.floating-couple');
 const dimensions=()=>widget.evaluate(e=>({width:e.offsetWidth,height:e.offsetHeight,art:e.querySelector('.dance-art').getBoundingClientRect().height,font:getComputedStyle(e.querySelector('[data-countdown]')).fontSize}));
 const originalSize=await dimensions();
 for(const id of ['details','rsvp','home']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.deepEqual(await dimensions(),originalSize,'Widget keeps its size at '+id);}

 const drag=async(surface,dx,dy)=>{const box=await surface.boundingBox(),old=await widget.boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
 if(width<500){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up()}
 await page.waitForFunction(({x,y})=>{const r=document.querySelector('.floating-couple').getBoundingClientRect();return Math.abs(r.x-x)>20||Math.abs(r.y-y)>20},old);};
 await drag(page.locator('.dance-art'),-70,-100);
 await page.locator('#rsvp').scrollIntoViewIfNeeded();await page.waitForTimeout(150);const before=await widget.boundingBox();await drag(page.locator('.floating-countdown'),-35,-60);const moved=await widget.boundingBox();assert.ok(Math.abs(moved.y-before.y)>30,'Countdown drags even in RSVP');
 await page.locator('#story').scrollIntoViewIfNeeded();await page.locator('#rsvp').scrollIntoViewIfNeeded();const preserved=await widget.boundingBox();assert.ok(Math.abs(preserved.x-moved.x)<2&&Math.abs(preserved.y-moved.y)<2,'Automatic docking does not override a drag');
 await page.locator('#story').scrollIntoViewIfNeeded();await page.locator('.main-print .memory-open-button').click();assert.equal(await page.locator('.memory-viewer').isVisible(),true);const first=await page.locator('.viewer-caption').textContent();await page.getByRole('button',{name:'Next photograph',exact:true}).click();assert.notEqual(await page.locator('.viewer-caption').textContent(),first);await page.keyboard.press('Escape');assert.equal(await page.locator('.memory-viewer').isVisible(),false);assert.equal(await page.locator('.main-print .memory-open-button').evaluate(e=>e===document.activeElement),true);
 await page.locator('.chapter-ribbon a[href="#promise"]').click();assert.equal(await page.evaluate(()=>location.hash),'#promise');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#moments').scrollIntoViewIfNeeded();await page.waitForTimeout(700);if(width<500)assert.equal(await page.locator('.gallery-photo').first().evaluate(e=>getComputedStyle(e).position),'sticky');await page.screenshot({path:`test-results/creative-${width}.png`});assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}: drag artwork/countdown by mouse or touch, RSVP drag persistence, photo viewer/focus, chapter links, mobile stack, no errors.`)
}
}finally{await browser.close()}
