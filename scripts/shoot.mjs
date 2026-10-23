// Screenshots the original site and the clone for visual comparison.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const TARGETS = [
  { name: 'original', url: 'https://spydyy-portfolio.vercel.app/' },
  { name: 'clone', url: 'http://localhost:4173/' },
]

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  })
  for (const target of TARGETS) {
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(String(e)))

    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4000)

    await page.screenshot({ path: `${OUT}/${target.name}-${vp.tag}-hero.png` })

    // Scroll through the page capturing each section.
    const height = await page.evaluate(() => document.body.scrollHeight)
    const steps = Math.min(6, Math.ceil(height / vp.height))
    const positions = []
    for (let i = 1; i <= steps; i++) {
      // `behavior: instant` so CSS smooth-scrolling can't skew the capture.
      await page.evaluate(
        (y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }),
        i * vp.height,
      )
      await page.waitForTimeout(1400)
      positions.push(await page.evaluate(() => Math.round(window.scrollY)))
      await page.screenshot({ path: `${OUT}/${target.name}-${vp.tag}-scroll${i}.png` })
    }

    console.log(
      `${target.name}/${vp.tag}: height=${height} steps=${steps} y=[${positions.join(',')}] errors=${JSON.stringify(errors.slice(0, 5))}`,
    )
    await page.close()
  }
  await ctx.close()
}

await browser.close()
console.log('done')
