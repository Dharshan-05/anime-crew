// Locates which scanline bands differ between a screenshot pair.
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

let bands = []
let start = -1
for (let y = 0; y <= a.height; y++) {
  const d = y < a.height ? Math.abs(pa[y] - pb[y]) : 0
  const hot = d > 12
  if (hot && start === -1) start = y
  if (!hot && start !== -1) {
    bands.push([start, y - 1, y - start])
    start = -1
  }
}

console.log(`${aPath} (${a.width}x${a.height}) vs ${bPath}`)
console.log('bands where row luminance differs by > 12:')
if (!bands.length) console.log('  (none)')
for (const [s, e, n] of bands) {
  console.log(`  y=${s}..${e}  (${n}px, ${((n / a.height) * 100).toFixed(1)}% of frame)`)
}
