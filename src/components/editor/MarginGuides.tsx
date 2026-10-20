import { useRef } from 'react';
import type { PointerEvent } from 'react';
import type { ResumeDocument } from '../../models/ResumeDocument';
import { inchesToPixels, pixelsToInches } from '../../utils/measurements';

type MarginSide = keyof ResumeDocument['page']['margins'];
interface MarginGuidesProps { document: ResumeDocument; onChange: (side: MarginSide, value: number) => void; }

export function MarginGuides({ document, onChange }: MarginGuidesProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const drag = (side: MarginSide) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const move = (moveEvent: globalThis.PointerEvent) => {
      const rect = pageRef.current?.getBoundingClientRect(); if (!rect) return;
      const isHorizontal = side === 'left' || side === 'right';
      const rawPixels = side === 'left' ? moveEvent.clientX - rect.left : side === 'right' ? rect.right - moveEvent.clientX : side === 'top' ? moveEvent.clientY - rect.top : rect.bottom - moveEvent.clientY;
      const max = isHorizontal ? document.page.width / 2 - 0.2 : document.page.height / 2 - 0.2;
      onChange(side, Math.max(0.2, Math.min(max, pixelsToInches(rawPixels))));
    };
    const end = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); };
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end);
  };
  const margins = document.page.margins;
  return <div ref={pageRef} className="margin-guides" aria-label="Drag the blue guides to change the page margins">
    <button className="margin-handle top" style={{ top: inchesToPixels(margins.top) }} onPointerDown={drag('top')} aria-label="Drag top margin" />
    <button className="margin-handle bottom" style={{ bottom: inchesToPixels(margins.bottom) }} onPointerDown={drag('bottom')} aria-label="Drag bottom margin" />
    <button className="margin-handle left" style={{ left: inchesToPixels(margins.left) }} onPointerDown={drag('left')} aria-label="Drag left margin" />
    <button className="margin-handle right" style={{ right: inchesToPixels(margins.right) }} onPointerDown={drag('right')} aria-label="Drag right margin" />
  </div>;
}
