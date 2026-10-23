// Structural diff between the original site and the clone.
//
// Uses offsetLeft/offsetTop/offsetWidth/offsetHeight, which are layout-box values
// and therefore immune to GSAP's transform animations. Compares geometry, key
// computed styles and text content for every element in the tree, and reports
// exactly which field differs.
import { chromium } from 'playwright'

const TARGETS = [
  { name: 'original', url: 'https://spydyy-portfolio.vercel.app/' },
  { name: 'clone', url: 'http://localhost:4173/' },
]

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
]

const FIELDS = [
  'depth',
  'tag',
  'id',
  'class',
  'left',
  'top',
  'width',
  'height',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'color',
  'bgColor',
  'textAlign',
  'textTransform',
  'letterSpacing',
  'lineHeight',
  'borderRadius',
  'borderTopWidth',
  'borderTopColor',
  'padding',
  'margin',
  'gap',
  'display',
  'position',
  'zIndex',
  'boxShadow',
  'textShadow',
  'text',
]

const COLLECT = () => {
  const out = []
  const walk = (el, depth) => {
    const cs = getComputedStyle(el)
    out.push([
      depth,
      el.tagName.toLowerCase(),
      el.id || '',
      typeof el.className === 'string' ? el.className : '',
      el.offsetLeft,
      el.offsetTop,
      el.offsetWidth,
      el.offsetHeight,
      cs.fontSize,
      cs.fontWeight,
      cs.fontFamily,
      cs.color,
      cs.backgroundColor,
      cs.textAlign,
      cs.textTransform,
      cs.letterSpacing,
      cs.lineHeight,
      cs.borderRadius,
      cs.borderTopWidth,
      cs.borderTopColor,
      cs.padding,
      cs.margin,
      cs.gap,
      cs.display,
      cs.position,
      cs.zIndex,
      cs.boxShadow,
      cs.textShadow,
      (el.textContent || '').trim().replace(/\s+/g, ' '),
    ])
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(document.body, 0)
  return out
}

/** Key an element by tag + class + text so we can pair them across the two trees. */
function keyOf(row) {
  return [row[1], row[3], row[FIELDS.length - 1]].join('~')
}

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const trees = {}

  for (const target of TARGETS) {
    const page = await ctx.newPage()
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4500)
    trees[target.name] = await page.evaluate(COLLECT)
    await page.close()
  }

  const a = trees.original
  const b = trees.clone

  console.log(`\n=== ${vp.tag} ===`)
  console.log(`elements: original=${a.length} clone=${b.length}`)

  // Pair rows by (tag, class, text) key, in order of appearance.
  const poolA = new Map()
  for (const row of a) {
    const k = keyOf(row)
    if (!poolA.has(k)) poolA.set(k, [])
    poolA.get(k).push(row)
  }
  const poolB = new Map()
  for (const row of b) {
    const k = keyOf(row)
    if (!poolB.has(k)) poolB.set(k, [])
    poolB.get(k).push(row)
  }

  const diffs = new Map()
  const keys = new Set([...poolA.keys(), ...poolB.keys()])
  for (const k of keys) {
    const ra = poolA.get(k) || []
    const rb = poolB.get(k) || []
    const n = Math.max(ra.length, rb.length)
    for (let i = 0; i < n; i++) {
      const x = ra[i]
      const y = rb[i]
      if (!x || !y) {
        const tag = (x || y)[1]
        const cls = (x || y)[3]
        const only = x ? 'original' : 'clone'
        diffs.set(`COUNT (${only} only) ${tag}.${cls.split(' ').slice(0, 3).join('.')}`, 1)
        continue
      }
      for (let f = 0; f < FIELDS.length; f++) {
        if (String(x[f]) !== String(y[f])) {
          const name = `${x[1]}.${x[3].split(' ').slice(0, 2).join('.')} :: ${FIELDS[f]}`
          diffs.set(name, (diffs.get(name) || 0) + 1)
        }
      }
    }
  }

  const sorted = [...diffs.entries()].sort((p, q) => q[1] - p[1])
  console.log(`distinct field-level differences: ${sorted.length}`)
  for (const [name, n] of sorted.slice(0, 40)) {
    console.log(`  x${n}  ${name}`)
  }

  await ctx.close()
}

await browser.close()
