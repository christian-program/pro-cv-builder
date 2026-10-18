import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { LetterItem, LetterGenerationParams, LetterType, LetterTone } from '../types/letter';
import { CVData } from '../types/cv';

interface LetterContextType {
  letters: LetterItem[];
  currentLetter: LetterItem | null;
  isLoadingLetters: boolean;
  isGenerating: boolean;
  loadLetters: () => Promise<void>;
  loadLetter: (id: string) => Promise<LetterItem | null>;
  createLetterFromCV: (
    params: LetterGenerationParams,
    cvData: CVData,
    language: string
  ) => Promise<LetterItem>;
  updateCurrentLetter: (updates: Partial<LetterItem>) => void;
  saveLetter: () => Promise<boolean>;
  deleteLetter: (id: string) => Promise<boolean>;
  duplicateLetter: (id: string) => Promise<LetterItem | null>;
  regenerateCurrentLetter: (cvData: CVData, language: string) => Promise<void>;
  regenerateParagraph: (paragraphText: string, instruction?: string) => Promise<string>;
  setCurrentLetter: (letter: LetterItem | null) => void;
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

const LOCAL_LETTERS_KEY = 'cv_builder_local_letters';

export const LetterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [currentLetter, setCurrentLetter] = useState<LetterItem | null>(null);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load letters from API if token, or localStorage if guest
  const loadLetters = useCallback(async () => {
    if (!token) {
      try {
        const saved = localStorage.getItem(LOCAL_LETTERS_KEY);
        if (saved) {
          setLetters(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse local letters', e);
      }
      return;
    }

    setIsLoadingLetters(true);
    try {
      const res = await fetch('/api/letters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
      }
    } catch (e) {
      console.error('Failed to load letters from backend', e);
    } finally {
      setIsLoadingLetters(false);
    }
  }, [token]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  // Load single letter
  const loadLetter = useCallback(
    async (id: string): Promise<LetterItem | null> => {
      // Check in-memory state first
      const found = letters.find((l) => l.id === id);
      if (found) {
        setCurrentLetter(found);
        return found;
      }

      if (!token) return null;

      try {
        const res = await fetch(`/api/letters/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentLetter(data.letter);
          return data.letter;
        }
      } catch (e) {
        console.error('Failed to load letter', e);
      }
      return null;
    },
    [letters, token]
  );

  // Create Letter using AI and attach to CV
  const createLetterFromCV = async (
    params: LetterGenerationParams,
    cvData: CVData,
    language: string
  ): Promise<LetterItem> => {
    setIsGenerating(true);
    try {
      // 1. Call AI generation endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const aiRes = await fetch('/api/ai/generate-letter', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: params.type,
          entreprise: params.entreprise,
          poste: params.poste,
          tone: params.tone || 'formel',
          notes: params.notes || '',
          language,
          cvData,
        }),
      });

      let generatedContent = '';
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        generatedContent = aiData.content || '';
      }

      const letterPayload = {
        cvId: params.cvId,
        type: params.type,
        entreprise: params.entreprise,
        poste: params.poste,
        contenu: generatedContent,
        langue: language,
        tone: params.tone || 'formel',
        notes: params.notes || '',
        recipientName: params.recipientName || '',
        recipientAddress: params.recipientAddress || '',
        signatureImageUrl: user?.signatureImageUrl || null,
      };

      // 2. Save letter
      if (token) {
        const saveRes = await fetch('/api/letters', {
          method: 'POST',
          headers,
          body: JSON.stringify(letterPayload),
        });

        if (saveRes.ok) {
          const resData = await saveRes.json();
          const created: LetterItem = resData.letter;
          setLetters((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
          setCurrentLetter(created);
          return created;
        }
      }

      // Guest mode
      const now = new Date().toISOString();
      const guestLetter: LetterItem = {
        ...letterPayload,
        id: `local-letter-${Date.now()}`,
        userId: 'guest',
        createdAt: now,
        updatedAt: now,
      };

      setLetters((prev) => {
        const updated = [guestLetter, ...prev];
        localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
        return updated;
      });
      setCurrentLetter(guestLetter);
      return guestLetter;
    } finally {
      setIsGenerating(false);
    }
  };

  // Update current letter in state
  const updateCurrentLetter = (updates: Partial<LetterItem>) => {
    setCurrentLetter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Save current letter to DB or localStorage
  const saveLetter = async (): Promise<boolean> => {
    if (!currentLetter) return false;

    if (!token) {
      setLetters((prev) => {
        const updated = prev.map((l) => (l.id === currentLetter.id ? currentLetter : l));
        localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
        return updated;
      });
      return true;
    }

    try {
      const res = await fetch(`/api/letters/${currentLetter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entreprise: currentLetter.entreprise,
          poste: currentLetter.poste,
          contenu: currentLetter.contenu,
          langue: currentLetter.langue,
          tone: currentLetter.tone,
          notes: currentLetter.notes,
          recipientName: currentLetter.recipientName,
          recipientAddress: currentLetter.recipientAddress,
          signatureImageUrl: currentLetter.signatureImageUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const saved: LetterItem = data.letter;
        setLetters((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
        setCurrentLetter(saved);
        return true;
      }
    } catch (e) {
      console.error('Failed to save letter', e);
    }
    return false;
  };

  // Delete letter
  const deleteLetter = async (id: string): Promise<boolean> => {
    if (!token) {
      setLetters((prev) => {
        const updated = prev.filter((l) => l.id !== id);
        localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
        return updated;
      });
      if (currentLetter?.id === id) {
        setCurrentLetter(null);
      }
      return true;
    }

    try {
      const res = await fetch(`/api/letters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setLetters((prev) => prev.filter((l) => l.id !== id));
        if (currentLetter?.id === id) {
          setCurrentLetter(null);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to delete letter', e);
    }
    return false;
  };

  // Duplicate letter
  const duplicateLetter = async (id: string): Promise<LetterItem | null> => {
    if (!token) {
      const src = letters.find((l) => l.id === id);
      if (!src) return null;
      const now = new Date().toISOString();
      const copy: LetterItem = {
        ...JSON.parse(JSON.stringify(src)),
        id: `local-letter-${Date.now()}`,
        entreprise: `${src.entreprise} (Copie)`,
        createdAt: now,
        updatedAt: now,
      };
      setLetters((prev) => {
        const updated = [copy, ...prev];
        localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
        return updated;
      });
      return copy;
    }

    try {
      const res = await fetch(`/api/letters/${id}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const copy: LetterItem = data.letter;
        setLetters((prev) => [copy, ...prev]);
        return copy;
      }
    } catch (e) {
      console.error('Failed to duplicate letter', e);
    }
    return null;
  };

  // Regenerate entire current letter
  const regenerateCurrentLetter = async (cvData: CVData, language: string) => {
    if (!currentLetter) return;
    setIsGenerating(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const aiRes = await fetch('/api/ai/generate-letter', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: currentLetter.type,
          entreprise: currentLetter.entreprise,
          poste: currentLetter.poste,
          tone: currentLetter.tone || 'formel',
          notes: currentLetter.notes || '',
          language,
          cvData,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.content) {
          updateCurrentLetter({ contenu: aiData.content });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate paragraph
  const regenerateParagraph = async (
    paragraphText: string,
    instruction?: string
  ): Promise<string> => {
    if (!currentLetter) return paragraphText;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai/regenerate-paragraph', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paragraph: paragraphText,
          instruction,
          type: currentLetter.type,
          entreprise: currentLetter.entreprise,
          poste: currentLetter.poste,
          tone: currentLetter.tone,
          language: currentLetter.langue,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.paragraph || paragraphText;
      }
    } catch (e) {
      console.error('Failed to regenerate paragraph', e);
    }
    return paragraphText;
  };

  return (
    <LetterContext.Provider
      value={{
        letters,
        currentLetter,
        isLoadingLetters,
        isGenerating,
        loadLetters,
        loadLetter,
        createLetterFromCV,
        updateCurrentLetter,
        saveLetter,
        deleteLetter,
        duplicateLetter,
        regenerateCurrentLetter,
        regenerateParagraph,
        setCurrentLetter,
      }}
    >
      {children}
    </LetterContext.Provider>
  );
};

export const useLetter = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetter must be used within a LetterProvider');
  }
  return context;
};
