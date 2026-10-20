import { defaultSectionOrder } from '../../models/ResumeDocument';
import type { ResumeDocument } from '../../models/ResumeDocument';
import { inchesToPixels } from '../../utils/measurements';
import { ResumeEntry } from './ResumeEntry';
import { ResumeHeader } from './ResumeHeader';
import { ResumeProject } from './ResumeProject';
import { ResumeSection } from './ResumeSection';
import { ResumeSkills } from './ResumeSkills';
import { MarginGuides } from '../editor/MarginGuides';
import { TextToolbar } from '../editor/TextToolbar';
import type { TextFormatting } from '../../models/ResumeElement';

interface Props { document: ResumeDocument; selectedId: string | null; select: (id: string | null) => void; updateMargin: (side: keyof ResumeDocument['page']['margins'], value: number) => void; updateTextFormatting: (id: string, update: Partial<TextFormatting>) => void; updateTextContent: (id: string, content: string) => void; }
function findText(value: unknown, id: string): { id: string; type: 'text'; content: string; formatting?: TextFormatting } | undefined { if (!value || typeof value !== 'object') return undefined; if ('id' in value && (value as { id?: string }).id === id && 'type' in value) return value as { id: string; type: 'text'; content: string; formatting?: TextFormatting }; for (const child of Object.values(value)) { const found = findText(child, id); if (found) return found; } }
function defaultFontSize(id: string, bodySize: number) {
  if (id === 'header-name') return 16.5;
  if (id.startsWith('contact-')) return 8.3;
  if (id.endsWith('-title')) return Number((bodySize * 1.02).toFixed(1));
  return bodySize;
}
export function ResumePage({ document, selectedId, select, updateMargin, updateTextFormatting, updateTextContent }: Props) {
  const { page, settings } = document;
  const style = { width: inchesToPixels(page.width), minHeight: inchesToPixels(page.height), padding: `${inchesToPixels(page.margins.top)}px ${inchesToPixels(page.margins.right)}px ${inchesToPixels(page.margins.bottom)}px ${inchesToPixels(page.margins.left)}px`, fontFamily: settings.fontFamily, fontSize: `${settings.baseFontSize}pt`, lineHeight: settings.lineSpacing };
  const selected = selectedId ? findText(document, selectedId) : undefined;
  return <div className="paper-wrap"><div className="canvas-stage"><div id="resume-page" className="resume-page" style={style} onClick={() => select(null)}><ResumeHeader header={document.header} selectedId={selectedId} onSelect={select} onChange={updateTextContent} />{(document.sectionOrder ?? defaultSectionOrder).map(key => <div key={key}>{{ education: <ResumeSection title={document.education.title} selectedId={selectedId} onSelect={select} onChange={updateTextContent}>{document.education.entries.map(entry => <ResumeEntry key={entry.id} entry={entry} selectedId={selectedId} onSelect={select} onChange={updateTextContent} />)}</ResumeSection>, experience: <ResumeSection title={document.experience.title} selectedId={selectedId} onSelect={select} onChange={updateTextContent}>{document.experience.entries.map(entry => <ResumeEntry key={entry.id} entry={entry} selectedId={selectedId} onSelect={select} onChange={updateTextContent} />)}</ResumeSection>, projects: <ResumeSection title={document.projects.title} selectedId={selectedId} onSelect={select} onChange={updateTextContent}>{document.projects.entries.map(entry => <ResumeProject key={entry.id} entry={entry} selectedId={selectedId} onSelect={select} onChange={updateTextContent} />)}</ResumeSection>, technicalSkills: <ResumeSkills skills={document.technicalSkills} selectedId={selectedId} onSelect={select} onChange={updateTextContent} /> }[key]}</div>)}</div><MarginGuides document={document} onChange={updateMargin} />{selected && <TextToolbar element={selected} defaultFontSize={defaultFontSize(selected.id, settings.baseFontSize)} onUpdate={update => updateTextFormatting(selected.id, update)} />}</div></div>;
}
