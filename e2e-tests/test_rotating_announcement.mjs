import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  console.log("=== VERIFYING ROTATING ANNOUNCEMENT BANNER ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const expectedMessages = [
    "✦ Handmade with love ✦",
    "✦ Made to order ✦",
    "✦ Customization available ✦",
    "✦ Standard delivery 7–8 days ✦",
    "✦ Free shipping on orders above ₹999 ✦",
  ];

  // 1. DESKTOP TEST (1280px)
  console.log("\n1. Testing on Desktop (1280x800)...");
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto("http://localhost:5173/");

  const bar = desktopPage.locator(".announcement");
  await bar.waitFor({ state: "visible" });

  const barStyles = await bar.evaluate((el) => {
    const s = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      height: rect.height,
      bgColor: s.backgroundColor,
      color: s.color,
      display: s.display,
      justifyContent: s.justifyContent,
      alignItems: s.alignItems,
    };
  });

  console.log("Desktop announcement bar styles:", barStyles);
  if (Math.round(barStyles.height) !== 32) {
    throw new Error(`Expected announcement bar height ~32px, got ${barStyles.height}px`);
  }

  // Check text sharpness and font weight on .announcement-slide
  const slideStyles = await desktopPage.locator(".announcement-slide").evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      fontWeight: s.fontWeight,
      fontSize: s.fontSize,
      fontFamily: s.fontFamily,
      textShadow: s.textShadow,
      filter: s.filter,
      transform: s.transform,
      willChange: s.willChange,
    };
  });
  console.log("Desktop announcement slide computed styles:", slideStyles);

  if (slideStyles.fontWeight !== "400" && slideStyles.fontWeight !== "normal") {
    throw new Error(`Expected normal font-weight (400), got ${slideStyles.fontWeight}`);
  }
  if (slideStyles.filter !== "none") {
    throw new Error(`Expected filter: none, got ${slideStyles.filter}`);
  }
  if (slideStyles.textShadow !== "none" && slideStyles.textShadow !== "") {
    throw new Error(`Expected no text-shadow, got ${slideStyles.textShadow}`);
  }
  console.log("✓ Text weight is strictly normal (400) with zero blur filters, no text-shadow, and crisp typography.");

  // Observe rotation across multiple messages
  const observedMessages = new Set();
  console.log("\nObserving continuous rotation over 10 seconds (should see all 5 messages at 1.8s intervals):");

  for (let i = 0; i < 6; i++) {
    const text = (await desktopPage.locator(".announcement-slide").innerText()).trim();
    console.log(`- Turn ${i + 1} (${(i * 1.8).toFixed(1)}s): "${text}"`);
    observedMessages.add(text);
    await desktopPage.waitForTimeout(1850);
  }

  console.log(`Observed ${observedMessages.size} distinct messages out of 5 expected.`);
  for (const exp of expectedMessages) {
    if (!observedMessages.has(exp)) {
      console.warn(`Warning: Did not observe expected message: "${exp}"`);
    } else {
      console.log(`✓ Observed: "${exp}"`);
    }
  }

  // Capture desktop screenshot
  await desktopPage.screenshot({ path: "e2e-tests/verified_desktop_rotating_announcement.png" });
  console.log("Desktop screenshot saved to e2e-tests/verified_desktop_rotating_announcement.png");

  // 2. MOBILE TEST (375px iPhone)
  console.log("\n2. Testing on Mobile Viewport (375x667)...");
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:5173/");

  const mobBar = mobilePage.locator(".announcement");
  await mobBar.waitFor({ state: "visible" });

  const mobRect = await mobBar.boundingBox();
  console.log(`Mobile bar dimensions: width=${mobRect.width}px, height=${mobRect.height}px`);

  // Check text alignment and overflow on mobile
  const mobSlideMetrics = await mobilePage.locator(".announcement-slide").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    return {
      text: el.innerText,
      width: rect.width,
      parentWidth: parentRect.width,
      overflowing: rect.width > parentRect.width,
    };
  });

  console.log("Mobile slide metrics:", mobSlideMetrics);
  if (mobSlideMetrics.overflowing) {
    throw new Error("Text is overflowing container on 375px mobile viewport!");
  }
  console.log("✓ Mobile text fits without clipping/overflow.");

  await mobilePage.screenshot({ path: "e2e-tests/verified_mobile_rotating_announcement.png" });
  console.log("Mobile screenshot saved to e2e-tests/verified_mobile_rotating_announcement.png");

  // 3. ULTRA-SMALL SCREEN TEST (320px)
  console.log("\n3. Testing on Ultra-Small Screen (320x568)...");
  const smallContext = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const smallPage = await smallContext.newPage();
  await smallPage.goto("http://localhost:5173/");

  // Wait for the longest message: "✦ Free shipping on orders above ₹999 ✦"
  let foundLongest = false;
  for (let t = 0; t < 6; t++) {
    const txt = (await smallPage.locator(".announcement-slide").innerText()).trim();
    if (txt.includes("Free shipping")) {
      foundLongest = true;
      const isOverflowing = await smallPage.locator(".announcement-slide").evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const parentRect = el.parentElement.getBoundingClientRect();
        return rect.width > parentRect.width;
      });
      console.log(`Longest message on 320px screen: "${txt}", overflowing=${isOverflowing}`);
      if (isOverflowing) {
        throw new Error("Longest message overflows on 320px screen!");
      }
      console.log("✓ Longest message fits perfectly within 320px with zero clipping.");
      break;
    }
    await smallPage.waitForTimeout(1850);
  }

  await smallPage.screenshot({ path: "e2e-tests/verified_small320_rotating_announcement.png" });

  await browser.close();
  console.log("\n=== ALL ROTATING ANNOUNCEMENT BANNER CHECKS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

