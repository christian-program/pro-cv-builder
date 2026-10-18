import { CVData, LanguageCode } from '../types/cv';

export const SAMPLE_AVATARS = {
  woman: '/src/assets/images/avatar_professional_woman_1790825655930.jpg',
  man: '/src/assets/images/avatar_professional_man_1790825668335.jpg',
};

export const sampleCVFr: CVData = {
  personal: {
    fullName: 'Alexandre Dupont',
    title: 'Développeur Full Stack Senior & Tech Lead',
    email: 'alexandre.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    address: 'Paris, France',
    website: 'https://alexandre-dupont.dev',
    linkedin: 'linkedin.com/in/alexandredupont',
    github: 'github.com/alexdupont',
    photoUrl: SAMPLE_AVATARS.man,
  },
  summary:
    'Ingénieur logiciel passionné fort de 7 années d’expérience dans la conception d’architectures web scalables et réactives. Spécialisé en écosystèmes React/TypeScript, Node.js et cloud public, avec un solide historique d’encadrement technique d’équipes produit agiles.',
  experiences: [
    {
      id: 'exp-1',
      position: 'Tech Lead Frontend & Senior Engineer',
      company: 'Novatech Solutions',
      location: 'Paris, France',
      startDate: '2022',
      endDate: 'Présent',
      isCurrent: true,
      description:
        '• Pilotage technique d’une équipe de 6 développeurs sur la refonte de la plateforme SaaS cœur de métier.\n• Réduction de 45% du temps de chargement des pages et amélioration du score Core Web Vitals (98/100).\n• Mise en place d’un Design System unifié sous React & Tailwind CSS avec couverture de tests à 85%.\n• Établissement des revues de code systématiques et mentoring de 3 profils juniors.',
    },
    {
      id: 'exp-2',
      position: 'Développeur Full Stack',
      company: 'KreaStudio Digital',
      location: 'Lyon, France',
      startDate: '2019',
      endDate: '2022',
      isCurrent: false,
      description:
        '• Conception et développement d’APIs REST et microservices Node.js desservant 200 000 requêtes/jour.\n• Implémentation d’un tableau de bord de reporting financier temps réel avec WebSockets et D3.js.\n• Collaboration étroite avec les designers UI/UX et product managers selon les cycles Scrum.',
    },
    {
      id: 'exp-3',
      position: 'Développeur Web Junior',
      company: 'AppliCraft Labs',
      location: 'Nantes, France',
      startDate: '2017',
      endDate: '2019',
      isCurrent: false,
      description:
        '• Intégration responsive d’interfaces web conformes aux critères d’accessibilité RGAA.\n• Maintenance corrective et évolutive des applications clients sous React et Express.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Master en Ingénierie Logicielle & Systèmes Distribués',
      institution: 'Université Paris-Saclay',
      location: 'Paris, France',
      startDate: '2015',
      endDate: '2017',
      description: 'Mention Très Bien. Mémoire sur l’orchestration de conteneurs et la haute disponibilité.',
    },
    {
      id: 'edu-2',
      degree: 'Licence Informatique et Sciences Numériques',
      institution: 'Université de Nantes',
      location: 'Nantes, France',
      startDate: '2012',
      endDate: '2015',
      description: 'Formation fondamentale en algorithmique, structures de données et génie logiciel.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'React & Next.js', level: 5, category: 'Frontend' },
    { id: 'sk-2', name: 'TypeScript / JavaScript', level: 5, category: 'Frontend' },
    { id: 'sk-3', name: 'Node.js & Express', level: 4, category: 'Backend' },
    { id: 'sk-4', name: 'Tailwind CSS & Design Systems', level: 5, category: 'Frontend' },
    { id: 'sk-5', name: 'PostgreSQL & MongoDB', level: 4, category: 'Backend' },
    { id: 'sk-6', name: 'Docker & CI/CD Pipelines', level: 4, category: 'DevOps' },
    { id: 'sk-7', name: 'Architecture logicielle & Clean Code', level: 5, category: 'Méthodes' },
  ],
  languages: [
    { id: 'lang-1', name: 'Français', level: 'Langue maternelle' },
    { id: 'lang-2', name: 'Anglais', level: 'Bilingue / Professionnel (C1)' },
    { id: 'lang-3', name: 'Espagnol', level: 'Intermédiaire (B1)' },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'OpenUI Component Kit',
      role: 'Auteur principal',
      link: 'https://github.com/alexdupont/openui',
      description: 'Bibliothèque de composants UI accessibles et légers cumulant plus de 1 400 étoiles GitHub.',
    },
    {
      id: 'proj-2',
      title: 'TrackDev Performance SaaS',
      role: 'Co-fondateur & Lead Dev',
      link: 'https://trackdev.io',
      description: 'Outil de monitoring applicatif surveillant la latence et l’erreur pour 40 entreprises clientes.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'cert-2',
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
  ],
  interests: [
    { id: 'int-1', name: 'Course à pied & Semi-marathon' },
    { id: 'int-2', name: 'Photographie argentique' },
    { id: 'int-3', name: 'Échecs & Stratégie' },
  ],
};

export const sampleCVEn: CVData = {
  personal: {
    fullName: 'Sarah Jenkins',
    title: 'Senior Product Designer & Design Lead',
    email: 'sarah.jenkins@designlab.io',
    phone: '+1 (415) 890-4321',
    address: 'San Francisco, CA, USA',
    website: 'https://sarahjenkins.design',
    linkedin: 'linkedin.com/in/sarahjenkins-design',
    github: 'github.com/sarahdesigns',
    photoUrl: SAMPLE_AVATARS.woman,
  },
  summary:
    'Human-centered product designer with 8+ years shaping multi-platform digital tools and enterprise design systems. Adept at translating ambiguous business needs into intuitive, high-converting customer experiences backed by quantitative user research.',
  experiences: [
    {
      id: 'exp-1',
      position: 'Staff Product Designer',
      company: 'Apex Cloud Platforms',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: 'Present',
      isCurrent: true,
      description:
        '• Led end-to-end design for the core analytics suite, increasing weekly retention by 34%.\n• Built and evangelized a company-wide multi-brand design system utilized by 45+ product engineers.\n• Conducted 50+ qualitative interviews and usability tests to eliminate critical friction points in onboarding.',
    },
    {
      id: 'exp-2',
      position: 'Senior UX/UI Designer',
      company: 'Loomis Digital Studio',
      location: 'New York, NY',
      startDate: '2018',
      endDate: '2021',
      isCurrent: false,
      description:
        '• Designed consumer fintech mobile apps for Tier 1 retail banks with over 1.2M active users.\n• Partnered with front-end developers to ensure pixel-perfect accessibility (WCAG AAA compliance).',
    },
    {
      id: 'exp-3',
      position: 'UI Designer & Prototyper',
      company: 'Veloce Interactive',
      location: 'Austin, TX',
      startDate: '2016',
      endDate: '2018',
      isCurrent: false,
      description:
        '• Crafted interactive motion prototypes in Figma and Framer, reducing sprint validation cycles by 3 weeks.\n• Created comprehensive icon libraries and design tokens.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.F.A. in Human-Computer Interaction & Digital Design',
      institution: 'Carnegie Mellon University',
      location: 'Pittsburgh, PA',
      startDate: '2012',
      endDate: '2016',
      description: 'Graduated with High Honors. Dean’s List for 6 consecutive semesters.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'Product Strategy & Discovery', level: 5, category: 'Design' },
    { id: 'sk-2', name: 'Figma, Design Tokens & Systems', level: 5, category: 'Tools' },
    { id: 'sk-3', name: 'Interactive Prototyping (Framer, Principle)', level: 5, category: 'Tools' },
    { id: 'sk-4', name: 'User Research & Usability Testing', level: 4, category: 'Research' },
    { id: 'sk-5', name: 'Information Architecture', level: 5, category: 'Design' },
    { id: 'sk-6', name: 'HTML5, CSS3, Tailwind Basics', level: 4, category: 'Tech' },
  ],
  languages: [
    { id: 'lang-1', name: 'English', level: 'Native proficiency' },
    { id: 'lang-2', name: 'French', level: 'Full professional (C1)' },
    { id: 'lang-3', name: 'Spanish', level: 'Conversational (B2)' },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Accessible Palette Generator',
      role: 'Solo Project',
      link: 'https://contrast-kit.dev',
      description: 'Free open-source contrast checker used by over 30,000 product teams globally.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'Nielsen Norman Group UX Master Certified',
      issuer: 'NN/g',
      date: '2022',
    },
  ],
  interests: [
    { id: 'int-1', name: 'Architectural sketching' },
    { id: 'int-2', name: 'Ceramics & Pottery' },
    { id: 'int-3', name: 'Trail hiking' },
  ],
};

export const sampleCVEs: CVData = {
  personal: {
    fullName: 'Carlos Mendoza',
    title: 'Ingeniero de Software Senior & Arquitecto Cloud',
    email: 'carlos.mendoza@devpro.es',
    phone: '+34 612 345 678',
    address: 'Madrid, España',
    website: 'https://carlosmendoza.dev',
    linkedin: 'linkedin.com/in/carlosmendoza-tech',
    github: 'github.com/carlosmendoza',
    photoUrl: SAMPLE_AVATARS.man,
  },
  summary:
    'Ingeniero de software con más de 7 años de trayectoria diseñando soluciones cloud escalables, microservicios y plataformas frontend modernas. Especializado en optimización de rendimiento, arquitectura limpia y liderazgo técnico.',
  experiences: [
    {
      id: 'exp-1',
      position: 'Lead Software Architect',
      company: 'Soluciones Cloud Iberia',
      location: 'Madrid, España',
      startDate: '2021',
      endDate: 'Presente',
      isCurrent: true,
      description:
        '• Dirección técnica de un equipo de 8 ingenieros en el desarrollo de la plataforma bancaria.\n• Migración de arquitectura monolítica a microservicios en Kubernetes, con ahorro del 30% en costes de nube.\n• Implementación de procesos CI/CD automatizados reduciendo los ciclos de despliegue de días a minutos.',
    },
    {
      id: 'exp-2',
      position: 'Senior Full Stack Developer',
      company: 'TechVanguard Barcelona',
      location: 'Barcelona, España',
      startDate: '2018',
      endDate: '2021',
      isCurrent: false,
      description:
        '• Desarrollo de aplicaciones web críticas en React, TypeScript y Node.js para sector logístico.\n• Rediseño de flujos de pago con aumento directo de conversión del 25% y tiempos de respuesta de 80ms.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Grado en Ingeniería Informática del Software',
      institution: 'Universidad Politécnica de Madrid',
      location: 'Madrid, España',
      startDate: '2013',
      endDate: '2017',
      description: 'Graduado con Mención de Honor en Sistemas Distribuidos.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'TypeScript & JavaScript', level: 5, category: 'Lenguajes' },
    { id: 'sk-2', name: 'React & Next.js', level: 5, category: 'Frontend' },
    { id: 'sk-3', name: 'Node.js, Express & NestJS', level: 5, category: 'Backend' },
    { id: 'sk-4', name: 'AWS & Kubernetes', level: 4, category: 'Cloud' },
    { id: 'sk-5', name: 'PostgreSQL & Redis', level: 4, category: 'Bases de datos' },
    { id: 'sk-6', name: 'Arquitectura Limpia & TDD', level: 5, category: 'Prácticas' },
  ],
  languages: [
    { id: 'lang-1', name: 'Español', level: 'Lengua materna' },
    { id: 'lang-2', name: 'Inglés', level: 'Bilingüe profesional (C1)' },
    { id: 'lang-3', name: 'Francés', level: 'Básico intermedio (B1)' },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevOps FastDeploy CLI',
      role: 'Creador & Mantenedor',
      link: 'https://github.com/carlosmendoza/fastdeploy',
      description: 'Herramienta de línea de comandos para despliegues rápidos en Kubernetes con más de 800 estrellas.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  interests: [
    { id: 'int-1', name: 'Ciclismo de montaña' },
    { id: 'int-2', name: 'Ajedrez' },
    { id: 'int-3', name: 'Open Source' },
  ],
};

export const emptyCVData: CVData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    linkedin: '',
    github: '',
    photoUrl: '',
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  interests: [],
};

export function getSampleDataForLanguage(lang: LanguageCode): CVData {
  switch (lang) {
    case 'fr':
      return JSON.parse(JSON.stringify(sampleCVFr));
    case 'es':
      return JSON.parse(JSON.stringify(sampleCVEs));
    case 'en':
    default:
      return JSON.parse(JSON.stringify(sampleCVEn));
  }
}
