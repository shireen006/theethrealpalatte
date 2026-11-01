import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyAbout() {
  console.log("=== VERIFYING ABOUT US EXACT REFERENCE MATCH ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. DESKTOP (1280x900)
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("theethrealpalatte_user", JSON.stringify({ email: "test@example.com", name: "Tester" }));
  });
  await desktopPage.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  const aboutSection = desktopPage.locator("#about");
  await aboutSection.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(600);

  // Take screenshot of desktop view
  await aboutSection.screenshot({ path: "e2e-tests/about_desktop_exact.png" });
  await desktopPage.screenshot({ path: "e2e-tests/full_desktop_about_page.png" });

  const desktopInfo = await desktopPage.evaluate(() => {
    const section = document.querySelector("#about");
    const eyebrow = document.querySelector(".about-eyebrow");
    const title = document.querySelector(".about-title");
    const p1 = document.querySelector(".about-p1");
    const p2 = document.querySelector(".about-p2");
    const sig = document.querySelector(".about-signature");

    const secRect = section.getBoundingClientRect();
    const eyeRect = eyebrow.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const p1Rect = p1.getBoundingClientRect();
    const p2Rect = p2.getBoundingClientRect();
    const sigRect = sig.getBoundingClientRect();

    const titleStyle = window.getComputedStyle(title);
    const eyeStyle = window.getComputedStyle(eyebrow);
    const p1Style = window.getComputedStyle(p1);
    const p2Style = window.getComputedStyle(p2);
    const sigStyle = window.getComputedStyle(sig);
    const secStyle = window.getComputedStyle(section);

    return {
      sectionBg: secStyle.backgroundColor,
      eyebrow: {
        text: eyebrow.textContent.trim(),
        leftOffset: eyeRect.left - secRect.left,
        topOffset: eyeRect.top - secRect.top,
        fontSize: eyeStyle.fontSize,
        letterSpacing: eyeStyle.letterSpacing,
        textTransform: eyeStyle.textTransform,
      },
      title: {
        text: title.innerText.trim(),
        fontSize: titleStyle.fontSize,
        fontStyle: titleStyle.fontStyle,
        fontFamily: titleStyle.fontFamily,
        textAlign: titleStyle.textAlign,
        centerX: titleRect.left + titleRect.width / 2,
        secCenterX: secRect.left + secRect.width / 2,
      },
      p1: {
        text: p1.textContent.trim(),
        textAlign: p1Style.textAlign,
        centerX: p1Rect.left + p1Rect.width / 2,
      },
      p2: {
        text: p2.textContent.trim(),
        textAlign: p2Style.textAlign,
        centerX: p2Rect.left + p2Rect.width / 2,
      },
      signature: {
        text: sig.textContent.trim(),
        fontStyle: sigStyle.fontStyle,
        textAlign: sigStyle.textAlign,
        centerX: sigRect.left + sigRect.width / 2,
      },
    };
  });

  console.log("Desktop info:", JSON.stringify(desktopInfo, null, 2));

  // 2. MOBILE (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    localStorage.setItem("theethrealpalatte_user", JSON.stringify({ email: "test@example.com", name: "Tester" }));
  });
  await mobilePage.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  const mobileAbout = mobilePage.locator("#about");
  await mobileAbout.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(600);

  await mobileAbout.screenshot({ path: "e2e-tests/about_mobile_exact.png" });

  const mobileInfo = await mobilePage.evaluate(() => {
    const title = document.querySelector(".about-title");
    const eyebrow = document.querySelector(".about-eyebrow");
    const p1 = document.querySelector(".about-p1");
    const p2 = document.querySelector(".about-p2");
    const sig = document.querySelector(".about-signature");

    return {
      eyebrowText: eyebrow.textContent.trim(),
      titleText: title.innerText.trim(),
      titleFontSize: window.getComputedStyle(title).fontSize,
      p1Text: p1.textContent.trim(),
      p2Text: p2.textContent.trim(),
      signatureText: sig.textContent.trim(),
    };
  });

  console.log("Mobile info:", JSON.stringify(mobileInfo, null, 2));

  await browser.close();
  console.log("Verification finished successfully!");
}

verifyAbout().catch(console.error);
