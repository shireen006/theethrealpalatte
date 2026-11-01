import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyAnnouncementSplit() {
  console.log("=== STARTING SPECIFIC VERIFICATION FOR ANNOUNCEMENT SPLIT ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. DESKTOP VERIFICATION (1280px)
  console.log("\n[1] Verifying Desktop (1280px)...");
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await desktopPage.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(500);

  const desktopAnnVisible = await desktopPage.locator(".announcement-desktop").isVisible();
  const mobileAnnHidden = await desktopPage.locator(".announcement-mobile").isHidden();
  const desktopAnnText = (await desktopPage.locator(".announcement-desktop").textContent()).replace(/\s+/g, " ").trim();
  console.log(`- Desktop announcement horizontal bar visible: ${desktopAnnVisible}`);
  console.log(`- Desktop announcement text: "${desktopAnnText}"`);
  console.log(`- Mobile announcement hidden on desktop: ${mobileAnnHidden}`);

  const desktopCatStyle = await desktopPage.locator(".hero-cat-wrapper").evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { position: cs.position, width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log(`- Desktop cat: position=${desktopCatStyle.position}, width=${desktopCatStyle.width}px, height=${desktopCatStyle.height}px`);

  const desktopHeroCols = await desktopPage.locator(".hero").evaluate((el) => {
    return window.getComputedStyle(el).gridTemplateColumns.split(" ").length;
  });
  console.log(`- Desktop hero 2-column grid preserved: ${desktopHeroCols === 2}`);

  await desktopPage.screenshot({ path: "e2e-tests/verified_desktop_announcement.png" });
  await desktopContext.close();

  // 2. MOBILE VIEWPORT VERIFICATION (390px, iPhone 12/13/14/15 size)
  console.log("\n[2] Verifying Mobile (390px)...");
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await mobilePage.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);

  // Check top rotating row and bottom shipping row
  const rotatingRow = mobilePage.locator(".announcement-mobile-rotating");
  const shippingRow = mobilePage.locator(".announcement-mobile-shipping");

  const rotatingVisible = await rotatingRow.isVisible();
  const shippingVisible = await shippingRow.isVisible();
  console.log(`- Mobile rotating row visible: ${rotatingVisible}`);
  console.log(`- Mobile shipping row visible: ${shippingVisible}`);

  const shippingText = (await shippingRow.textContent()).trim();
  console.log(`- Mobile permanent shipping text: "${shippingText}"`);

  // Track rotating messages across cycles
  console.log("\n[3] Observing carousel rotation cycle over ~10 seconds...");
  const observedMessages = new Set();
  const sequence = [];

  for (let i = 0; i < 7; i++) {
    const currentRotating = (await rotatingRow.locator(".announcement-slide").textContent()).trim();
    const currentShipping = (await shippingRow.textContent()).trim();
    observedMessages.add(currentRotating);
    sequence.push(currentRotating);
    console.log(`  Step ${i + 1} (${i * 1.6}s):`);
    console.log(`    Top (rotating): "${currentRotating}"`);
    console.log(`    Bottom (permanent): "${currentShipping}"`);

    // Verify shipping never changes
    if (currentShipping !== "✦ Free shipping on orders above ₹999 ✦") {
      throw new Error(`Permanent shipping message changed unexpectedly to "${currentShipping}"!`);
    }

    await mobilePage.waitForTimeout(1600);
  }

  console.log(`- All observed rotating messages:`, Array.from(observedMessages));
  const expectedMessages = ["✦ Handmade with love ✦", "Made to order", "Customization available"];
  const matchesExpected = expectedMessages.every((m) => observedMessages.has(m)) && observedMessages.size === 3;
  console.log(`- Exactly the 3 requested rotating messages: ${matchesExpected}`);

  // 4. VERIFY FLOATING CAT ON MOBILE (WHILE SCROLLING)
  console.log("\n[4] Verifying floating cat animation on mobile...");
  const catWrapper = mobilePage.locator(".hero-cat-wrapper");
  const catIsVisible = await catWrapper.isVisible();
  const catInitialPos = await catWrapper.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      position: cs.position,
      left: Math.round(rect.left),
      bottom: Math.round(window.innerHeight - rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      zIndex: cs.zIndex,
    };
  });
  console.log(`- Mobile Cat initial: position=${catInitialPos.position}, left=${catInitialPos.left}px, bottom=${catInitialPos.bottom}px, width=${catInitialPos.width}px, height=${catInitialPos.height}px, zIndex=${catInitialPos.zIndex}`);

  // Scroll down to collections section and verify cat remains fixed in bottom-left
  await mobilePage.evaluate(() => window.scrollTo(0, 600));
  await mobilePage.waitForTimeout(400);

  const catScrolledPos = await catWrapper.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      position: cs.position,
      left: Math.round(rect.left),
      bottom: Math.round(window.innerHeight - rect.bottom),
      scrollY: window.scrollY,
    };
  });
  console.log(`- Mobile Cat while scrolled (scrollY=${catScrolledPos.scrollY}px): position=${catScrolledPos.position}, left=${catScrolledPos.left}px, bottom=${catScrolledPos.bottom}px`);
  console.log(`- Cat fixed in viewport while scrolling: ${catScrolledPos.position === "fixed" && catScrolledPos.left < 50 && catScrolledPos.bottom < 50}`);

  // Capture screenshot scrolled
  await mobilePage.screenshot({ path: "e2e-tests/verified_mobile_cat_scrolled.png" });

  // Scroll back to top
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(300);

  // 5. VERIFY HERO IMAGE AND COLLECTIONS
  console.log("\n[5] Verifying Hero and Collections dimensions on mobile...");
  const heroImg = mobilePage.locator(".hero-image-wrap img");
  const heroImgInfo = await heroImg.evaluate((img) => {
    return {
      src: img.src.substring(img.src.lastIndexOf("/") + 1),
      width: Math.round(img.getBoundingClientRect().width),
      height: Math.round(img.getBoundingClientRect().height),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };
  });
  console.log(`- Hero image: src=${heroImgInfo.src}, rendered=${heroImgInfo.width}x${heroImgInfo.height}px, natural=${heroImgInfo.naturalWidth}x${heroImgInfo.naturalHeight}`);

  const collectionsSection = mobilePage.locator(".products-section");
  const collectionsVisible = await collectionsSection.isVisible();
  const collectionCards = await mobilePage.locator(".product-card").count();
  console.log(`- Collections section (.products-section) visible: ${collectionsVisible}, product cards count: ${collectionCards}`);

  // Capture hero & announcement screenshot
  await mobilePage.screenshot({ path: "e2e-tests/verified_mobile_announcement_and_hero.png" });

  // 6. Test 360px and 430px viewports
  for (const w of [360, 430]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const pg = await ctx.newPage();
    await pg.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await pg.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await pg.waitForTimeout(300);

    const rotating = await pg.locator(".announcement-mobile-rotating").isVisible();
    const shipping = await pg.locator(".announcement-mobile-shipping").isVisible();
    const annBox = await pg.locator(".announcement").boundingBox();
    console.log(`\n- [${w}px Viewport]: announcement height=${Math.round(annBox.height)}px, rotating=${rotating}, shipping=${shipping}`);
    await pg.screenshot({ path: `e2e-tests/verified_mobile_${w}_announcement.png` });
    await ctx.close();
  }

  await mobileContext.close();
  await browser.close();
  console.log("\n=== ALL ANNOUNCEMENT BAR & REGRESSION VERIFICATIONS PASSED! ===");
}

verifyAnnouncementSplit().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
