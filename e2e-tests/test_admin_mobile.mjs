import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  for (const width of [360, 390, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await context.newPage();
    await page.goto("http://localhost:5173/#admin");
    await page.waitForTimeout(600);

    const loginCard = await page.$(".admin-login-card");
    if (loginCard) {
      await page.fill(".admin-login-form input[type='email']", "admin@theethrealpalatte.com");
      await page.fill(".admin-login-form input[type='password']", "Admin@TRP2026!");
      await page.click(".admin-login-btn");
      await page.waitForTimeout(1500);
    }

    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] Authenticated Admin scrollWidth: ${scrollW}, clientWidth: ${clientW}, Overflow: ${scrollW > clientW}`);
    await page.screenshot({ path: `admin_auth_${width}.png`, fullPage: false });
    await context.close();
  }

  await browser.close();
  console.log("Admin mobile test complete!");
}

run().catch(console.error);
