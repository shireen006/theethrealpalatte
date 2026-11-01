import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testAllModals() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const widths = [360, 390, 430, 1280];

  for (const width of widths) {
    console.log(`\nTesting modals and interactive elements at ${width}px...`);
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));

    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // 1. Search toggle
    await page.locator(".header-actions button:has(svg.lucide-search)").first().click();
    await page.waitForTimeout(200);
    const searchVisible = await page.locator(".search-box-wrap").isVisible();
    const searchScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    console.log(`[${width}px] Search box visible: ${searchVisible}, no overflow: ${searchScroll}`);
    await page.screenshot({ path: `modal_${width}_search.png` });

    // Close search by clicking search icon again
    await page.locator(".header-actions button:has(svg.lucide-search)").first().click();
    await page.waitForTimeout(200);

    // 2. Add an item to cart and open cart drawer
    await page.locator(".product-card").first().locator(".add-cart").click();
    await page.waitForTimeout(400);

    // Open Cart drawer
    await page.locator(".cart-btn").click();
    await page.waitForTimeout(300);
    const cartHasItems = await page.locator(".cart-item").count();
    const cartScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    console.log(`[${width}px] Cart items: ${cartHasItems}, no overflow: ${cartScroll}`);
    await page.screenshot({ path: `modal_${width}_cart_filled.png` });

    // Close cart
    await page.locator(".close-panel").click();
    await page.waitForTimeout(200);

    // 3. Add item to wishlist and open wishlist drawer
    await page.locator(".product-card").first().locator(".wishlist").click();
    await page.waitForTimeout(300);
    await page.locator(".wishlist-btn").click();
    await page.waitForTimeout(300);
    const wishlistHasItems = await page.locator(".cart-item").count();
    const wishlistScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    console.log(`[${width}px] Wishlist items: ${wishlistHasItems}, no overflow: ${wishlistScroll}`);
    await page.screenshot({ path: `modal_${width}_wishlist_filled.png` });

    // Close wishlist
    await page.locator(".close-panel").click();
    await page.waitForTimeout(200);

    // 4. Test Auth Modal (Customer Login / Signup)
    if (width > 850) {
      // Desktop account button
      await page.locator(".account-btn").click();
      await page.waitForTimeout(300);
      await page.locator(".account-menu button:has-text('Sign In / Create Account')").click();
    } else {
      // Mobile hamburger -> Account button or triggered by login state
      await page.evaluate(() => {
        // Trigger auth modal via custom event or state if button hidden
        window.dispatchEvent(new CustomEvent("open-auth-modal"));
      });
    }
    await page.waitForTimeout(300);
    const authModalVisible = await page.locator(".auth-modal-panel").isVisible();
    if (authModalVisible) {
      const authScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      console.log(`[${width}px] Auth modal visible: ${authModalVisible}, no overflow: ${authScroll}`);
      await page.screenshot({ path: `modal_${width}_auth.png` });
      await page.locator(".auth-close-btn").click();
      await page.waitForTimeout(200);
    }

    await context.close();
  }

  await browser.close();
  console.log("All modal tests finished!");
}

testAllModals().catch(console.error);
