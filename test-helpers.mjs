import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
export const base = process.env.TEST_URL || "http://127.0.0.1:3000";
export async function launch() {
  await mkdir("test-results", { recursive: true });
  return chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
}
export async function open(page) {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("#skip-intro").click();
  await page.locator(".invitation-scene").waitFor({ state: "hidden" });
  await page.emulateMedia({ reducedMotion: "reduce" });
}
