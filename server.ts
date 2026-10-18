import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { db, UserRecord, LetterType } from './server/db.js';
import {
  generateWritingSuggestions,
  generateCoverLetter,
  regenerateLetterParagraph,
} from './server/ai.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cv_builder_jwt_secret_default_2026';

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Extend Express Request for authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

// Auth Middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
}

// Optional Auth (for AI suggestions where guests get a public limited pool)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.findUserById(decoded.userId);
      if (user) req.user = user;
    } catch {
      // ignore
    }
  }
  next();
}

// Helper to format user response without password hash
function formatUserResponse(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    aiSuggestionsUsedToday: user.aiSuggestionsUsedToday,
    signatureImageUrl: user.signatureImageUrl || null,
  };
}

// ==========================================
// 1. AUTHENTICATION & USER ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    const newUser = await db.createUser(email, password, name);
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '14d' });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: formatUserResponse(newUser),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de l’inscription.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides (email ou mot de passe incorrect).' });
    }

    const isValid = await db.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides (email ou mot de passe incorrect).' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '14d' });

    res.json({
      message: 'Connexion réussie',
      token,
      user: formatUserResponse(user),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur lors de la connexion.' });
  }
});

// Me / Current User Profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: formatUserResponse(req.user!),
  });
});

// Update Signature in user profile
app.put('/api/auth/signature', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { signatureImageUrl } = req.body;
    const updated = db.updateUserSignature(req.user!.id, signatureImageUrl || null);
    res.json({
      message: 'Signature mise à jour avec succès.',
      user: formatUserResponse(updated),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la mise à jour de la signature.' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Adresse e-mail requise.' });
    }

    const { resetToken } = db.createPasswordResetToken(email);

    res.json({
      message: 'Un lien de réinitialisation sécurisé a été généré.',
      resetToken,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la demande de réinitialisation.' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Jeton et nouveau mot de passe requis.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    await db.resetPassword(token, password);
    res.json({ message: 'Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Échec de la réinitialisation.' });
  }
});

// Delete Account
app.delete('/api/auth/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.deleteUser(req.user!.id);
    res.json({ message: 'Compte supprimé avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur lors de la suppression du compte.' });
  }
});

// ==========================================
// 2. CV MANAGEMENT ROUTES (Multi-CV per user)
// ==========================================

// Get all CVs for authenticated user
app.get('/api/cvs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const cvs = db.getUserCVs(req.user!.id);
  res.json({ cvs });
});

// Get single CV by ID
app.get('/api/cvs/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const cv = db.getCVById(req.params.id, req.user!.id);
  if (!cv) {
    return res.status(404).json({ error: 'CV non trouvé.' });
  }
  res.json({ cv });
});

// Create new CV
app.post('/api/cvs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, templateId, data, config } = req.body;
    const newCv = db.createCV(
      req.user!.id,
      data || {},
      config || { templateId: templateId || 'modern' },
      title || 'Mon CV',
      templateId || 'modern'
    );
    res.status(201).json({ cv: newCv });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la création du CV.' });
  }
});

// Update CV (Autosave endpoint)
app.put('/api/cvs/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, templateId, status, data, config } = req.body;
    const updated = db.updateCV(req.params.id, req.user!.id, {
      title,
      templateId,
      status,
      data,
      config,
    });
    res.json({ cv: updated, message: 'CV enregistré avec succès.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la mise à jour du CV.' });
  }
});

// Duplicate CV
app.post('/api/cvs/:id/duplicate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const copy = db.duplicateCV(req.params.id, req.user!.id);
    res.status(201).json({ cv: copy, message: 'CV dupliqué avec succès.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la duplication.' });
  }
});

// Delete CV
app.delete('/api/cvs/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteCV(req.params.id, req.user!.id);
    if (!ok) {
      return res.status(404).json({ error: 'CV non trouvé ou déjà supprimé.' });
    }
    res.json({ message: 'CV supprimé avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur lors de la suppression.' });
  }
});

// ==========================================
// 3. LETTERS ROUTES (Motivation & Demande d'emploi)
// ==========================================

// Get all letters for authenticated user
app.get('/api/letters', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const letters = db.getUserLetters(req.user!.id);
  res.json({ letters });
});

// Get single letter by ID
app.get('/api/letters/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const letter = db.getLetterById(req.params.id, req.user!.id);
  if (!letter) {
    return res.status(404).json({ error: 'Lettre non trouvée.' });
  }
  res.json({ letter });
});

// Create new letter
app.post('/api/letters', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      cvId,
      type,
      entreprise,
      poste,
      contenu,
      langue,
      tone,
      notes,
      recipientName,
      recipientAddress,
      signatureImageUrl,
      templateId,
      fontFamily,
      spacing,
      fontSize,
      margin,
      accentColor,
    } = req.body;

    if (!entreprise || !poste) {
      return res.status(400).json({ error: 'Le nom de l’entreprise et le poste visé sont requis.' });
    }

    const newLetter = db.createLetter(req.user!.id, {
      cvId: cvId || '',
      type: type || 'motivation',
      entreprise,
      poste,
      contenu: contenu || '',
      langue: langue || 'fr',
      tone: tone || 'formel',
      notes: notes || '',
      recipientName: recipientName || '',
      recipientAddress: recipientAddress || '',
      signatureImageUrl: signatureImageUrl !== undefined ? signatureImageUrl : req.user!.signatureImageUrl,
      templateId,
      fontFamily,
      spacing,
      fontSize,
      margin,
      accentColor,
    });

    res.status(201).json({ letter: newLetter, message: 'Lettre créée avec succès.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la création de la lettre.' });
  }
});

// Update letter
app.put('/api/letters/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      entreprise,
      poste,
      contenu,
      langue,
      tone,
      notes,
      recipientName,
      recipientAddress,
      signatureImageUrl,
      templateId,
      fontFamily,
      spacing,
      fontSize,
      margin,
      accentColor,
    } = req.body;

    const updated = db.updateLetter(req.params.id, req.user!.id, {
      entreprise,
      poste,
      contenu,
      langue,
      tone,
      notes,
      recipientName,
      recipientAddress,
      signatureImageUrl,
      templateId,
      fontFamily,
      spacing,
      fontSize,
      margin,
      accentColor,
    });

    res.json({ letter: updated, message: 'Lettre enregistrée avec succès.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la mise à jour de la lettre.' });
  }
});

// Duplicate letter
app.post('/api/letters/:id/duplicate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const copy = db.duplicateLetter(req.params.id, req.user!.id);
    res.status(201).json({ letter: copy, message: 'Lettre dupliquée avec succès.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erreur lors de la duplication de la lettre.' });
  }
});

// Delete letter
app.delete('/api/letters/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteLetter(req.params.id, req.user!.id);
    if (!ok) {
      return res.status(404).json({ error: 'Lettre non trouvée ou déjà supprimée.' });
    }
    res.json({ message: 'Lettre supprimée avec succès.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erreur lors de la suppression de la lettre.' });
  }
});

// ==========================================
// 4. AI ENDPOINTS (Suggestions, Cover Letter, Paragraph Refinement)
// ==========================================

// AI CV Text suggestions
app.post('/api/ai/suggest', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      const quota = db.checkAndIncrementAiQuota(req.user.id, 50);
      if (!quota.allowed) {
        return res.status(429).json({
          error: 'Limite quotidienne de suggestions IA atteinte (50/jour). Revenez demain !',
        });
      }
    }

    const { field, currentText, context, language } = req.body;
    const suggestions = await generateWritingSuggestions({
      field,
      currentText,
      context,
      language: language || 'fr',
    });

    res.json({ suggestions });
  } catch (err: any) {
    console.error('AI suggestion route error:', err);
    res.json({ suggestions: [] });
  }
});

// AI Generate Cover Letter
app.post('/api/ai/generate-letter', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      const quota = db.checkAndIncrementAiQuota(req.user.id, 50);
      if (!quota.allowed) {
        return res.status(429).json({
          error: 'Limite quotidienne d’appels IA atteinte (50/jour). Revenez demain !',
        });
      }
    }

    const { type, entreprise, poste, tone, notes, language, cvData } = req.body;
    if (!entreprise || !poste) {
      return res.status(400).json({ error: 'Le nom de l’entreprise et le poste visé sont requis.' });
    }

    const letterContent = await generateCoverLetter({
      type: type || 'motivation',
      entreprise,
      poste,
      tone: tone || 'formel',
      notes: notes || '',
      language: language || 'fr',
      cvData: cvData || {},
    });

    res.json({ content: letterContent });
  } catch (err: any) {
    console.error('AI generate letter route error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération de la lettre.' });
  }
});

// AI Regenerate Paragraph in letter
app.post('/api/ai/regenerate-paragraph', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      const quota = db.checkAndIncrementAiQuota(req.user.id, 50);
      if (!quota.allowed) {
        return res.status(429).json({
          error: 'Limite quotidienne d’appels IA atteinte (50/jour). Revenez demain !',
        });
      }
    }

    const { paragraph, instruction, type, entreprise, poste, tone, language } = req.body;
    if (!paragraph) {
      return res.status(400).json({ error: 'Le paragraphe à réécrire est requis.' });
    }

    const newParagraph = await regenerateLetterParagraph({
      paragraph,
      instruction,
      type: type || 'motivation',
      entreprise: entreprise || '',
      poste: poste || '',
      tone: tone || 'formel',
      language: language || 'fr',
    });

    res.json({ paragraph: newParagraph });
  } catch (err: any) {
    console.error('AI regenerate paragraph route error:', err);
    res.status(500).json({ error: 'Erreur lors de la réécriture du paragraphe.' });
  }
});

// ==========================================
// 5. VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
