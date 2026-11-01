import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function inspectCat() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
  });

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1000);

  const mobCat = page.locator(".hero-cat-mobile");
  console.log("Count:", await mobCat.count());
  console.log("Is visible:", await mobCat.isVisible());
  console.log("HTML:", await mobCat.innerHTML());

  try {
    await mobCat.screenshot({ path: "C:/Users/SYEDA FATIMA/.gemini/antigravity-ide/brain/d7adfc1c-cee8-46fa-8c6a-cc4028bb0414/scratch/mob_cat_element.png" });
    console.log("Element screenshot saved!");
  } catch (e) {
    console.error("Screenshot error:", e.message);
  }

  await browser.close();
}

inspectCat().catch(console.error);
