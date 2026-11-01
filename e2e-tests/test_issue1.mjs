import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  for (const width of [360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(600);

    // Click Sunflower Bouquet
    await page.locator('.product-card:has-text("Sunflower")').first().click();
    await page.waitForTimeout(400);

    const imgBox = await page.locator(".product-detail-image img").boundingBox();
    const wrapBox = await page.locator(".product-detail-image").boundingBox();
    const heartBox = await page.locator(".detail-image-wishlist").boundingBox();

    console.log(`[Width ${width}px] Image box:`, imgBox);
    console.log(`[Width ${width}px] Wrap box:`, wrapBox);
    console.log(`[Width ${width}px] Heart box:`, heartBox);

    if (imgBox.height > 340.5) {
      throw new Error(`Height ${imgBox.height} exceeds 340px!`);
    }
    if (imgBox.width > 300.5) {
      throw new Error(`Width ${imgBox.width} exceeds 300px!`);
    }
    // Check horizontal centering
    const centerOffset = Math.abs((wrapBox.x + wrapBox.width / 2) - (width / 2));
    console.log(`[Width ${width}px] Center offset: ${centerOffset}px`);

    await page.screenshot({ path: `e2e-tests/issue1_verified_${width}.png` });
  }
  await browser.close();
  console.log("Issue 1 verification passed!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
