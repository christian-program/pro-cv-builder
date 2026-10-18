import React from 'react';
import { CVData, CVConfig, SectionId } from '../../types/cv';
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

export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, config, labels }) => {
  const { personal, summary, experiences, education, skills, languages, projects, certifications, interests } = data;
  const { primaryColor, fontStyle, density, showPhoto, photoShape } = config;

  const fontClass = fontStyle === 'serif' ? 'font-serif-cv' : fontStyle === 'mono' ? 'font-mono-cv' : 'font-sans-cv';
  const mbSection = density === 'compact' ? 'mb-4' : density === 'spacious' ? 'mb-7' : 'mb-5';

  const photoRadiusClass =
    photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  const renderSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-1.5 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.profile}
            </div>
            <p className="text-[11.5px] leading-relaxed text-neutral-700 text-justify">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (!experiences || experiences.length === 0) return null;
        return (
          <section key="experience" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-3 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.experience}
            </div>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-semibold text-neutral-900">{exp.position}</span>
                    <span className="text-[10px] text-neutral-400 font-normal tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mb-1">
                    {exp.company} {exp.location && `— ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-neutral-600 leading-relaxed whitespace-pre-line">
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
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2.5 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.education}
            </div>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-neutral-900">{edu.degree}</span>
                    <span className="text-[10px] text-neutral-400 tabular-nums">
                      {edu.startDate && `${edu.startDate} – `}{edu.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {edu.institution} {edu.location && `— ${edu.location}`}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-neutral-500 mt-0.5">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (!skills || skills.length === 0) return null;
        return (
          <section key="skills" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.skills}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-700">
              {skills.map((s) => (
                <span key={s.id} className="flex items-center gap-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[9px] tabular-nums" style={{ color: primaryColor }}>
                    {Array.from({ length: s.level }, () => '●').join('')}
                  </span>
                </span>
              ))}
            </div>
          </section>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <section key="languages" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.languages}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-neutral-600">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-medium text-neutral-800">{l.name}</span>
                  <span className="text-[10px] text-neutral-400">{l.level}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!projects || projects.length === 0) return null;
        return (
          <section key="projects" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.projects}
            </div>
            <div className="space-y-1.5 text-[11px]">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-medium text-neutral-800">{proj.title}</span>
                  {proj.role && <span className="text-[10px] text-neutral-400"> ({proj.role})</span>}
                  <p className="text-[10.5px] text-neutral-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.certifications}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <span className="font-medium text-neutral-800">{cert.title}</span>
                  <span className="text-[10px] text-neutral-400"> — {cert.issuer} {cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'interests':
        if (!interests || interests.length === 0) return null;
        return (
          <section key="interests" className={mbSection}>
            <div
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}30` }}
            >
              {labels.interests}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600">
              {interests.map((int, i) => (
                <span key={int.id}>
                  {int.name}
                  {i < interests.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full min-h-[297mm] bg-white text-neutral-800 ${fontClass} p-9 flex flex-col justify-between shadow-sm print:shadow-none`}>
      <div>
        {/* Header */}
        <header className="pb-5 mb-5 border-b-2" style={{ borderBottomColor: primaryColor }}>
          <div className="flex items-start justify-between">
            <div className="max-w-[75%]">
              <h1 className="text-3xl font-light tracking-tight text-neutral-900 leading-none mb-1.5">
                {personal.fullName || 'Votre Nom'}
              </h1>
              <p
                className="text-xs font-semibold tracking-wide uppercase mb-3"
                style={{ color: primaryColor }}
              >
                {personal.title || 'Titre Professionnel'}
              </p>

              {/* Contact coordinates */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && (
                  <>
                    <span className="text-neutral-300">/</span>
                    <span>{personal.phone}</span>
                  </>
                )}
                {personal.address && (
                  <>
                    <span className="text-neutral-300">/</span>
                    <span>{personal.address}</span>
                  </>
                )}
                {personal.website && (
                  <>
                    <span className="text-neutral-300">/</span>
                    <span>{personal.website.replace(/^https?:\/\//, '')}</span>
                  </>
                )}
                {personal.linkedin && (
                  <>
                    <span className="text-neutral-300">/</span>
                    <span>{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                  </>
                )}
              </div>
            </div>

            {showPhoto && personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className={`w-20 h-20 object-cover grayscale contrast-125 border border-neutral-200 ${photoRadiusClass}`}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </header>

        {/* Dynamically render all sections in user specified order */}
        {sectionOrder.map((secId) => renderSection(secId))}
      </div>
    </div>
  );
};
