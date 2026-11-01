import { chromium } from "playwright";

async function verifyVisualAccuracy() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const viewports = [
    { name: "desktop_1280", width: 1280, height: 800 },
    { name: "laptop_1366", width: 1366, height: 768 },
    { name: "mobile_375", width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(600);

    const heroBox = await page.$eval(".hero", el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    console.log(`[${vp.name}] Slide 1 Hero: ${heroBox.width}x${heroBox.height}`);

    // Capture Slide 1 (Crochet)
    await page.screenshot({ path: `e2e-tests/check_${vp.name}_slide1.png` });

    // Switch to Slide 2 (Paintings)
    await page.locator(".hero-arrow.right").click();
    await page.waitForTimeout(300);

    const titleText = await page.$eval(".hero h1", el => el.textContent.trim());
    console.log(`[${vp.name}] Slide 2 Title: ${titleText}`);

    // Capture Slide 2 (Paintings)
    await page.screenshot({ path: `e2e-tests/check_${vp.name}_slide2_paintings.png` });

    // Check About section
    const aboutBox = await page.$eval("#about", el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    console.log(`[${vp.name}] About: ${aboutBox.width}x${aboutBox.height}`);
    const aboutEl = await page.$("#about");
    if (aboutEl) {
      await aboutEl.screenshot({ path: `e2e-tests/check_${vp.name}_about.png` });
    }

    await context.close();
  }

  await browser.close();
  console.log("All screenshots captured!");
}

verifyVisualAccuracy();
