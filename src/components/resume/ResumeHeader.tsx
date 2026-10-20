import type { ResumeDocument } from '../../models/ResumeDocument';
import { EditableText } from '../editor/EditableText';

interface Props { header: ResumeDocument['header']; selectedId: string | null; onSelect: (id: string) => void; onChange: (id: string, content: string) => void; }
export function ResumeHeader({ header, selectedId, onSelect, onChange }: Props) {
  return <header className="resume-header"><EditableText as="h1" element={header.name} selected={selectedId === header.name.id} onSelect={onSelect} onChange={onChange} /><div>{header.contactInfo.map((item, index) => <span key={item.id}><EditableText element={item} selected={selectedId === item.id} onSelect={onSelect} onChange={onChange} />{index < header.contactInfo.length - 1 && <b> | </b>}</span>)}</div></header>;
}
