import React from 'react';
import { CVData, CVConfig, SectionId } from '../../types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
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

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, config, labels }) => {
  const { personal, summary, experiences, education, skills, languages, projects, certifications, interests } = data;
  const { primaryColor, fontStyle, density, showPhoto, photoShape } = config;

  const fontClass = fontStyle === 'mono' ? 'font-mono-cv' : fontStyle === 'sans' ? 'font-sans-cv' : 'font-serif-cv';
  const mbSection = density === 'compact' ? 'mb-3.5' : density === 'spacious' ? 'mb-6' : 'mb-4.5';

  const photoRadiusClass =
    photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  const renderSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.profile}
            </h2>
            <p className="text-[11.5px] leading-relaxed text-slate-700 text-justify">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (!experiences || experiences.length === 0) return null;
        return (
          <section key="experience" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.experience}
            </h2>
            <div className="space-y-3.5">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">{exp.position}</span>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] italic text-slate-600 mb-1">
                    {exp.company} {exp.location && `· ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">
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
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.education}
            </h2>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {edu.startDate && `${edu.startDate} – `}{edu.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] italic text-slate-600">
                    {edu.institution} {edu.location && `· ${edu.location}`}
                  </div>
                  {edu.description && (
                    <p className="text-[10.5px] text-slate-600 mt-0.5">{edu.description}</p>
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
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.skills}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-slate-700">
              {skills.map((skill) => (
                <div key={skill.id} className="flex justify-between items-center py-0.5">
                  <span className="font-medium text-slate-800">{skill.name}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: dot <= skill.level ? primaryColor : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <section key="languages" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.languages}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-700">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center py-0.5">
                  <span className="font-medium text-slate-800">{lang.name}</span>
                  <span className="text-[10px] text-slate-500 italic">{lang.level}</span>
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
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.projects}
            </h2>
            <div className="space-y-2 text-[11px]">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.role && <span className="text-slate-500 text-[10px]"> — {proj.role}</span>}
                  <p className="text-[10.5px] text-slate-600">{proj.description}</p>
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
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.certifications}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <div className="font-semibold text-slate-900">{cert.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {cert.issuer} {cert.date && `(${cert.date})`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'interests':
        if (!interests || interests.length === 0) return null;
        return (
          <section key="interests" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900"
              style={{ borderBottomColor: primaryColor }}
            >
              {labels.interests}
            </h2>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
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
    <div className={`w-full min-h-[297mm] bg-white text-slate-900 ${fontClass} p-8 shadow-sm print:shadow-none flex flex-col justify-between`}>
      <div>
        {/* Header */}
        <header className="text-center pb-4 mb-4 border-b-2" style={{ borderColor: primaryColor }}>
          {showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-3">
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className={`w-24 h-24 object-cover border border-slate-300 shadow-xs ${photoRadiusClass}`}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase mb-1">
            {personal.fullName || 'Votre Nom'}
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-600 mb-2.5">
            {personal.title || 'Titre Professionnel'}
          </p>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            {personal.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {personal.email}
              </span>
            )}
            {personal.phone && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {personal.phone}
                </span>
              </>
            )}
            {personal.address && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {personal.address}
                </span>
              </>
            )}
            {personal.website && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  {personal.website.replace(/^https?:\/\//, '')}
                </span>
              </>
            )}
            {personal.linkedin && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-slate-400" />
                  {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Dynamically render sections in customized order */}
        {sectionOrder.map((secId) => renderSection(secId))}
      </div>
    </div>
  );
};
