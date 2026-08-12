/**
 * Cut the studio background out of each Popular Starting Points photo so all
 * four sit on one identical plate (set in CSS) instead of four slightly
 * different grays/vignettes baked into the source JPGs.
 *
 * Approach: relative-growing flood fill from the image border. Each step
 * compares a candidate pixel to its already-accepted neighbor (not a single
 * fixed target color), so it correctly follows smooth gradients/vignettes
 * without leaking across hard edges like the window frame.
 *
 * Output: transparent PNGs, trimmed to content and padded to a consistent
 * margin so every product reads at a similar visual "weight" once dropped
 * into the site's object-contain cards. A CSS `drop-shadow` filter (applied
 * in the component, not here) then gives every card an identical shadow that
 * hugs each product's real silhouette.
 *
 * Usage: node scripts/cutout-window-photos.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../src/assets");

const SOURCES = [
  "window-single-hung.jpg",
  "window-slider-popular.jpg",
  "window-casement.jpg",
  "window-picture.jpg",
];

/** Per-step tolerance for growing into a neighbor (handles vignette gradients). */
const STEP_TOLERANCE = 10;
/** Reject pixels with too much color spread (keeps colored/white frame edges out). */
const MAX_SPREAD = 22;
/** Padding added around trimmed content, as a fraction of the larger content dimension. */
const PAD_FRACTION = 0.1;

function dist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function spread(pixel) {
  return Math.max(
    Math.abs(pixel[0] - pixel[1]),
    Math.abs(pixel[1] - pixel[2]),
    Math.abs(pixel[0] - pixel[2]),
  );
}

async function loadRaw(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

/** Relative-growing background mask: BFS from border, comparing each candidate to its accepting neighbor. */
function growBackgroundMask(data, width, height, channels) {
  const N = width * height;
  const mask = new Uint8Array(N); // 1 = background
  const queue = new Int32Array(N);
  let qh = 0;
  let qt = 0;

  const pixelAt = (p) => {
    const i = p * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const tryEnqueue = (p, refColor) => {
    if (mask[p]) return;
    const pixel = pixelAt(p);
    if (spread(pixel) > MAX_SPREAD) return;
    if (dist(pixel, refColor) > STEP_TOLERANCE) return;
    mask[p] = 1;
    queue[qt++] = p;
  };

  // Seed every border pixel directly (assume the studio backdrop always touches the frame edge).
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const p = y * width + x;
      const pixel = pixelAt(p);
      if (spread(pixel) <= MAX_SPREAD) {
        mask[p] = 1;
        queue[qt++] = p;
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const p = y * width + x;
      const pixel = pixelAt(p);
      if (spread(pixel) <= MAX_SPREAD) {
        mask[p] = 1;
        queue[qt++] = p;
      }
    }
  }

  while (qh < qt) {
    const p = queue[qh++];
    const x = p % width;
    const y = (p / width) | 0;
    const refColor = pixelAt(p);
    if (x > 0) tryEnqueue(p - 1, refColor);
    if (x < width - 1) tryEnqueue(p + 1, refColor);
    if (y > 0) tryEnqueue(p - width, refColor);
    if (y < height - 1) tryEnqueue(p + width, refColor);
  }

  return mask;
}

/** Feather the mask edge slightly so the cutout doesn't look razor-cut. */
function alphaFromMask(mask, width, height, featherPx = 2) {
  const N = width * height;
  const alpha = new Float32Array(N);
  const distArr = new Int16Array(N).fill(-1);
  const queue = new Int32Array(N);
  let qh = 0;
  let qt = 0;

  for (let p = 0; p < N; p++) {
    if (!mask[p]) continue;
    const x = p % width;
    const y = (p / width) | 0;
    let border = false;
    if (x > 0 && !mask[p - 1]) border = true;
    if (x < width - 1 && !mask[p + 1]) border = true;
    if (y > 0 && !mask[p - width]) border = true;
    if (y < height - 1 && !mask[p + width]) border = true;
    if (border) {
      distArr[p] = 0;
      queue[qt++] = p;
    }
  }

  while (qh < qt) {
    const p = queue[qh++];
    const d = distArr[p];
    if (d >= featherPx) continue;
    const x = p % width;
    const y = (p / width) | 0;
    const neigh = [];
    if (x > 0) neigh.push(p - 1);
    if (x < width - 1) neigh.push(p + 1);
    if (y > 0) neigh.push(p - width);
    if (y < height - 1) neigh.push(p + width);
    for (const n of neigh) {
      if (!mask[n] || distArr[n] >= 0) continue;
      distArr[n] = d + 1;
      queue[qt++] = n;
    }
  }

  for (let p = 0; p < N; p++) {
    if (!mask[p]) {
      alpha[p] = 1; // foreground: fully opaque
      continue;
    }
    const d = distArr[p];
    if (d < 0 || d >= featherPx) {
      alpha[p] = 0;
    } else {
      const t = d / featherPx;
      alpha[p] = 1 - (t * t * (3 - 2 * t));
    }
  }
  return alpha;
}

function bboxFromAlpha(alpha, width, height, threshold = 0.05) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

async function processOne(name) {
  const srcPath = path.join(assetsDir, name);
  const { data, width, height, channels } = await loadRaw(srcPath);

  const bgMask = growBackgroundMask(data, width, height, channels);
  const alpha = alphaFromMask(bgMask, width, height);

  const rgba = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const o = p * 4;
    rgba[o] = data[i];
    rgba[o + 1] = data[i + 1];
    rgba[o + 2] = data[i + 2];
    rgba[o + 3] = Math.round(alpha[p] * 255);
  }

  const { minX, minY, maxX, maxY } = bboxFromAlpha(alpha, width, height);
  if (maxX < 0) throw new Error(`${name}: no foreground detected — check thresholds`);

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const pad = Math.round(Math.max(contentW, contentH) * PAD_FRACTION);

  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, minY - pad);
  const cropWidth = Math.min(width - cropLeft, contentW + pad * 2);
  const cropHeight = Math.min(height - cropTop, contentH + pad * 2);

  const outName = name.replace(/\.jpe?g$/i, ".png");
  const outPath = path.join(assetsDir, outName);

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`${name} -> ${outName}  (${cropWidth}x${cropHeight}, content ${contentW}x${contentH})`);
}

async function main() {
  for (const name of SOURCES) {
    await processOne(name);
  }
  console.log("\nDone. Review the PNGs in src/assets, then wire them into src/routes/index.tsx.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
