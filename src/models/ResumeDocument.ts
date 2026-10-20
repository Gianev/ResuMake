import type { ResumeBullet, TextElement } from './ResumeElement';

export interface ResumeEntry {
  id: string;
  organization: TextElement;
  role: TextElement;
  location?: TextElement;
  dates: TextElement;
  bullets: ResumeBullet[];
}

export interface ProjectEntry {
  id: string;
  name: TextElement;
  technologies: TextElement;
  dates: TextElement;
  bullets: ResumeBullet[];
}

export interface ResumeSection<T = ResumeEntry | ProjectEntry> {
  id: string;
  title: TextElement;
  spacingAfter: number;
  entrySpacing: number;
  entries: T[];
}

export interface SkillsCategory {
  id: string;
  label: TextElement;
  skills: TextElement;
}

export type SectionKey = 'education' | 'experience' | 'projects' | 'technicalSkills';
export const defaultSectionOrder: SectionKey[] = ['education', 'experience', 'projects', 'technicalSkills'];

export interface ResumeDocument {
  sectionOrder?: SectionKey[];
  page: {
    width: number;
    height: number;
    margins: { top: number; right: number; bottom: number; left: number };
  };
  settings: { fontFamily: string; baseFontSize: number; lineSpacing: number };
  header: { name: TextElement; contactInfo: TextElement[] };
  education: ResumeSection<ResumeEntry>;
  experience: ResumeSection<ResumeEntry>;
  projects: ResumeSection<ProjectEntry>;
  technicalSkills: { id: string; title: TextElement; spacingAfter: number; categories: SkillsCategory[] };
}
