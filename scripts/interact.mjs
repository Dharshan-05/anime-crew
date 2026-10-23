// Exercises the clone's interactive behaviour.
import { chromium } from 'playwright'

const URL = 'http://localhost:4173/'
const results = []
const check = (name, ok, detail = '') =>
  results.push({ name, ok: ok ? 'PASS' : 'FAIL', detail })

const browser = await chromium.launch()

// ---------- desktop ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // nav anchors resolve to real sections
  for (const id of ['about', 'skills', 'projects', 'contact']) {
    const found = await page.locator(`section#${id}`).count()
    check(`section #${id} exists`, found === 1, `found=${found}`)
  }

  // "Explore Projects" scrolls to the projects section
  await page.click('text=Explore Projects')
  await page.waitForTimeout(1500)
  const y = await page.evaluate(() => window.scrollY)
  const projTop = await page.evaluate(
    () => document.getElementById('projects').getBoundingClientRect().top + window.scrollY,
  )
  check('Explore Projects scrolls to #projects', Math.abs(y - projTop) < 120, `scrollY=${y} target=${projTop}`)

  // contact form -> success state
  await page.fill('#name', 'Peter Parker')
  await page.fill('#email', 'peter@stark.com')
  await page.fill('#message', 'Hello there!')
  await page.click('button:has-text("Send Message")')
  await page.waitForTimeout(400)
  const success = await page.locator('text=Message Sent!').count()
  check('contact form shows success state', success === 1, `matches=${success}`)
  const badge = await page.locator('.animate-bounce').first().innerText()
  check('success badge renders a check mark', badge.trim() === '✓', `got ${JSON.stringify(badge)}`)

  // success state auto-resets after 4s
  await page.waitForTimeout(4200)
  const formBack = await page.locator('button:has-text("Send Message")').count()
  check('success state resets after 4s', formBack === 1, `form buttons=${formBack}`)

  // resume download resolves
  const pdf = await page.request.get(`${URL}sde_resume.pdf`)
  check('resume PDF resolves', pdf.status() === 200, `status=${pdf.status()}`)

  // hero spotlight mask responds to the cursor
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  const before = await page.evaluate(
    () => getComputedStyle(document.querySelector('img[alt="Top Mask Layer"]')).maskImage,
  )
  await page.mouse.move(400, 300)
  await page.waitForTimeout(1200)
  const after = await page.evaluate(
    () => getComputedStyle(document.querySelector('img[alt="Top Mask Layer"]')).maskImage,
  )
  check('hero spotlight mask reacts to cursor', before !== after, `changed=${before !== after}`)

  check('no console errors (desktop)', errors.length === 0, JSON.stringify(errors.slice(0, 3)))
  await page.close()
}

// ---------- mobile ----------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  const drawer = page.locator('#mobile-menu')
  const h0 = (await drawer.boundingBox())?.height ?? 0
  check('mobile drawer starts collapsed', h0 < 5, `height=${h0}`)

  await page.click('button[aria-label="Open navigation menu"]')
  await page.waitForTimeout(600)
  const h1 = (await drawer.boundingBox())?.height ?? 0
  check('mobile drawer opens', h1 > 100, `height=${h1}`)

  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  const h2 = (await drawer.boundingBox())?.height ?? 0
  check('Escape closes the drawer', h2 < 5, `height=${h2}`)

  await page.click('button[aria-label="Open navigation menu"]')
  await page.waitForTimeout(500)
  await page.click('#mobile-menu a[href="#projects"]')
  await page.waitForTimeout(1500)
  const open = await page.evaluate(
    () => document.getElementById('mobile-menu').getBoundingClientRect().height,
  )
  check('drawer closes after navigating', open < 5, `height=${open}`)

  check('no console errors (mobile)', errors.length === 0, JSON.stringify(errors.slice(0, 3)))
  await page.close()
}

await browser.close()

console.table(results)
const failed = results.filter((r) => r.ok === 'FAIL')
console.log(failed.length ? `${failed.length} FAILING` : 'all checks passed')
process.exit(failed.length ? 1 : 0)
