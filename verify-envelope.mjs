import assert from "node:assert/strict";
import { launch, base } from "./test-helpers.mjs";
const browser = await launch();
try {
  for (const [width, height, reduced] of [
    [1440, 1000, false],
    [390, 844, false],
    [320, 568, true],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: reduced ? "reduce" : "no-preference",
      hasTouch: width < 500,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: "domcontentloaded" });
    assert.equal(
      await page.locator(".invitation-scene").getAttribute("data-state"),
      "waiting",
    );
    assert.equal(await page.locator("main").evaluate((el) => el.inert), true);
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator("#skip-intro")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator("#open-invitation")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.mouse.wheel(0, 1000);
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.screenshot({ path: `test-results/envelope-${width}.png` });
    await page.evaluate(() => {
      window.opens = 0;
      document.addEventListener("wedding:opened", () => window.opens++);
    });
    await page.locator("#open-invitation").press("Enter");
    if (!reduced) {
      assert.equal(await page.locator("#open-invitation").isDisabled(), true);
      await page.evaluate(() =>
        document.getElementById("open-invitation").click(),
      );
      await page.waitForTimeout(1900);
      await page.screenshot({ path: `test-results/card-${width}.png` });
    }
    await page.locator(".invitation-scene").waitFor({ state: "hidden" });
    assert.equal(await page.evaluate(() => window.opens), 1);
    assert.equal(await page.locator("main").evaluate((e) => e.inert), false);
    assert.equal(
      await page.locator("h1").evaluate((e) => e === document.activeElement),
      true,
    );
    if (width < 701) await page.locator("#menu-toggle").click();
    await page.locator("#replay-invitation").click();
    assert.equal(await page.locator(".invitation-scene").isVisible(), true);
    assert.equal(
      await page
        .locator(".invitation-scene")
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".invitation-scene").isVisible(), false);
    await page.reload();
    assert.equal(await page.locator(".invitation-scene").isVisible(), false);
    if (!reduced) {
      await page.locator("#moments").scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      if (width > 900)
        assert.equal(await page.locator(".pin-spacer").count(), 1);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(
        () => document.querySelectorAll(".pin-spacer").length === 0,
      );
      assert.equal(await page.locator(".pin-spacer").count(), 0);
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `PASS ${width}px intro: focus/scroll lock, single activation, card sequence, skip, replay, return visit, motion cleanup.`,
    );
  }
} finally {
  await browser.close();
}
