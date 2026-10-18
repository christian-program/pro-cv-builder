import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CVData,
  CVConfig,
  PersonalDetails,
  Experience,
  Education,
  Skill,
  Language,
  Project,
  Certification,
  Interest,
  LanguageCode,
  SectionId,
} from '../types/cv';
import { sampleCVFr, getSampleDataForLanguage, emptyCVData } from '../data/sampleCV';
import { useAuth } from './AuthContext';

const STORAGE_DATA_KEY = 'cv_builder_user_data_v2';
const STORAGE_CONFIG_KEY = 'cv_builder_user_config_v2';

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'projects',
  'certifications',
  'interests',
];

const defaultConfig: CVConfig = {
  templateId: 'modern',
  primaryColor: '#1e3a8a',
  fontStyle: 'sans',
  density: 'normal',
  showPhoto: true,
  photoShape: 'circle',
  sectionOrder: DEFAULT_SECTION_ORDER,
};

export interface CVListItem {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  data: CVData;
  config: CVConfig;
}

interface CVContextType {
  cvData: CVData;
  config: CVConfig;
  currentCvId: string | null;
  currentCvTitle: string;
  currentCvStatus: 'draft' | 'completed';
  userCVs: CVListItem[];
  isLoadingCVs: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  setCurrentCvTitle: (title: string) => void;
  setCurrentCvStatus: (status: 'draft' | 'completed') => void;
  fetchUserCVs: () => Promise<void>;
  loadCV: (id: string) => Promise<void>;
  createNewCV: (title?: string, templateId?: string, useEmpty?: boolean) => Promise<string | null>;
  duplicateUserCV: (id: string) => Promise<string | null>;
  deleteUserCV: (id: string) => Promise<void>;
  renameUserCV: (id: string, newTitle: string) => Promise<void>;
  updatePersonal: (field: keyof PersonalDetails, value: string) => void;
  updateSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  moveExperience: (id: string, direction: 'up' | 'down') => void;
  reorderExperiences: (fromIndex: number, toIndex: number) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  moveEducation: (id: string, direction: 'up' | 'down') => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;
  addSkill: (name?: string, category?: string) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  moveSkill: (id: string, direction: 'up' | 'down') => void;
  reorderSkills: (fromIndex: number, toIndex: number) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, updates: Partial<Language>) => void;
  removeLanguage: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  moveProject: (id: string, direction: 'up' | 'down') => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  addCertification: () => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  addInterest: (name?: string) => void;
  updateInterest: (id: string, name: string) => void;
  removeInterest: (id: string) => void;
  updateConfig: (updates: Partial<CVConfig>) => void;
  reorderSectionOrder: (fromIndex: number, toIndex: number) => void;
  moveSectionOrder: (sectionId: SectionId, direction: 'up' | 'down') => void;
  loadSample: (lang: LanguageCode) => void;
  resetCV: () => void;
  setCVData: (data: CVData) => void;
  manualSave: () => Promise<boolean>;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [cvData, setCVDataState] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DATA_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved CV data', e);
    }
    return sampleCVFr;
  });

  const [config, setConfigState] = useState<CVConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultConfig,
          ...parsed,
          sectionOrder:
            Array.isArray(parsed.sectionOrder) && parsed.sectionOrder.length > 0
              ? parsed.sectionOrder
              : DEFAULT_SECTION_ORDER,
        };
      }
    } catch (e) {
      console.error('Error loading config', e);
    }
    return defaultConfig;
  });

  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [currentCvTitle, setCurrentCvTitle] = useState<string>('Mon CV');
  const [currentCvStatus, setCurrentCvStatus] = useState<'draft' | 'completed'>('draft');
  const [userCVs, setUserCVs] = useState<CVListItem[]>([]);
  const [isLoadingCVs, setIsLoadingCVs] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [activeSection, setActiveSection] = useState<string>('personal');

  // Fetch all CVs for the authenticated user
  const fetchUserCVs = useCallback(async () => {
    if (!token) {
      setUserCVs([]);
      return;
    }
    try {
      setIsLoadingCVs(true);
      const res = await fetch('/api/cvs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserCVs(data.cvs || []);
      }
    } catch (e) {
      console.error('Error fetching CVs:', e);
    } finally {
      setIsLoadingCVs(false);
    }
  }, [token]);

  // When user logs in or token changes, fetch their CVs
  useEffect(() => {
    if (token) {
      fetchUserCVs();
    } else {
      setUserCVs([]);
      setCurrentCvId(null);
    }
  }, [token, fetchUserCVs]);

  // Load a specific CV into the active editor
  const loadCV = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        const res = await fetch(`/api/cvs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const resData = await res.json();
          const cv: CVListItem = resData.cv;
          setCurrentCvId(cv.id);
          setCurrentCvTitle(cv.title);
          setCurrentCvStatus(cv.status || 'draft');
          if (cv.data) setCVDataState(cv.data);
          if (cv.config) setConfigState({ ...defaultConfig, ...cv.config });
        }
      } catch (err) {
        console.error('Failed to load CV:', err);
      }
    },
    [token]
  );

  // Create a new CV in the database (or locally if not logged in)
  const createNewCV = useCallback(
    async (title = 'Nouveau CV', templateId = 'modern', useEmpty = false) => {
      const initialData = useEmpty ? emptyCVData : sampleCVFr;
      const initialConfig: CVConfig = {
        ...defaultConfig,
        templateId: (templateId as any) || 'modern',
      };

      if (!token) {
        // Guest mode: update current state locally
        setCVDataState(JSON.parse(JSON.stringify(initialData)));
        setConfigState(initialConfig);
        setCurrentCvTitle(title);
        setCurrentCvStatus('draft');
        setCurrentCvId(null);
        return null;
      }

      try {
        const res = await fetch('/api/cvs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            templateId,
            data: initialData,
            config: initialConfig,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          const newCv = resData.cv;
          await fetchUserCVs();
          setCurrentCvId(newCv.id);
          setCurrentCvTitle(newCv.title);
          setCurrentCvStatus(newCv.status);
          setCVDataState(newCv.data);
          setConfigState({ ...defaultConfig, ...newCv.config });
          return newCv.id;
        }
      } catch (e) {
        console.error('Error creating CV:', e);
      }
      return null;
    },
    [token, fetchUserCVs]
  );

  // Duplicate an existing CV
  const duplicateUserCV = useCallback(
    async (id: string) => {
      if (!token) return null;
      try {
        const res = await fetch(`/api/cvs/${id}/duplicate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          await fetchUserCVs();
          return data.cv.id;
        }
      } catch (e) {
        console.error('Error duplicating CV:', e);
      }
      return null;
    },
    [token, fetchUserCVs]
  );

  // Delete a CV
  const deleteUserCV = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        const res = await fetch(`/api/cvs/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await fetchUserCVs();
          if (currentCvId === id) {
            setCurrentCvId(null);
            setCurrentCvTitle('Mon CV');
          }
        }
      } catch (e) {
        console.error('Error deleting CV:', e);
      }
    },
    [token, currentCvId, fetchUserCVs]
  );

  // Rename a CV
  const renameUserCV = useCallback(
    async (id: string, newTitle: string) => {
      if (!token) return;
      try {
        const res = await fetch(`/api/cvs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
          await fetchUserCVs();
          if (currentCvId === id) {
            setCurrentCvTitle(newTitle);
          }
        }
      } catch (e) {
        console.error('Error renaming CV:', e);
      }
    },
    [token, currentCvId, fetchUserCVs]
  );

  // Debounced auto-save: saves to localStorage, AND if logged in with active currentCvId, saves to database!
  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(async () => {
      try {
        localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(cvData));
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));

        // If authenticated and have active currentCvId, save to backend
        if (token && currentCvId) {
          await fetch(`/api/cvs/${currentCvId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: currentCvTitle,
              templateId: config.templateId,
              status: currentCvStatus,
              data: cvData,
              config,
            }),
          });
        }
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to auto-save CV data', err);
      } finally {
        setIsSaving(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [cvData, config, currentCvId, currentCvTitle, currentCvStatus, token]);

  const manualSave = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(cvData));
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));

      if (token) {
        if (currentCvId) {
          await fetch(`/api/cvs/${currentCvId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: currentCvTitle,
              templateId: config.templateId,
              status: currentCvStatus,
              data: cvData,
              config,
            }),
          });
          await fetchUserCVs();
        } else {
          const newId = await createNewCV(currentCvTitle || 'Mon CV', config.templateId, false);
          if (newId) {
            setCurrentCvId(newId);
          }
        }
      }
      setLastSaved(new Date());
      return true;
    } catch (err) {
      console.error('Failed to manually save CV', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [cvData, config, currentCvId, currentCvTitle, currentCvStatus, token, createNewCV, fetchUserCVs]);

  const setCVData = useCallback((data: CVData) => {
    setCVDataState(data);
  }, []);

  const updatePersonal = useCallback((field: keyof PersonalDetails, value: string) => {
    setCVDataState((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setCVDataState((prev) => ({
      ...prev,
      summary,
    }));
  }, []);

  // Experience handlers
  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    setCVDataState((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences],
    }));
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setCVDataState((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  }, []);

  const moveExperience = useCallback((id: string, direction: 'up' | 'down') => {
    setCVDataState((prev) => {
      const idx = prev.experiences.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.experiences.length) return prev;

      const newExps = [...prev.experiences];
      const [moved] = newExps.splice(idx, 1);
      newExps.splice(targetIdx, 0, moved);
      return { ...prev, experiences: newExps };
    });
  }, []);

  const reorderExperiences = useCallback((fromIndex: number, toIndex: number) => {
    setCVDataState((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.experiences.length ||
        toIndex >= prev.experiences.length
      ) {
        return prev;
      }
      const list = [...prev.experiences];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { ...prev, experiences: list };
    });
  }, []);

  // Education handlers
  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setCVDataState((prev) => ({
      ...prev,
      education: [newEdu, ...prev.education],
    }));
  }, []);

  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    setCVDataState((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  }, []);

  const moveEducation = useCallback((id: string, direction: 'up' | 'down') => {
    setCVDataState((prev) => {
      const idx = prev.education.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.education.length) return prev;

      const newEdus = [...prev.education];
      const [moved] = newEdus.splice(idx, 1);
      newEdus.splice(targetIdx, 0, moved);
      return { ...prev, education: newEdus };
    });
  }, []);

  const reorderEducation = useCallback((fromIndex: number, toIndex: number) => {
    setCVDataState((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.education.length ||
        toIndex >= prev.education.length
      ) {
        return prev;
      }
      const list = [...prev.education];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { ...prev, education: list };
    });
  }, []);

  // Skills handlers
  const addSkill = useCallback((name = '', category = '') => {
    const newSkill: Skill = {
      id: `sk-${Date.now()}`,
      name,
      level: 4,
      category,
    };
    setCVDataState((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setCVDataState((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  }, []);

  const moveSkill = useCallback((id: string, direction: 'up' | 'down') => {
    setCVDataState((prev) => {
      const idx = prev.skills.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.skills.length) return prev;

      const newSkills = [...prev.skills];
      const [moved] = newSkills.splice(idx, 1);
      newSkills.splice(targetIdx, 0, moved);
      return { ...prev, skills: newSkills };
    });
  }, []);

  const reorderSkills = useCallback((fromIndex: number, toIndex: number) => {
    setCVDataState((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.skills.length ||
        toIndex >= prev.skills.length
      ) {
        return prev;
      }
      const list = [...prev.skills];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { ...prev, skills: list };
    });
  }, []);

  // Languages handlers
  const addLanguage = useCallback(() => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      level: 'Courant',
    };
    setCVDataState((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  }, []);

  const updateLanguage = useCallback((id: string, updates: Partial<Language>) => {
    setCVDataState((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  }, []);

  // Projects handlers
  const addProject = useCallback(() => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      link: '',
      description: '',
    };
    setCVDataState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setCVDataState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const moveProject = useCallback((id: string, direction: 'up' | 'down') => {
    setCVDataState((prev) => {
      const idx = prev.projects.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.projects.length) return prev;

      const newProjs = [...prev.projects];
      const [moved] = newProjs.splice(idx, 1);
      newProjs.splice(targetIdx, 0, moved);
      return { ...prev, projects: newProjs };
    });
  }, []);

  const reorderProjects = useCallback((fromIndex: number, toIndex: number) => {
    setCVDataState((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.projects.length ||
        toIndex >= prev.projects.length
      ) {
        return prev;
      }
      const list = [...prev.projects];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { ...prev, projects: list };
    });
  }, []);

  // Certifications handlers
  const addCertification = useCallback(() => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      title: '',
      issuer: '',
      date: '',
    };
    setCVDataState((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  }, []);

  const updateCertification = useCallback((id: string, updates: Partial<Certification>) => {
    setCVDataState((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  }, []);

  // Interests handlers
  const addInterest = useCallback((name = '') => {
    const newInt: Interest = {
      id: `int-${Date.now()}`,
      name,
    };
    setCVDataState((prev) => ({
      ...prev,
      interests: [...prev.interests, newInt],
    }));
  }, []);

  const updateInterest = useCallback((id: string, name: string) => {
    setCVDataState((prev) => ({
      ...prev,
      interests: prev.interests.map((item) => (item.id === id ? { ...item, name } : item)),
    }));
  }, []);

  const removeInterest = useCallback((id: string) => {
    setCVDataState((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item.id !== id),
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<CVConfig>) => {
    setConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reorder CV sections
  const reorderSectionOrder = useCallback((fromIndex: number, toIndex: number) => {
    setConfigState((prev) => {
      const order = [...(prev.sectionOrder || DEFAULT_SECTION_ORDER)];
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= order.length ||
        toIndex >= order.length
      ) {
        return prev;
      }
      const [removed] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, removed);
      return { ...prev, sectionOrder: order };
    });
  }, []);

  const moveSectionOrder = useCallback((sectionId: SectionId, direction: 'up' | 'down') => {
    setConfigState((prev) => {
      const order = [...(prev.sectionOrder || DEFAULT_SECTION_ORDER)];
      const idx = order.indexOf(sectionId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= order.length) return prev;

      const [removed] = order.splice(idx, 1);
      order.splice(targetIdx, 0, removed);
      return { ...prev, sectionOrder: order };
    });
  }, []);

  const loadSample = useCallback((lang: LanguageCode) => {
    const sample = getSampleDataForLanguage(lang);
    setCVDataState(sample);
  }, []);

  const resetCV = useCallback(() => {
    setCVDataState(JSON.parse(JSON.stringify(emptyCVData)));
  }, []);

  return (
    <CVContext.Provider
      value={{
        cvData,
        config,
        currentCvId,
        currentCvTitle,
        currentCvStatus,
        userCVs,
        isLoadingCVs,
        isSaving,
        lastSaved,
        activeSection,
        setActiveSection,
        setCurrentCvTitle,
        setCurrentCvStatus,
        fetchUserCVs,
        loadCV,
        createNewCV,
        duplicateUserCV,
        deleteUserCV,
        renameUserCV,
        updatePersonal,
        updateSummary,
        addExperience,
        updateExperience,
        removeExperience,
        moveExperience,
        reorderExperiences,
        addEducation,
        updateEducation,
        removeEducation,
        moveEducation,
        reorderEducation,
        addSkill,
        updateSkill,
        removeSkill,
        moveSkill,
        reorderSkills,
        addLanguage,
        updateLanguage,
        removeLanguage,
        addProject,
        updateProject,
        removeProject,
        moveProject,
        reorderProjects,
        addCertification,
        updateCertification,
        removeCertification,
        addInterest,
        updateInterest,
        removeInterest,
        updateConfig,
        reorderSectionOrder,
        moveSectionOrder,
        loadSample,
        resetCV,
        setCVData,
        manualSave,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
