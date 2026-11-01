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

    // 1. Home
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `e2e-tests/full_${width}_home.png`, fullPage: true });

    // 2. Detail
    await page.locator(".product-card").first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `e2e-tests/full_${width}_detail.png`, fullPage: true });

    await context.close();
  }

  await browser.close();
  console.log("Captured all full screenshots successfully!");
}

run().catch(console.error);
