import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testCat() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
  });

  await page.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("theethrealpalatte_user", JSON.stringify({ email: "test@example.com", name: "Tester" }));
  });

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Check homepage mobile
  const cat = page.locator(".hero-cat-mobile");
  console.log("Cat count on page:", await cat.count());
  const isVisible = await cat.first().isVisible();
  console.log("Cat isVisible:", isVisible);

  const catDetails = await cat.first().evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      position: cs.position,
      zIndex: cs.zIndex,
      left: cs.left,
      bottom: cs.bottom,
      width: cs.width,
      height: cs.height,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      innerHTMLSnippet: el.innerHTML.slice(0, 100),
    };
  });

  console.log("Cat details on homepage mobile:", JSON.stringify(catDetails, null, 2));
  await page.screenshot({ path: "e2e-tests/test_mobile_cat_home.png" });

  // Now click on a product to go to product detail
  await page.locator(".product-card").first().click();
  await page.waitForTimeout(500);

  const isVisibleDetail = await cat.first().isVisible();
  console.log("Cat isVisible on product detail:", isVisibleDetail);
  await page.screenshot({ path: "e2e-tests/test_mobile_cat_detail.png" });

  await browser.close();
}

testCat().catch(console.error);
