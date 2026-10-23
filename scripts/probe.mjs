// Instrumented probe: runs the SAME freeze + scroll protocol as frozen-diff.mjs
// on both pages, but instead of pixel-diffing it dumps per-frame state for the
// elements involved in the mismatching frames (hero webs, about wrapper & photo,
// glow frame, tech pills) plus image-load completeness. Prints only field pairs
// that differ between the two pages, so the exact drifted property shows up.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

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

const PROBE = `
() => {
  const pick = (el) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      op: cs.opacity,
      xform: cs.transform,
      ta: cs.translate,
      rot: cs.rotate,
      scl: cs.scale,
      clip: cs.clipPath || '',
      filter: cs.filter || '',
      rect: el.getBoundingClientRect().toJSON(),
    }
  }
  const imgs = [...document.images].map((im) => ({
    alt: im.alt,
    ok: im.complete && im.naturalWidth > 0,
  }))
  const out = { imgs, els: {} }
  const sel = {
    webTop: 'img[alt="Spider Web Top"]',
    webBot: 'img[alt="Spider Web Bottom"]',
    heroWebs: 'img[alt="Spider Web Top"]',
    profile: 'img[alt="Sri Sushmita Profile"]',
    glow: '.glow-frame',
    hangL: '.bg-web-left',
    hangR: '.bg-web-right',
    pillLast: '.tech-pill:not(:nth-last-child(-n+5))',
  }
  for (const [k, s] of Object.entries(sel)) {
    const els = [...document.querySelectorAll(s)]
    out.els[k] = els.map(pick)
  }
  // wrappers that carry the animated opacities
  out.els.photoWrap = [...document.querySelectorAll('.glow-frame')].map((g) => g.parentElement).map(pick)
  out.els.wrapL = [...document.querySelectorAll('.bg-web-left')].map((g) => g.parentElement).map(pick)
  out.els.wrapR = [...document.querySelectorAll('.bg-web-right')].map((g) => g.parentElement).map(pick)
  out.els.pills = [...document.querySelectorAll('.tech-pill')].map(pick).map((p) => (p ? p.op : null))
  // last pill only, to keep output small
  const pills = [...document.querySelectorAll('.tech-pill')]
  out.els.pill5 = pills[5] ? pick(pills[5]) : null
  out.els.webTopParent = document.querySelector('img[alt="Spider Web Top"]')?.parentElement
    ? pick(document.querySelector('img[alt="Spider Web Top"]').parentElement) : null
  out.scrollY = Math.round(scrollY)
  out.scrollHeight = document.body.scrollHeight
  out.fontsReady = document.fonts ? document.fonts.status : 'n/a'
  let res
  try {
    res = JSON.stringify(out)
  } catch (e) {
    res = JSON.stringify({ probeErr: String(e && e.stack ? e.stack : e) })
  }
  return res
}
`

function narrow(o, depth = 0) {
  if (Array.isArray(o)) return o.map((v) => narrow(v, depth + 1))
  if (o && typeof o === 'object') {
    const r = {}
    for (const [k, v] of Object.entries(o)) {
      // keep only meaningful fields
      if (['op', 'ok', 'alt', 'ta', 'rot', 'scl', 'filter', 'x', 'y', 'width', 'height', 'top', 'left', 'clip'].includes(k) || typeof v !== 'object') {
        r[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? narrow(v, depth + 1) : v
      }
    }
    return r
  }
  return o
}

function diff(a, b, path = '', acc = []) {
  if (a === null && b === null) return acc
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.max(a.length, b.length)
    for (let i = 0; i < n; i++) diff(a[i], b[i], path + '[' + i + ']', acc)
    return acc
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const k of keys) {
      if (['rect'].includes(k)) continue
      if (k === 'xform' || k === 'translate' || k === 'ta') continue // transforms frozen
      diff(a[k], b[k], path ? path + '.' + k : k, acc)
    }
    return acc
  }
  const sa = a === undefined ? '(undefined)' : String(a)
  const sb = b === undefined ? '(undefined)' : String(b)
  if (sa !== sb) acc.push(path + ': original=' + sa + ' | clone=' + sb)
  return acc
}

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const states = {}
  for (const target of TARGETS) {
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errs.push('console: ' + m.text())
    })
    await page.route(target.url, async (route) => {
      const response = await route.fetch()
      const body = (await response.text()).replace('</head>', `<style>${FREEZE}</style></head>`)
      await route.fulfill({ response, body })
    })
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4500)
    const height = await page.evaluate(() => document.body.scrollHeight)
    const steps = Math.min(6, Math.ceil(height / vp.height))
    const frames = []
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }), i * vp.height)
      await page.waitForTimeout(1400)
      const probeFn = new Function('return (' + PROBE + ')')()
      const r = await page.evaluate(probeFn)
      if (typeof r !== 'string') {
        console.log('[' + target.name + ' frame ' + i + '] PROBE returned non-string (' + typeof r + '); page errors: ' + JSON.stringify(errs.slice(-6), null, 1))
        process.exitCode = 1
        await browser.close()
        process.exit(1)
      }
      frames.push(JSON.parse(r))
    }
    states[target.name] = frames
    await page.close()
  }
  console.log('\n########## ' + vp.tag.toUpperCase() + ' ##########')
  const n = Math.min(states.original.length, states.clone.length)
  for (let i = 0; i < n; i++) {
    const d = diff(narrow(states.original[i]), narrow(states.clone[i]))
    console.log('--- frame ' + i + ' (scrollY=' + states.clone[i].scrollY + ') fonts=' + states.clone[i].fontsReady + ' ---')
    if (!d.length) console.log('   (state identical)')
    else for (const line of d.slice(0, 60)) console.log('   ' + line)
    if (d.length > 60) console.log('   ... ' + (d.length - 60) + ' more')
    // image completeness summary
    const bo = states.original[i].imgs.filter((x) => !x.ok)
    const bc = states.clone[i].imgs.filter((x) => !x.ok)
    if (bo.length || bc.length) {
      console.log('   images NOT ok  original: [' + bo.map((x) => x.alt).join(', ') + ']  clone: [' + bc.map((x) => x.alt).join(', ') + ']')
    } else {
      console.log('   images all ok')
    }
  }
  await ctx.close()
}
await browser.close()
