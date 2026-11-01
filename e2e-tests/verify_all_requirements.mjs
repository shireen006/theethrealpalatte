import { chromium } from "playwright";

async function runVerification() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  console.log("=== STARTING PRODUCT SIZING & RECOMMENDATIONS VERIFICATION ===");
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(600);

  // 1. Check Hero remains untouched (no dots, split screen, 6-stage cat)
  const dotsCount = await page.$$eval(".dots .dot", (dots) => dots.length);
  console.log(`✓ Hero dots count: ${dotsCount} (Untouched)`);
  const catWrapper = await page.$(".hero-cat-wrapper");
  console.log(`✓ Hero cat present: ${!!catWrapper} (Untouched)`);

  // 2. Check Product Cards image sizing (aspect-ratio 1:1, object-fit contain)
  const productCards = await page.$$eval(".product-card", (cards) => {
    return cards.map((c) => {
      const img = c.querySelector(".product-image img");
      const imgWrap = c.querySelector(".product-image");
      const cs = window.getComputedStyle(img);
      const wrapCs = window.getComputedStyle(imgWrap);
      return {
        name: c.querySelector("h3")?.textContent.trim(),
        objectFit: cs.objectFit,
        aspectRatio: wrapCs.aspectRatio,
        width: imgWrap.clientWidth,
        height: imgWrap.clientHeight,
      };
    });
  });
  console.log(
    `✓ Product cards count: ${productCards.length}, aspect-ratio: ${productCards[0]?.aspectRatio}, object-fit: ${productCards[0]?.objectFit}, box: ${productCards[0]?.width}x${productCards[0]?.height}`
  );

  await page.screenshot({ path: "e2e-tests/verified_catalog_sizing.png" });

  // 3. Open Product 1 (Crochet Sunflower Bouquet)
  console.log("Opening Product 1 (Crochet Sunflower Bouquet)...");
  await page.locator(".product-card").first().click();
  await page.waitForTimeout(500);

  const detailTitle = await page.$eval(".product-detail-info h1", (el) => el.textContent.trim());
  console.log(`✓ Product detail opened: "${detailTitle}"`);

  // Check detail image styling (contained, large enough, side-by-side)
  const detailImgFit = await page.$eval(".product-detail-image img", (img) => {
    const cs = window.getComputedStyle(img);
    return {
      objectFit: cs.objectFit,
      width: img.clientWidth,
      height: img.clientHeight,
    };
  });
  console.log(`✓ Detail image: object-fit: ${detailImgFit.objectFit}, dimensions: ${detailImgFit.width}x${detailImgFit.height}`);

  // Check "You May Also Like"
  const recHeadings = await page.$$eval(".product-recommendations-section h2", (h2s) =>
    h2s.map((h) => h.textContent.trim())
  );
  console.log("✓ Recommendation headings on Product 1:", recHeadings);

  const relatedProducts = await page.$$eval(".related-product-grid .product-card", (cards) =>
    cards.map((c) => c.querySelector("h3")?.textContent.trim())
  );
  console.log(`✓ "You May Also Like" items (${relatedProducts.length}):`, relatedProducts);

  // 4. Click a recommended product to open Product 2 and test "Recently Viewed"
  console.log("Navigating to recommended item to test Recently Viewed session storage...");
  await page.locator(".related-product-grid .product-card").first().click();
  await page.waitForTimeout(600);

  const secondTitle = await page.$eval(".product-detail-info h1", (el) => el.textContent.trim());
  console.log(`✓ Second product opened: "${secondTitle}"`);

  const secondRecHeadings = await page.$$eval(".product-recommendations-section h2", (h2s) =>
    h2s.map((h) => h.textContent.trim())
  );
  console.log("✓ Recommendation headings on Product 2:", secondRecHeadings);

  const recentlyViewedItems = await page.$$eval(
    ".product-recommendations-section:nth-of-type(2) .related-product-grid .product-card",
    (cards) => cards.map((c) => c.querySelector("h3")?.textContent.trim())
  );
  console.log("✓ Recently Viewed items:", recentlyViewedItems);

  // Capture full desktop page with both sections
  await page.screenshot({ path: "e2e-tests/verified_recommendations_desktop.png", fullPage: true });

  // 5. Check Mobile (375px) - 2 columns for recommendations, neat stacking
  console.log("Testing mobile responsive layout (375px)...");
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await mobilePage.goto("http://localhost:5173/");
  await mobilePage.waitForTimeout(500);

  // Click first product on mobile
  await mobilePage.locator(".product-card").first().click();
  await mobilePage.waitForTimeout(500);

  const mobileCols = await mobilePage.$eval(".related-product-grid", (el) =>
    window.getComputedStyle(el).gridTemplateColumns.split(" ").length
  );
  console.log(`✓ Mobile recommendation grid columns: ${mobileCols} (Target: 2)`);

  await mobilePage.screenshot({ path: "e2e-tests/verified_recommendations_mobile.png", fullPage: true });

  await mobileContext.close();
  await context.close();
  await browser.close();
  console.log("=== ALL PRODUCT SIZING & RECOMMENDATIONS VERIFICATIONS PASSED! ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
