// Quick visual check of the clone's hero and marquee after the icon swap.
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(4500)
await page.screenshot({ path: 'screenshots/final-hero.png' })
await page.evaluate(() => window.scrollTo({ top: 960, left: 0, behavior: 'instant' }))
await page.waitForTimeout(1200)
await page.screenshot({ path: 'screenshots/final-marquee-about.png' })
// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
await m.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await m.waitForTimeout(4000)
await m.screenshot({ path: 'screenshots/final-mobile-hero.png' })
await browser.close()
console.log('captured 3 frames')
