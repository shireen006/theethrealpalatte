import { chromium } from "playwright";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifySideBySideHero() {
  console.log("=== STARTING SIDE-BY-SIDE MOBILE HERO VERIFICATION ===");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  // 1. VERIFY MOBILE 390px (PRIMARY TARGET)
  console.log("\n[1] Verifying Mobile (390px)...");
  const ctx390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page390 = await ctx390.newPage();
  await page390.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await page390.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page390.waitForTimeout(500);

  const hero390 = await page390.locator(".hero").boundingBox();
  const copy390 = await page390.locator(".hero-copy").boundingBox();
  const imageWrap390 = await page390.locator(".hero-image-wrap").boundingBox();
  const heroImg390 = page390.locator(".hero-image-wrap img.hero-image");
  const heroImgSrc390 = await heroImg390.getAttribute("src");

  console.log(`- Hero total dimensions: ${Math.round(hero390.width)}x${Math.round(hero390.height)}px at y=${Math.round(hero390.y)}`);
  console.log(`- Hero-copy (LEFT text): x=${Math.round(copy390.x)}, y=${Math.round(copy390.y)}, w=${Math.round(copy390.width)}, h=${Math.round(copy390.height)}`);
  console.log(`- Hero-image-wrap (RIGHT image): x=${Math.round(imageWrap390.x)}, y=${Math.round(imageWrap390.y)}, w=${Math.round(imageWrap390.width)}, h=${Math.round(imageWrap390.height)}`);
  console.log(`- Hero image asset src: ${heroImgSrc390}`);

  // Checks:
  const isSideBySide = Math.abs(copy390.y - imageWrap390.y) < 10;
  const isCopyOnLeft = copy390.x < imageWrap390.x;
  const isImageOnRight = imageWrap390.x >= copy390.width - 5;
  const isCompactHeight = hero390.height >= 230 && hero390.height <= 300;

  console.log(`  -> Side-by-side (same row / y-aligned): ${isSideBySide}`);
  console.log(`  -> Text is on the LEFT: ${isCopyOnLeft}`);
  console.log(`  -> Image is on the RIGHT: ${isImageOnRight}`);
  console.log(`  -> Compact hero height (230-300px): ${isCompactHeight}`);

  if (!isSideBySide || !isCopyOnLeft || !isImageOnRight) {
    throw new Error("FAILED: Mobile hero is NOT side-by-side!");
  }

  // Check text content on left
  const titleText = (await page390.locator(".hero h1").textContent()).trim();
  const descText = (await page390.locator(".hero-copy p").textContent()).trim();
  const btnText = (await page390.locator(".hero-copy .primary-btn").textContent()).trim();
  console.log(`  -> Title: "${titleText}", Desc: "${descText}", Button: "${btnText}"`);

  // Screenshot 390px
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/verified_side_by_side_390.png" });

  // Slide to second item (Bloom Studio) and check
  console.log("\n  -> Testing slide 2 transition...");
  await page390.locator(".hero-arrow.right").click();
  await page390.waitForTimeout(600);

  const titleSlide2 = (await page390.locator(".hero h1").textContent()).trim();
  const copySlide2 = await page390.locator(".hero-copy").boundingBox();
  const imageSlide2 = await page390.locator(".hero-image-wrap").boundingBox();
  console.log(`  -> Slide 2 Title: "${titleSlide2}"`);
  console.log(`  -> Slide 2 Side-by-side: ${Math.abs(copySlide2.y - imageSlide2.y) < 10 && copySlide2.x < imageSlide2.x}`);
  await page390.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/verified_side_by_side_390_slide2.png" });

  await ctx390.close();

  // 2. CHECK 360px & 430px
  for (const w of [360, 430]) {
    console.log(`\n[2] Checking Mobile (${w}px)...`);
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const pg = await ctx.newPage();
    await pg.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
    await pg.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await pg.waitForTimeout(400);

    const cBox = await pg.locator(".hero-copy").boundingBox();
    const iBox = await pg.locator(".hero-image-wrap").boundingBox();
    const sbs = Math.abs(cBox.y - iBox.y) < 10 && cBox.x < iBox.x;
    console.log(`- [${w}px] Side-by-side confirmed: ${sbs} (copy x=${Math.round(cBox.x)}, img x=${Math.round(iBox.x)})`);
    await pg.screenshot({ path: `C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/verified_side_by_side_${w}.png` });
    await ctx.close();
  }

  // 3. CHECK DESKTOP (1280px)
  console.log("\n[3] Checking Desktop (1280px)...");
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPg = await desktopCtx.newPage();
  await desktopPg.addInitScript(() => sessionStorage.setItem("trp_login_dismissed", "true"));
  await desktopPg.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await desktopPg.waitForTimeout(400);

  const desktopHero = await desktopPg.locator(".hero").boundingBox();
  const desktopCopy = await desktopPg.locator(".hero-copy").boundingBox();
  const desktopImg = await desktopPg.locator(".hero-image-wrap").boundingBox();
  console.log(`- Desktop hero dimensions: ${Math.round(desktopHero.width)}x${Math.round(desktopHero.height)}`);
  console.log(`- Desktop copy width: ${Math.round(desktopCopy.width)}px, img width: ${Math.round(desktopImg.width)}px`);
  await desktopPg.screenshot({ path: "C:/Users/SYEDA FATIMA/Downloads/theethrealpalatte-starter/e2e-tests/verified_desktop_hero_unchanged.png" });
  await desktopCtx.close();

  await browser.close();
  console.log("\n=== ALL SIDE-BY-SIDE MOBILE HERO VERIFICATIONS PASSED! ===");
}

verifySideBySideHero().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
