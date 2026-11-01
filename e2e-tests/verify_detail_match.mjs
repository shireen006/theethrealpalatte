import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyProductDetail() {
  console.log("=== VERIFYING PRODUCT DETAIL EXACT REFERENCE MATCH ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. DESKTOP (1280x900)
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("theethrealpalatte_user", JSON.stringify({ email: "test@example.com", name: "Tester" }));
  });
  await desktopPage.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  // Click on the first product card to open product detail
  const firstCard = desktopPage.locator(".product-card").first();
  await firstCard.click();
  await desktopPage.waitForTimeout(500);

  // Take screenshot of product detail
  const detailSection = desktopPage.locator(".product-detail");
  await detailSection.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(400);

  await detailSection.screenshot({ path: "e2e-tests/product_detail_desktop_exact.png" });
  await desktopPage.screenshot({ path: "e2e-tests/product_detail_desktop_fullpage.png" });

  const desktopStats = await desktopPage.evaluate(() => {
    const img = document.querySelector(".product-detail-image img");
    const imgWrap = document.querySelector(".product-detail-image");
    const h1 = document.querySelector(".product-detail-info h1");
    const addBtn = document.querySelector(".detail-add-cart");
    const waBtn = document.querySelector(".detail-whatsapp-btn");
    const qty = document.querySelector(".product-quantity");
    const content = document.querySelector(".product-detail-content");

    const imgRect = img.getBoundingClientRect();
    const h1Rect = h1.getBoundingClientRect();
    const addRect = addBtn.getBoundingClientRect();
    const waRect = waBtn.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const h1Style = window.getComputedStyle(h1);
    const imgStyle = window.getComputedStyle(img);

    return {
      image: {
        width: Math.round(imgRect.width),
        height: Math.round(imgRect.height),
        objectFit: imgStyle.objectFit,
      },
      heading: {
        fontSize: h1Style.fontSize,
        fontFamily: h1Style.fontFamily,
      },
      addBtn: {
        width: Math.round(addRect.width),
        height: Math.round(addRect.height),
      },
      waBtn: {
        width: Math.round(waRect.width),
        height: Math.round(waRect.height),
      },
      content: {
        width: Math.round(contentRect.width),
        height: Math.round(contentRect.height),
      },
    };
  });

  console.log("Desktop stats:", JSON.stringify(desktopStats, null, 2));

  // 2. MOBILE (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("theethrealpalatte_user", JSON.stringify({ email: "test@example.com", name: "Tester" }));
  });
  await mobilePage.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  const mobileFirstCard = mobilePage.locator(".product-card").first();
  await mobileFirstCard.click();
  await mobilePage.waitForTimeout(500);

  const mobileDetail = mobilePage.locator(".product-detail");
  await mobileDetail.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(400);

  await mobileDetail.screenshot({ path: "e2e-tests/product_detail_mobile_exact.png" });

  const mobileStats = await mobilePage.evaluate(() => {
    const img = document.querySelector(".product-detail-image img");
    const h1 = document.querySelector(".product-detail-info h1");
    const addBtn = document.querySelector(".detail-add-cart");
    const imgRect = img.getBoundingClientRect();
    const addRect = addBtn.getBoundingClientRect();

    return {
      image: {
        width: Math.round(imgRect.width),
        height: Math.round(imgRect.height),
      },
      addBtnWidth: Math.round(addRect.width),
    };
  });

  console.log("Mobile stats:", JSON.stringify(mobileStats, null, 2));

  await browser.close();
  console.log("Product detail verification finished!");
}

verifyProductDetail().catch(console.error);
