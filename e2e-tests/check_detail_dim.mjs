import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function check() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  for (const w of [1440, 1280, 1024, 768, 375]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/");

    const card = page.locator('.product-card:has-text("Four Leaf Clover Keychain")');
    await card.click();
    await page.waitForTimeout(500);

    const detail = await page.locator(".product-detail").boundingBox();
    const content = await page.locator(".product-detail-content").boundingBox();
    const imgWrap = await page.locator(".product-detail-image").boundingBox();
    const img = await page.locator(".product-detail-image img").boundingBox();
    const info = await page.locator(".product-detail-info").boundingBox();

    console.log(`[width ${w}]`);
    console.log("  product-detail:", detail);
    console.log("  product-detail-content:", content);
    console.log("  product-detail-image wrap:", imgWrap);
    console.log("  product-detail-image img:", img);
    console.log("  product-detail-info:", info);

    await page.screenshot({ path: `e2e-tests/e2e-tests/clover_${w}.png` });
    await page.close();
  }

  await browser.close();
}

check().catch(console.error);
