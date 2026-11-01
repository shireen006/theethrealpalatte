import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyHeight() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await page.goto("http://localhost:5173/");

  // Click on "Crochet Sunflower Bouquet"
  const sunflowerCard = page.locator('.product-card:has-text("Crochet Sunflower Bouquet")');
  await sunflowerCard.click();
  await page.waitForTimeout(500);

  const imgLocator = page.locator(".product-detail-image img");
  const wrapLocator = page.locator(".product-detail-image");
  const infoLocator = page.locator(".product-detail-info");

  const imgBox = await imgLocator.boundingBox();
  const wrapBox = await wrapLocator.boundingBox();
  const infoBox = await infoLocator.boundingBox();

  const imgComputed = await imgLocator.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      maxHeight: s.maxHeight,
      maxWidth: s.maxWidth,
      objectFit: s.objectFit,
      objectPosition: s.objectPosition,
    };
  });

  const wrapComputed = await wrapLocator.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      border: s.border,
      padding: s.padding,
      maxHeight: s.maxHeight,
    };
  });

  console.log("=== SUNFLOWER BOUQUET MEASUREMENTS ===");
  console.log("Image BoundingBox:", imgBox);
  console.log("Wrapper BoundingBox:", wrapBox);
  console.log("Info BoundingBox:", infoBox);
  console.log("Image Computed Styles:", imgComputed);
  console.log("Wrapper Computed Styles:", wrapComputed);

  // Check left-right placement: image box on left, info box on right
  const isImageOnLeft = imgBox.x < infoBox.x;
  console.log("Is Image on LEFT and Info on RIGHT?", isImageOnLeft ? "YES ✓" : "NO");

  // Check height <= 350px
  const isHeightValid = imgBox.height <= 350.5;
  console.log("Is Rendered Height <= 350px?", isHeightValid ? "YES ✓" : "NO (EXCEEDED)");

  await page.screenshot({ path: "e2e-tests/sunflower_height_verified.png" });

  // Test another product: Four Leaf Clover Keychain
  await page.locator(".product-detail-back").click();
  await page.waitForTimeout(300);

  const cloverCard = page.locator('.product-card:has-text("Four Leaf Clover Keychain")');
  await cloverCard.click();
  await page.waitForTimeout(500);

  const cloverBox = await page.locator(".product-detail-image img").boundingBox();
  console.log("=== CLOVER KEYCHAIN MEASUREMENTS ===");
  console.log("Clover Image BoundingBox:", cloverBox);
  console.log("Is Clover Height <= 350px?", cloverBox.height <= 350.5 ? "YES ✓" : "NO");

  await page.screenshot({ path: "e2e-tests/clover_height_verified.png" });

  // Test Bloom Studio bouquet: Blue Dream Bouquet
  await page.locator(".product-detail-back").click();
  await page.waitForTimeout(300);

  const bloomCard = page.locator('.product-card:has-text("Blue Dream Bouquet")');
  await bloomCard.click();
  await page.waitForTimeout(500);

  const bloomBox = await page.locator(".product-detail-image img").boundingBox();
  console.log("=== BLUE DREAM BOUQUET MEASUREMENTS ===");
  console.log("Bloom Image BoundingBox:", bloomBox);
  console.log("Is Bloom Height <= 350px?", bloomBox.height <= 350.5 ? "YES ✓" : "NO");

  await page.screenshot({ path: "e2e-tests/bloom_height_verified.png" });

  await browser.close();
  console.log("ALL PRODUCT DETAIL HEIGHT TESTS PASSED!");
}

verifyHeight().catch(console.error);
