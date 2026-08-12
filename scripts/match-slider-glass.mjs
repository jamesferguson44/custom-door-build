/**
 * The slider photo's left sash has a subtle vertical shading gradient (glass
 * reflection look); the right (fixed) sash glass is perfectly flat with no
 * gradient at all, so it reads as a solid panel instead of glass.
 *
 * Fix: copy the left pane's glass pixels into the right pane's glass region
 * (resized to fit), so both panes share the same glass texture/gradient.
 * Frame, hardware, and the header track above the right pane are untouched.
 *
 * Usage: node scripts/match-slider-glass.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../src/assets");
const srcPath = path.join(assetsDir, "window-slider-popular.jpg");

// Measured by sampling pixel rows/columns directly against the 800x1000 source.
const LEFT_GLASS = { left: 86, top: 166, width: 297, height: 662 };
const RIGHT_GLASS = { left: 407, top: 176, width: 310, height: 649 };
/** Feather so the pasted patch blends into the frame it sits inside. */
const FEATHER = 4;

async function main() {
  const image = sharp(srcPath);
  const meta = await image.metadata();

  const leftPatchBuf = await sharp(srcPath).extract(LEFT_GLASS).resize(RIGHT_GLASS.width, RIGHT_GLASS.height).toBuffer();

  // Soft rectangular feather mask so the seam blends rather than looking pasted.
  const maskSvg = `
    <svg width="${RIGHT_GLASS.width}" height="${RIGHT_GLASS.height}">
      <defs>
        <filter id="f"><feGaussianBlur stdDeviation="${FEATHER}" /></filter>
      </defs>
      <rect x="${FEATHER}" y="${FEATHER}" width="${RIGHT_GLASS.width - FEATHER * 2}" height="${RIGHT_GLASS.height - FEATHER * 2}" fill="white" filter="url(#f)" />
    </svg>`;
  const maskBuf = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  const leftPatchWithMask = await sharp(leftPatchBuf)
    .ensureAlpha()
    .composite([{ input: maskBuf, blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = await sharp(srcPath)
    .composite([{ input: leftPatchWithMask, left: RIGHT_GLASS.left, top: RIGHT_GLASS.top }])
    .jpeg({ quality: 95 })
    .toBuffer();

  // Sharp can't safely read+write the same path in one pipeline; write to a
  // temp file, then move it over the source.
  const tmpPath = `${srcPath}.tmp`;
  await sharp(out).toFile(tmpPath);
  const fs = await import("node:fs/promises");
  await fs.rename(tmpPath, srcPath);
  console.log(`Updated ${srcPath} (${meta.width}x${meta.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
