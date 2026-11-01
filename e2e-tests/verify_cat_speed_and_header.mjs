import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyCatSpeedAndCleanHeader() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  // 1. Verify Install App button is REMOVED from header
  const installBtn = await page.$(".pwa-header-install");
  console.log("Install App button in header:", installBtn ? "FOUND (Unexpected)" : "REMOVED (Confirmed ✓)");

  // 2. Verify professional header actions
  const headerActions = await page.$$eval(".header-actions button", (btns) =>
    btns.map((b) => b.getAttribute("aria-label") || b.className)
  );
  console.log("Header action buttons:", headerActions);

  // 3. Verify cat animation is rendered and cycles through stages
  const catWrapper = await page.$(".hero-cat-wrapper");
  console.log("Hero cat wrapper rendered:", catWrapper ? "YES ✓" : "NO");

  // Track stages over 6 seconds
  const observedStages = new Set();
  const startTime = Date.now();

  for (let i = 0; i < 18; i++) {
    const stage1 = await page.$(".stage-1-group");
    const stage2 = await page.$(".stage-2-group");
    const stage3 = await page.$(".stage-3-group");
    const stage4 = await page.$(".stage-4-group");
    const stage5 = await page.$(".stage-5-group");
    const stage6 = await page.$(".stage-6-group");

    if (stage1) observedStages.add(1);
    if (stage2) observedStages.add(2);
    if (stage3) observedStages.add(3);
    if (stage4) observedStages.add(4);
    if (stage5) observedStages.add(5);
    if (stage6) observedStages.add(6);

    await page.waitForTimeout(350);
  }

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`Observed animation stages in ${elapsed.toFixed(1)}s:`, Array.from(observedStages).sort());

  // Capture screenshot of cat and clean header
  await page.screenshot({ path: "professional_clean_header_cat.png", fullPage: false });

  await browser.close();
  console.log("CAT SPEED & CLEAN HEADER VERIFICATION COMPLETE!");
}

verifyCatSpeedAndCleanHeader().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
