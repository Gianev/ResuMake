import type { ReactNode } from 'react';
import type { TextElement } from '../../models/ResumeElement';
import { EditableText } from '../editor/EditableText';

export function ResumeSection({ title, children, selectedId, onSelect, onChange }: { title: TextElement; children: ReactNode; selectedId: string | null; onSelect: (id: string) => void; onChange: (id: string, content: string) => void }) {
  return <section className="resume-section"><EditableText as="h2" element={title} selected={selectedId === title.id} onSelect={onSelect} onChange={onChange} />{children}</section>;
}
