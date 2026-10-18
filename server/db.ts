import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  resetToken?: string | null;
  resetTokenExpiry?: number | null;
  aiSuggestionsUsedToday: number;
  lastAiResetDate: string;
  signatureImageUrl?: string | null;
}

export interface CVRecord {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  data: any;
  config: any;
}

export type LetterType = 'motivation' | 'demande_emploi';

export interface LetterRecord {
  id: string;
  userId: string;
  cvId: string;
  type: LetterType;
  entreprise: string;
  poste: string;
  contenu: string;
  langue: string;
  tone?: 'formel' | 'dynamique' | 'convaincant';
  notes?: string;
  recipientName?: string;
  recipientAddress?: string;
  signatureImageUrl?: string | null;
  templateId?: 'minimaliste' | 'moderne' | 'classique';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'geometric';
  spacing?: 'compact' | 'normal' | 'spacious';
  fontSize?: 'sm' | 'base' | 'lg';
  margin?: 'compact' | 'normal' | 'spacious';
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  cvs: CVRecord[];
  letters: LetterRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class Database {
  private data: DatabaseSchema = { users: [], cvs: [], letters: [] };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        this.data = {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          cvs: Array.isArray(parsed.cvs) ? parsed.cvs : [],
          letters: Array.isArray(parsed.letters) ? parsed.letters : [],
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Failed to initialize database, using in-memory store:', e);
      this.data = { users: [], cvs: [], letters: [] };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  // --- User Operations ---

  async createUser(email: string, passwordPlain: string, name: string): Promise<UserRecord> {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const now = new Date().toISOString();

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
      aiSuggestionsUsedToday: 0,
      lastAiResetDate: now.slice(0, 10),
      signatureImageUrl: null,
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  findUserByEmail(email: string): UserRecord | null {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id: string): UserRecord | null {
    return this.data.users.find((u) => u.id === id) || null;
  }

  async verifyPassword(user: UserRecord, passwordPlain: string): Promise<boolean> {
    return bcrypt.compare(passwordPlain, user.passwordHash);
  }

  createPasswordResetToken(email: string): { user: UserRecord; resetToken: string } {
    const user = this.findUserByEmail(email);
    if (!user) {
      throw new Error('Aucun compte associé à cette adresse e-mail');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    user.updatedAt = new Date().toISOString();

    this.save();
    return { user, resetToken };
  }

  async resetPassword(token: string, newPasswordPlain: string): Promise<UserRecord> {
    const user = this.data.users.find(
      (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now()
    );

    if (!user) {
      throw new Error('Lien de réinitialisation invalide ou expiré');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPasswordPlain, salt);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.updatedAt = new Date().toISOString();

    this.save();
    return user;
  }

  updateUserSignature(userId: string, signatureImageUrl: string | null): UserRecord {
    const user = this.findUserById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    user.signatureImageUrl = signatureImageUrl;
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  deleteUser(userId: string): boolean {
    const initialUsersCount = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    // Also remove their CVs and letters
    this.data.cvs = this.data.cvs.filter((cv) => cv.userId !== userId);
    this.data.letters = this.data.letters.filter((l) => l.userId !== userId);
    const deleted = this.data.users.length < initialUsersCount;
    if (deleted) this.save();
    return deleted;
  }

  checkAndIncrementAiQuota(userId: string, dailyLimit = 50): { allowed: boolean; remaining: number } {
    const user = this.findUserById(userId);
    if (!user) return { allowed: false, remaining: 0 };

    const today = new Date().toISOString().slice(0, 10);
    if (user.lastAiResetDate !== today) {
      user.aiSuggestionsUsedToday = 0;
      user.lastAiResetDate = today;
    }

    if (user.aiSuggestionsUsedToday >= dailyLimit) {
      return { allowed: false, remaining: 0 };
    }

    user.aiSuggestionsUsedToday += 1;
    this.save();
    return {
      allowed: true,
      remaining: Math.max(0, dailyLimit - user.aiSuggestionsUsedToday),
    };
  }

  // --- CV Operations ---

  getUserCVs(userId: string): CVRecord[] {
    return this.data.cvs
      .filter((cv) => cv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getCVById(id: string, userId: string): CVRecord | null {
    return this.data.cvs.find((cv) => cv.id === id && cv.userId === userId) || null;
  }

  createCV(
    userId: string,
    data: any,
    config: any,
    title = 'Mon CV',
    templateId = 'modern'
  ): CVRecord {
    const now = new Date().toISOString();
    const newCv: CVRecord = {
      id: crypto.randomUUID(),
      userId,
      title,
      templateId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      data,
      config,
    };

    this.data.cvs.push(newCv);
    this.save();
    return newCv;
  }

  updateCV(
    id: string,
    userId: string,
    updates: Partial<{
      title: string;
      templateId: string;
      status: 'draft' | 'completed';
      data: any;
      config: any;
    }>
  ): CVRecord {
    const cv = this.getCVById(id, userId);
    if (!cv) {
      throw new Error('CV non trouvé ou accès non autorisé');
    }

    if (updates.title !== undefined) cv.title = updates.title;
    if (updates.templateId !== undefined) {
      cv.templateId = updates.templateId;
      if (cv.config) cv.config.templateId = updates.templateId;
    }
    if (updates.status !== undefined) cv.status = updates.status;
    if (updates.data !== undefined) cv.data = updates.data;
    if (updates.config !== undefined) cv.config = updates.config;

    cv.updatedAt = new Date().toISOString();
    this.save();
    return cv;
  }

  duplicateCV(id: string, userId: string): CVRecord {
    const source = this.getCVById(id, userId);
    if (!source) {
      throw new Error('CV à dupliquer non trouvé');
    }

    const now = new Date().toISOString();
    const copy: CVRecord = {
      id: crypto.randomUUID(),
      userId,
      title: `${source.title} (Copie)`,
      templateId: source.templateId,
      status: source.status,
      createdAt: now,
      updatedAt: now,
      data: JSON.parse(JSON.stringify(source.data)),
      config: JSON.parse(JSON.stringify(source.config)),
    };

    this.data.cvs.push(copy);
    this.save();
    return copy;
  }

  deleteCV(id: string, userId: string): boolean {
    const initialLen = this.data.cvs.length;
    this.data.cvs = this.data.cvs.filter((cv) => !(cv.id === id && cv.userId === userId));
    const deleted = this.data.cvs.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Letter Operations ---

  getUserLetters(userId: string): LetterRecord[] {
    return this.data.letters
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getLetterById(id: string, userId: string): LetterRecord | null {
    return this.data.letters.find((l) => l.id === id && l.userId === userId) || null;
  }

  createLetter(
    userId: string,
    data: {
      cvId: string;
      type: LetterType;
      entreprise: string;
      poste: string;
      contenu: string;
      langue?: string;
      tone?: 'formel' | 'dynamique' | 'convaincant';
      notes?: string;
      recipientName?: string;
      recipientAddress?: string;
      signatureImageUrl?: string | null;
      templateId?: 'minimaliste' | 'moderne' | 'classique';
      fontFamily?: 'sans' | 'serif' | 'mono' | 'geometric';
      spacing?: 'compact' | 'normal' | 'spacious';
      fontSize?: 'sm' | 'base' | 'lg';
      margin?: 'compact' | 'normal' | 'spacious';
      accentColor?: string;
    }
  ): LetterRecord {
    const now = new Date().toISOString();
    const newLetter: LetterRecord = {
      id: crypto.randomUUID(),
      userId,
      cvId: data.cvId,
      type: data.type,
      entreprise: data.entreprise.trim(),
      poste: data.poste.trim(),
      contenu: data.contenu.trim(),
      langue: data.langue || 'fr',
      tone: data.tone || 'formel',
      notes: data.notes || '',
      recipientName: data.recipientName || '',
      recipientAddress: data.recipientAddress || '',
      signatureImageUrl: data.signatureImageUrl || null,
      templateId: data.templateId || 'moderne',
      fontFamily: data.fontFamily || 'sans',
      spacing: data.spacing || 'normal',
      fontSize: data.fontSize || 'base',
      margin: data.margin || 'normal',
      accentColor: data.accentColor || '#2563eb',
      createdAt: now,
      updatedAt: now,
    };

    this.data.letters.push(newLetter);
    this.save();
    return newLetter;
  }

  updateLetter(
    id: string,
    userId: string,
    updates: Partial<{
      entreprise: string;
      poste: string;
      contenu: string;
      langue: string;
      tone: 'formel' | 'dynamique' | 'convaincant';
      notes: string;
      recipientName: string;
      recipientAddress: string;
      signatureImageUrl: string | null;
      templateId: 'minimaliste' | 'moderne' | 'classique';
      fontFamily: 'sans' | 'serif' | 'mono' | 'geometric';
      spacing: 'compact' | 'normal' | 'spacious';
      fontSize: 'sm' | 'base' | 'lg';
      margin: 'compact' | 'normal' | 'spacious';
      accentColor: string;
    }>
  ): LetterRecord {
    const letter = this.getLetterById(id, userId);
    if (!letter) {
      throw new Error('Lettre non trouvée ou accès non autorisé');
    }

    if (updates.entreprise !== undefined) letter.entreprise = updates.entreprise;
    if (updates.poste !== undefined) letter.poste = updates.poste;
    if (updates.contenu !== undefined) letter.contenu = updates.contenu;
    if (updates.langue !== undefined) letter.langue = updates.langue;
    if (updates.tone !== undefined) letter.tone = updates.tone;
    if (updates.notes !== undefined) letter.notes = updates.notes;
    if (updates.recipientName !== undefined) letter.recipientName = updates.recipientName;
    if (updates.recipientAddress !== undefined) letter.recipientAddress = updates.recipientAddress;
    if (updates.signatureImageUrl !== undefined) letter.signatureImageUrl = updates.signatureImageUrl;
    if (updates.templateId !== undefined) letter.templateId = updates.templateId;
    if (updates.fontFamily !== undefined) letter.fontFamily = updates.fontFamily;
    if (updates.spacing !== undefined) letter.spacing = updates.spacing;
    if (updates.fontSize !== undefined) letter.fontSize = updates.fontSize;
    if (updates.margin !== undefined) letter.margin = updates.margin;
    if (updates.accentColor !== undefined) letter.accentColor = updates.accentColor;

    letter.updatedAt = new Date().toISOString();
    this.save();
    return letter;
  }

  duplicateLetter(id: string, userId: string): LetterRecord {
    const source = this.getLetterById(id, userId);
    if (!source) {
      throw new Error('Lettre à dupliquer non trouvée');
    }

    const now = new Date().toISOString();
    const copy: LetterRecord = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      entreprise: `${source.entreprise} (Copie)`,
      createdAt: now,
      updatedAt: now,
    };

    this.data.letters.push(copy);
    this.save();
    return copy;
  }

  deleteLetter(id: string, userId: string): boolean {
    const initialLen = this.data.letters.length;
    this.data.letters = this.data.letters.filter((l) => !(l.id === id && l.userId === userId));
    const deleted = this.data.letters.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

export const db = new Database();
