import type { CSSProperties, ElementType, FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { TextElement } from '../../models/ResumeElement';

interface EditableTextProps {
  element: TextElement;
  selected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, content: string) => void;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

export function EditableText({ element, selected, onSelect, onChange, as: Tag = 'span', className, children }: EditableTextProps) {
  const formatting = element.formatting ?? {};
  const style: CSSProperties = {
    fontWeight: formatting.bold ? 700 : undefined,
    fontStyle: formatting.italic ? 'italic' : undefined,
    fontSize: formatting.fontSize ? `${formatting.fontSize}pt` : undefined,
    fontFamily: formatting.fontFamily,
    textAlign: formatting.alignment,
  };
  const select = (event: MouseEvent) => { event.stopPropagation(); onSelect(element.id); };
  // Commit on blur—not every keystroke—so React never resets the browser's caret while typing.
  const commit = (event: FocusEvent<HTMLElement>) => onChange(element.id, event.currentTarget.textContent ?? '');
  const blockNewline = (event: KeyboardEvent<HTMLElement>) => { if (event.key === 'Enter') event.preventDefault(); };
  return <Tag className={`editable-text${selected ? ' is-selected' : ''}${className ? ` ${className}` : ''}`} style={style} onClick={select} contentEditable suppressContentEditableWarning spellCheck onBlur={commit} onKeyDown={blockNewline} title="Click to edit">{children ?? element.content}</Tag>;
}
