export type TextAlignment = 'left' | 'center' | 'right';

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  alignment?: TextAlignment;
  fontFamily?: string;
}

export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  formatting?: TextFormatting;
}

export interface ResumeBullet {
  id: string;
  content: TextElement;
}
