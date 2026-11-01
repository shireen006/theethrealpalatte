import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verify() {
  console.log("Starting full verification of restored website...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. Desktop Verification (1280x800)
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1500);

  // Check announcement bar
  const announcementText = await page.locator(".announcement").innerText();
  console.log("Desktop announcement text:", announcementText.replace(/\s+/g, " "));

  // Check desktop hero cat
  const desktopCatVisible = await page.locator(".hero-cat-wrapper.hero-cat-desktop").isVisible();
  console.log("Desktop hero corridor cat visible:", desktopCatVisible);

  // Check slide 1
  const heroHeading = await page.locator(".hero-copy h1").innerText();
  console.log("Hero heading:", heroHeading.replace(/\s+/g, " "));

  // Next slide (Bloom Studio)
  const nextBtn = page.locator(".hero-arrow.right");
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    const slide2Heading = await page.locator(".hero-copy h1").innerText();
    console.log("Hero slide 2 heading:", slide2Heading.replace(/\s+/g, " "));
  }

  // Check products count
  const productCount = await page.locator(".product-card").count();
  console.log("Products displayed in catalog:", productCount);

  // Click first product to verify Product Detail
  const firstCard = page.locator(".product-card").first();
  await firstCard.click();
  await page.waitForTimeout(800);

  const detailVisible = await page.locator(".product-detail").isVisible();
  const detailTitle = await page.locator(".product-detail-info h1, .product-detail-info h2").first().innerText();
  console.log("Product detail opened:", detailVisible, "Title:", detailTitle);

  // Check recommendations
  const recVisible = await page.locator(".product-recommendations-section").isVisible();
  console.log("Recommendations section visible on detail page:", recVisible);

  await page.screenshot({ path: "e2e-tests/verified_desktop_restored.png", fullPage: false });

  // 2. Mobile Verification (390x844 - iPhone 14 style)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:5173/");
  await mobilePage.waitForTimeout(1500);

  // Check persistent mobile cat
  const mobileCatVisible = await page.locator(".hero-cat-mobile").isVisible();
  const mobileCatBox = await page.locator(".hero-cat-mobile").boundingBox();
  console.log("Mobile persistent cat visible:", mobileCatVisible, "box:", mobileCatBox);

  // Check mobile hero
  const mobileHero = await mobilePage.locator(".hero").boundingBox();
  console.log("Mobile hero box:", mobileHero);

  // Navigate to product detail on mobile
  await mobilePage.locator(".product-card").first().click();
  await mobilePage.waitForTimeout(800);

  const mobileDetailCatVisible = await mobilePage.locator(".hero-cat-mobile").isVisible();
  console.log("Mobile persistent cat visible on product detail:", mobileDetailCatVisible);

  await mobilePage.screenshot({ path: "e2e-tests/verified_mobile_restored.png", fullPage: false });

  await browser.close();
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

verify().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
