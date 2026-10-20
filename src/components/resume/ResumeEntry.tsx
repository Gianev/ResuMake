import type { ResumeEntry as ResumeEntryModel } from '../../models/ResumeDocument';
import { EditableText } from '../editor/EditableText';

interface Props { entry: ResumeEntryModel; selectedId: string | null; onSelect: (id: string) => void; onChange: (id: string, content: string) => void; }
export function ResumeEntry({ entry, selectedId, onSelect, onChange }: Props) {
  return <article className="resume-entry"><div className="entry-topline"><EditableText element={entry.organization} selected={selectedId === entry.organization.id} onSelect={onSelect} onChange={onChange} />{entry.location && <EditableText element={entry.location} selected={selectedId === entry.location.id} onSelect={onSelect} onChange={onChange} />}</div><div className="entry-topline entry-role"><EditableText element={entry.role} selected={selectedId === entry.role.id} onSelect={onSelect} onChange={onChange} /><EditableText element={entry.dates} selected={selectedId === entry.dates.id} onSelect={onSelect} onChange={onChange} /></div>{entry.bullets.length > 0 && <ul>{entry.bullets.map(bullet => <li key={bullet.id}><EditableText className="bullet-text" element={bullet.content} selected={selectedId === bullet.content.id} onSelect={onSelect} onChange={onChange} /></li>)}</ul>}</article>;
}
