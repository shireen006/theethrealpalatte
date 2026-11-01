import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  for (const width of [360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1000);

    const card = page.locator('.product-card:has-text("Crochet Sunflower Bouquet")').first();
    await card.click();
    await page.waitForTimeout(600);

    const backArrow = await page.locator(".product-detail-back").boundingBox();
    const img = await page.locator(".product-detail-image img").boundingBox();
    const imgWrap = await page.locator(".product-detail-image").boundingBox();
    const catMob = await page.locator(".hero-cat-mobile").boundingBox();
    const catIsVisible = await page.locator(".hero-cat-mobile").isVisible();
    const trpCatIsVisible = await page.locator(".trp-cat-scene, .trp-cat").isVisible().catch(() => false);

    console.log(`=== Viewport ${width}px ===`);
    console.log("Back arrow box:", backArrow);
    console.log("Image box:", img);
    console.log("Image wrap box:", imgWrap);
    console.log(".hero-cat-mobile visible?", catIsVisible, "box:", catMob);
    console.log(".trp-cat visible?", trpCatIsVisible);

    await page.screenshot({ path: `e2e-tests/current_mobile_${width}_detail.png` });
  }

  await browser.close();
}

run().catch(console.error);
