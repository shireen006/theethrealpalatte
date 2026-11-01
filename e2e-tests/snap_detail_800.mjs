import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function snapDetail800() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 800, height: 844 } });
  await page.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
  });
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1000);
  const card = page.locator(".product-card").first();
  await card.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "C:/Users/SYEDA FATIMA/.gemini/antigravity-ide/brain/d7adfc1c-cee8-46fa-8c6a-cc4028bb0414/scratch/detail_800.png" });

  await browser.close();
}

snapDetail800().catch(console.error);
