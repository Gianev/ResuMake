import type { ProjectEntry } from '../../models/ResumeDocument';
import { EditableText } from '../editor/EditableText';

interface Props { entry: ProjectEntry; selectedId: string | null; onSelect: (id: string) => void; onChange: (id: string, content: string) => void; }
export function ResumeProject({ entry, selectedId, onSelect, onChange }: Props) {
  return <article className="resume-entry"><div className="entry-topline"><span><EditableText element={entry.name} selected={selectedId === entry.name.id} onSelect={onSelect} onChange={onChange} /><span className="technologies"> | <EditableText element={entry.technologies} selected={selectedId === entry.technologies.id} onSelect={onSelect} onChange={onChange} /></span></span><EditableText element={entry.dates} selected={selectedId === entry.dates.id} onSelect={onSelect} onChange={onChange} /></div><ul>{entry.bullets.map(bullet => <li key={bullet.id}><EditableText className="bullet-text" element={bullet.content} selected={selectedId === bullet.content.id} onSelect={onSelect} onChange={onChange} /></li>)}</ul></article>;
}
