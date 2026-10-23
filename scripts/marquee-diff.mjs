// Detailed comparison of the marquee internals between the original and the clone.
import { chromium } from 'playwright'

const TARGETS = [
  { name: 'original', url: 'https://spydyy-portfolio.vercel.app/' },
  { name: 'clone', url: 'http://localhost:4173/' },
]

const browser = await chromium.launch()

for (const target of TARGETS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(4000)

  const data = await page.evaluate(() => {
    const track = document.querySelectorAll('main > section:nth-of-type(2) div.flex.items-center.h-full.w-max')
    const out = []
    track.forEach((t, ti) => {
      out.push({
        track: ti,
        width: t.offsetWidth,
        children: t.children.length,
        childTags: [...t.children].map((c) => c.tagName + '.' + (c.className || '').split(' ')[0]),
        firstGroupWidth: t.firstElementChild?.offsetWidth ?? null,
        firstGroupChildren: t.firstElementChild?.children.length ?? null,
        spans: [...t.querySelectorAll('span')].slice(0, 5).map((s) => ({
          text: s.textContent,
          w: s.offsetWidth,
          left: s.offsetLeft,
          fontSize: getComputedStyle(s).fontSize,
        })),
        imgs: [...t.querySelectorAll('img')].slice(0, 5).map((i) => ({
          src: i.getAttribute('src'),
          w: i.offsetWidth,
          h: i.offsetHeight,
          natural: i.naturalWidth + 'x' + i.naturalHeight,
          complete: i.complete,
        })),
      })
    })
    return out
  })

  console.log(`\n########## ${target.name} ##########`)
  for (const d of data) {
    console.log(`track[${d.track}] width=${d.width} children=${d.children} firstGroupWidth=${d.firstGroupWidth} firstGroupChildren=${d.firstGroupChildren}`)
    console.log('  childTags:', d.childTags.join(', '))
    console.log('  spans:', d.spans.map((s) => `${s.text}=${s.w}@${s.left}`).join('  '))
    console.log('  imgs:', d.imgs.map((i) => `${i.src.split('/').pop()}=${i.w}x${i.h} nat=${i.natural} ok=${i.complete}`).join('  '))
  }

  await page.close()
}

await browser.close()
