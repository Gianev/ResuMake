import type { TextAlignment, TextElement, TextFormatting } from '../../models/ResumeElement';

interface TextToolbarProps {
  element: TextElement;
  defaultFontSize: number;
  onUpdate: (update: Partial<TextFormatting>) => void;
}

export function TextToolbar({ element, defaultFontSize, onUpdate }: TextToolbarProps) {
  const format = element.formatting ?? {};
  const alignment: TextAlignment = format.alignment ?? 'left';
  const currentSize = format.fontSize ?? defaultFontSize;
  return <div className="text-toolbar" role="toolbar" aria-label="Text formatting">
    <select value={format.fontFamily ?? 'Arial'} onChange={event => onUpdate({ fontFamily: event.target.value })} aria-label="Font family"><option>Arial</option><option>Georgia</option><option>Times New Roman</option><option>Helvetica</option></select>
    <select value={currentSize} onChange={event => onUpdate({ fontSize: Number(event.target.value) })} aria-label="Font size">{[8, 8.3, 9, 9.2, 9.4, 10, 11, 12, 14, 16, 16.5, 18, 20].map(size => <option key={size} value={size}>{size} pt</option>)}</select>
    <button className={format.bold ? 'active' : ''} onClick={() => onUpdate({ bold: !format.bold })} aria-label="Bold"><strong>B</strong></button>
    <button className={format.italic ? 'active' : ''} onClick={() => onUpdate({ italic: !format.italic })} aria-label="Italic"><em>I</em></button>
    {(['left', 'center', 'right'] as TextAlignment[]).map(option => <button key={option} className={alignment === option ? 'active alignment' : 'alignment'} onClick={() => onUpdate({ alignment: option })} aria-label={`Align ${option}`}>{option === 'left' ? '≡' : option === 'center' ? '☰' : '≡'}</button>)}
  </div>;
}
