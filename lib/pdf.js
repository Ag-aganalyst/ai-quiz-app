// A tiny dependency-free PDF writer: title, subtitle, a table (auto-paginated) and a footer, Helvetica only.
// Good enough for real downloadable report PDFs without pulling a 300 KB library into the single-file build.

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;

function esc(text) {
  return String(text ?? '')
    .replace(/[^\x20-\x7E]/g, (ch) => ({ '·': '-', '→': '->', '–': '-', '—': '-', '’': "'", '‘': "'", '“': '"', '”': '"', '%': '%' }[ch] || '-'))
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}
const fit = (text, chars) => (String(text ?? '').length > chars ? `${String(text).slice(0, Math.max(0, chars - 1))}…`.replace('…', '.') : String(text ?? ''));

/**
 * @param {{ title: string, subtitle?: string, meta?: string[], columns: {label: string, width: number, align?: 'left'|'right'}[], rows: (string|number)[][], footer?: string, summary?: string[] }} spec
 * @returns {Blob}
 */
export function buildPdf(spec) {
  const { title, subtitle = '', meta = [], columns, rows, footer = '', summary = [] } = spec;
  const pages = [];
  let ops = [];
  let y = PAGE_H - MARGIN;
  const totalWidth = columns.reduce((a, c) => a + c.width, 0);
  const scale = Math.min(1, (PAGE_W - 2 * MARGIN) / totalWidth);
  const cols = columns.map((c) => ({ ...c, width: c.width * scale }));

  const text = (x, yy, str, size = 9, bold = false) => ops.push(`BT /F${bold ? 2 : 1} ${size} Tf ${x.toFixed(1)} ${yy.toFixed(1)} Td (${esc(str)}) Tj ET`);
  const line = (yy, gray = 0.85) => ops.push(`${gray} G 0.5 w ${MARGIN} ${yy.toFixed(1)} m ${PAGE_W - MARGIN} ${yy.toFixed(1)} l S`);
  const header = (first) => {
    y = PAGE_H - MARGIN;
    if (first) {
      text(MARGIN, y - 10, title, 18, true);
      y -= 30;
      if (subtitle) { text(MARGIN, y, subtitle, 11); y -= 16; }
      meta.forEach((m) => { text(MARGIN, y, m, 9); y -= 13; });
      y -= 4;
      summary.forEach((s) => { text(MARGIN, y, s, 10, true); y -= 14; });
      if (summary.length) y -= 4;
    } else {
      text(MARGIN, y - 10, `${title} (continued)`, 11, true);
      y -= 24;
    }
    let x = MARGIN;
    cols.forEach((c) => { text(c.align === 'right' ? x + c.width - 4 - c.label.length * 4.6 : x, y, c.label, 8, true); x += c.width; });
    y -= 6;
    line(y, 0.6);
    y -= 12;
  };
  const flush = () => {
    const pageNo = pages.length + 1;
    text(MARGIN, MARGIN - 14, footer, 7);
    text(PAGE_W - MARGIN - 50, MARGIN - 14, `Page ${pageNo}`, 7);
    pages.push(ops.join('\n'));
    ops = [];
  };

  header(true);
  rows.forEach((r) => {
    if (y < MARGIN + 30) { flush(); header(false); }
    let x = MARGIN;
    r.forEach((cell, i) => {
      const c = cols[i];
      const chars = Math.floor(c.width / 4.9);
      const str = fit(cell, chars);
      const tx = c.align === 'right' ? x + c.width - 4 - str.length * 4.4 : x;
      text(tx, y, str, 8.5);
      x += c.width;
    });
    y -= 13;
    line(y + 4, 0.92);
  });
  flush();

  // Assemble the PDF file.
  const objects = [];
  const add = (body) => { objects.push(body); return objects.length; };
  const fontRegular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pagesIdx = add('PLACEHOLDER');
  const pageIds = pages.map((content) => {
    const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    const contentId = add(stream);
    return add(`<< /Type /Page /Parent ${pagesIdx} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`);
  });
  objects[pagesIdx - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catalog = add(`<< /Type /Catalog /Pages ${pagesIdx} 0 R >>`);

  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { out += `${String(o).padStart(10, '0')} 00000 n \n`; });
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([out], { type: 'application/pdf' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
