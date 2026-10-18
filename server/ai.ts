import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface SuggestionRequest {
  field: 'summary' | 'experience' | 'project';
  currentText?: string;
  context?: {
    jobTitle?: string;
    company?: string;
    skills?: string[];
    degree?: string;
    institution?: string;
    projectTitle?: string;
  };
  language?: 'fr' | 'en' | 'es';
}

export interface LetterGenerationRequest {
  type: 'motivation' | 'demande_emploi';
  entreprise: string;
  poste: string;
  tone?: 'formel' | 'dynamique' | 'convaincant';
  notes?: string;
  language?: 'fr' | 'en' | 'es';
  cvData: {
    personal?: {
      fullName?: string;
      title?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    summary?: string;
    experiences?: Array<{
      position: string;
      company: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      startDate?: string;
      endDate?: string;
    }>;
    skills?: Array<{
      name: string;
      level?: number;
    }>;
    projects?: Array<{
      title: string;
      role?: string;
      description?: string;
    }>;
  };
}

export async function generateWritingSuggestions(req: SuggestionRequest): Promise<string[]> {
  const lang = req.language || 'fr';
  const fieldName = req.field || 'summary';
  const current = req.currentText?.trim() || '';
  const ctx = req.context || {};

  const langNames = {
    fr: 'français',
    en: 'english',
    es: 'español',
  };
  const targetLang = langNames[lang] || 'français';

  const prompt = `Tu es un expert senior en recrutement et rédaction de CV professionnels.
Génère exactement 3 variantes courtes et percutantes pour la section "${fieldName}" d'un CV en ${targetLang}.

Contexte du candidat :
- Poste visé : ${ctx.jobTitle || 'Professionnel'}
- Entreprise / Organisation : ${ctx.company || ctx.projectTitle || ''}
- Compétences clés mentionnées : ${(ctx.skills || []).join(', ') || 'Non précisé'}
- Texte actuel saisi par l'utilisateur (peut être vide) :
"""${current}"""

Instructions :
- Si le texte actuel est vide : propose une ébauche professionnelle structurée et attrayante à partir du poste et des compétences.
- Si le texte contient déjà du contenu : propose une reformulation améliorée (plus percutante, valorisant l'impact, éliminant les redondances et fautes).
- Pour une expérience ou un projet : formule les variantes sous forme de 2 à 3 points d'action avec puces (•) commençant par des verbes d'action au présent/passé composé, incluant des résultats concrets ou métriques.
- Pour un résumé / profil : formule un paragraphe fluide de 3 à 4 phrases percutantes.
- Propose 3 variantes avec des tons différents :
  1. Variante 1 : Axée sur l'impact, le leadership et les métriques chiffrées
  2. Variante 2 : Synthétique, directe et percutante
  3. Variante 3 : Axée sur l'expertise technique et la méthodologie
- Rédige UNIQUEMENT en ${targetLang}.`;

  if (!aiClient) {
    return getFallbackSuggestions(req);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `Tu es un assistant d'écriture spécialisé dans la rédaction de CV professionnels haut de gamme. Tu réponds obligatoirement en format JSON avec un tableau de 3 chaînes de caractères nommées "suggestions".`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Liste de 3 variantes professionnelles rédigées.',
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return parsed.suggestions.slice(0, 3);
      }
    }
  } catch (error) {
    console.error('Gemini API call failed, falling back to smart templates:', error);
  }

  return getFallbackSuggestions(req);
}

export async function generateCoverLetter(req: LetterGenerationRequest): Promise<string> {
  const lang = req.language || 'fr';
  const type = req.type || 'motivation';
  const entreprise = req.entreprise.trim() || 'l’Entreprise';
  const poste = req.poste.trim() || 'le poste visé';
  const tone = req.tone || 'formel';
  const candidateName = req.cvData?.personal?.fullName || 'Le Candidat';
  const candidateTitle = req.cvData?.personal?.title || '';

  const experiencesSummary = (req.cvData?.experiences || [])
    .slice(0, 3)
    .map((e) => `- ${e.position} chez ${e.company}${e.description ? ` : ${e.description.replace(/\n+/g, ' ')}` : ''}`)
    .join('\n');

  const educationSummary = (req.cvData?.education || [])
    .slice(0, 2)
    .map((ed) => `- ${ed.degree} à ${ed.institution}`)
    .join('\n');

  const skillsSummary = (req.cvData?.skills || [])
    .slice(0, 8)
    .map((s) => s.name)
    .join(', ');

  const langNames = {
    fr: 'français standard irréprochable',
    en: 'professional standard English',
    es: 'español formal y profesional',
  };
  const targetLang = langNames[lang] || 'français standard irréprochable';

  const typeDesc =
    type === 'motivation'
      ? 'Lettre de motivation répondant à une offre ou un poste précis'
      : 'Lettre de demande d’emploi spontanée et proactive';

  const toneGuidance =
    tone === 'dynamique'
      ? 'Ton moderne, direct, énergique, valorisant la prise d’initiative et la culture d’innovation.'
      : tone === 'convaincant'
      ? 'Ton affirmatif, orienté résultats et valeur ajoutée immédiate, orienté chiffres et impact.'
      : 'Ton formel, courtois, hautement respectueux des codes professionnels et diplomatique.';

  const prompt = `Tu es un expert senior en recrutement et communication professionnelle de haut niveau.
Rédige une ${typeDesc} complète, percutante, personnalisée et sans clichés en ${targetLang}.

INFORMATIONS SUR LA CANDIDATURE :
- Entreprise ciblée : ${entreprise}
- Poste visé : ${poste}
- Type de lettre : ${type === 'motivation' ? 'Lettre de motivation' : 'Lettre de demande d’emploi'}
- Ton souhaité : ${toneGuidance}
${req.notes ? `- Notes / éléments clés précisés par le candidat : "${req.notes}"` : ''}

INFORMATIONS SUR LE CANDIDAT (tirées de son CV) :
- Nom : ${candidateName}
- Titre professionnel : ${candidateTitle}
${req.cvData?.summary ? `- Profil / Résumé : "${req.cvData.summary}"` : ''}
- Expériences professionnelles clés :
${experiencesSummary || 'Non spécifié'}
- Formation / Diplômes :
${educationSummary || 'Non spécifié'}
- Compétences techniques & relationnelles :
${skillsSummary || 'Non spécifié'}

CONSIGNES DE RÉDACTION STRICTES :
1. Commence directement par la formule de salutation (ex. "Madame, Monsieur," ou équivalent dans la langue). Ne mets pas les coordonnées du candidat dans le corps du texte (elles sont déjà gérées dans l'en-tête de la mise en page).
2. Objet : Ne pas inclure la ligne "Objet:" au début car le template l'affiche déjà au-dessus.
3. Structure en 4 paragraphes bien délimités par des sauts de ligne doubles :
   - Paragraphe 1 (Accroche / Le Poste) : Motivation vive et claire pour le rôle de ${poste} chez ${entreprise}. Montre une compréhension des enjeux du secteur.
   - Paragraphe 2 (Le Candidat / La Valeur ajoutée) : Synthèse convaincante de ses réalisations et compétences les plus pertinentes tirées de son parcours, prouvant son adéquation parfaite.
   - Paragraphe 3 (L'Entreprise & La Collaboration) : Pourquoi ${entreprise}, la vision partagée et l'impact que le candidat apportera concrètement à l'équipe.
   - Paragraphe 4 (Conclusion & Entretien) : Proposition d'un échange lors d'un entretien, suivie d'une formule de politesse chaleureuse et élégante.
4. Finis par le nom du candidat sur une ligne seule après la formule de politesse.
5. Sois naturel, évite le jargon creux ("dynamique et motivé"), utilise des tournures riches et fluides. Rédige UNIQUEMENT en ${targetLang}.`;

  if (!aiClient) {
    return getFallbackLetter(req);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `Tu es un rédacteur professionnel de lettres de candidature d'élite. Tu produis directement le texte complet de la lettre avec des sauts de lignes naturels entre les paragraphes, sans markdown excessif (pas de balises code, pas de hashtags).`,
        temperature: 0.7,
      },
    });

    const text = response.text?.trim();
    if (text && text.length > 150) {
      return text;
    }
  } catch (error) {
    console.error('Gemini cover letter generation failed, falling back:', error);
  }

  return getFallbackLetter(req);
}

export async function regenerateLetterParagraph(params: {
  paragraph: string;
  instruction?: string;
  type: string;
  entreprise: string;
  poste: string;
  tone?: string;
  language?: string;
}): Promise<string> {
  const lang = params.language || 'fr';
  const targetLang = lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : 'French';

  const prompt = `Tu es un expert en recrutement. Réécris et améliore le paragraphe suivant d'une lettre de candidature en ${targetLang}.
- Entreprise : ${params.entreprise}
- Poste : ${params.poste}
- Instruction spécifique : ${params.instruction || 'Rendre plus percutant, fluide et convaincant'}
- Ton : ${params.tone || 'professionnel'}

Paragraphe original :
"""${params.paragraph}"""

Consigne : Renvoie UNIQUEMENT le texte du paragraphe réécrit, sans guillemets, sans commentaires ni préambule.`;

  if (!aiClient) {
    return params.paragraph;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });
    const text = response.text?.trim();
    if (text) return text;
  } catch (e) {
    console.error('Paragraph regeneration error:', e);
  }

  return params.paragraph;
}

function getFallbackSuggestions(req: SuggestionRequest): string[] {
  const lang = req.language || 'fr';
  const role = req.context?.jobTitle || (lang === 'fr' ? 'Professionnel' : lang === 'es' ? 'Profesional' : 'Professional');
  const comp = req.context?.company ? ` chez ${req.context.company}` : '';
  const skillsList = req.context?.skills?.slice(0, 3).join(', ') || '';

  if (lang === 'en') {
    if (req.field === 'summary') {
      return [
        `Results-oriented ${role} with proven track record in delivering high-impact projects. Adept in ${skillsList || 'strategic execution'} with strong emphasis on product quality, team collaboration, and measurable business growth.`,
        `Dynamic ${role} passionate about building scalable solutions and driving innovation. Experienced in leading cross-functional initiatives and optimizing team workflows for high performance.`,
        `Strategic ${role} combining technical proficiency and problem-solving rigor. Dedicated to architecting robust systems and mentoring agile teams toward operational excellence.`,
      ];
    } else {
      return [
        `• Spearheaded high-priority initiatives, accelerating project delivery timelines by 25%.\n• Collaborated closely with cross-functional teams to streamline workflows and boost user satisfaction.\n• Standardized code review and quality assurance practices across the engineering department.`,
        `• Designed and implemented scalable solutions utilizing modern best practices and agile methodologies.\n• Reduced operational errors by 30% through robust automated monitoring and testing pipelines.`,
        `• Directed key product enhancements that drove measurable customer retention gains.\n• Mentored junior team members and fostered a culture of continuous learning and high accountability.`,
      ];
    }
  }

  if (lang === 'es') {
    if (req.field === 'summary') {
      return [
        `${role} enfocado en resultados y excelencia operativa con amplia experiencia en proyectos estratégicos. Destacada capacidad en ${skillsList || 'gestión técnica y resolución de problemas'}, orientado al impacto medible en negocio.`,
        `Profesional proactivo en el rol de ${role}, con sólida trayectoria optimizando procesos y liderando equipos multidisciplinares hacia altos estándares de rendimiento.`,
        `${role} apasionado por la innovación y la calidad del software. Especializado en arquitecturas escalables, buenas prácticas y metodologías ágiles.`,
      ];
    } else {
      return [
        `• Liderazgo técnico en el desarrollo de funcionalidades clave, incrementando la eficiencia operativa en un 25%.\n• Colaboración transversal para alinear prioridades técnicas con objetivos estratégicos de negocio.\n• Implementación de procesos de integración continua y control de calidad riguroso.`,
        `• Diseño e implementación de soluciones robustas basadas en ${skillsList || 'tecnologías modernas'}.\n• Reducción de tiempos de entrega en un 30% mediante optimización de flujos de trabajo.`,
        `• Gestión integral del ciclo de vida del proyecto con enfoque en alta disponibilidad y satisfacción del usuario final.`,
      ];
    }
  }

  // French default
  if (req.field === 'summary') {
    return [
      `${role} passionné et orienté résultats, fort d'une solide expérience dans la livraison de projets à fort impact. Expert en ${skillsList || 'conception et pilotage stratégique'}, engagé dans la qualité logicielle et la satisfaction utilisateur.`,
      `Professionnel rigoureux et communicant, spécialisé en tant que ${role}${comp}. Recommandé pour ma capacité à fédérer des équipes pluridisciplinaires et à optimiser la productivité globale.`,
      `${role} doté d'une vision pragmatique alliant excellence technique et sensibilité produit. Habitué aux environnements véloces et soucieux de créer des solutions durables et scalables.`,
    ];
  } else {
    return [
      `• Pilotage de projets stratégiques de bout en bout, avec un gain de productivité mesuré à +25%.\n• Collaboration étroite avec les équipes produit et design pour concevoir des expériences utilisateurs fluides.\n• Mise en place de standards de qualité et mentorat technique auprès des profils juniors.`,
      `• Conception et déploiement d’architectures modulaires basées sur ${skillsList || 'les meilleures pratiques du secteur'}.\n• Réduction de 35% des temps de traitement grâce à une refonte ciblée des processus clés.`,
      `• Prise en charge des fonctionnalités critiques en garantissant haute disponibilité, sécurité et maintenabilité du code.`,
    ];
  }
}

function getFallbackLetter(req: LetterGenerationRequest): string {
  const lang = req.language || 'fr';
  const type = req.type || 'motivation';
  const comp = req.entreprise || 'votre entreprise';
  const pos = req.poste || 'ce poste';
  const name = req.cvData?.personal?.fullName || 'Alexandre Dupont';
  const skills = (req.cvData?.skills || []).slice(0, 3).map((s) => s.name).join(', ') || 'mon expertise technique';
  const topExp = req.cvData?.experiences?.[0];

  if (lang === 'en') {
    return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${pos} position at ${comp}. With a solid foundation in my field and a continuous drive for operational excellence, I have followed ${comp}'s accomplishments with great admiration and would be thrilled to contribute to your continued growth.

Throughout my career${topExp ? `, notably as ${topExp.position} at ${topExp.company}` : ''}, I have developed strong competencies in ${skills}. My approach is rooted in delivering measurable value, collaborating seamlessly with cross-functional partners, and tackling complex challenges with analytical rigor.

What particularly attracts me to ${comp} is your commitment to high standards and innovation. I am convinced that my proactive mindset, adaptability, and technical proficiency will enable me to make an immediate, positive impact on your team.

I would welcome the opportunity to discuss how my qualifications align with your strategic objectives during an interview. Thank you very much for your time and consideration.

Sincerely,

${name}`;
  }

  if (lang === 'es') {
    return `Estimado/a Responsable de Selección,

Le escribo para manifestar mi firme interés en incorporarme a ${comp} en la posición de ${pos}. He seguido con atención la trayectoria de su organización y considero que mis competencias y visión profesional están estrechamente alineadas con los desafíos que afrontan actualmente.

A lo largo de mi trayectoria${topExp ? `, particularmente en mi rol de ${topExp.position} en ${topExp.company}` : ''}, he consolidado una sólida experiencia en ${skills}. Me caracterizo por un enfoque orientado a resultados medibles, rigor metodológico y una comunicación fluida en equipos multidisciplinares.

La reputación de excelencia e innovación de ${comp} representa para mí el entorno ideal para aportar valor tangible y comprometerme a largo plazo con el éxito de sus proyectos estratégicos.

Estaría encantado/a de mantener una entrevista para detallar cómo mi perfil puede contribuir a sus objetivos. Agradeciendo de antemano su atención, le saluda cordialmente,

${name}`;
  }

  // French default
  const isCandidatureSpontanee = type === 'demande_emploi';
  return `Madame, Monsieur,

${
  isCandidatureSpontanee
    ? `Particulièrement attentif au développement et aux succès récents de ${comp}, je me permets de vous adresser ma candidature pour le poste de ${pos}. Convaincu que votre dynamique de croissance offre des opportunités stimulantes, je souhaite mettre mon expertise et mon énergie au service de vos ambitions.`
    : `C'est avec un vif intérêt que je vous présente ma candidature au poste de ${pos} au sein de ${comp}. Suivant avec attention vos réalisations et votre positionnement d'excellence sur le marché, je suis particulièrement motivé à l'idée de mettre mes compétences au service de vos projets futurs.`
}

Mon parcours professionnel${topExp ? `, notamment en tant que ${topExp.position} chez ${topExp.company}` : ''}, m'a permis de développer une solide maîtrise dans le domaine de ${skills}. Rigoureux et doté d'un sens aigu des priorités, j'ai toujours eu à cœur de concevoir des solutions performantes, pérennes et orientées vers l'impact mesurable.

Rejoindre ${comp} représente pour moi l'opportunité de collaborer avec des professionnels exigeants autour de défis stimulants. Ma capacité d'adaptation rapide et mon esprit d'équipe me permettront d'être immédiatement opérationnel et de contribuer activement à vos objectifs.

Je serais honoré de pouvoir vous exposer plus en détail mes motivations et la pertinence de mon profil lors d'un entretien à votre convenance.

Dans cette attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${name}`;
}
