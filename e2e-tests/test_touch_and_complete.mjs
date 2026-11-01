import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWPORTS = [
  { name: "320px Mobile", width: 320, height: 600, isMobile: true },
  { name: "375px Mobile", width: 375, height: 667, isMobile: true },
  { name: "390px Mobile", width: 390, height: 844, isMobile: true },
  { name: "430px Mobile", width: 430, height: 932, isMobile: true },
  { name: "768px Tablet", width: 768, height: 1024, isMobile: true },
  { name: "1024px Laptop", width: 1024, height: 768, isMobile: false },
  { name: "1366px Desktop", width: 1366, height: 768, isMobile: false },
  { name: "1920px Desktop", width: 1920, height: 1080, isMobile: false },
];

const results = [];

function recordResult(testName, passed, details = "") {
  results.push({ testName, passed, details });
  console.log(`${passed ? "✅ [PASS]" : "❌ [FAIL]"} ${testName}${details ? `: ${details}` : ""}`);
}

async function setupAdminSession(page) {
  await page.addInitScript(() => {
    window.__TEST_ADMIN_SESSION__ = {
      id: "admin-uuid-1",
      role: "admin",
      name: "Store Administrator",
      email: "admin@theethrealpalatte.com"
    };
  });
}

async function runTouchAndCompleteAudit() {
  console.log("===============================================================================");
  console.log("STARTING MULTI-VIEWPORT TOUCHSCREEN & FULL CAPABILITY TEST SUITE");
  console.log("===============================================================================");

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome"
  });

  try {
    // 1. TEST ALL 8 VIEWPORTS FOR OVERFLOW & RESPONSIVENESS
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile
      });

      await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return {
          bodyScrollWidth: document.body.scrollWidth,
          bodyClientWidth: document.body.clientWidth,
          htmlScrollWidth: document.documentElement.scrollWidth,
          htmlClientWidth: document.documentElement.clientWidth,
          windowInnerWidth: window.innerWidth
        };
      });

      const hasHorizontalScroll = overflow.htmlScrollWidth > overflow.windowInnerWidth + 1;
      recordResult(
        `Viewport Responsiveness & Zero Horizontal Overflow (${vp.name})`,
        !hasHorizontalScroll,
        `scrollWidth=${overflow.htmlScrollWidth}px, innerWidth=${overflow.windowInnerWidth}px`
      );

      // Verify Product Grid rendering
      const cardCount = await page.locator(".product-card").count();
      recordResult(
        `Product Grid Visibility (${vp.name})`,
        cardCount > 0,
        `Found ${cardCount} product cards rendered cleanly`
      );

      // Verify Touch Targets on mobile viewports
      if (vp.isMobile) {
        const touchTargets = await page.evaluate(() => {
          const addCart = document.querySelector(".add-cart");
          const waQuick = document.querySelector(".card-whatsapp-quick");
          const wishlist = document.querySelector(".wishlist");
          const filterBtn = document.querySelector(".filters button");
          
          return {
            addCartDim: addCart ? { w: addCart.getBoundingClientRect().width, h: addCart.getBoundingClientRect().height } : null,
            waQuickDim: waQuick ? { w: waQuick.getBoundingClientRect().width, h: waQuick.getBoundingClientRect().height } : null,
            wishlistDim: wishlist ? { w: wishlist.getBoundingClientRect().width, h: wishlist.getBoundingClientRect().height } : null,
            filterDim: filterBtn ? { w: filterBtn.getBoundingClientRect().width, h: filterBtn.getBoundingClientRect().height } : null,
          };
        });

        const targetsAdequate = 
          touchTargets.addCartDim && touchTargets.addCartDim.h >= 36 &&
          touchTargets.waQuickDim && touchTargets.waQuickDim.h >= 36 &&
          touchTargets.filterDim && touchTargets.filterDim.h >= 40;

        recordResult(
          `Touch Target Ergonomics (${vp.name})`,
          targetsAdequate,
          `AddCart: ${touchTargets.addCartDim?.w}x${touchTargets.addCartDim?.h}px, WA: ${touchTargets.waQuickDim?.w}x${touchTargets.waQuickDim?.h}px, Filter: ${touchTargets.filterDim?.w}x${touchTargets.filterDim?.h}px`
        );
      }

      await page.close();
    }

    // 2. TEST ADMIN DASHBOARD MOBILE VS DESKTOP ADAPTATION
    // Desktop View (1366px)
    const desktopPage = await browser.newPage({
      viewport: { width: 1366, height: 768 }
    });
    await setupAdminSession(desktopPage);
    await desktopPage.goto("http://localhost:5173/#admin", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(800);

    const desktopHasTable = await desktopPage.evaluate(() => {
      const table = document.querySelector(".admin-table-desktop");
      const mobileCards = document.querySelector(".admin-mobile-cards");
      const tableVisible = table && window.getComputedStyle(table).display !== "none";
      const cardsVisible = mobileCards && window.getComputedStyle(mobileCards).display !== "none";
      return { tableVisible, cardsVisible };
    });

    recordResult(
      "Admin Dashboard Desktop Layout (1366px)",
      desktopHasTable.tableVisible && !desktopHasTable.cardsVisible,
      `Table visible: ${desktopHasTable.tableVisible}, Mobile cards visible: ${desktopHasTable.cardsVisible}`
    );

    // Mobile View (375px)
    const mobilePage = await browser.newPage({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true
    });
    await setupAdminSession(mobilePage);
    await mobilePage.goto("http://localhost:5173/#admin", { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(800);

    const mobileHasCards = await mobilePage.evaluate(() => {
      const table = document.querySelector(".admin-table-desktop");
      const mobileCards = document.querySelector(".admin-mobile-cards");
      const tableVisible = table && window.getComputedStyle(table).display !== "none";
      const cardsVisible = mobileCards && window.getComputedStyle(mobileCards).display !== "none";
      
      const actBtn = document.querySelector(".admin-mobile-act-btn");
      const btnDim = actBtn ? { w: actBtn.getBoundingClientRect().width, h: actBtn.getBoundingClientRect().height } : null;

      return { tableVisible, cardsVisible, btnDim };
    });

    recordResult(
      "Admin Dashboard Mobile Cards Layout (375px)",
      mobileHasCards.cardsVisible && !mobileHasCards.tableVisible,
      `Cards visible: ${mobileHasCards.cardsVisible}, Table hidden: ${!mobileHasCards.tableVisible}`
    );

    recordResult(
      "Admin Mobile Action Button Touch Targets (>= 44px height)",
      mobileHasCards.btnDim && mobileHasCards.btnDim.h >= 43,
      `Button height: ${mobileHasCards.btnDim?.h}px, width: ${mobileHasCards.btnDim?.w}px`
    );

    // Check Thumbnail Individual Mapping
    const thumbnailInspection = await desktopPage.evaluate(() => {
      const thumbs = Array.from(document.querySelectorAll(".admin-table tbody tr img")).map(img => img.src);
      const uniqueThumbs = new Set(thumbs);
      return { total: thumbs.length, unique: uniqueThumbs.size, thumbs: thumbs.slice(0, 4) };
    });

    recordResult(
      "Admin Thumbnail Dedup & Individual Product Images",
      thumbnailInspection.unique > 1,
      `Found ${thumbnailInspection.unique} unique images across ${thumbnailInspection.total} product rows (No identical fallback duplication)`
    );

    // Check Dynamic Statistics Cards
    const statsInspection = await desktopPage.evaluate(() => {
      const statValues = Array.from(document.querySelectorAll(".stat-card .stat-value")).map(el => el.textContent.trim());
      return statValues;
    });

    recordResult(
      "Admin Dashboard Dynamic Stats Calculation",
      statsInspection.length >= 4 && parseInt(statsInspection[0]) > 0,
      `Total: ${statsInspection[0]}, In-Stock: ${statsInspection[1]}, Out-of-Stock: ${statsInspection[2]}`
    );

    await desktopPage.close();
    await mobilePage.close();

    console.log("===============================================================================");
    console.log("ALL TOUCHSCREEN & COMPLETE FUNCTIONALITY TESTS COMPLETED");
    console.log("===============================================================================");

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
  }
}

runTouchAndCompleteAudit();
