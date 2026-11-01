import { chromium } from "playwright";

async function verifyAll() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const widths = [360, 390, 430];

  for (const width of widths) {
    console.log(`\n=================== VERIFYING ${width}px ===================`);
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await context.newPage();

    // Set mock user so addToCart executes seamlessly without blocking modal
    await page.addInitScript(() => {
      localStorage.setItem(
        "trp_user",
        JSON.stringify({ name: "Fatima", email: "fatima@example.com", phone: "+91 8088645598" })
      );
    });

    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(600);

    // 1. Homepage & Overflow
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] Home scrollWidth: ${scrollW}, clientWidth: ${clientW}, Overflow: ${scrollW > clientW}`);

    // 2. Open first product card
    const firstCard = page.locator(".product-card").first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.click();
    await page.waitForTimeout(500);

    // Detail page overflow check
    const detailW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[${width}px] Detail scrollWidth: ${detailW}, clientWidth: ${clientW}, Overflow: ${detailW > clientW}`);

    // Add to cart
    await page.locator(".detail-add-cart").click();
    await page.waitForTimeout(400);

    // Open Cart drawer
    await page.locator(".cart-btn").click();
    await page.waitForTimeout(500);
    const cartW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[${width}px] Cart open scrollWidth: ${cartW}, clientWidth: ${clientW}, Overflow: ${cartW > clientW}`);
    await page.screenshot({ path: `mobile_${width}_cart_populated.png` });

    // Close cart
    await page.locator(".close-panel").click();
    await page.waitForTimeout(300);

    // Add to wishlist
    await page.locator(".detail-image-wishlist").click();
    await page.waitForTimeout(300);

    // Open Wishlist
    await page.locator(".wishlist-btn").click();
    await page.waitForTimeout(500);
    const wishW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[${width}px] Wishlist open scrollWidth: ${wishW}, clientWidth: ${clientW}, Overflow: ${wishW > clientW}`);
    await page.screenshot({ path: `mobile_${width}_wishlist_view.png` });
    await page.locator(".close-panel").click();
    await page.waitForTimeout(300);

    // Go back to store
    await page.locator(".product-detail-back").click();
    await page.waitForTimeout(400);

    // Check About section
    const aboutSec = page.locator("#about");
    await aboutSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const aboutW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[${width}px] About scrollWidth: ${aboutW}, clientWidth: ${clientW}, Overflow: ${aboutW > clientW}`);
    await page.screenshot({ path: `mobile_${width}_about.png` });

    // Check Contact section
    const contactSec = page.locator("#contact");
    await contactSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const contactW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[${width}px] Contact scrollWidth: ${contactW}, clientWidth: ${clientW}, Overflow: ${contactW > clientW}`);
    await page.screenshot({ path: `mobile_${width}_contact.png` });

    await context.close();
  }

  // Also verify Desktop (1280px) remains completely unchanged!
  console.log(`\n=================== VERIFYING DESKTOP 1280px ===================`);
  const dContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const dPage = await dContext.newPage();
  await dPage.goto("http://localhost:5173/");
  await dPage.waitForTimeout(600);

  // Check Slide 1 Hero Crochet image
  const slide1Img = await dPage.locator(".hero-slide.active .hero-image-wrap img").getAttribute("src");
  console.log("[1280px] Slide 1 Hero Image src:", slide1Img);

  // Click next slide
  await dPage.locator(".next-btn").click();
  await dPage.waitForTimeout(500);
  const slide2Img = await dPage.locator(".hero-slide.active .hero-image-wrap img").getAttribute("src");
  console.log("[1280px] Slide 2 Hero Image src:", slide2Img);

  // Open first product detail
  const firstProd = dPage.locator(".product-card").first();
  await firstProd.scrollIntoViewIfNeeded();
  await firstProd.click();
  await dPage.waitForTimeout(500);

  const detailImgBox = await dPage.locator(".product-detail-image img").boundingBox();
  console.log("[1280px] Detail image box:", detailImgBox);
  await dPage.screenshot({ path: `desktop_1280_detail_check.png` });

  await dContext.close();
  await browser.close();
  console.log("\nAll verification complete!");
}

verifyAll().catch(console.error);
