import type { ReactNode } from 'react';

export function EditorLayout({ toolbar, controls, children }: { toolbar: ReactNode; controls: ReactNode; children: ReactNode }) {
  return <main className="workspace-shell"><div className="workspace-toolbar-wrap">{toolbar}</div><div className="editor-layout"><aside className="controls-panel">{controls}</aside><section className="preview-panel">{children}</section></div></main>;
}
