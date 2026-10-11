import assert from "node:assert/strict";
import { launch, base, open } from "./test-helpers.mjs";
const browser = await launch();
try {
  for (const width of [1440, 900, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: width < 500 ? 844 : 1000 },
      isMobile: width < 500,
      hasTouch: width < 500,
    });
    const errors = [],
      missing = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.url().startsWith(base) && r.status() >= 400) missing.push(r.url());
    });
    await open(page);
    assert.equal(await page.locator("h1").count(), 1);
    for (const id of [
      "story",
      "moments",
      "promise",
      "invitation",
      "celebration",
      "details",
      "rsvp",
    ]) {
      await page.locator("#" + id).scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => document.documentElement.scrollWidth <= innerWidth,
      );
      for (const img of await page.locator("#" + id + " img").all())
        await img.evaluate((el) => el.decode());
      await page.screenshot({ path: `test-results/${id}-${width}.png` });
    }
    for (const link of ["Our story", "The day", "The details"]) {
      if (width <= 700) await page.locator("#menu-toggle").click();
      await page
        .locator("#main-nav")
        .getByRole("link", { name: link, exact: true })
        .click();
      const hash = await page.evaluate(() => location.hash);
      assert.ok(["#story", "#celebration", "#details"].includes(hash));
      await page.waitForFunction((hash) => {
        const y = document.querySelector(hash).getBoundingClientRect().top;
        return y >= 0 && y < 120;
      }, hash);
      const y = await page
        .locator(hash)
        .evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(y >= 0 && y < 120, `${link} target visible at ${width}: ${y}`);
    }
    await page.locator(".nav-rsvp").click();
    assert.equal(await page.evaluate(() => location.hash), "#rsvp");
    assert.equal(
      await page.locator(".floating-couple").isVisible(),
      true,
      "Widget remains visible at RSVP",
    );
    await page.locator("[name=name]").fill("   ");
    await page.locator("[name=email]").fill("guest@example.com");
    await page.locator("[name=attendance]").selectOption("yes");
    await page.locator("button[type=submit]").click();
    assert.equal(
      await page.locator("[name=name]").evaluate((e) => e.validity.valid),
      false,
    );
    await page.locator("[name=name]").fill("Alex Guest");
    await page.locator("[name=guests]").selectOption("2");
    await page.locator("button[type=submit]").click();
    assert.match(
      await page.locator("#form-message").textContent(),
      /Nothing has been sent/,
    );
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("emma-james-rsvp")).guests,
      ),
      "2",
    );
    await page.locator("[name=attendance]").selectOption("no");
    assert.equal(await page.locator("[name=guests]").isDisabled(), true);
    await page.locator("button[type=submit]").click();
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("emma-james-rsvp")).guests,
      ),
      "0",
    );
    await page.reload();
    assert.equal(await page.locator("[name=name]").inputValue(), "Alex Guest");
    assert.equal(await page.locator(".invitation-scene").isVisible(), false);
    for (const summary of await page.locator("summary").all()) {
      await summary.focus();
      const before = await summary.evaluate((el) => el.parentElement.open);
      await page.keyboard.press("Enter");
      assert.notEqual(
        await summary.evaluate((el) => el.parentElement.open),
        before,
      );
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    await page.close();
    console.log(
      `PASS ${width}px: scenes, image decode, navigation, no overflow, accordions, RSVP validation/save/restore/decline, no runtime errors.`,
    );
  }
  const fallback = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await fallback.route("**/vendor/*.js", (r) => r.abort());
  await open(fallback);
  assert.equal(await fallback.locator("main").evaluate((e) => e.inert), false);
  await fallback.locator("#rsvp").scrollIntoViewIfNeeded();
  assert.equal(await fallback.locator("#rsvp-form").isVisible(), true);
  await fallback.close();
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto(base);
  assert.equal(await nojs.locator("#invitation").isVisible(), true);
  assert.equal(await nojs.locator(".invitation-scene").isVisible(), false);
  assert.equal(await nojs.locator("#rsvp-form").isVisible(), false);
  await nojs.screenshot({ path: "test-results/no-js.png" });
  await nojs.close();
  const storage = await browser.newPage({ reducedMotion: "reduce" });
  await storage.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Blocked");
    };
  });
  await open(storage);
  await storage.locator("[name=name]").fill("Alex");
  await storage.locator("[name=email]").fill("alex@example.com");
  await storage.locator("[name=attendance]").selectOption("yes");
  await storage.locator("button[type=submit]").click();
  assert.match(
    await storage.locator("#form-message").textContent(),
    /could not save/,
  );
  await storage.close();
  console.log(
    "PASS missing GSAP, no JavaScript, and blocked storage fallbacks.",
  );
} finally {
  await browser.close();
}
