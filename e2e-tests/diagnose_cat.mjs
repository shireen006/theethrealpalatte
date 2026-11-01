import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const widths = [375, 390, 768, 800, 850, 900, 1024];

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();

    page.on("pageerror", err => console.log(`[PageError ${width}px]:`, err.message));

    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(1200);

    const diagnostics = await page.evaluate(() => {
      const mobCat = document.querySelector(".hero-cat-mobile");
      const dskCat = document.querySelector(".hero-cat-desktop");
      const authOverlay = document.querySelector(".auth-overlay, .overlay");

      function getInfo(el) {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const hitEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          display: style.display,
          position: style.position,
          visibility: style.visibility,
          opacity: style.opacity,
          transform: style.transform,
          zIndex: style.zIndex,
          left: style.left,
          bottom: style.bottom,
          top: style.top,
          right: style.right,
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          hitElementTag: hitEl ? hitEl.tagName + (hitEl.className ? "." + hitEl.className : "") : null,
          isInsideEl: hitEl ? el.contains(hitEl) : false,
        };
      }

      return {
        hasMobCat: !!mobCat,
        hasDskCat: !!dskCat,
        mobCatInfo: getInfo(mobCat),
        dskCatInfo: getInfo(dskCat),
        authOverlayVisible: authOverlay ? window.getComputedStyle(authOverlay).display !== "none" : false,
        authOverlayZIndex: authOverlay ? window.getComputedStyle(authOverlay).zIndex : null,
      };
    });

    console.log(`\n=== Viewport width: ${width}px ===`);
    console.log("Mob cat:", JSON.stringify(diagnostics.mobCatInfo, null, 2));
    console.log("Dsk cat:", JSON.stringify(diagnostics.dskCatInfo, null, 2));
    console.log("Auth overlay visible?", diagnostics.authOverlayVisible, "zIndex:", diagnostics.authOverlayZIndex);

    await context.close();
  }

  await browser.close();
}

diagnose().catch(console.error);
