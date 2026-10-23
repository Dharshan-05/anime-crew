// Generates a minimal, valid one-page placeholder PDF for the resume link.
import { writeFileSync } from 'node:fs'

const lines = [
  ['F24', 22, 'SRI SUSHMITA'],
  ['F16', 14, 'Full-Stack Engineer  |  AI & ML Undergraduate'],
  ['F11', 11, 'Aditya Engineering College'],
  ['F11', 11, 'PLACEHOLDER RESUME - replace public/sde_resume.pdf with your own.'],
  ['F11', 11, 'Email: your.email@example.com   |   GitHub: github.com/your-handle'],
  ['F13', 13, 'EXPERIENCE'],
  ['F11', 11, 'Full-Stack Engineer, Technical Hub - Built containerized SaaS platforms,'],
  ['F11', 11, 'designing for scale, reliability, and measurable outcomes.'],
  ['F11', 11, 'AlgoUniversity Tech Fellowship - Advanced algorithms and problem solving.'],
  ['F13', 13, 'PROJECTS'],
  ['F11', 11, 'Multi-Tenant SaaS Platform  -  React, Node.js, PostgreSQL, Docker'],
  ['F11', 11, 'Full-Stack Payment Gateway  -  Node.js, Express, MongoDB, REST APIs'],
  ['F11', 11, 'Notice Hub University Portal  -  React, Tailwind CSS, Node.js'],
  ['F11', 11, 'Productivity Suite Extension  -  JavaScript, Chrome APIs, Tailwind'],
  ['F13', 13, 'SKILLS'],
  ['F11', 11, 'React / Next.js, JavaScript / TypeScript, Node.js & Express, PostgreSQL,'],
  ['F11', 11, 'MongoDB, Docker, Python / AI & ML, GSAP, Tailwind CSS, Git & GitHub'],
]

let content = 'BT\n/F1 12 Tf\n72 720 Td\n14 TL\n'
for (const [font, size, text] of lines) {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  content += `/F${font} ${size} Tf\n(${escaped}) Tj\nT*\n`
}
content += 'ET\n'

const objects = []
objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
objects[3] =
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F11 6 0 R /F13 7 0 R /F16 8 0 R /F22 9 0 R /F24 10 0 R >> >> /Contents 4 0 R >>'
objects[4] = `<< /Length ${content.length} >>\nstream\n${content}endstream`
objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
objects[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
objects[7] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
objects[8] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
objects[9] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
objects[10] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

let pdf = '%PDF-1.4\n'
const offsets = []
for (let i = 1; i < objects.length; i++) {
  offsets[i] = pdf.length
  pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
}
const xrefStart = pdf.length
pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
for (let i = 1; i < objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
}
pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

writeFileSync('public/sde_resume.pdf', pdf, 'latin1')
console.log(`Wrote public/sde_resume.pdf (${pdf.length} bytes)`)
