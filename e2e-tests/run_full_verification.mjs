import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  console.log("=== STARTING COMPLETE E2E VERIFICATION ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // ==========================================
  // 1. DESKTOP CHECKS (1280x800)
  // ==========================================
  console.log("\n--- 1. DESKTOP CHECKS (1280px) ---");
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Set mock user and dismiss auth modal to test logged in Add to Cart
  await desktopPage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("trp_user", JSON.stringify({ name: "Shireen", email: "test@example.com", role: "customer" }));
    localStorage.setItem("trp_token", "mock_jwt_token");
  });

  await desktopPage.goto("http://localhost:5173/");
  await desktopPage.waitForTimeout(1000);

  // A. Announcement Bar (Desktop)
  const desktopAnnounce = await desktopPage.locator(".announcement-desktop").innerText();
  console.log("Desktop Announcement:", desktopAnnounce.replace(/\s+/g, " "));
  if (!desktopAnnounce.includes("Free shipping on orders above ₹999")) {
    throw new Error("Desktop announcement missing free shipping text");
  }

  // B. Hero corridor cat (Desktop)
  const desktopCat = desktopPage.locator(".hero-cat-wrapper.hero-cat-desktop");
  const desktopCatVisible = await desktopCat.isVisible();
  const desktopCatBox = await desktopCat.boundingBox();
  console.log("Desktop Corridor Cat visible?", desktopCatVisible, "Box:", desktopCatBox);
  if (!desktopCatVisible) throw new Error("Desktop corridor cat not visible");

  // C. Hero arrows and no dots
  const dotsCount = await desktopPage.locator(".dots").count();
  console.log("Hero dots indicator count (should be 0):", dotsCount);
  if (dotsCount !== 0) throw new Error("Unwanted hero dots pill still present");

  const slide1Title = await desktopPage.locator(".hero-copy h1").innerText();
  console.log("Hero Slide 1 Title:", slide1Title);

  await desktopPage.locator(".hero-arrow.right").click();
  await desktopPage.waitForTimeout(600);
  const slide2Title = await desktopPage.locator(".hero-copy h1").innerText();
  console.log("Hero Slide 2 Title:", slide2Title);

  // D. About Us Section (Desktop)
  const aboutEyebrow = await desktopPage.locator(".about-eyebrow").innerText();
  const aboutTitle = await desktopPage.locator(".about-title").innerText();
  const aboutSignature = await desktopPage.locator(".about-signature").innerText();
  console.log("About Eyebrow:", aboutEyebrow);
  console.log("About Title:", aboutTitle.replace(/\n/g, " "));
  console.log("About Signature:", aboutSignature);
  if (!aboutTitle.includes("Made slowly")) throw new Error("About title does not match original reference");

  // E. Product Detail (Desktop)
  await desktopPage.locator(".product-card").first().click();
  await desktopPage.waitForTimeout(800);

  const detailVisible = await desktopPage.locator(".product-detail").isVisible();
  console.log("Product detail visible?", detailVisible);

  // F. Recommended products "You May Also Like" - Check no extra frame/border
  const relatedCard = desktopPage.locator(".related-card").first();
  const cardBorder = await relatedCard.evaluate(el => window.getComputedStyle(el).borderWidth);
  const cardBg = await relatedCard.evaluate(el => window.getComputedStyle(el).backgroundColor);
  const cardPadding = await relatedCard.evaluate(el => window.getComputedStyle(el).padding);
  console.log("Related card border:", cardBorder, "bg:", cardBg, "padding:", cardPadding);
  if (cardBorder !== "0px" && cardBorder !== "") throw new Error("Extra border still present on related card");

  // G. Add to Cart Toast (Desktop)
  await desktopPage.locator(".detail-add-cart").click();
  await desktopPage.waitForTimeout(300);

  const toast = desktopPage.locator(".toast-popup");
  const toastVisible = await toast.isVisible();
  const toastText = await toast.innerText();
  const toastBox = await toast.boundingBox();
  console.log("Toast visible?", toastVisible, "Text:", toastText, "Box:", toastBox);
  if (!toastText.includes("Added to your cart ♡")) {
    throw new Error(`Toast text '${toastText}' does not match 'Added to your cart ♡'`);
  }
  // Check top-right position
  if (toastBox.x < 800 || toastBox.y > 100) {
    throw new Error(`Toast position expected near top-right, got x=${toastBox.x}, y=${toastBox.y}`);
  }

  await desktopPage.screenshot({ path: "e2e-tests/verified_desktop_final.png" });

  // ==========================================
  // 2. MOBILE CHECKS (390x844 - iPhone style)
  // ==========================================
  console.log("\n--- 2. MOBILE CHECKS (390px) ---");
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("trp_user", JSON.stringify({ name: "Shireen", email: "test@example.com", role: "customer" }));
    localStorage.setItem("trp_token", "mock_jwt_token");
  });

  await mobilePage.goto("http://localhost:5173/");
  await mobilePage.waitForTimeout(1000);

  // A. Mobile Announcement Bar (2 independent rows)
  const mobileRotatingVisible = await mobilePage.locator(".announcement-mobile-rotating").isVisible();
  const mobileShippingVisible = await mobilePage.locator(".announcement-mobile-shipping").isVisible();
  const shippingText = await mobilePage.locator(".announcement-mobile-shipping").innerText();
  const rotatingText1 = await mobilePage.locator(".announcement-slide").innerText();
  console.log("Mobile fixed shipping visible?", mobileShippingVisible, "Text:", shippingText);
  console.log("Mobile rotating message 1:", rotatingText1);

  if (!shippingText.includes("Free shipping on orders above ₹999")) {
    throw new Error("Mobile fixed shipping row missing expected text");
  }

  // Wait for rotation
  await mobilePage.waitForTimeout(3300);
  const rotatingText2 = await mobilePage.locator(".announcement-slide").innerText();
  console.log("Mobile rotating message 2 after 3.3s:", rotatingText2);
  const shippingTextStill = await mobilePage.locator(".announcement-mobile-shipping").innerText();
  console.log("Mobile shipping still visible after rotation:", shippingTextStill);

  // B. Persistent Mobile Cat
  const mobileCat = mobilePage.locator(".hero-cat-mobile");
  const mobileCatVisible = await mobileCat.isVisible();
  const mobileCatBox = await mobileCat.boundingBox();
  console.log("Mobile Cat visible?", mobileCatVisible, "Box:", mobileCatBox);
  if (!mobileCatVisible) throw new Error("Mobile persistent cat is not visible");
  if (mobileCatBox.x > 30 || mobileCatBox.y < 600) {
    throw new Error(`Mobile cat expected near bottom-left, got x=${mobileCatBox.x}, y=${mobileCatBox.y}`);
  }

  // Check WhatsApp float does NOT overlap cat if present
  const waBtn = mobilePage.locator(".whatsapp-float");
  if (await waBtn.count() > 0) {
    const waBox = await waBtn.boundingBox();
    console.log("WhatsApp button box:", waBox);
    if (Math.abs(waBox.x - mobileCatBox.x) < 100) {
      throw new Error("WhatsApp button and cat overlapping horizontally!");
    }
  } else {
    console.log("No .whatsapp-float button in DOM (cat safely docked at bottom-left x=14)");
  }

  // C. Mobile Product Detail Page & Image Sizing
  await mobilePage.locator(".product-card").first().click();
  await mobilePage.waitForTimeout(800);

  const mobImg = mobilePage.locator(".product-detail-image img");
  const mobImgBox = await mobImg.boundingBox();
  const mobImgWrap = mobilePage.locator(".product-detail-image");
  const mobWrapBox = await mobWrapWrap();
  async function mobWrapWrap() { return await mobImgWrap.boundingBox(); }
  console.log("Mobile Product Detail Image Box:", mobImgBox);
  console.log("Mobile Product Detail Wrapper Box:", mobWrapBox);

  if (mobImgBox.width > 310) throw new Error(`Product image width ${mobImgBox.width}px exceeds ~300px limit`);
  if (mobImgBox.height > 345) throw new Error(`Product image height ${mobImgBox.height}px exceeds 340px limit`);

  // Back button spacing
  const backBtnBox = await mobilePage.locator(".product-detail-back").boundingBox();
  console.log("Back button box:", backBtnBox);

  // Mobile persistent cat remains visible on product detail
  const mobDetailCatVisible = await mobilePage.locator(".hero-cat-mobile").isVisible();
  console.log("Mobile Cat visible on product detail page?", mobDetailCatVisible);
  if (!mobDetailCatVisible) throw new Error("Mobile cat disappeared on product detail page");

  // D. Mobile Add to Cart Toast
  await mobilePage.locator(".detail-add-cart").click();
  await mobilePage.waitForTimeout(300);

  const mobToast = mobilePage.locator(".toast-popup");
  const mobToastVisible = await mobToast.isVisible();
  const mobToastText = await mobToast.innerText();
  const mobToastBox = await mobToast.boundingBox();
  console.log("Mobile Toast visible?", mobToastVisible, "Text:", mobToastText, "Box:", mobToastBox);
  if (!mobToastText.includes("Added to your cart ♡")) {
    throw new Error(`Mobile toast text '${mobToastText}' does not match expected`);
  }
  // Check centered near top
  if (mobToastBox.y > 60) {
    throw new Error(`Mobile toast expected near top, got y=${mobToastBox.y}`);
  }

  await mobilePage.screenshot({ path: "e2e-tests/verified_mobile_final.png" });

  await browser.close();
  console.log("\n==========================================");
  console.log(">>> ALL E2E VERIFICATION CHECKS PASSED! <<<");
  console.log("==========================================");
}

run().catch(err => {
  console.error("\n*** VERIFICATION FAILED ***", err);
  process.exit(1);
});
