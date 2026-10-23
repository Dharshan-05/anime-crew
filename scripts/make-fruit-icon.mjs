// Builds a square, transparent "marquee/decoration" icon from the devil-fruit
// artwork the user supplied, and writes it over public/assets/web.png so every
// existing <img> keeps its sizing behaviour.
//
// Steps: trim transparent margins -> bilinear-resample (premultiplied, so the
// anti-aliased edges don't darken) -> centre on a 500x500 canvas, matching the
// square format of the web graphic it replaces.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { PNG } from 'pngjs'

// The artwork the portfolio owner supplied (archived in _site so the icon can
// always be rebuilt; falls back to the original download location).
const SOURCE = existsSync('_site/fruit-source.png')
  ? '_site/fruit-source.png'
  : 'C:/Users/prema/Downloads/1021120915528786968-removebg-preview.png'
const TARGET = 'public/assets/web.png'
const BACKUP = '_site/web-original.png'
const CANVAS = 500
const FILL = 0.7 // the fruit occupies 70% of the canvas (original web filled ~96% of its box)

// Preserve the original web graphic once; never overwrite it with the fruit.
if (!existsSync(BACKUP)) copyFileSync(TARGET, BACKUP)

const src = PNG.sync.read(readFileSync(SOURCE))
const { width: sw, height: sh, data: sd } = src

// --- 1. tight bounding box of visible pixels -------------------------------
let minX = sw, minY = sh, maxX = -1, maxY = -1
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    if (sd[(y * sw + x) * 4 + 3] > 20) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}
const bw = maxX - minX + 1
const bh = maxY - minY + 1
console.log(`source ${sw}x${sh} -> content ${bw}x${bh} (x ${minX}..${maxX}, y ${minY}..${maxY})`)

// --- 2. crop, premultiply, resample, unpremultiply -------------------------
const out = new Uint8ClampedArray(CANVAS * CANVAS * 4)

// crop into a flat buffer for clean sampling
const crop = Buffer.alloc(bw * bh * 4)
for (let y = 0; y < bh; y++) {
  crop.set(sd.subarray(((y + minY) * sw + minX) * 4, ((y + minY) * sw + minX) * 4 + bw * 4), y * bw * 4)
}
const pm = Buffer.alloc(crop.length)
for (let i = 0; i < crop.length; i += 4) {
  const a = crop[i + 3] / 255
  pm[i] = crop[i] * a
  pm[i + 1] = crop[i + 1] * a
  pm[i + 2] = crop[i + 2] * a
  pm[i + 3] = crop[i + 3]
}

// destination rect that centres the fruit while preserving its aspect ratio
const scale = (CANVAS * FILL) / Math.max(bw, bh)
const dw = Math.max(1, Math.round(bw * scale))
const dh = Math.max(1, Math.round(bh * scale))
const ox = Math.round((CANVAS - dw) / 2)
const oy = Math.round((CANVAS - dh) / 2)
console.log(`composited ${dw}x${dh} at (${ox}, ${oy}) on a ${CANVAS}x${CANVAS} canvas`)

const sample = (px, py, ch2) => {
  const x0 = Math.max(0, Math.min(bw - 1, Math.floor(px)))
  const x1 = Math.max(0, Math.min(bw - 1, Math.ceil(px)))
  const y0 = Math.max(0, Math.min(bh - 1, Math.floor(py)))
  const y1 = Math.max(0, Math.min(bh - 1, Math.ceil(py)))
  const fx = Math.max(0, Math.min(1, px - Math.floor(px)))
  const fy = Math.max(0, Math.min(1, py - Math.floor(py)))
  const i00 = (y0 * bw + x0) * 4 + ch2
  const i10 = (y0 * bw + x1) * 4 + ch2
  const i01 = (y1 * bw + x0) * 4 + ch2
  const i11 = (y1 * bw + x1) * 4 + ch2
  const top = pm[i00] * (1 - fx) + pm[i10] * fx
  const bottom = pm[i01] * (1 - fx) + pm[i11] * fx
  return top * (1 - fy) + bottom * fy
}

for (let y = 0; y < dh; y++) {
  // sample at pixel centres
  const sy = (y + 0.5) / scale - 0.5
  for (let x = 0; x < dw; x++) {
    const sx = (x + 0.5) / scale - 0.5
    const o = ((y + oy) * CANVAS + (x + ox)) * 4
    for (let c = 0; c < 4; c++) out[o + c] = Math.round(sample(sx, sy, c))
    const a = out[o + 3] / 255
    if (a > 0) {
      // unpremultiply for straight-alpha PNG
      out[o] = Math.min(255, out[o] / a)
      out[o + 1] = Math.min(255, out[o + 1] / a)
      out[o + 2] = Math.min(255, out[o + 2] / a)
    }
  }
}

const result = new PNG({ width: CANVAS, height: CANVAS })
result.data = Buffer.from(out)
writeFileSync(TARGET, PNG.sync.write(result))
console.log(`wrote ${TARGET} (${CANVAS}x${CANVAS})`)

// --- 3. sanity check the result --------------------------------------------
const check = PNG.sync.read(readFileSync(TARGET))
let bx0 = CANVAS, by0 = CANVAS, bx1 = -1, by1 = -1
for (let y = 0; y < check.height; y++)
  for (let x = 0; x < check.width; x++)
    if (check.data[(y * check.width + x) * 4 + 3] > 20) {
      if (x < bx0) bx0 = x
      if (x > bx1) bx1 = x
      if (y < by0) by0 = y
      if (y > by1) by1 = y
    }
console.log(
  `verify: ${check.width}x${check.height}, visible bbox x=${bx0}..${bx1} y=${by0}..${by1} ` +
    `(content ${bx1 - bx0 + 1}x${by1 - by0 + 1}, centred offset ` +
    `${Math.abs((bx0 + bx1) / 2 - (CANVAS - 1) / 2).toFixed(1)}px)`,
)
