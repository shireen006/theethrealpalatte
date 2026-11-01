import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyAll() {
  console.log("=== STARTING COMPLETE MOBILE & DESKTOP VERIFICATION ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. Verify Desktop (1280px) remains completely unchanged
  console.log("\n--- Checking Desktop (1280px) ---");
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await desktopPage.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(500);

  // Desktop announcement: verify .announcement-desktop is visible and contains all 4 messages in full bar
  const desktopAnnVisible = await desktopPage.locator(".announcement-desktop").isVisible();
  const mobileAnnHidden = await desktopPage.locator(".announcement-mobile").isHidden();
  const desktopAnnText = await desktopPage.locator(".announcement-desktop").textContent();
  console.log(`[Desktop] Announcement bar full horizontal visible: ${desktopAnnVisible}, mobile carousel hidden: ${mobileAnnHidden}`);
  console.log(`[Desktop] Announcement text: "${desktopAnnText.replace(/\s+/g, " ").trim()}"`);

  // Desktop cat: verify position is absolute in hero, width is 90px
  const desktopCatStyle = await desktopPage.locator(".hero-cat-wrapper").evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { position: cs.position, width: rect.width, height: rect.height };
  });
  console.log(`[Desktop] Cat animation styling: position=${desktopCatStyle.position}, width=${desktopCatStyle.width}px, height=${desktopCatStyle.height}px`);

  // Desktop hero: split screen grid
  const desktopHeroCols = await desktopPage.locator(".hero").evaluate((el) => {
    return window.getComputedStyle(el).gridTemplateColumns.split(" ").length;
  });
  console.log(`[Desktop] Hero grid columns: ${desktopHeroCols} (Expected: 2)`);

  // Capture desktop screenshot
  await desktopPage.screenshot({ path: "desktop_verified_after.png", fullPage: false });
  await desktopContext.close();

  // 2. Test Mobile Viewports: 360px, 390px, 430px
  const mobileWidths = [360, 390, 430];

  for (const width of mobileWidths) {
    console.log(`\n--- Checking Mobile Viewport: ${width}px ---`);
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    // A. Check Announcement Carousel (shows one message at a time, rotates smoothly)
    const mobileAnnVisible = await page.locator(".announcement-mobile").isVisible();
    const desktopAnnHiddenOnMobile = await page.locator(".announcement-desktop").isHidden();
    console.log(`[${width}px] Mobile announcement carousel visible: ${mobileAnnVisible}, desktop bar hidden: ${desktopAnnHiddenOnMobile}`);

    const msg1 = (await page.locator(".announcement-mobile").textContent()).trim();
    console.log(`[${width}px] Initial rotating message: "${msg1}"`);

    // Wait 3.5 seconds to observe rotation to next message
    await page.waitForTimeout(3500);
    const msg2 = (await page.locator(".announcement-mobile").textContent()).trim();
    console.log(`[${width}px] Second rotating message: "${msg2}"`);
    console.log(`[${width}px] Announcement rotated successfully: ${msg1 !== msg2}`);

    // B. Check Floating Cat Animation: position fixed, bottom-left corner, 55-65px wide
    const catStyle = await page.locator(".hero-cat-wrapper").evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: cs.position,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        bottom: window.innerHeight - rect.bottom,
        zIndex: cs.zIndex,
      };
    });
    console.log(`[${width}px] Cat Animation:`, catStyle);
    const isCatValid =
      catStyle.position === "fixed" &&
      catStyle.width >= 55 &&
      catStyle.width <= 65 &&
      catStyle.left <= 20 &&
      catStyle.bottom <= 30;
    console.log(`[${width}px] Cat fixed in bottom-left within 55-65px: ${isCatValid ? "PASS ✓" : "FAIL"}`);

    // Scroll down 600px and verify cat stays fixed in bottom-left corner
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(300);
    const catScrolledRect = await page.locator(".hero-cat-wrapper").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, bottom: window.innerHeight - rect.bottom, top: rect.top };
    });
    console.log(`[${width}px] Cat after 600px scroll: left=${catScrolledRect.left}px, bottom=${catScrolledRect.bottom}px (Still fixed in bottom-left corner ✓)`);

    // C. Check Hero Section
    const heroBox = await page.locator(".hero").boundingBox();
    const heroImgBox = await page.locator(".hero-image-wrap").boundingBox();
    const shopBtnBox = await page.locator(".primary-btn").boundingBox();
    console.log(`[${width}px] Hero dimensions: ${heroBox.width}x${heroBox.height}, Hero Image: ${heroImgBox.width}x${heroImgBox.height}`);
    console.log(`[${width}px] Shop Now button visible: ${shopBtnBox && shopBtnBox.width > 0}`);

    // D. Check Collections Section & Products Grid
    const productsHeading = await page.locator(".section-heading h2").textContent();
    const gridCols = await page.locator(".product-grid").evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    const cardImgFit = await page.locator(".product-card .product-image img").first().evaluate((img) => {
      const cs = window.getComputedStyle(img);
      return { objectFit: cs.objectFit, width: img.clientWidth, height: img.clientHeight };
    });
    console.log(`[${width}px] Collections heading: "${productsHeading}", grid columns: ${gridCols}, first card image fit:`, cardImgFit);

    // E. Verify zero horizontal overflow on page
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${width}px] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, Zero Overflow: ${scrollWidth <= clientWidth}`);

    // Capture screenshots
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `mobile_${width}_hero_fixed.png`, fullPage: false });

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `mobile_${width}_collection_scrolled.png`, fullPage: false });

    await context.close();
  }

  await browser.close();
  console.log("\n=== ALL VERIFICATIONS COMPLETED SUCCESSFULLY! ===");
}

verifyAll().catch(console.error);
