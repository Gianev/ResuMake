import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ResumeDocument } from '../models/ResumeDocument';

/** Exports the rendered resume page itself, preserving its on-screen layout. */
export async function downloadRenderedResumePdf(document: ResumeDocument) {
  const page = globalThis.document.getElementById('resume-page');
  if (!page) throw new Error('Resume preview is not available for export.');

  await globalThis.document.fonts.ready;

  const canvas = await html2canvas(page, {
    backgroundColor: '#ffffff',
    scale: 3,
    useCORS: true,
    onclone: clonedDocument => clonedDocument.getElementById('resume-page')?.classList.add('pdf-export'),
  });
  const renderedHeight = document.page.width * canvas.height / canvas.width;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [document.page.width, Math.max(document.page.height, renderedHeight)], compress: true });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, document.page.width, renderedHeight);
  const filename = document.header.name.content.trim().replace(/\s+/g, '-').toLowerCase() || 'resume';
  pdf.save(`${filename}.pdf`);
}
