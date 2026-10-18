export type LetterType = 'motivation' | 'demande_emploi';
export type LetterTone = 'formel' | 'dynamique' | 'convaincant';

export type LetterTemplateId = 'minimaliste' | 'moderne' | 'classique';
export type LetterFont = 'sans' | 'serif' | 'mono' | 'geometric';
export type LetterSpacing = 'compact' | 'normal' | 'spacious';
export type LetterFontSize = 'sm' | 'base' | 'lg';
export type LetterMargin = 'compact' | 'normal' | 'spacious';

export interface LetterItem {
  id: string;
  userId: string;
  cvId: string;
  type: LetterType;
  entreprise: string;
  poste: string;
  contenu: string;
  langue: string;
  tone?: LetterTone;
  notes?: string;
  recipientName?: string;
  recipientAddress?: string;
  signatureImageUrl?: string | null;
  templateId?: LetterTemplateId;
  fontFamily?: LetterFont;
  spacing?: LetterSpacing;
  fontSize?: LetterFontSize;
  margin?: LetterMargin;
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LetterGenerationParams {
  cvId: string;
  type: LetterType;
  entreprise: string;
  poste: string;
  tone?: LetterTone;
  notes?: string;
  recipientName?: string;
  recipientAddress?: string;
  templateId?: LetterTemplateId;
}
