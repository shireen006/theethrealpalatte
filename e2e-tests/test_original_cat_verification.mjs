import { chromium } from "playwright";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyCatDesktopAndMobile() {
  console.log("Launching browser with Chrome executable...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  // ==========================================
  // 1. DESKTOP VIEWPORT (1280x800)
  // ==========================================
  console.log("\n--- TESTING DESKTOP VIEWPORT (1280px) ---");
  const pageDesktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await pageDesktop.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await pageDesktop.goto("http://localhost:5173/");

  // Confirm obsolete hero cat elements do not exist
  const heroCatCountDesktop = await pageDesktop.locator(".hero-cat-wrapper").count();
  console.log(`Hero cat wrapper count (should be 0): ${heroCatCountDesktop}`);
  if (heroCatCountDesktop > 0) {
    throw new Error("Obsolete .hero-cat-wrapper found on desktop!");
  }

  // Check .trp-cat visibility and position on desktop
  const catLocatorDesktop = pageDesktop.locator(".trp-cat");
  await catLocatorDesktop.waitFor({ state: "visible", timeout: 5000 });
  const isCatVisibleDesktop = await catLocatorDesktop.isVisible();
  const catBoxDesktop = await catLocatorDesktop.boundingBox();
  console.log(`Desktop Cat visible: ${isCatVisibleDesktop}, box: x=${catBoxDesktop.x}, y=${catBoxDesktop.y}, width=${catBoxDesktop.width}, height=${catBoxDesktop.height}`);

  if (!isCatVisibleDesktop || catBoxDesktop.x > 30 || catBoxDesktop.y < 650) {
    throw new Error(`Desktop cat position unexpected: ${JSON.stringify(catBoxDesktop)}`);
  }

  // Verify all SVG components in DOM on desktop
  const partsDesktop = {
    catHead: await pageDesktop.locator(".trp-cat-head").count(),
    pawLeft: await pageDesktop.locator(".trp-cat-paw-left").count(),
    pawRight: await pageDesktop.locator(".trp-cat-paw-right").count(),
    miniYarn: await pageDesktop.locator(".trp-mini-yarn").count(),
    hook: await pageDesktop.locator(".trp-hook").count(),
    crochetPiece: await pageDesktop.locator(".trp-crochet-piece").count(),
    yarnFall: await pageDesktop.locator(".trp-yarn-fall").count(),
    yarnBall: await pageDesktop.locator(".trp-yarn-ball").count(),
    yarnString: await pageDesktop.locator(".trp-yarn-string").count()
  };
  console.log("Desktop SVG components:", partsDesktop);
  for (const [key, val] of Object.entries(partsDesktop)) {
    if (val < 1) throw new Error(`Missing expected element on desktop: ${key}`);
  }

  // Wait for animation to complete
  await pageDesktop.waitForTimeout(5500);
  await pageDesktop.screenshot({ path: "e2e-tests/cat_desktop_verified.png" });
  await catLocatorDesktop.screenshot({ path: "e2e-tests/cat_desktop_close_up.png" });
  console.log("Captured desktop screenshots.");

  // ==========================================
  // 2. MOBILE VIEWPORT (390x844)
  // ==========================================
  console.log("\n--- TESTING MOBILE VIEWPORT (390px) ---");
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await pageMobile.goto("http://localhost:5173/");

  const catLocatorMobile = pageMobile.locator(".trp-cat");
  await catLocatorMobile.waitFor({ state: "visible", timeout: 5000 });
  const isCatVisibleMobile = await catLocatorMobile.isVisible();
  const catBoxMobile = await catLocatorMobile.boundingBox();
  console.log(`Mobile Cat visible: ${isCatVisibleMobile}, box: x=${catBoxMobile.x}, y=${catBoxMobile.y}, width=${catBoxMobile.width}, height=${catBoxMobile.height}`);

  if (!isCatVisibleMobile || catBoxMobile.x > 30 || catBoxMobile.y < 700) {
    throw new Error(`Mobile cat position unexpected: ${JSON.stringify(catBoxMobile)}`);
  }

  // Wait for animation to complete
  await pageMobile.waitForTimeout(5500);
  await pageMobile.screenshot({ path: "e2e-tests/cat_mobile_verified.png" });
  await catLocatorMobile.screenshot({ path: "e2e-tests/cat_mobile_close_up.png" });
  console.log("Captured mobile screenshots.");

  // Product detail page check on mobile
  const firstProduct = pageMobile.locator(".product-card").first();
  await firstProduct.click();
  await pageMobile.waitForTimeout(800);
  const isCatOnProduct = await catLocatorMobile.isVisible();
  console.log(`Product page mobile cat visible: ${isCatOnProduct}`);
  await pageMobile.screenshot({ path: "e2e-tests/cat_mobile_product_detail_verified.png" });

  await browser.close();
  console.log("\n>>> ALL VERIFICATIONS PASSED SUCCESSFULLY ON BOTH DESKTOP AND MOBILE! <<<");
}

verifyCatDesktopAndMobile().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
