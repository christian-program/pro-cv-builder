export type TemplateId = 'modern' | 'classic' | 'creative' | 'minimalist' | 'executive';

export type FontStyle = 'sans' | 'serif' | 'mono';
export type Density = 'compact' | 'normal' | 'spacious';
export type PhotoShape = 'circle' | 'square' | 'rounded';
export type LanguageCode = 'fr' | 'en' | 'es';

export type SectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'interests';

export interface PersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1 to 5
  category?: string;
}

export interface Language {
  id: string;
  name: string;
  level: string; // e.g. 'Native', 'Fluent', 'Intermediate', 'Basic' or 'C2', 'B2', etc.
}

export interface Project {
  id: string;
  title: string;
  role?: string;
  link?: string;
  description: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface CVData {
  personal: PersonalDetails;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  interests: Interest[];
}

export interface CVConfig {
  templateId: TemplateId;
  primaryColor: string;
  fontStyle: FontStyle;
  density: Density;
  showPhoto: boolean;
  photoShape: PhotoShape;
  sectionOrder: SectionId[];
}
