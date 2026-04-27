import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const NAVY = rgb(10 / 255, 22 / 255, 40 / 255)
const GOLD = rgb(212 / 255, 168 / 255, 67 / 255)
const INK = rgb(0.12, 0.15, 0.21)
const MUTED = rgb(0.38, 0.42, 0.49)
const PANEL = rgb(0.985, 0.988, 0.995)
const RULE = rgb(0.82, 0.85, 0.9)
const WHITE = rgb(1, 1, 1)

function wrapLine(text, font, size, maxWidth) {
  const words = String(text ?? '').split(' ')
  const lines = []
  let current = ''
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  })
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.URL.revokeObjectURL(url)
}

export async function downloadApplicationSummaryPdf({ referenceId, sections }) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 40
  const maxWidth = pageWidth - margin * 2
  const bodySize = 10
  const smallSize = 9

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  function addPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight])
    page.drawRectangle({ x: 0, y: pageHeight - 34, width: pageWidth, height: 34, color: NAVY })
    page.drawText('MUCM Application Form', {
      x: margin,
      y: pageHeight - 23,
      size: 10,
      font: bold,
      color: WHITE,
    })
    y = pageHeight - margin - 14
  }

  addPage()

  page.drawRectangle({
    x: margin,
    y: y - 74,
    width: maxWidth,
    height: 74,
    color: PANEL,
    borderColor: RULE,
    borderWidth: 0.8,
  })
  page.drawText('METROPOLITAN UNIVERSITY COLLEGE OF MEDICINE', {
    x: margin + 14,
    y: y - 22,
    size: 9,
    font: bold,
    color: MUTED,
  })
  page.drawText('Application Form Submission Copy', {
    x: margin + 14,
    y: y - 42,
    size: 15,
    font: bold,
    color: NAVY,
  })
  page.drawText(`Reference ID: ${referenceId || 'N/A'}`, {
    x: margin + 14,
    y: y - 60,
    size: smallSize,
    font,
    color: INK,
  })
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: margin + 250,
    y: y - 60,
    size: smallSize,
    font,
    color: INK,
  })
  y -= 92

  sections.forEach((section) => {
    if (y < margin + 80) addPage()

    page.drawRectangle({ x: margin, y: y - 2, width: 4, height: 16, color: GOLD })
    page.drawText(section.title, {
      x: margin + 12,
      y,
      size: 12,
      font: bold,
      color: NAVY,
    })
    y -= 20

    section.entries.forEach((entry) => {
      const wrapped = String(entry.value || '—')
        .split('\n')
        .flatMap((line) => wrapLine(line, font, bodySize, maxWidth - 180))
      const blockHeight = Math.max(28, 14 + wrapped.length * (bodySize + 2))

      if (y < margin + blockHeight + 8) {
        addPage()
        page.drawRectangle({ x: margin, y: y - 2, width: 4, height: 16, color: GOLD })
        page.drawText(section.title, {
          x: margin + 12,
          y,
          size: 12,
          font: bold,
          color: NAVY,
        })
        y -= 20
      }

      page.drawRectangle({
        x: margin,
        y: y - blockHeight + 6,
        width: maxWidth,
        height: blockHeight,
        color: WHITE,
        borderColor: RULE,
        borderWidth: 0.45,
      })
      page.drawText(String(entry.label || '').toUpperCase(), {
        x: margin + 10,
        y: y - 10,
        size: 8,
        font: bold,
        color: MUTED,
      })
      let vy = y - 10
      wrapped.forEach((line) => {
        page.drawText(line, {
          x: margin + 170,
          y: vy,
          size: bodySize,
          font,
          color: INK,
        })
        vy -= bodySize + 2
      })
      y -= blockHeight + 6
    })

    y -= 6
  })

  const bytes = await pdfDoc.save()
  const outName = `${String(referenceId || 'mucm-application').replace(/[^\w.-]/g, '_')}.pdf`
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), outName)
}

