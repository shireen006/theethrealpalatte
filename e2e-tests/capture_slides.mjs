import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const widths = [360, 390, 430, 1280];

  for (const width of widths) {
    const isMobile = width < 768;
    const height = isMobile ? 844 : 900;
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));

    // 1. Home Slide 1
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // 2. Click right arrow to Slide 2
    await page.locator(".hero-arrow.right").click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `slide2_${width}.png`, fullPage: false });

    // 3. Click back to Slide 1
    await page.locator(".hero-arrow.left").click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `slide1_${width}.png`, fullPage: false });

    await context.close();
  }

  await browser.close();
  console.log("Captured slides across all viewports!");
}

run().catch(console.error);
