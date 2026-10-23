// Zooms into the mismatch: clips the top-left corner (where the hero web sits)
// on both pages with the same freeze, saves both clips + full geometry of the
// two hero web <img>s on each side.
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const TARGETS = [
  { name: 'original', url: 'https://spydyy-portfolio.vercel.app/' },
  { name: 'clone', url: 'http://localhost:4173/' },
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

const report = {}
for (const target of TARGETS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.route(target.url, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace('</head>', `<style>${FREEZE}</style></head>`)
    await route.fulfill({ response, body })
  })
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(4500)
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 })
    .catch(() => {})
  await page.waitForTimeout(1000)

  report[target.name] = await page.evaluate(() => {
    const dump = (el) => {
      if (!el) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        src: el.currentSrc || el.src || null,
        alt: el.alt ?? null,
        op: cs.opacity,
        xform: cs.transform,
        rotate: cs.rotate,
        translate: cs.translate,
        scale: cs.scale,
        box: { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) },
        natural: imgOnly(el),
      }
    }
    const round = (n) => Math.round(n * 100) / 100
    const imgOnly = (el) => (el.tagName === 'IMG' ? { nw: el.naturalWidth, nh: el.naturalHeight } : null)
    const webs = [...document.querySelectorAll('img')].filter((i) => /web/i.test(i.alt))
    return {
      heroWebImgs: webs.map(dump),
      heroWebParents: webs.map((i) => dump(i.parentElement)),
      scrollY: Math.round(scrollY),
    }
  })

  await page.screenshot({ path: 'screenshots/clip-' + target.name + '.png', clip: { x: 0, y: 0, width: 480, height: 480 } })
  await ctx.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 1))
