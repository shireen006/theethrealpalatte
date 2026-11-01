import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  for (const width of [360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(600);

    const headerBox = await page.locator(".header").boundingBox();

    // Click Sunflower Bouquet
    await page.locator('.product-card:has-text("Sunflower")').first().click();
    await page.waitForTimeout(400);

    const backBtn = page.locator(".product-detail-back");
    const backBox = await backBtn.boundingBox();
    const imgBox = await page.locator(".product-detail-image img").boundingBox();

    console.log(`[Width ${width}px] Header bottom: ${headerBox.y + headerBox.height}`);
    console.log(`[Width ${width}px] Back arrow box:`, backBox);
    console.log(`[Width ${width}px] Image box:`, imgBox);

    const gapFromHeader = backBox.y - (headerBox.y + headerBox.height);
    const gapToImage = imgBox.y - (backBox.y + backBox.height);

    console.log(`[Width ${width}px] Gap from header to back arrow: ${gapFromHeader}px`);
    console.log(`[Width ${width}px] Gap from back arrow to image: ${gapToImage}px`);
    console.log(`[Width ${width}px] Back arrow x: ${backBox.x}px`);

    // Verify back navigation
    await backBtn.click();
    await page.waitForTimeout(300);
    const isDetailVisible = await page.locator(".product-detail").isVisible();
    console.log(`[Width ${width}px] Returned to shop? ${!isDetailVisible}`);

    if (isDetailVisible) {
      throw new Error("Back navigation did not close product detail!");
    }

    // Now re-open detail to take screenshot
    await page.locator('.product-card:has-text("Sunflower")').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `e2e-tests/issue2_verified_${width}.png` });
  }
  await browser.close();
  console.log("Issue 2 verification passed!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
