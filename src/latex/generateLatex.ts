import { defaultSectionOrder } from '../models/ResumeDocument';
import type { ResumeDocument, ResumeEntry } from '../models/ResumeDocument';
import type { TextElement, ResumeBullet } from '../models/ResumeElement';

function escapeLatex(value: string): string {
  const escapes: Record<string, string> = { '\\': '\\textbackslash{}', '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}' };
  return value.replace(/[\\&%$#_{}~^]/g, c => escapes[c]).replace(/\r\n|\r|\n/g, '\\newline{}');
}

/** Standalone source for pdfLaTeX, XeLaTeX, or LuaLaTeX. */
export function generateLatex(document: ResumeDocument): string {
  const { margins, width, height } = document.page;
  const { baseFontSize, lineSpacing } = document.settings;
  const text = (element: TextElement, defaultSize = baseFontSize) => {
    let value = escapeLatex(element.content);
    if (element.formatting?.bold) value = `\\textbf{${value}}`;
    if (element.formatting?.italic) value = `\\textit{${value}}`;
    const size = element.formatting?.fontSize ?? defaultSize;
    return `{\\fontsize{${size}}{${size * lineSpacing}}\\selectfont ${value}}`;
  };
  const row = (left: string, right: string) => `\\noindent ${left}\\hfill ${right}\\par`;
  const bullets = (items: ResumeBullet[]) => items.length ? `\\begin{itemize}\n${items.map(item => `\\item ${text(item.content)}`).join('\n')}\n\\end{itemize}` : '';
  const space = (pixels: number) => `\\vspace{${pixels / 96}in}`;
  const heading = (title: TextElement) => `\\par${space(8)}\n${text({ ...title, content: title.content.toUpperCase() }, baseFontSize * 1.02)}\\par\n\\vspace{1pt}\\hrule\\vspace{3pt}`;
  const entry = (item: ResumeEntry) => [row(text(item.organization), item.location ? text(item.location) : ''), row(text(item.role), text(item.dates)), bullets(item.bullets)].filter(Boolean).join('\n');
  const section = (value: ResumeDocument['education']) => [heading(value.title), value.entries.map(entry).join(`\n${space(value.entrySpacing)}\n`), space(value.spacingAfter)].join('\n');
  const alignment = { left: '\\raggedright', center: '\\centering', right: '\\raggedleft' }[document.header.name.formatting?.alignment ?? 'left'];
  const font = escapeLatex(document.settings.fontFamily);
  const family = document.settings.fontFamily.toLowerCase();
  const pdfFont = family.includes('courier') ? '\\usepackage{tgcursor}\n\\renewcommand{\\familydefault}{\\ttdefault}'
    : /times|georgia/.test(family) ? '\\usepackage{tgtermes}'
    : '\\usepackage{tgheros}\n\\renewcommand{\\familydefault}{\\sfdefault}';
  const fallbackFont = family.includes('courier') ? 'TeX Gyre Cursor' : /times|georgia/.test(family) ? 'TeX Gyre Termes' : 'TeX Gyre Heros';
  return `% Works with Overleaf's default pdfLaTeX compiler.
% Use XeLaTeX or LuaLaTeX for broader Unicode and installed system fonts.
\\documentclass[10pt]{article}
\\usepackage{iftex}
\\ifPDFTeX
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
${pdfFont}
\\else
\\usepackage{fontspec}
\\IfFontExistsTF{${font}}{\\setmainfont{${font}}}{\\setmainfont{${fallbackFont}}}
\\fi
\\usepackage[paperwidth=${width}in,paperheight=${height}in,top=${margins.top}in,right=${margins.right}in,bottom=${margins.bottom}in,left=${margins.left}in]{geometry}
\\usepackage{enumitem}
\\setlist[itemize]{leftmargin=1.5em,topsep=0pt,itemsep=0pt,parsep=0pt}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\pagestyle{empty}
\\begin{document}
\\fontsize{${baseFontSize}}{${baseFontSize * lineSpacing}}\\selectfont
{${alignment}
${text({ ...document.header.name, content: document.header.name.content.toUpperCase() }, 16.5)}\\par
${document.header.contactInfo.map(item => text(item, baseFontSize * 0.9)).join(' \\textbar{} ')}\\par}
${(document.sectionOrder ?? defaultSectionOrder).map(key => ({
    education: section(document.education),
    experience: section(document.experience),
    projects: `${heading(document.projects.title)}
${document.projects.entries.map(item => [row(`${text(item.name)} \\textbar{} \\textit{${text(item.technologies)}}`, text(item.dates)), bullets(item.bullets)].filter(Boolean).join('\n')).join(`\n${space(document.projects.entrySpacing)}\n`)}
${space(document.projects.spacingAfter)}
`,
    technicalSkills: `${heading(document.technicalSkills.title)}
${document.technicalSkills.categories.map(item => `${text(item.label)} ${text(item.skills)}\\par`).join('\n')}`,
  })[key]).join('\n')}
\\end{document}
`;
}

export function downloadResumeLatex(resume: ResumeDocument): void {
  const url = URL.createObjectURL(new Blob([generateLatex(resume)], { type: 'application/x-tex;charset=utf-8' }));
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${resume.header.name.content.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/\s+/g, '-').toLowerCase() || 'resume'}.tex`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
