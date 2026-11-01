import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testMobile() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const widths = [360, 390, 430];

  for (const width of widths) {
    console.log(`\n=================== TESTING WIDTH: ${width}px ===================`);
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));

    // 1. Home page
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Check horizontal scroll on homepage
    const homeScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const homeClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] Homepage scrollWidth: ${homeScrollWidth}, clientWidth: ${homeClientWidth}. Overflow: ${homeScrollWidth > homeClientWidth}`);

    // Find any overflowing elements
    const overflowingElements = await page.evaluate((w) => {
      const results = [];
      document.querySelectorAll("*").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > w + 2 || rect.left < -2) {
          results.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          });
        }
      });
      return results.slice(0, 10);
    }, width);

    if (overflowingElements.length > 0) {
      console.log(`[${width}px] Overflowing elements on homepage:`, overflowingElements);
    } else {
      console.log(`[${width}px] Clean zero overflow on homepage! ✓`);
    }

    await page.screenshot({ path: `e2e-tests/mobile_${width}_home.png`, fullPage: false });

    // Test hamburger menu open
    const hamburger = page.locator(".mobile-icon");
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
      const isNavOpen = await page.locator(".nav.nav-open").isVisible();
      console.log(`[${width}px] Hamburger open:`, isNavOpen ? "PASS ✓" : "FAIL");
      await page.screenshot({ path: `e2e-tests/mobile_${width}_menu.png` });
      await hamburger.click(); // Close
      await page.waitForTimeout(200);
    }

    // 2. Product Detail view
    await page.locator(".product-card").first().click();
    await page.waitForTimeout(400);

    const detailScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const detailClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] Product detail scrollWidth: ${detailScrollWidth}, clientWidth: ${detailClientWidth}. Overflow: ${detailScrollWidth > detailClientWidth}`);

    const detailImg = await page.locator(".product-detail-image img").boundingBox();
    console.log(`[${width}px] Detail image box:`, detailImg);

    await page.screenshot({ path: `e2e-tests/mobile_${width}_detail.png`, fullPage: false });

    // Close detail
    await page.locator(".product-detail-back").click();
    await page.waitForTimeout(300);

    // 3. Cart Drawer
    await page.locator(".cart-btn").click();
    await page.waitForTimeout(300);
    const cartBox = await page.locator(".cart-panel").boundingBox();
    console.log(`[${width}px] Cart panel box:`, cartBox);
    await page.screenshot({ path: `e2e-tests/mobile_${width}_cart.png` });
    await page.locator(".close-panel").click();
    await page.waitForTimeout(200);

    // 4. Wishlist Drawer
    await page.locator(".wishlist-btn").click();
    await page.waitForTimeout(300);
    const wishlistPanel = page.locator(".cart-panel");
    const isWishlistVisible = await wishlistPanel.isVisible();
    console.log(`[${width}px] Wishlist drawer visible:`, isWishlistVisible);
    await page.screenshot({ path: `e2e-tests/mobile_${width}_wishlist.png` });
    await page.locator(".close-panel").click();
    await page.waitForTimeout(200);

    // 5. Admin Dashboard (#admin)
    await page.goto("http://localhost:5173/#admin");
    await page.waitForTimeout(500);
    const adminScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const adminClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] Admin dashboard scrollWidth: ${adminScrollWidth}, clientWidth: ${adminClientWidth}. Overflow: ${adminScrollWidth > adminClientWidth}`);
    await page.screenshot({ path: `e2e-tests/mobile_${width}_admin.png` });

    await context.close();
  }

  await browser.close();
  console.log("\nFinished mobile responsiveness test run!");
}

testMobile().catch(console.error);
