import { useCallback, useState } from 'react';
import type { ProjectEntry, ResumeDocument, ResumeEntry } from '../models/ResumeDocument';
import type { TextFormatting } from '../models/ResumeElement';
import { initialResume } from './resumeStore';
import { defaultSectionOrder, type SectionKey } from '../models/ResumeDocument';

type MarginSide = keyof ResumeDocument['page']['margins'];
export type EntryKind = 'education' | 'experience' | 'projects';
export interface SelectedEntry { kind: EntryKind; index: number; label: string; }
type AnyEntry = ResumeEntry | ProjectEntry;

function findTextElement(value: unknown, id: string): { content: string; formatting?: TextFormatting } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  if ('id' in value && (value as { id?: string }).id === id && 'type' in value) return value as unknown as { content: string; formatting?: TextFormatting };
  for (const child of Object.values(value)) {
    const found = findTextElement(child, id);
    if (found) return found;
  }
}

function containsId(value: unknown, id: string): boolean {
  if (!value || typeof value !== 'object') return false;
  if ('id' in value && (value as { id?: string }).id === id) return true;
  return Object.values(value).some(child => containsId(child, id));
}

function locateEntry(document: ResumeDocument, selectedId: string | null): SelectedEntry | null {
  if (!selectedId) return null;
  const groups: [EntryKind, AnyEntry[]][] = [
    ['education', document.education.entries], ['experience', document.experience.entries], ['projects', document.projects.entries],
  ];
  for (const [kind, entries] of groups) {
    const index = entries.findIndex(entry => containsId(entry, selectedId));
    if (index !== -1) return { kind, index, label: kind === 'projects' ? 'project' : kind === 'education' ? 'education entry' : 'experience role' };
  }
  return null;
}

function firstTextId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  if ('id' in value && 'type' in value) return (value as { id: string }).id;
  for (const child of Object.values(value)) { const result = firstTextId(child); if (result) return result; }
  return null;
}

function giveNewIds(value: unknown, token: string): unknown {
  if (Array.isArray(value)) return value.map(item => giveNewIds(item, token));
  if (!value || typeof value !== 'object') return value;
  const copy: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, item]) => { copy[key] = key === 'id' && typeof item === 'string' ? `${item}-${token}` : giveNewIds(item, token); });
  return copy;
}

export function useResumeEditor() {
  const [document, setDocument] = useState<ResumeDocument>(initialResume);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updateSettings = useCallback((update: Partial<ResumeDocument['settings']>) => {
    setDocument(current => ({ ...current, settings: { ...current.settings, ...update } }));
  }, []);

  const reorderSection = useCallback((source: SectionKey, target: SectionKey) => {
    setDocument(current => {
      const order = [...(current.sectionOrder ?? defaultSectionOrder)];
      const from = order.indexOf(source);
      const to = order.indexOf(target);
      if (from < 0 || to < 0 || from === to) return current;
      order.splice(from, 1);
      order.splice(to, 0, source);
      return { ...current, sectionOrder: order };
    });
  }, []);

  const updateMargin = useCallback((side: MarginSide, value: number) => {
    setDocument(current => ({ ...current, page: { ...current.page, margins: { ...current.page.margins, [side]: value } } }));
  }, []);

  const updateTextFormatting = useCallback((id: string, update: Partial<TextFormatting>) => {
    setDocument(current => {
      const next = structuredClone(current);
      const element = findTextElement(next, id);
      if (element) element.formatting = { ...element.formatting, ...update };
      return next;
    });
  }, []);

  const updateTextContent = useCallback((id: string, content: string) => {
    setDocument(current => {
      const next = structuredClone(current);
      const element = findTextElement(next, id);
      if (element) element.content = content.replace(/\n/g, ' ');
      return next;
    });
  }, []);

  const addExperience = useCallback(() => {
    const token = globalThis.crypto.randomUUID();
    const entryId = `experience-${token}`;
    setDocument(current => ({
      ...current,
      experience: {
        ...current.experience,
        entries: [...current.experience.entries, {
          id: entryId,
          organization: { id: `${entryId}-organization`, type: 'text', content: 'New Company', formatting: { bold: true } },
          role: { id: `${entryId}-role`, type: 'text', content: 'Role Title', formatting: { italic: true } },
          location: { id: `${entryId}-location`, type: 'text', content: 'City, ST' },
          dates: { id: `${entryId}-dates`, type: 'text', content: 'Month Year — Present' },
          bullets: [{ id: `${entryId}-bullet-1`, content: { id: `${entryId}-bullet-1-text`, type: 'text', content: 'Describe a measurable accomplishment or responsibility.' } }],
        }],
      },
    }));
    setSelectedId(`${entryId}-organization`);
  }, []);

  const addProject = useCallback(() => {
    const token = globalThis.crypto.randomUUID();
    const entryId = `project-${token}`;
    setDocument(current => ({
      ...current,
      projects: {
        ...current.projects,
        entries: [...current.projects.entries, {
          id: entryId,
          name: { id: `${entryId}-name`, type: 'text', content: 'New Project', formatting: { bold: true } },
          technologies: { id: `${entryId}-technologies`, type: 'text', content: 'Technology, Tools' },
          dates: { id: `${entryId}-dates`, type: 'text', content: 'Month Year — Month Year' },
          bullets: [{ id: `${entryId}-bullet-1`, content: { id: `${entryId}-bullet-1-text`, type: 'text', content: 'Describe the problem, your contribution, and the result.' } }],
        }],
      },
    }));
    setSelectedId(`${entryId}-name`);
  }, []);

  const addEducation = useCallback(() => {
    const token = globalThis.crypto.randomUUID(); const entryId = `education-${token}`;
    setDocument(current => ({ ...current, education: { ...current.education, entries: [...current.education.entries, {
      id: entryId,
      organization: { id: `${entryId}-organization`, type: 'text', content: 'University or School', formatting: { bold: true } },
      role: { id: `${entryId}-degree`, type: 'text', content: 'Degree, Major or Program', formatting: { italic: true } },
      location: { id: `${entryId}-location`, type: 'text', content: 'City, ST' },
      dates: { id: `${entryId}-dates`, type: 'text', content: 'Month Year — Month Year' },
      bullets: [{ id: `${entryId}-bullet-1`, content: { id: `${entryId}-bullet-1-text`, type: 'text', content: 'Add honors, relevant coursework, or an academic achievement.' } }],
    }] } }));
    setSelectedId(`${entryId}-organization`);
  }, []);

  const selectedEntry = locateEntry(document, selectedId);

  const addBullet = useCallback(() => {
    if (!selectedEntry) return;
    const token = globalThis.crypto.randomUUID(); const bulletId = `bullet-${token}`;
    setDocument(current => {
      const next = structuredClone(current);
      const entries = next[selectedEntry.kind].entries as AnyEntry[];
      entries[selectedEntry.index].bullets.push({ id: bulletId, content: { id: `${bulletId}-text`, type: 'text', content: 'Describe an accomplishment, contribution, or result.' } });
      return next;
    });
    setSelectedId(`${bulletId}-text`);
  }, [selectedEntry]);

  const deleteSelectedEntry = useCallback(() => {
    if (!selectedEntry) return;
    setDocument(current => ({ ...current, [selectedEntry.kind]: { ...current[selectedEntry.kind], entries: current[selectedEntry.kind].entries.filter((_, index) => index !== selectedEntry.index) } }));
    setSelectedId(null);
  }, [selectedEntry]);

  const duplicateSelectedEntry = useCallback(() => {
    if (!selectedEntry) return;
    const token = globalThis.crypto.randomUUID();
    setDocument(current => {
      const next = structuredClone(current);
      const entries = next[selectedEntry.kind].entries as AnyEntry[];
      const copy = giveNewIds(entries[selectedEntry.index], token) as AnyEntry;
      entries.splice(selectedEntry.index + 1, 0, copy);
      setSelectedId(firstTextId(copy));
      return next;
    });
  }, [selectedEntry]);

  const moveSelectedEntry = useCallback((direction: -1 | 1) => {
    if (!selectedEntry) return;
    const target = selectedEntry.index + direction;
    if (target < 0 || target >= document[selectedEntry.kind].entries.length) return;
    setDocument(current => {
      const next = structuredClone(current); const entries = next[selectedEntry.kind].entries as AnyEntry[];
      [entries[selectedEntry.index], entries[target]] = [entries[target], entries[selectedEntry.index]];
      return next;
    });
  }, [document, selectedEntry]);

  return { document, selectedId, selectedEntry, select: setSelectedId, updateSettings, reorderSection, updateMargin, updateTextFormatting, updateTextContent, addExperience, addProject, addEducation, addBullet, deleteSelectedEntry, duplicateSelectedEntry, moveSelectedEntry };
}
