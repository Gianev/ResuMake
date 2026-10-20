import type { ProjectEntry, ResumeDocument, ResumeEntry } from '../models/ResumeDocument';

const encoder = new TextEncoder();
const escapePdf = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
const wrap = (text: string, maxChars: number) => {
  const words = text.split(/\s+/); const lines: string[] = []; let line = '';
  words.forEach(word => { const next = line ? `${line} ${word}` : word; if (next.length > maxChars && line) { lines.push(line); line = word; } else line = next; });
  if (line) lines.push(line); return lines;
};

interface Line { text: string; bold?: boolean; italic?: boolean; indent?: number; size?: number; }
function entryLines(entry: ResumeEntry): Line[] {
  const organization = `${entry.organization.content}${entry.location ? `                                                       ${entry.location.content}` : ''}`;
  const role = `${entry.role.content}                                                       ${entry.dates.content}`;
  return [{ text: organization, bold: true }, { text: role, italic: true }, ...entry.bullets.flatMap(bullet => wrap(`- ${bullet.content.content}`, 96).map((text, i) => ({ text, indent: i ? 13 : 8 })))];
}
function projectLines(entry: ProjectEntry): Line[] {
  return [{ text: `${entry.name.content} | ${entry.technologies.content}                                                       ${entry.dates.content}`, bold: true }, ...entry.bullets.flatMap(bullet => wrap(`- ${bullet.content.content}`, 96).map((text, i) => ({ text, indent: i ? 13 : 8 })))];
}

/** Creates a portable, client-side PDF from the current document model. */
export function createResumePdf(document: ResumeDocument): Blob {
  const width = document.page.width * 72; const height = document.page.height * 72;
  const margins = document.page.margins; const left = margins.left * 72; const right = margins.right * 72;
  const lines: Line[] = [
    { text: document.header.name.content.toUpperCase(), bold: true, size: 16, indent: (width - left - right) / 2 - document.header.name.content.length * 4.2 },
    { text: document.header.contactInfo.map(item => item.content).join(' | '), size: 8, indent: Math.max(0, (width - left - right) / 2 - document.header.contactInfo.map(item => item.content).join(' | ').length * 2.15) },
    { text: '' },
    { text: document.education.title.content.toUpperCase(), bold: true, size: 10 }, ...document.education.entries.flatMap(entryLines),
    { text: '' }, { text: document.experience.title.content.toUpperCase(), bold: true, size: 10 }, ...document.experience.entries.flatMap(entryLines),
    { text: '' }, { text: document.projects.title.content.toUpperCase(), bold: true, size: 10 }, ...document.projects.entries.flatMap(projectLines),
    { text: '' }, { text: document.technicalSkills.title.content.toUpperCase(), bold: true, size: 10 },
    ...document.technicalSkills.categories.flatMap(category => wrap(`${category.label.content} ${category.skills.content}`, 103).map((text, i) => ({ text, bold: i === 0 }))),
  ];
  let y = height - margins.top * 72; const stream: string[] = [];
  lines.forEach(line => {
    const size = line.size ?? document.settings.baseFontSize;
    if (!line.text) { y -= size * 0.65; return; }
    const font = line.bold ? 'F2' : line.italic ? 'F3' : 'F1';
    stream.push(`BT /${font} ${size} Tf ${left + (line.indent ?? 0)} ${y} Td (${escapePdf(line.text)}) Tj ET`);
    if (line.bold && line.size === 10) stream.push(`${left} ${y - 2} m ${width - right} ${y - 2} l S`);
    y -= size * document.settings.lineSpacing * 1.15;
  });
  const content = stream.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>',
  ];
  let pdf = '%PDF-1.4\n'; const offsets: number[] = [0];
  objects.forEach((object, index) => { offsets.push(encoder.encode(pdf).length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadResumePdf(document: ResumeDocument) {
  const url = URL.createObjectURL(createResumePdf(document)); const link = globalThis.document.createElement('a');
  link.href = url; link.download = `${document.header.name.content.trim().replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`;
  link.click(); URL.revokeObjectURL(url);
}
