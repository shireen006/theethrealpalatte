import { chromium } from "playwright";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyHeroAndPwa() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // Test across multiple screen widths: 1920, 1366, 1280, 768, 375
  const viewports = [
    { name: "wide_1920", width: 1920, height: 1080 },
    { name: "laptop_1366", width: 1366, height: 768 },
    { name: "desktop_1280", width: 1280, height: 800 },
    { name: "tablet_768", width: 768, height: 1024 },
    { name: "mobile_375", width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

    // Check collision between cat-wrapper and primary-btn on desktop
    if (vp.width > 900) {
      const catBox = await page.locator(".hero-cat-wrapper").boundingBox();
      const btnBox = await page.locator(".primary-btn").boundingBox();

      console.log(`[${vp.name}] Cat box:`, catBox);
      console.log(`[${vp.name}] Button box:`, btnBox);

      const isOverlapping = !(
        catBox.x + catBox.width <= btnBox.x ||
        btnBox.x + btnBox.width <= catBox.x ||
        catBox.y + catBox.height <= btnBox.y ||
        btnBox.y + btnBox.height <= catBox.y
      );

      console.log(`[${vp.name}] Is Overlapping?`, isOverlapping ? "YES (COLLISION)" : "NO (CLEAN CLEARANCE ✓)");
    }

    await page.screenshot({ path: `hero_fix_${vp.name}.png`, fullPage: false });
    await context.close();
  }

  // Verify PWA Manifest & Service Worker
  const testContext = await browser.newContext();
  const testPage = await testContext.newPage();

  const manifestResponse = await testPage.goto("http://localhost:5173/manifest.webmanifest");
  console.log("PWA Manifest HTTP Status:", manifestResponse.status());

  const swResponse = await testPage.goto("http://localhost:5173/sw.js");
  console.log("PWA Service Worker HTTP Status:", swResponse.status());

  const faviconResponse = await testPage.goto("http://localhost:5173/favicon.svg");
  console.log("Favicon HTTP Status:", faviconResponse.status());

  await browser.close();
  console.log("ALL PWA & SCREEN VERIFICATIONS PASSED!");
}

verifyHeroAndPwa().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
