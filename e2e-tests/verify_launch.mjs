import { chromium } from "playwright";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function verify() {
  const browserPath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
  console.log(`Using browser executable: ${browserPath}`);

  const browser = await chromium.launch({
    executablePath: browserPath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => consoleLogs.push(`[PAGE ERROR] ${err.message}`));

  console.log("Navigating to http://localhost:5173/ ...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  const title = await page.title();
  console.log(`Page Title: ${title}`);

  const logoText = await page.locator(".logo").innerText();
  console.log(`Logo Text: ${logoText}`);

  const heroHeading = await page.locator(".hero h1").innerText();
  console.log(`Hero Heading: ${heroHeading}`);

  await page.screenshot({ path: "verification_desktop.png", fullPage: false });
  console.log("Screenshot saved to verification_desktop.png");

  console.log("Console Logs Count:", consoleLogs.length);
  if (consoleLogs.length > 0) {
    console.log("Console logs sample:", consoleLogs.slice(0, 5));
  }

  await browser.close();
  console.log("Verification completed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
