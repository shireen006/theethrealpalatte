import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verify() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const widths = [360, 375, 390, 430, 600, 768, 769, 800, 820, 850, 900, 1024];

  console.log("=== CHECK 1: FRESH VISIT (WITHOUT DISMISSED MODAL) ===");
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1000); // Wait for potential auth modal (800ms timer)

    const res = await page.evaluate(() => {
      const auth = document.querySelector(".auth-overlay, .overlay");
      const authVisible = auth && window.getComputedStyle(auth).display !== "none" && window.getComputedStyle(auth).visibility !== "hidden";
      
      const mobCat = document.querySelector(".hero-cat-mobile");
      const dskCat = document.querySelector(".hero-cat-desktop");

      const mobStyle = mobCat ? window.getComputedStyle(mobCat) : null;
      const dskStyle = dskCat ? window.getComputedStyle(dskCat) : null;

      const mobRect = mobCat ? mobCat.getBoundingClientRect() : null;
      const dskRect = dskCat ? dskCat.getBoundingClientRect() : null;

      return {
        authVisible,
        mobCat: mobCat ? {
          display: mobStyle.display,
          position: mobStyle.position,
          left: mobStyle.left,
          bottom: mobStyle.bottom,
          zIndex: mobStyle.zIndex,
          rect: { x: mobRect.x, y: mobRect.y, w: mobRect.width, h: mobRect.height },
        } : null,
        dskCat: dskCat ? {
          display: dskStyle.display,
          position: dskStyle.position,
          zIndex: dskStyle.zIndex,
          rect: { x: dskRect.x, y: dskRect.y, w: dskRect.width, h: dskRect.height },
        } : null,
      };
    });

    console.log(`Width ${width}px | Auth visible: ${res.authVisible} | MobCat display: ${res.mobCat?.display}, pos: ${res.mobCat?.position}, left: ${res.mobCat?.left}, bottom: ${res.mobCat?.bottom}, rect: [${res.mobCat?.rect.w}x${res.mobCat?.rect.h} at (${res.mobCat?.rect.x}, ${res.mobCat?.rect.y})] | DskCat display: ${res.dskCat?.display}`);
    await context.close();
  }

  console.log("\n=== CHECK 2: USER SESSION (AUTH MODAL DISMISSED / LOGGED IN) ===");
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      sessionStorage.setItem("trp_login_dismissed", "true");
    });
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1000);

    const res = await page.evaluate(() => {
      const auth = document.querySelector(".auth-overlay, .overlay");
      const authVisible = auth && window.getComputedStyle(auth).display !== "none" && window.getComputedStyle(auth).visibility !== "hidden";
      
      const mobCat = document.querySelector(".hero-cat-mobile");
      const dskCat = document.querySelector(".hero-cat-desktop");

      const mobStyle = mobCat ? window.getComputedStyle(mobCat) : null;
      const dskStyle = dskCat ? window.getComputedStyle(dskCat) : null;

      const mobRect = mobCat ? mobCat.getBoundingClientRect() : null;
      const dskRect = dskCat ? dskCat.getBoundingClientRect() : null;

      return {
        authVisible,
        mobCat: mobCat ? {
          display: mobStyle.display,
          position: mobStyle.position,
          left: mobStyle.left,
          bottom: mobStyle.bottom,
          zIndex: mobStyle.zIndex,
          rect: { x: mobRect.x, y: mobRect.y, w: mobRect.width, h: mobRect.height },
        } : null,
        dskCat: dskCat ? {
          display: dskStyle.display,
          position: dskStyle.position,
          rect: { x: dskRect.x, y: dskRect.y, w: dskRect.width, h: dskRect.height },
        } : null,
      };
    });

    console.log(`Width ${width}px | Auth visible: ${res.authVisible} | MobCat display: ${res.mobCat?.display}, pos: ${res.mobCat?.position}, left: ${res.mobCat?.left}, bottom: ${res.mobCat?.bottom}, rect: [${res.mobCat?.rect.w}x${res.mobCat?.rect.h} at (${res.mobCat?.rect.x}, ${res.mobCat?.rect.y})] | DskCat display: ${res.dskCat?.display}`);
    await context.close();
  }

  await browser.close();
}

verify().catch(console.error);
