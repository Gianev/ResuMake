import { useState } from 'react';
import { EditorLayout } from './components/editor/EditorLayout';
import { WorkspaceToolbar } from './components/editor/WorkspaceToolbar';
import { PageControls } from './components/controls/PageControls';
import { ResumePage } from './components/resume/ResumePage';
import { useResumeEditor } from './state/useResumeEditor';
import { downloadRenderedResumePdf } from './pdf/exportRenderedPdf';
import { downloadResumeLatex } from './latex/generateLatex';
import { AiAssistant } from './components/assistant/AiAssistant';

export default function App() {
  const editor = useResumeEditor();
  const [assistantOpen, setAssistantOpen] = useState(false);
  return <EditorLayout toolbar={<WorkspaceToolbar selectedEntry={editor.selectedEntry} entryCount={editor.selectedEntry ? editor.document[editor.selectedEntry.kind].entries.length : 0} onAddBullet={editor.addBullet} onDuplicateEntry={editor.duplicateSelectedEntry} onDeleteEntry={editor.deleteSelectedEntry} onMoveEntry={editor.moveSelectedEntry} documentName={editor.document.header.name.content || 'Untitled'} assistantOpen={assistantOpen} onToggleAssistant={() => setAssistantOpen(open => !open)} onAddEducation={editor.addEducation} onAddExperience={editor.addExperience} onAddProject={editor.addProject} onDownload={() => void downloadRenderedResumePdf(editor.document)} onDownloadLatex={() => downloadResumeLatex(editor.document)} />} controls={<PageControls onSettingsChange={editor.updateSettings} onReorderSection={editor.reorderSection} document={editor.document} onMarginChange={editor.updateMargin} />}>{assistantOpen && <div className="assistant-banner"><AiAssistant document={editor.document} selectedId={editor.selectedId} onApply={editor.updateTextContent} /></div>}<div className="preview-topbar"><span><i className="live-dot" />Interactive canvas</span><span>Click text to type &middot; Drag blue guides</span></div><ResumePage {...editor} /></EditorLayout>;
}


