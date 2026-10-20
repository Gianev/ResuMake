import type { ResumeDocument } from '../../models/ResumeDocument';
import { ResumeSection } from './ResumeSection';
import { EditableText } from '../editor/EditableText';

interface Props { skills: ResumeDocument['technicalSkills']; selectedId: string | null; onSelect: (id: string) => void; onChange: (id: string, content: string) => void; }
export function ResumeSkills({ skills, selectedId, onSelect, onChange }: Props) {
  return <ResumeSection title={skills.title} selectedId={selectedId} onSelect={onSelect} onChange={onChange}><div className="skills-list">{skills.categories.map(category => <p key={category.id}><EditableText element={category.label} selected={selectedId === category.label.id} onSelect={onSelect} onChange={onChange} /><EditableText element={category.skills} selected={selectedId === category.skills.id} onSelect={onSelect} onChange={onChange} /></p>)}</div></ResumeSection>;
}
