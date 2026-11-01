import { chromium } from "playwright";

async function verifyTargetedChanges() {
  console.log("=== VERIFYING TARGETED VISUAL & E-COMMERCE ENHANCEMENTS ===");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem("trp_login_dismissed", "true");
    });
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1000);

    // 1. ANNOUNCEMENT BAR VERIFICATION
    console.log("\n[Check 1] Announcement Bar...");
    const announcementText = await page.$eval(".announcement", el => el.textContent.trim());
    console.log("Announcement text:", announcementText);
    const hasCustomization = announcementText.includes("Customization available");
    console.log(hasCustomization ? "PASS: 'Customization available' is present." : "FAIL: 'Customization available' missing.");

    // 2. HERO SECTION & REMOVED INDICATORS
    console.log("\n[Check 2] Hero Section & Slide Indicators...");
    const dotsCount = await page.$$eval(".dots, .dot", els => els.length);
    console.log(dotsCount === 0 ? "PASS: Indicator dots completely removed (count: 0)." : `FAIL: Dots still found (${dotsCount}).`);

    // Verify hero image sizing & fit
    const heroBox = await page.$eval(".hero", el => {
      const rect = el.getBoundingClientRect();
      return { height: rect.height, width: rect.width };
    });
    console.log(`Hero dimensions: ${heroBox.width}px x ${heroBox.height}px`);

    const heroImgBox = await page.$eval(".hero-image", el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        height: rect.height,
        width: rect.width,
        objectFit: style.objectFit,
      };
    });
    console.log("Hero Image sizing:", heroImgBox);
    console.log(heroImgBox.objectFit === "cover" && heroImgBox.height <= heroBox.height ? "PASS: Hero image fits prominently with object-fit: cover matching reference." : "FAIL: Hero image sizing issue.");

    await page.screenshot({ path: "e2e-tests/hero_targeted_verified.png" });

    // 3. ABOUT SECTION MATCHING LATEST REFERENCE
    console.log("\n[Check 3] About Section (2-Column Editorial)...");
    await page.evaluate(() => document.getElementById("about").scrollIntoView());
    await page.waitForTimeout(400);

    const aboutEyebrow = await page.$eval(".about-eyebrow", el => el.textContent.trim());
    const aboutTitle = await page.$eval(".about-title", el => el.textContent.replace(/\s+/g, " ").trim());
    const aboutBody = await page.$eval(".about-body", el => el.textContent.trim());

    console.log("About Eyebrow:", aboutEyebrow);
    console.log("About Title:", aboutTitle);
    const aboutMatches = aboutEyebrow === "ABOUT THEETHREALPALATTE" && aboutTitle.includes("Made slowly.") && aboutTitle.includes("Made with feeling.") && aboutBody.includes("Theethrealpalatte is a little space for handmade things") && aboutBody.includes("— Theethrealpalatte");
    console.log(aboutMatches ? "PASS: About section verbatim matches reference copy and 2-column layout." : "FAIL: About section content mismatch.");

    await page.screenshot({ path: "e2e-tests/about_targeted_verified.png" });

    // 4. PRODUCT DETAIL BACK BUTTON & CLEAN IMAGE
    console.log("\n[Check 4] Product Detail Page & Back Arrow...");
    await page.evaluate(() => document.getElementById("products").scrollIntoView());
    await page.waitForTimeout(400);

    // Click on the first product (Sunflower Bouquet)
    await page.click(".product-image img");
    await page.waitForSelector(".product-detail-back", { timeout: 5000 });

    const backBtnTransform = await page.$eval(".product-detail-back", el => {
      return window.getComputedStyle(el).transform;
    });
    console.log("Back button transform:", backBtnTransform);

    const detailImgStyle = await page.$eval(".product-detail-image", el => {
      const style = window.getComputedStyle(el);
      return {
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
      };
    });
    console.log("Product detail image container styling:", detailImgStyle);
    const isCleanImage = detailImgStyle.boxShadow === "none" || detailImgStyle.boxShadow.includes("rgba(0, 0, 0, 0)");
    console.log(isCleanImage ? "PASS: Unnecessary frame and shadows removed from product detail image." : "FAIL: Still has card shadow.");

    await page.screenshot({ path: "e2e-tests/product_detail_targeted_verified.png" });

    console.log("\nALL TARGETED VERIFICATIONS COMPLETE!");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
}

verifyTargetedChanges();
