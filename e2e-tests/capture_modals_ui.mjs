import { chromium } from "playwright";

async function captureModals() {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome"
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 850 }
  });

  await page.addInitScript(() => {
    window.__TEST_ADMIN_SESSION__ = {
      id: "admin-uuid-1",
      role: "admin",
      name: "Store Administrator",
      email: "admin@theethrealpalatte.com"
    };
  });

  await page.goto("http://localhost:5173/#admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // 1. Open Edit Modal for first product
  const editBtn = page.locator(".admin-table-desktop .row-action-btn.edit").first();
  await editBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: "e2e-tests/verified_edit_modal_desktop.png",
    fullPage: false
  });
  console.log("Captured e2e-tests/verified_edit_modal_desktop.png");

  // Close Edit Modal
  await page.locator(".modal-close-btn").click();
  await page.waitForTimeout(300);

  // 2. Open Delete Modal for first product
  const delBtn = page.locator(".admin-table-desktop .row-action-btn.delete").first();
  await delBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: "e2e-tests/verified_delete_modal_desktop.png",
    fullPage: false
  });
  console.log("Captured e2e-tests/verified_delete_modal_desktop.png");

  // Also capture mobile view of Edit and Delete
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await mobilePage.addInitScript(() => {
    window.__TEST_ADMIN_SESSION__ = {
      id: "admin-uuid-1",
      role: "admin",
      name: "Store Administrator",
      email: "admin@theethrealpalatte.com"
    };
  });

  await mobilePage.goto("http://localhost:5173/#admin", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(800);

  // Open Edit on mobile
  const mobEditBtn = mobilePage.locator(".admin-mobile-act-btn.edit").first();
  await mobEditBtn.click();
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({
    path: "e2e-tests/verified_edit_modal_mobile.png",
    fullPage: false
  });
  console.log("Captured e2e-tests/verified_edit_modal_mobile.png");

  // Close and open Delete on mobile
  await mobilePage.locator(".modal-close-btn").click();
  await mobilePage.waitForTimeout(300);

  const mobDelBtn = mobilePage.locator(".admin-mobile-act-btn.del").first();
  await mobDelBtn.click();
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({
    path: "e2e-tests/verified_delete_modal_mobile.png",
    fullPage: false
  });
  console.log("Captured e2e-tests/verified_delete_modal_mobile.png");

  await browser.close();
  console.log("Done capturing all modal screenshots!");
}

captureModals().catch(console.error);
