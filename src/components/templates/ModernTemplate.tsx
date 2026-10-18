import React from 'react';
import { CVData, CVConfig, SectionId } from '../../types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { DEFAULT_SECTION_ORDER } from '../../context/CVContext';

interface TemplateProps {
  data: CVData;
  config: CVConfig;
  labels: {
    profile: string;
    experience: string;
    education: string;
    skills: string;
    languages: string;
    projects: string;
    certifications: string;
    interests: string;
    contact: string;
  };
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, config, labels }) => {
  const { personal, summary, experiences, education, skills, languages, projects, certifications, interests } = data;
  const { primaryColor, fontStyle, density, showPhoto, photoShape } = config;

  const fontClass = fontStyle === 'serif' ? 'font-serif-cv' : fontStyle === 'mono' ? 'font-mono-cv' : 'font-sans-cv';
  const mbSection = density === 'compact' ? 'mb-4' : density === 'spacious' ? 'mb-6' : 'mb-5';

  const photoRadiusClass =
    photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-xl' : 'rounded-none';

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  // Main column sections
  const renderMainSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {labels.profile}
            </h2>
            <p className="text-[11.5px] leading-relaxed text-slate-600 text-justify">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (!experiences || experiences.length === 0) return null;
        return (
          <section key="experience" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {labels.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-3 border-l-2 border-slate-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mb-1.5">
                    {exp.company} {exp.location && `· ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <section key="education" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {labels.education}
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-3 border-l-2 border-slate-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{edu.degree}</h3>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {edu.startDate && `${edu.startDate} – `}{edu.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">
                    {edu.institution} {edu.location && `· ${edu.location}`}
                  </div>
                  {edu.description && (
                    <p className="text-[10.5px] text-slate-500 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!projects || projects.length === 0) return null;
        return (
          <section key="projects" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {labels.projects}
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    {proj.role && <span className="text-[10px] text-slate-500">{proj.role}</span>}
                  </div>
                  <p className="text-slate-600 text-[10.5px] mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {labels.certifications}
            </h2>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="font-bold text-slate-800">{cert.title}</div>
                  <div className="text-slate-500 text-[10px]">
                    {cert.issuer} {cert.date && `· ${cert.date}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Sidebar sections
  const renderSidebarSection = (secId: SectionId) => {
    switch (secId) {
      case 'skills':
        if (!skills || skills.length === 0) return null;
        return (
          <div key="skills" className="mb-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-white/80 border-b border-white/20 pb-1 mb-3">
              {labels.skills}
            </h3>
            <div className="space-y-2.5">
              {skills.map((skill) => (
                <div key={skill.id} className="text-[11px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-white/95">{skill.name}</span>
                    <span className="text-[9px] text-white/70 tabular-nums">{skill.level}/5</span>
                  </div>
                  <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-300"
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <div key="languages" className="mb-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-white/80 border-b border-white/20 pb-1 mb-3">
              {labels.languages}
            </h3>
            <div className="space-y-2 text-[11px]">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="font-medium text-white/95">{lang.name}</span>
                  <span className="text-[10px] text-white/75">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests || interests.length === 0) return null;
        return (
          <div key="interests" className="mb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-white/80 border-b border-white/20 pb-1 mb-2.5">
              {labels.interests}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((int) => (
                <span
                  key={int.id}
                  className="text-[10px] bg-white/15 px-2 py-0.5 rounded text-white/90"
                >
                  {int.name}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full min-h-[297mm] bg-white text-slate-800 ${fontClass} flex flex-row overflow-hidden shadow-sm print:shadow-none`}>
      {/* Left Sidebar */}
      <aside
        className="w-[34%] p-6 text-white flex flex-col justify-between"
        style={{ backgroundColor: primaryColor }}
      >
        <div>
          {/* Photo */}
          {showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-5">
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Photo'}
                className={`w-28 h-28 object-cover border-3 border-white/80 shadow-md ${photoRadiusClass}`}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Contact Details */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-white/80 border-b border-white/20 pb-1 mb-3">
              {labels.contact}
            </h3>
            <div className="space-y-2 text-[11px] text-white/90">
              {personal.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{personal.address}</span>
                </div>
              )}
              {personal.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{personal.website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                </div>
              )}
              {personal.github && (
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Render sidebar items in relative order */}
          {sectionOrder.map((secId) => renderSidebarSection(secId))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-[66%] p-7 flex flex-col justify-between bg-white">
        <div>
          {/* Header */}
          <header className="border-b border-slate-200 pb-4 mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {personal.fullName || 'Votre Nom'}
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase mt-1"
              style={{ color: primaryColor }}
            >
              {personal.title || 'Titre Professionnel'}
            </p>
          </header>

          {/* Render main sections dynamically in user configured order */}
          {sectionOrder.map((secId) => renderMainSection(secId))}
        </div>
      </main>
    </div>
  );
};
