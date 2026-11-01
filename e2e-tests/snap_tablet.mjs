import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function snapTablet() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  for (const width of [768, 769, 800, 850]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.addInitScript(() => {
      sessionStorage.setItem("trp_login_dismissed", "true");
    });
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `C:/Users/SYEDA FATIMA/.gemini/antigravity-ide/brain/d7adfc1c-cee8-46fa-8c6a-cc4028bb0414/scratch/view_${width}.png` });
  }

  await browser.close();
}

snapTablet().catch(console.error);
