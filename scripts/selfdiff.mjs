// Control experiment: capture the ORIGINAL site twice (two independent loads)
// and diff it against itself. Any delta it shows is pure animation-phase drift,
// which gives the baseline that the original-vs-clone delta must be read against.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const URL = 'https://spydyy-portfolio.vercel.app/'
const OUT = 'screenshots'

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()
const report = []

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })

  for (const pass of [1, 2]) {
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: `${OUT}/self${pass}-${vp.tag}-hero.png` })
    const height = await page.evaluate(() => document.body.scrollHeight)
    const steps = Math.min(6, Math.ceil(height / vp.height))
    for (let i = 1; i <= steps; i++) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }),
        i * vp.height,
      )
      await page.waitForTimeout(1400)
      await page.screenshot({ path: `${OUT}/self${pass}-${vp.tag}-scroll${i}.png` })
    }
    await page.close()
  }

  await ctx.close()
}

const load = (p) => PNG.sync.read(readFileSync(p))
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

const files = readdirSync(OUT).filter((f) => f.startsWith('self1-'))
for (const f of files) {
  const other = f.replace('self1-', 'self2-')
  const a = load(`${OUT}/${f}`)
  const b = load(`${OUT}/${other}`)
  const changed = pixelmatch(a.data, b.data, null, a.width, a.height, {
    threshold: 0.12,
    includeAA: false,
  })
  const pa = profile(a)
  const pb = profile(b)
  let shifted = 0
  for (let y = 0; y < a.height; y++) if (Math.abs(pa[y] - pb[y]) > 12) shifted++
  report.push({
    file: f.replace('self1-', ''),
    diffPct: +((changed / (a.width * a.height)) * 100).toFixed(2),
    shiftedRowPct: +((shifted / a.height) * 100).toFixed(1),
  })
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir)
  } catch {
    return []
  }
}

console.table(report)
await browser.close()
