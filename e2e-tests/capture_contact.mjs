import { chromium } from "playwright";

async function captureContact() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // Disable sessionStorage dismissal so we directly view the site
  await page.addInitScript(() => {
    sessionStorage.setItem("trp_login_dismissed", "true");
  });

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1000);

  // Scroll to bottom of the page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(800);

  // Capture the contact section specifically
  const contactEl = await page.$(".contact-section");
  if (contactEl) {
    await contactEl.screenshot({ path: "e2e-tests/contact_section_closeup.png" });
    await contactEl.screenshot({
      path: "C:\\Users\\SYEDA FATIMA\\.gemini\antigravity-ide\\brain\\5b70de26-416b-4638-a3b0-c6fd10baece1\\contact_section_closeup.png",
    });
    console.log("Contact section screenshot saved!");
  } else {
    console.error("Could not find .contact-section");
  }

  await browser.close();
}

captureContact();
