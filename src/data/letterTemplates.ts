import { LetterTemplateId, LetterFont, LetterSpacing, LetterFontSize, LetterMargin } from '../types/letter';

export interface LetterTemplateDefinition {
  id: LetterTemplateId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  previewBg: string;
  defaultFont: LetterFont;
  defaultSpacing: LetterSpacing;
  defaultMargin: LetterMargin;
  defaultAccent: string;
}

export const LETTER_TEMPLATES: LetterTemplateDefinition[] = [
  {
    id: 'minimaliste',
    name: 'Minimaliste',
    tagline: 'Éditorial, épuré & contemporain',
    description: 'Une mise en page suisse aérée, sans fioritures, valorisant la clarté du propos et le rythme typographique.',
    badge: 'Design épuré',
    previewBg: 'bg-slate-50 border-slate-200',
    defaultFont: 'sans',
    defaultSpacing: 'spacious',
    defaultMargin: 'spacious',
    defaultAccent: '#0f172a',
  },
  {
    id: 'moderne',
    name: 'Moderne',
    tagline: 'Dynamique, percutant & structuré',
    description: 'Bandeau d’accent coloré, encart objet stylisé et hiérarchie visuelle tranchée pour les entreprises innovantes.',
    badge: 'Recommandé',
    previewBg: 'bg-blue-50/60 border-blue-200',
    defaultFont: 'sans',
    defaultSpacing: 'normal',
    defaultMargin: 'normal',
    defaultAccent: '#2563eb',
  },
  {
    id: 'classique',
    name: 'Classique',
    tagline: 'Traditionnel, protocolaire & élégant',
    description: 'Respect strict des normes épistolaires françaises (adresses opposées, objet solennel, formule de politesse et signature soignée).',
    badge: 'Institutionnel',
    previewBg: 'bg-stone-50 border-stone-200',
    defaultFont: 'serif',
    defaultSpacing: 'normal',
    defaultMargin: 'normal',
    defaultAccent: '#334155',
  },
];

export interface LetterFontOption {
  id: LetterFont;
  name: string;
  fontFamily: string;
  sample: string;
}

export const LETTER_FONTS: LetterFontOption[] = [
  {
    id: 'sans',
    name: 'Sans Moderne',
    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    sample: 'Aa Jakarta Sans',
  },
  {
    id: 'serif',
    name: 'Serif Littéraire',
    fontFamily: "'Merriweather', 'Playfair Display', Georgia, serif",
    sample: 'Aa Merriweather',
  },
  {
    id: 'geometric',
    name: 'Inter Neutre',
    fontFamily: "'Inter', system-ui, sans-serif",
    sample: 'Aa Inter Pro',
  },
  {
    id: 'mono',
    name: 'Monospace Tech',
    fontFamily: "'JetBrains Mono', Menlo, monospace",
    sample: 'Aa JetBrains',
  },
];

export interface LetterSpacingOption {
  id: LetterSpacing;
  label: string;
  lineHeight: number;
  paragraphGap: string;
  cssLineHeight: string;
}

export const LETTER_SPACINGS: LetterSpacingOption[] = [
  {
    id: 'compact',
    label: 'Compact',
    lineHeight: 1.45,
    paragraphGap: '10px',
    cssLineHeight: '1.45',
  },
  {
    id: 'normal',
    label: 'Normal',
    lineHeight: 1.65,
    paragraphGap: '14px',
    cssLineHeight: '1.65',
  },
  {
    id: 'spacious',
    label: 'Aéré',
    lineHeight: 1.85,
    paragraphGap: '18px',
    cssLineHeight: '1.85',
  },
];

export interface LetterMarginOption {
  id: LetterMargin;
  label: string;
  paddingMm: string;
}

export const LETTER_MARGINS: LetterMarginOption[] = [
  { id: 'compact', label: 'Étroites (18mm)', paddingMm: '18mm' },
  { id: 'normal', label: 'Standard (24mm)', paddingMm: '24mm' },
  { id: 'spacious', label: 'Larges (30mm)', paddingMm: '30mm' },
];

export interface LetterFontSizeOption {
  id: LetterFontSize;
  label: string;
  ptSize: string;
}

export const LETTER_FONT_SIZES: LetterFontSizeOption[] = [
  { id: 'sm', label: 'Petit (9.5pt)', ptSize: '9.5pt' },
  { id: 'base', label: 'Standard (10.5pt)', ptSize: '10.5pt' },
  { id: 'lg', label: 'Grand (11.5pt)', ptSize: '11.5pt' },
];

export const LETTER_ACCENT_COLORS = [
  { name: 'Bleu Cobalt', value: '#2563eb' },
  { name: 'Indigo Royal', value: '#4f46e5' },
  { name: 'Ardoise / Noir', value: '#0f172a' },
  { name: 'Émeraude Sobre', value: '#059669' },
  { name: 'Bordeaux Profond', value: '#991b1b' },
  { name: 'Ambre Chaud', value: '#b45309' },
];
