import { useState } from 'react';
import { defaultSectionOrder, type SectionKey } from '../../models/ResumeDocument';
import type { ResumeDocument } from '../../models/ResumeDocument';
import { formatInches } from '../../utils/measurements';

type MarginSide = keyof ResumeDocument['page']['margins'];
interface Props { onSettingsChange: (update: Partial<ResumeDocument['settings']>) => void; onReorderSection: (source: SectionKey, target: SectionKey) => void; document: ResumeDocument; onMarginChange: (side: MarginSide, value: number) => void; }
export function PageControls({ document, onSettingsChange, onReorderSection, onMarginChange }: Props) {
  const [dragged, setDragged] = useState<SectionKey | null>(null);
  const [dropTarget, setDropTarget] = useState<SectionKey | null>(null);
  const order = document.sectionOrder ?? defaultSectionOrder;
  const { margins } = document.page;
  return <>
    <div className="inspector-heading"><span>Inspector</span><span title="Edits are kept only in this tab until you refresh or close it.">Not saved</span></div>
    <section className="control-group"><h2>Page settings</h2><div className="paper-row"><span>Letter</span><span>8.5 × 11 in</span></div></section>
    <section className="control-group"><h2>Margins <span className="now">Live</span></h2>{(Object.entries(margins) as [MarginSide, number][]).map(([side, value]) => <label className="field" key={side}><span>{side[0].toUpperCase() + side.slice(1)}</span><input type="number" min="0.2" max="4" step="0.05" value={value.toFixed(2)} onChange={event => onMarginChange(side, Number(event.target.value))} aria-label={`${side} margin in inches`} /><em>{formatInches(value)}</em></label>)}</section>
    <section className="control-group"><h2>Typography</h2><label className="field"><span>Font family</span><select value={document.settings.fontFamily} onChange={event => onSettingsChange({ fontFamily: event.target.value })}>{Array.from(new Set([document.settings.fontFamily, 'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Calibri', 'Courier New'])).map(font => <option key={font}>{font}</option>)}</select></label><label className="field"><span>Base size (pt)</span><input aria-label="Base font size in points" type="number" min="6" max="24" step="0.1" value={document.settings.baseFontSize} onChange={event => { const value = event.target.valueAsNumber; if (value >= 6 && value <= 24) onSettingsChange({ baseFontSize: value }); }} /></label><label className="field"><span>Line spacing</span><input aria-label="Line spacing" type="number" min="0.8" max="2.5" step="0.05" value={document.settings.lineSpacing} onChange={event => { const value = event.target.valueAsNumber; if (value >= 0.8 && value <= 2.5) onSettingsChange({ lineSpacing: value }); }} /></label></section>
    <section className="control-group"><h2>Section order</h2><p className="editing-hint">Drag sections up or down to reorder.</p><div className="section-order">{order.map((key, index) => <div key={key} className={`section-order-row${dropTarget === key ? ' is-drop-target' : ''}`} draggable onDragStart={event => { setDragged(key); event.dataTransfer.setData('text/plain', key); event.dataTransfer.effectAllowed = 'move'; }} onDragOver={event => { if (dragged) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(key); } }} onDrop={event => { event.preventDefault(); if (dragged) onReorderSection(dragged, key); setDragged(null); setDropTarget(null); }} onDragEnd={() => { setDragged(null); setDropTarget(null); }}><span aria-hidden="true">&#x2630;</span><span className="section-order-label">{document[key].title.content}</span><button aria-label={`Move ${document[key].title.content} up`} disabled={index === 0} onClick={() => onReorderSection(key, order[index - 1])}>&uarr;</button><button aria-label={`Move ${document[key].title.content} down`} disabled={index === order.length - 1} onClick={() => onReorderSection(key, order[index + 1])}>&darr;</button></div>)}</div></section>


    <p className="editing-hint">Tip: click text to type. Use the top bar to add content, and export. Download your work before closing or refreshing this tab.</p>
  </>;
}
