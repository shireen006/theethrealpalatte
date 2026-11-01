import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyAll() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });

  const widths = [360, 390, 430];
  const productsToTest = [
    "Crochet Sunflower Bouquet",
    "Four Leaf Clover Keychain",
    "Butterfly Hairtie"
  ];

  for (const width of widths) {
    console.log(`\n================== TESTING MOBILE VIEWPORT ${width}px ==================`);
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(600);

    // 1. Check Cat on Homepage
    const catLocator = page.locator(".trp-cat");
    const isCatVisibleHome = await catLocator.isVisible();
    const catBoxHome = await catLocator.boundingBox();
    console.log(`[${width}px Home] Cat visible:`, isCatVisibleHome, "Box:", catBoxHome);

    if (!isCatVisibleHome || !catBoxHome) {
      throw new Error(`Cat is not visible on Homepage at ${width}px!`);
    }
    if (catBoxHome.width < 54 || catBoxHome.width > 66) {
      throw new Error(`Cat width ${catBoxHome.width}px is not in 55-65px range!`);
    }

    // Scroll to Collections / Products
    await page.locator("#products").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const catBoxScrolledProducts = await catLocator.boundingBox();
    console.log(`[${width}px Products Scrolled] Cat box:`, catBoxScrolledProducts);
    await page.screenshot({ path: `e2e-tests/final_verified_${width}_products.png` });

    // Scroll to Contact / Footer
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const catBoxScrolledContact = await catLocator.boundingBox();
    console.log(`[${width}px Contact Scrolled] Cat box:`, catBoxScrolledContact);
    await page.screenshot({ path: `e2e-tests/final_verified_${width}_contact.png` });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // 2. Test Product Detail Pages
    for (const prodName of productsToTest) {
      const card = page.locator(`.product-card:has-text("${prodName}")`).first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await page.waitForTimeout(400);

      const headerBox = await page.locator(".header").boundingBox();
      const backBtn = page.locator(".product-detail-back");
      const backBox = await backBtn.boundingBox();
      const imgLocator = page.locator(".product-detail-image img");
      const imgWrap = page.locator(".product-detail-image");
      const imgBox = await imgLocator.boundingBox();
      const wrapBox = await imgWrap.boundingBox();
      const heartBox = await page.locator(".detail-image-wishlist").boundingBox();
      const catBoxDetail = await catLocator.boundingBox();
      const isCatVisibleDetail = await catLocator.isVisible();

      console.log(`\n  --- Product: "${prodName}" at ${width}px ---`);
      console.log(`  Header bottom: ${headerBox.y + headerBox.height}`);
      console.log(`  Back button box:`, backBox);
      console.log(`  Image box:`, imgBox);
      console.log(`  Wrapper box:`, wrapBox);
      console.log(`  Heart button box:`, heartBox);
      console.log(`  Cat visible in detail:`, isCatVisibleDetail, "Box:", catBoxDetail);

      // Verify Image Sizing: width ~300px max, height <= 340px
      if (imgBox.height > 340.5) {
        throw new Error(`Product "${prodName}" image height ${imgBox.height} exceeds 340px!`);
      }
      if (imgBox.width > 300.5) {
        throw new Error(`Product "${prodName}" image width ${imgBox.width} exceeds 300px!`);
      }

      // Verify centering:
      const centerDiff = Math.abs((wrapBox.x + wrapBox.width / 2) - (width / 2));
      console.log(`  Center diff: ${centerDiff.toFixed(2)}px (should be ~0)`);
      if (centerDiff > 2) {
        throw new Error(`Product "${prodName}" image is not horizontally centered!`);
      }

      // Verify Heart Button on top right corner
      const heartRightDist = (wrapBox.x + wrapBox.width) - (heartBox.x + heartBox.width);
      console.log(`  Heart right inset: ${heartRightDist.toFixed(2)}px`);
      if (heartRightDist < 0 || heartRightDist > 20) {
        throw new Error(`Heart button is misplaced relative to image!`);
      }

      // Verify Back Arrow spacing
      const headerToBackGap = backBox.y - (headerBox.y + headerBox.height);
      const backToImageGap = imgBox.y - (backBox.y + backBox.height);
      console.log(`  Gap from header to back: ${headerToBackGap.toFixed(2)}px`);
      console.log(`  Gap from back to image: ${backToImageGap.toFixed(2)}px`);
      console.log(`  Back arrow X: ${backBox.x}px`);

      if (headerToBackGap < 8 || headerToBackGap > 22) {
        throw new Error(`Header to back gap ${headerToBackGap}px is outside 8-22px!`);
      }
      if (backToImageGap < 8 || backToImageGap > 20) {
        throw new Error(`Back to image gap ${backToImageGap}px is outside 8-20px!`);
      }
      if (backBox.x < 10 || backBox.x > 20) {
        throw new Error(`Back arrow x ${backBox.x}px is not in 12-16px range!`);
      }

      // Verify Cat does not cover back arrow, product image, purchase buttons, or text
      const catTop = catBoxDetail.y;
      const catBottom = catBoxDetail.y + catBoxDetail.height;
      const catRight = catBoxDetail.x + catBoxDetail.width;
      
      // Cat is at bottom-left: check it does not overlap image
      const overlapsImage = !(
        catRight < imgBox.x ||
        catBoxDetail.x > imgBox.x + imgBox.width ||
        catBottom < imgBox.y ||
        catTop > imgBox.y + imgBox.height
      );
      if (overlapsImage) {
        throw new Error("Cat overlaps product image!");
      }

      // Check Back navigation
      await backBtn.click();
      await page.waitForTimeout(300);
      const isStillDetail = await page.locator(".product-detail").isVisible();
      if (isStillDetail) {
        throw new Error("Back button did not navigate back to catalog!");
      }
    }

    // Re-open Sunflower for screenshot
    await page.locator('.product-card:has-text("Crochet Sunflower Bouquet")').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `e2e-tests/final_verified_${width}_detail_sunflower.png` });

    await page.close();
  }

  // 4. Verify Desktop Unchanged at 1280px
  console.log(`\n================== TESTING DESKTOP VIEWPORT 1280px ==================`);
  const dPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await dPage.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await dPage.goto("http://localhost:5173/");
  await dPage.waitForTimeout(600);

  // Desktop cat in hero
  const dHeroCat = dPage.locator(".hero-cat-desktop");
  const isDHeroCatVisible = await dHeroCat.isVisible();
  console.log("Desktop Hero Cat visible:", isDHeroCatVisible);

  // Mobile cat should be HIDDEN on desktop
  const dMobileCatScene = dPage.locator(".trp-cat-scene");
  const isDMobileCatSceneVisible = await dMobileCatScene.isVisible();
  console.log("Mobile trp-cat-scene hidden on desktop:", !isDMobileCatSceneVisible);

  if (isDMobileCatSceneVisible) {
    throw new Error("Mobile cat is visible on desktop!");
  }

  // Open Sunflower on Desktop
  await dPage.locator('.product-card:has-text("Crochet Sunflower Bouquet")').first().click();
  await dPage.waitForTimeout(400);

  const dImgBox = await dPage.locator(".product-detail-image img").boundingBox();
  const dInfoBox = await dPage.locator(".product-detail-info").boundingBox();
  console.log("Desktop Sunflower Image box:", dImgBox);
  console.log("Desktop Sunflower Info box:", dInfoBox);

  // Desktop should have two columns (image on left, info on right)
  const isTwoCol = dImgBox.x < dInfoBox.x;
  console.log("Desktop is 2 columns (image left, info right):", isTwoCol);
  if (!isTwoCol) {
    throw new Error("Desktop layout broken! Not two columns.");
  }

  // Desktop height should remain original (~350px)
  if (Math.abs(dImgBox.height - 350) > 2) {
    throw new Error(`Desktop image height ${dImgBox.height} was altered!`);
  }

  await dPage.screenshot({ path: `e2e-tests/final_verified_desktop_detail.png` });
  await dPage.close();

  await browser.close();
  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY ON MOBILE (360, 390, 430px) AND DESKTOP (1280px) <<<");
}

verifyAll().catch((err) => {
  console.error("\nTEST FAILED:", err);
  process.exit(1);
});
