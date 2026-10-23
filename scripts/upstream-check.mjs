// Detects upstream drift: compares the LIVE original site
// (https://spydyy-portfolio.vercel.app/) against the archived snapshot in
// _site/ and the assets actually used by the clone (public/assets, dist/assets).
//
// If the live bundle or any referenced asset has changed bytes compared to what
// the clone was built from, the frozen-diff baseline no longer applies.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const BASE = 'https://spydyy-portfolio.vercel.app'
const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16)
const get = async (p) => Buffer.from(await (await fetch(BASE + p)).arrayBuffer())
const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length))

mkdirSync('_site/live', { recursive: true })

// ---- local assets: hash -> path -------------------------------------------
const localByHash = new Map()
const localPaths = []
for (const d of ['_site', 'public/assets', 'dist/assets']) {
  if (!existsSync(d)) continue
  for (const n of readdirSync(d)) {
    if (!/\.(png|pdf)$/.test(n)) continue
    const p = d + '/' + n
    const buf = readFileSync(p)
    localPaths.push({ p, size: buf.length, hash: sha(buf) })
    if (!localByHash.has(sha(buf))) localByHash.set(sha(buf), p)
  }
}

// ---- live html + bundle ----------------------------------------------------
const html = await (await fetch(BASE + '/')).text()
writeFileSync('_site/live/index.html', html)
const jsName = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1]
const cssName = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1]
const [liveJs, liveCss] = await Promise.all([get(jsName), get(cssName)])
writeFileSync('_site/live/index.js', liveJs)
writeFileSync('_site/live/index.css', liveCss)

const archJs = readFileSync('_site/index.js')
const archCss = readFileSync('_site/index.css')
console.log('BUNDLE  JS  live=' + sha(liveJs) + ' archived=' + sha(archJs) + ' -> ' + (sha(liveJs) === sha(archJs) ? 'IDENTICAL' : '!!! DIFFERENT !!! (live js: ' + jsName + ')'))
console.log('BUNDLE  CSS live=' + sha(liveCss) + ' archived=' + sha(archCss) + ' -> ' + (sha(liveCss) === sha(archCss) ? 'IDENTICAL' : '!!! DIFFERENT !!! (live css: ' + cssName + ')'))

// ---- every asset the live page actually references ------------------------
const jsText = liveJs.toString()
const refs = [...new Set([
  ...(jsText.matchAll(/\/assets\/[A-Za-z0-9_.%-]+\.(?:png|pdf|ico|svg|webp|jpe?g)/g) || []).map((m) => m[0]),
  ...(html.matchAll(/\/assets\/[A-Za-z0-9_.%-]+\.(?:png|pdf|ico|svg|webp|jpe?g)/g) || []).map((m) => m[0]),
])]
console.log('\nASSETS referenced by the live page (' + refs.length + '):')
const liveFiles = []
for (const p of refs) {
  try {
    const buf = await get(p)
    const name = p.split('/').pop()
    writeFileSync('_site/live/' + name, buf)
    const h = sha(buf)
    const twin = localByHash.get(h)
    liveFiles.push({ name, size: buf.length, hash: h, twin })
    console.log(
      '  ' + pad(name, 30) + pad(buf.length + ' B', 10) + h + (twin ? '  == ' + twin : '  !!! NO BYTE-IDENTICAL LOCAL COPY !!!'),
    )
  } catch (e) {
    console.log('  ' + p + '  FETCH ERROR: ' + e.message)
  }
}

// ---- local assets that no live asset matches anymore ----------------------
const liveHashes = new Set(liveFiles.map((f) => f.hash))
const orphans = localPaths.filter((f) => !liveHashes.has(f.hash))
if (orphans.length) {
  console.log('\nLOCAL assets with no live counterpart (stale or special):')
  for (const f of orphans) console.log('  ' + pad(f.p, 40) + pad(f.size + ' B', 10) + f.hash)
}
