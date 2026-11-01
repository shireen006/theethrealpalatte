import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyFixes() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const viewports = [
    { name: "desktop_1280", width: 1280, height: 800 },
    { name: "mobile_375", width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));

    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

    // 1. Check Hero Slide 1 (Crochet)
    const heroBox = await page.locator(".hero").boundingBox();
    console.log(`[${vp.name}] Hero dimensions:`, heroBox);

    const slide1ImgSrc = await page.locator(".hero-image").getAttribute("src");
    console.log(`[${vp.name}] Slide 1 (Crochet) Image src:`, slide1ImgSrc);

    await page.screenshot({ path: `e2e-tests/fixed_${vp.name}_slide1_crochet.png` });

    // 2. Check Hero Slide 2 (Bloom Studio)
    await page.locator(".hero-arrow.right").click();
    await page.waitForTimeout(400);

    const slide2Title = await page.locator(".hero h1").textContent();
    const slide2ImgSrc = await page.locator(".hero-image").getAttribute("src");
    console.log(`[${vp.name}] Slide 2 Title: "${slide2Title}", Image src:`, slide2ImgSrc);

    const heroBox2 = await page.locator(".hero").boundingBox();
    console.log(`[${vp.name}] Slide 2 Hero dimensions:`, heroBox2);

    await page.screenshot({ path: `e2e-tests/fixed_${vp.name}_slide2_bloom.png` });

    // 3. Check Product Grid Cards
    await page.locator("#products").scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `e2e-tests/fixed_${vp.name}_product_grid.png` });

    // 4. Click a product to open Product Detail View (e.g., Sunflower Bouquet)
    await page.locator(".product-card").first().click();
    await page.waitForTimeout(400);

    // Verify detail container styling
    const detailImageWrapper = page.locator(".product-detail-image");
    const detailImg = page.locator(".product-detail-image img");

    const wrapperBg = await detailImageWrapper.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const wrapperPadding = await detailImageWrapper.evaluate((el) => window.getComputedStyle(el).padding);
    const wrapperBorder = await detailImageWrapper.evaluate((el) => window.getComputedStyle(el).border);
    const wrapperMinHeight = await detailImageWrapper.evaluate((el) => window.getComputedStyle(el).minHeight);

    console.log(`[${vp.name}] Product detail wrapper styling:`, {
      backgroundColor: wrapperBg,
      padding: wrapperPadding,
      border: wrapperBorder,
      minHeight: wrapperMinHeight,
    });

    const imgBox = await detailImg.boundingBox();
    console.log(`[${vp.name}] Product detail image bounding box:`, imgBox);

    await page.screenshot({ path: `e2e-tests/fixed_${vp.name}_detail_sunflower.png` });

    // Test back button
    await page.locator(".product-detail-back").click();
    await page.waitForTimeout(300);

    // Test clicking another product (Keychains - square image)
    await page.locator(".product-card").nth(1).click();
    await page.waitForTimeout(400);

    const keychainImgBox = await page.locator(".product-detail-image img").boundingBox();
    console.log(`[${vp.name}] Keychain image bounding box:`, keychainImgBox);

    await page.screenshot({ path: `e2e-tests/fixed_${vp.name}_detail_keychains.png` });

    await context.close();
  }

  await browser.close();
  console.log("All fix verifications completed successfully!");
}

verifyFixes().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
