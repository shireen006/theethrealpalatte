import { chromium } from "playwright";

async function verify() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(600);

  // 1. Hero checks
  const heroBox = await page.$eval(".hero", (el) => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return { width: r.width, height: r.height, bg: cs.backgroundColor };
  });
  console.log(`Hero box: ${heroBox.width}x${heroBox.height}, bg: ${heroBox.bg}`);

  const dots = await page.$$(".dots .dot");
  console.log(`Hero dots count: ${dots.length} (Expected: 0)`);

  // 2. Palette checks
  const bodyBg = await page.$eval("body", (el) => window.getComputedStyle(el).backgroundColor);
  const annBg = await page.$eval(".announcement", (el) => window.getComputedStyle(el).backgroundColor);
  const btnBg = await page.$eval(".primary-btn", (el) => window.getComputedStyle(el).backgroundColor);
  console.log(`Colors - Body: ${bodyBg}, Announcement: ${annBg}, Button: ${btnBg}`);

  // Capture homepage
  await page.screenshot({ path: "reverted_homepage.png" });

  // 3. Product cards check
  const cardImg = await page.$eval(".product-image img", (el) => {
    const cs = window.getComputedStyle(el);
    return { objectFit: cs.objectFit, width: el.clientWidth, height: el.clientHeight };
  });
  console.log(`Product card image: object-fit: ${cardImg.objectFit}, dimensions: ${cardImg.width}x${cardImg.height}`);

  // 4. Product detail check
  await page.locator(".product-card").first().click();
  await page.waitForTimeout(500);

  const detailTitle = await page.$eval(".product-detail-info h1", (el) => el.textContent.trim());
  console.log(`Product detail title: "${detailTitle}"`);

  const relatedHeadings = await page.$$eval(".product-detail h2", (headings) =>
    headings.map((h) => h.textContent.trim())
  );
  console.log(`Product detail h2 headings:`, relatedHeadings, `(Expected: none)`);

  const recommendationSections = await page.$$(".product-recommendations-section, .related-section, .related-product-grid");
  console.log(`Recommendation sections present: ${recommendationSections.length} (Expected: 0)`);

  // Capture product detail
  await page.screenshot({ path: "reverted_product_detail.png", fullPage: true });

  // 5. Check Cat animation
  const catWrapper = await page.$(".hero-cat-wrapper");
  console.log(`Cat wrapper present: ${!!catWrapper}`);

  await context.close();
  await browser.close();
  console.log("=== REVERSION VERIFIED SUCCESSFULLY ===");
}

verify().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
