import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyDeletion() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // 1. Clear any stored state
  await page.goto("http://localhost:5173/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("trp_login_dismissed", "true");
  });

  // 2. Reload page completely
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 3. Collect all visible product names in the store
  const productNames = await page.locator(".product-card h3").allTextContents();
  console.log("Visible products on store homepage:", productNames);

  const hasFlowerPot = productNames.some((name) => name.toLowerCase().includes("flower pot"));
  const hasExactCrochetFlower = productNames.some((name) => name.trim().toLowerCase() === "crochet flower");

  console.log(`Contains 'Crochet Flower Pot'? ${hasFlowerPot ? "FAIL - FOUND!" : "PASS - NOT FOUND ✓"}`);
  console.log(`Contains standalone 'Crochet Flower'? ${hasExactCrochetFlower ? "FAIL - FOUND!" : "PASS - NOT FOUND ✓"}`);

  // 4. Open search bar
  await page.locator("button[aria-label='Search collection']").click();
  await page.waitForTimeout(300);

  const searchInput = page.locator("input[placeholder*='Search']");

  // Search for "Flower Pot"
  await searchInput.fill("Flower Pot");
  await page.waitForTimeout(400);

  const searchResultsPot = await page.locator(".product-card h3").allTextContents();
  console.log("Search results for 'Flower Pot':", searchResultsPot);

  // Search for "Crochet Flower"
  await searchInput.fill("Crochet Flower");
  await page.waitForTimeout(400);

  const searchResultsFlower = await page.locator(".product-card h3").allTextContents();
  console.log("Search results for 'Crochet Flower':", searchResultsFlower);
  const foundPotInSearch = searchResultsFlower.some((n) => n.toLowerCase().includes("flower pot"));
  const foundExactFlowerInSearch = searchResultsFlower.some((n) => n.trim().toLowerCase() === "crochet flower");
  console.log(`Found 'Crochet Flower Pot' in search? ${foundPotInSearch ? "FAIL" : "NO ✓"}`);
  console.log(`Found exact 'Crochet Flower' in search? ${foundExactFlowerInSearch ? "FAIL" : "NO ✓"}`);

  // Clear search
  await searchInput.fill("");
  await page.waitForTimeout(300);
  await page.locator("button[aria-label='Search collection']").click();

  // 5. Test Category Filter "Crochet"
  await page.locator("button:has-text('Crochet')").first().click();
  await page.waitForTimeout(400);

  const crochetFiltered = await page.locator(".product-card h3").allTextContents();
  console.log("Crochet filtered products:", crochetFiltered);
  const foundPotInFilter = crochetFiltered.some((n) => n.toLowerCase().includes("flower pot"));
  const foundFlowerInFilter = crochetFiltered.some((n) => n.trim().toLowerCase() === "crochet flower");
  console.log(`Found 'Crochet Flower Pot' in Crochet filter? ${foundPotInFilter ? "FAIL" : "NO ✓"}`);
  console.log(`Found exact 'Crochet Flower' in Crochet filter? ${foundFlowerInFilter ? "FAIL" : "NO ✓"}`);

  // 6. Test Category Filter "Bloom Studio"
  await page.locator("button:has-text('Bloom Studio')").first().click();
  await page.waitForTimeout(400);

  const bloomFiltered = await page.locator(".product-card h3").allTextContents();
  console.log("Bloom Studio filtered products:", bloomFiltered);

  // 7. Reset to All
  await page.locator("button:has-text('All')").first().click();
  await page.waitForTimeout(300);

  // 8. Test Related Products and Recommendations inside a product detail view
  await page.locator(".product-card").first().click();
  await page.waitForTimeout(500);

  const relatedTitles = await page.locator(".related-card h3, .product-card h3").allTextContents();
  console.log("Related / recommendation product titles:", relatedTitles);
  const foundPotInRelated = relatedTitles.some((n) => n.toLowerCase().includes("flower pot"));
  const foundFlowerInRelated = relatedTitles.some((n) => n.trim().toLowerCase() === "crochet flower");
  console.log(`Found 'Crochet Flower Pot' in related/recommendations? ${foundPotInRelated ? "FAIL" : "NO ✓"}`);
  console.log(`Found exact 'Crochet Flower' in related/recommendations? ${foundFlowerInRelated ? "FAIL" : "NO ✓"}`);

  await page.screenshot({ path: "e2e-tests/e2e-tests/deletion_verified_store.png" });

  await browser.close();

  if (hasFlowerPot || hasExactCrochetFlower || foundPotInSearch || foundExactFlowerInSearch || foundPotInFilter || foundFlowerInFilter || foundPotInRelated || foundFlowerInRelated) {
    throw new Error("One or more deleted products were still found in store!");
  }

  console.log("\nALL VERIFICATION CHECKS PASSED: 'Crochet Flower Pot' and 'Crochet Flower' ARE 100% REMOVED!");
}

verifyDeletion().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
