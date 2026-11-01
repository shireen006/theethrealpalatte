import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(600);
  await page.locator(".product-card").first().click();
  await page.waitForTimeout(400);

  // Scroll down to action buttons
  await page.locator(".detail-whatsapp-btn").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "e2e-tests/scroll_bottom_detail_390.png" });

  const catBox = await page.locator(".trp-cat").boundingBox();
  const whatsappBox = await page.locator(".detail-whatsapp-btn").boundingBox();
  const cartBtnBox = await page.locator(".detail-add-cart").boundingBox();

  console.log("Cat box at scroll:", catBox);
  console.log("WhatsApp box at scroll:", whatsappBox);
  console.log("Cart button box at scroll:", cartBtnBox);

  await browser.close();
  console.log("Scroll check completed!");
}

run().catch(console.error);
