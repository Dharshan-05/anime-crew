// Decisive fidelity test.
//
// Injects an identical "freeze" stylesheet into the original and the clone so
// that every time-driven animation resolves to the same state, then pixel-diffs
// the two. If the layouts are truly identical the diff collapses to ~0.
//
// The freeze works because Tailwind v4 encodes translate/rotate/scale as
// standalone CSS properties, so `transform: none` cancels GSAP's writes without
// disturbing Tailwind's own layout.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const TARGETS = [
  { name: 'original', url: 'https://spydyy-portfolio.vercel.app/' },
  { name: 'clone', url: 'http://localhost:4173/' },
]

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
]

const FREEZE = `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}
.glow-frame { box-shadow: 0px 15px 35px rgba(163,21,21,0.25) !important; }
img[alt="Spider Web Top"], img[alt="Spider Web Bottom"] { opacity: 0.5 !important; }
section img.w-\\[600px\\], section img.w-\\[500px\\] { opacity: 0.04 !important; }
`

const browser = await chromium.launch()
const report = []

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const shots = {}

  for (const target of TARGETS) {
    const page = await ctx.newPage()
    // Inject the freeze into the served HTML so it applies from first paint.
    await page.route(target.url, async (route) => {
      const response = await route.fetch()
      const body = (await response.text()).replace(
        '</head>',
        `<style>${FREEZE}</style></head>`,
      )
      await route.fulfill({ response, body })
    })
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4500)
    // Never shoot a half-decoded page: wait for every <img> to have real pixels.
    await page
      .waitForFunction(
        () => [...document.images].every((i) => i.complete && i.naturalWidth > 0),
        null,
        { timeout: 20000 },
      )
      .catch(() => {})
    await page.waitForTimeout(1000)

    const height = await page.evaluate(() => document.body.scrollHeight)
    const steps = Math.min(6, Math.ceil(height / vp.height))
    const frames = []
    for (let i = 0; i <= steps; i++) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }),
        i * vp.height,
      )
      await page.waitForTimeout(4000)
      const buf = await page.screenshot()
      frames.push(buf)
    }
    shots[target.name] = frames
    await page.close()
  }

  for (let i = 0; i < shots.original.length; i++) {
    const a = PNG.sync.read(shots.original[i])
    const b = PNG.sync.read(shots.clone[i])
    if (a.width !== b.width || a.height !== b.height) {
      report.push({ frame: i, error: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` })
      continue
    }
    const diff = new PNG({ width: a.width, height: a.height })
    const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
      threshold: 0.1,
      includeAA: false,
    })
    writeFileSync(`screenshots/frozen-${vp.tag}-${i}.png`, PNG.sync.write(diff))
    report.push({
      viewport: vp.tag,
      frame: i,
      diffPct: +((changed / (a.width * a.height)) * 100).toFixed(2),
    })
  }

  await ctx.close()
}

await browser.close()
console.table(report)
