// Pixel-diffs the original site against the clone and reports layout drift.
// Animated elements (marquee, web rotation) drift by design, so we report both
// raw pixel delta and a scanline profile delta that catches real layout shifts.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const DIR = 'screenshots'

function load(path) {
  return PNG.sync.read(readFileSync(path))
}

/** Mean luminance per scanline - insensitive to small moving decorations. */
function rowProfile(png) {
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

const files = readdirSync(DIR).filter((f) => f.startsWith('original-'))
const report = []

for (const f of files) {
  const cloneName = f.replace('original-', 'clone-')
  const a = load(`${DIR}/${f}`)
  const b = load(`${DIR}/${cloneName}`)
  if (a.width !== b.width || a.height !== b.height) {
    report.push({ file: f, error: `size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}` })
    continue
  }

  const diff = new PNG({ width: a.width, height: a.height })
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.12,
    includeAA: false,
  })
  writeFileSync(`${DIR}/diff-${cloneName}`, PNG.sync.write(diff))

  const pa = rowProfile(a)
  const pb = rowProfile(b)
  let maxRowDelta = 0
  let shiftedRows = 0
  for (let y = 0; y < a.height; y++) {
    const d = Math.abs(pa[y] - pb[y])
    if (d > maxRowDelta) maxRowDelta = d
    if (d > 12) shiftedRows++
  }

  report.push({
    file: f,
    pixels: a.width * a.height,
    diffPct: +((changed / (a.width * a.height)) * 100).toFixed(2),
    maxRowDelta: +maxRowDelta.toFixed(1),
    shiftedRowPct: +((shiftedRows / a.height) * 100).toFixed(1),
  })
}

console.table(report)
