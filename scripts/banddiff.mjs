// For a screenshot pair, reports where the differing pixels actually are:
// for each scanline band that differs, the horizontal extent of the deltas.
import { readFileSync } from 'node:fs'
import { PNG } from 'pngjs'

const [, , aPath, bPath] = process.argv

const load = (p) => PNG.sync.read(readFileSync(p))
const a = load(aPath)
const b = load(bPath)

const profile = (png) => {
  const rows = new Float64Array(png.height)
  for (let y = 0; y < png.height; y++) {
    let sum = 0
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) << 2
      sum += 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]
    }
    rows[y] = sum / png.width
  }
  return rows
}

const pa = profile(a)
const pb = profile(b)

// Rows whose mean luminance moved by more than 12.
const hot = []
for (let y = 0; y < a.height; y++) hot.push(Math.abs(pa[y] - pb[y]) > 12)

console.log(`${aPath} vs ${bPath}  (${a.width}x${a.height})`)

let bands = []
let start = -1
for (let y = 0; y <= a.height; y++) {
  const on = y < a.height && hot[y]
  if (on && start === -1) start = y
  if (!on && start !== -1) {
    bands.push([start, y - 1])
    start = -1
  }
}

for (const [s, e] of bands) {
  // Horizontal extent of actually-differing pixels in this band.
  let xMin = Infinity
  let xMax = -Infinity
  let count = 0
  for (let y = s; y <= e; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) << 2
      const d =
        Math.abs(a.data[i] - b.data[i]) +
        Math.abs(a.data[i + 1] - b.data[i + 1]) +
        Math.abs(a.data[i + 2] - b.data[i + 2])
      if (d > 30) {
        count++
        if (x < xMin) xMin = x
        if (x > xMax) xMax = x
      }
    }
  }
  const pct = ((count / ((e - s + 1) * a.width)) * 100).toFixed(1)
  console.log(
    `  y=${s}..${e} (${e - s + 1}px)  differing px=${count} (${pct}% of band)  x=${xMin === Infinity ? '-' : xMin}..${xMax === Infinity ? '-' : xMax}`,
  )
}
