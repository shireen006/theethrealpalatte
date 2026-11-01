import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyCatEverywhere() {
  console.log("=== STARTING FULL CAT ANIMATION VERIFICATION ACROSS PAGES & VIEWPORTS ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. MOBILE 390px (HOMEPAGE, SCROLLING, PRODUCT PAGE, CONTACT)
  console.log("\n[1] Testing Mobile (390px) Viewport...");
  const ctx390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page390 = await ctx390.newPage();
  await page390.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await page390.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page390.waitForTimeout(600);

  // A. Homepage top
  const catMobile = page390.locator(".hero-cat-mobile");
  const catDesktop = page390.locator(".hero-cat-desktop");

  const mobileCatVisibleHome = await catMobile.isVisible();
  const desktopCatHiddenHome = await catDesktop.isHidden();
  const catBoxHome = await catMobile.boundingBox();

  console.log(`- [Homepage Top] Mobile Cat Visible: ${mobileCatVisibleHome}`);
  console.log(`- [Homepage Top] Desktop Cat Hidden on Mobile: ${desktopCatHiddenHome}`);
  console.log(`- [Homepage Top] Cat Bounding Box: x=${Math.round(catBoxHome.x)}, y=${Math.round(catBoxHome.y)}, w=${Math.round(catBoxHome.width)}, h=${Math.round(catBoxHome.height)}`);
  console.log(`- [Homepage Top] Distance from viewport bottom: ${Math.round(844 - (catBoxHome.y + catBoxHome.height))}px (Expected: ~14px)`);

  if (!mobileCatVisibleHome || catBoxHome.width < 50 || catBoxHome.width > 70) {
    throw new Error("FAILED: Mobile cat is not properly visible or sized (expected 55-65px)!");
  }

  // Screenshot homepage top
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_390_home.png" });

  // B. Scroll down to Collections
  console.log("\n- Scrolling to Collections...");
  await page390.evaluate(() => window.scrollTo(0, 650));
  await page390.waitForTimeout(400);

  const catBoxScrolled = await catMobile.boundingBox();
  console.log(`- [Collections Scrolled] Cat Box: x=${Math.round(catBoxScrolled.x)}, y=${Math.round(catBoxScrolled.y)}, w=${Math.round(catBoxScrolled.width)}, h=${Math.round(catBoxScrolled.height)}`);
  const isFixedWhileScrolling = Math.abs(catBoxScrolled.x - catBoxHome.x) < 5 && Math.abs(catBoxScrolled.y - catBoxHome.y) < 5;
  console.log(`- [Collections Scrolled] Cat remains FIXED in bottom-left corner: ${isFixedWhileScrolling}`);

  if (!isFixedWhileScrolling) {
    throw new Error("FAILED: Cat did not remain fixed in viewport while scrolling!");
  }
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_390_collections.png" });

  // C. Scroll down to Contact Section
  console.log("\n- Scrolling to Contact Section...");
  await page390.evaluate(() => {
    document.getElementById("contact")?.scrollIntoView();
  });
  await page390.waitForTimeout(400);

  const catBoxContact = await catMobile.boundingBox();
  const isVisibleContact = await catMobile.isVisible();
  console.log(`- [Contact Section] Mobile Cat Visible: ${isVisibleContact}, x=${Math.round(catBoxContact.x)}, y=${Math.round(catBoxContact.y)}`);
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_390_contact.png" });

  // D. Navigate to Product Detail Page
  console.log("\n- Opening Product Detail Page...");
  await page390.evaluate(() => window.scrollTo(0, 0));
  await page390.waitForTimeout(300);
  await page390.locator(".product-card").first().click();
  await page390.waitForTimeout(600);

  const isProductPageOpen = await page390.locator(".product-detail").isVisible();
  const catVisibleProductPage = await catMobile.isVisible();
  const catBoxProduct = await catMobile.boundingBox();
  console.log(`- Product Detail Page Open: ${isProductPageOpen}`);
  console.log(`- [Product Page] Mobile Cat Visible: ${catVisibleProductPage}`);
  console.log(`- [Product Page] Cat Box: x=${Math.round(catBoxProduct.x)}, y=${Math.round(catBoxProduct.y)}, w=${Math.round(catBoxProduct.width)}`);

  if (!isProductPageOpen || !catVisibleProductPage) {
    throw new Error("FAILED: Cat is not visible on product page!");
  }
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_390_product.png" });

  // Close product detail page back to homepage
  await page390.locator(".product-detail-back").click();
  await page390.waitForTimeout(400);
  await ctx390.close();

  // 2. CHECK 360px & 430px
  for (const w of [360, 430]) {
    console.log(`\n[2] Checking Mobile Viewport (${w}px)...`);
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const pg = await ctx.newPage();
    await pg.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await pg.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await pg.waitForTimeout(400);

    const c = pg.locator(".hero-cat-mobile");
    const vis = await c.isVisible();
    const b = await c.boundingBox();
    console.log(`- [${w}px] Cat visible: ${vis}, x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.width)}`);
    await pg.screenshot({ path: `C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_${w}.png` });
    await ctx.close();
  }

  // 3. CHECK DESKTOP (1280px)
  console.log("\n[3] Checking Desktop (1280px)...");
  const dCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dPg = await dCtx.newPage();
  await dPg.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await dPg.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await dPg.waitForTimeout(400);

  const dCatMobileHidden = await dPg.locator(".hero-cat-mobile").isHidden();
  const dCatDesktopVisible = await dPg.locator(".hero-cat-desktop").isVisible();
  const dCatBox = await dPg.locator(".hero-cat-desktop").boundingBox();
  console.log(`- [Desktop] Mobile Cat Hidden: ${dCatMobileHidden}`);
  console.log(`- [Desktop] Desktop Cat in Hero Visible: ${dCatDesktopVisible}`);
  console.log(`- [Desktop] Desktop Cat Box: x=${Math.round(dCatBox.x)}, y=${Math.round(dCatBox.y)}, w=${Math.round(dCatBox.width)}, h=${Math.round(dCatBox.height)}`);

  if (!dCatMobileHidden || !dCatDesktopVisible) {
    throw new Error("FAILED: Desktop cat regression!");
  }
  await dPg.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/cat_verified_desktop_corridor.png" });
  await dCtx.close();

  await browser.close();
  console.log("\n=== ALL CAT ANIMATION VERIFICATIONS PASSED 100%! ===");
}

verifyCatEverywhere().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
