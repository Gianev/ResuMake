import type { SelectedEntry } from '../../state/useResumeEditor';
import { useState } from 'react';
interface Props {
  selectedEntry: SelectedEntry | null;
  entryCount: number;
  onAddBullet: () => void;
  onDuplicateEntry: () => void;
  onDeleteEntry: () => void;
  onMoveEntry: (direction: -1 | 1) => void;
  documentName: string;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
  onAddEducation: () => void;
  onAddExperience: () => void;
  onAddProject: () => void;
  onDownload: () => void;
  onDownloadLatex: () => void;
}

export function WorkspaceToolbar({ documentName, assistantOpen, onToggleAssistant, onAddEducation, onAddExperience, onAddProject, onDownload, onDownloadLatex, selectedEntry, entryCount, onAddBullet, onDuplicateEntry, onDeleteEntry, onMoveEntry }: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const add = (action: () => void) => { action(); setAddMenuOpen(false); };
  return <header className="workspace-toolbar">
    <div className="workspace-brand"><span className="brand-mark">L</span><strong>Resume Studio</strong></div>
    <div className="toolbar-divider" />
    <div className="document-identity"><span className="document-name">{documentName}</span><span className="document-kind">Resume</span></div>
    <div className="toolbar-spacer" />
    <div className="add-menu"><button className="toolbar-add" onClick={() => setAddMenuOpen(open => !open)} aria-expanded={addMenuOpen}>+ Add content <span>&#x2304;</span></button>{addMenuOpen && <div className="add-menu-popover"><button onClick={() => add(onAddEducation)}><b>Education</b><small>School, degree, and achievements</small></button><button onClick={() => add(onAddExperience)}><b>Experience</b><small>Role, dates, and bullet points</small></button><button onClick={() => add(onAddProject)}><b>Project</b><small>Project details and outcomes</small></button></div>}</div>
    <details key={selectedEntry ? `${selectedEntry.kind}-${selectedEntry.index}` : 'none'} className="entry-menu" onToggle={event => { if (event.currentTarget.open) setAddMenuOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}>
      <summary className={`toolbar-add${selectedEntry ? ' has-selection' : ''}`} title={selectedEntry ? `Actions for selected ${selectedEntry.label}` : 'Click text in an entry to manage it'}>{selectedEntry ? `Selected ${selectedEntry.label}` : 'Entry actions'} <span aria-hidden="true">&#x2304;</span></summary>
      <div className="add-menu-popover entry-menu-popover">
        <p>{selectedEntry ? `Edit the selected ${selectedEntry.label}.` : 'Select text in an education, experience, or project entry first.'}</p>
        <button disabled={!selectedEntry} onClick={onAddBullet}><b>+ Add bullet</b><small>Add a point to this entry</small></button>
        <button disabled={!selectedEntry} onClick={onDuplicateEntry}><b>Duplicate entry</b></button>
        <button disabled={!selectedEntry || selectedEntry.index === 0} onClick={() => onMoveEntry(-1)}><b>&uarr; Move up</b></button>
        <button disabled={!selectedEntry || selectedEntry.index === entryCount - 1} onClick={() => onMoveEntry(1)}><b>&darr; Move down</b></button>
        <div className="entry-menu-divider" />
        <button className="entry-menu-delete" disabled={!selectedEntry} onClick={onDeleteEntry}><b>Delete selected entry</b></button>
      </div>
    </details>
    <button className={`toolbar-ai${assistantOpen ? ' is-active' : ''}`} onClick={onToggleAssistant} aria-expanded={assistantOpen}>&#x2726; AI coach</button>
    <button className="toolbar-add" onClick={onDownloadLatex} title="Export LaTeX source for Overleaf">Download .tex</button>
    <button className="toolbar-export" onClick={onDownload}>&#x2193; Download PDF</button>
  </header>;
}



