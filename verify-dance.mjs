import assert from "node:assert/strict";
import { launch, open } from "./test-helpers.mjs";
const browser = await launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      hasTouch: width < 500,
      isMobile: width < 500,
    });
    await open(page);
    const widget = page.locator(".floating-couple");

    const seconds = await page.locator("#seconds").textContent();
    await page.waitForTimeout(1100);
    assert.notEqual(await page.locator("#seconds").textContent(), seconds);
    assert.equal(
      await page.locator("[data-countdown=seconds]").textContent(),
      await page.locator("#seconds").textContent(),
    );
    const initial = await widget.boundingBox(),
      grip = await page.locator(".couple-grip").boundingBox();
    if (width < 500) {
      const session = await page.context().newCDPSession(page);
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          { x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 },
        ],
      });
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: grip.x + grip.width / 2 - 70,
            y: grip.y + grip.height / 2 - 130,
          },
        ],
      });
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    } else {
      await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
      await page.mouse.down();
      await page.mouse.move(grip.x - 80, grip.y - 130, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForFunction(({x,y}) => {
      const rect = document.querySelector('.floating-couple').getBoundingClientRect();
      return rect.x < x - 40 && rect.y < y - 80;
    }, initial);
    const moved = await widget.boundingBox();
    assert.ok(
      moved.x < initial.x - 40 && moved.y < initial.y - 80,
      "Dedicated grip mouse/touch drag",
    );
    await widget.focus();
    await page.keyboard.press("ArrowLeft");
    assert.ok((await widget.boundingBox()).x < moved.x);
    const before = (await widget.boundingBox()).width;
    await page.locator("#couple-larger").click();
    assert.ok((await widget.boundingBox()).width > before);
    await page.setViewportSize({ width: 320, height: 568 });
    const bounded = await widget.boundingBox();
    assert.ok(
      bounded.x >= 0 &&
        bounded.y >= 80 &&
        bounded.x + bounded.width <= 320 &&
        bounded.y + bounded.height <= 568,
    );
    await page.locator("#companion-toggle").click();
    assert.equal(
      await widget
        .getAttribute("class")
        .then((s) => s.includes("is-minimized")),
      true,
    );
    await page.reload();
    assert.ok(!(await widget.getAttribute("class")).includes("is-minimized"));
    await page.locator("#companion-close").click();
    assert.equal(await widget.isVisible(), false);
    await page.locator("#show-companion").click();
    await page.locator(".monogram").click();
    assert.equal(await widget.isVisible(), true);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document
        .querySelector(".floating-couple")
        .classList.contains("is-response-docked"),
    );
    assert.equal(await widget.isVisible(), true);
    await page.close();
    console.log(
      `PASS ${width}px countdown sync, drag/touch, keyboard, size/clamp, expanded-on-reload behavior, close/restore, RSVP clearance.`,
    );
  }
} finally {
  await browser.close();
}
