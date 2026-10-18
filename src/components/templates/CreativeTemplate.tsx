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

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, config, labels }) => {
  const { personal, summary, experiences, education, skills, languages, projects, certifications, interests } = data;
  const { primaryColor, fontStyle, density, showPhoto, photoShape } = config;

  const fontClass = fontStyle === 'serif' ? 'font-serif-cv' : fontStyle === 'mono' ? 'font-mono-cv' : 'font-sans-cv';
  const mbSection = density === 'compact' ? 'mb-4' : density === 'spacious' ? 'mb-6' : 'mb-5';

  const photoRadiusClass =
    photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none';

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  const renderLeftColumnSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
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
              className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                    {exp.company} {exp.location && `· ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                      {exp.description}
                    </p>
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
              className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.projects}
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px] p-2.5 rounded-lg bg-slate-50 border border-slate-100">
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

      default:
        return null;
    }
  };

  const renderRightColumnSection = (secId: SectionId) => {
    switch (secId) {
      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <section key="education" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.education}
            </h2>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-[10.5px] text-slate-600 font-medium">
                    {edu.institution}
                  </div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {edu.startDate && `${edu.startDate} – `}{edu.endDate}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{edu.description}</p>
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
              className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.skills}
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="text-[11px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-800">{skill.name}</span>
                    <span className="text-[9px] text-slate-400 tabular-nums">{skill.level}/5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(skill.level / 5) * 100}%`,
                        backgroundColor: primaryColor,
                      }}
                    />
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
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.languages}
            </h2>
            <div className="space-y-1.5 text-[11px]">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="font-medium text-slate-800">{lang.name}</span>
                  <span className="text-[10px] text-slate-500">{lang.level}</span>
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
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.certifications}
            </h2>
            <div className="space-y-1.5 text-[10.5px]">
              {certifications.map((cert) => (
                <div key={cert.id} className="border-l-2 pl-2" style={{ borderColor: primaryColor }}>
                  <div className="font-semibold text-slate-800">{cert.title}</div>
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
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {labels.interests}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((int) => (
                <span
                  key={int.id}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                >
                  {int.name}
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
    <div className={`w-full min-h-[297mm] bg-white text-slate-800 ${fontClass} flex flex-col justify-between shadow-sm print:shadow-none`}>
      <div>
        {/* Creative Top Banner */}
        <header className="p-7 text-white relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10">
            {showPhoto && personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className={`w-24 h-24 object-cover border-2 border-white/70 shadow-lg ${photoRadiusClass} shrink-0`}
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {personal.fullName || 'Votre Nom'}
              </h1>
              <p className="text-sm font-medium tracking-wide text-white/90 mb-3">
                {personal.title || 'Titre Professionnel'}
              </p>

              {/* Coordinates Bar */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/80 justify-center md:justify-start">
                {personal.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 opacity-80" />
                    {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 opacity-80" />
                    {personal.phone}
                  </span>
                )}
                {personal.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 opacity-80" />
                    {personal.address}
                  </span>
                )}
                {personal.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 opacity-80" />
                    {personal.website.replace(/^https?:\/\//, '')}
                  </span>
                )}
                {personal.linkedin && (
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 opacity-80" />
                    {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                  </span>
                )}
                {personal.github && (
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 opacity-80" />
                    {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Two Column Layout Body */}
        <div className="p-7 grid grid-cols-12 gap-7">
          {/* Main Column (7 cols) */}
          <div className="col-span-7 space-y-5">
            {sectionOrder.map((secId) => renderLeftColumnSection(secId))}
          </div>

          {/* Side Column (5 cols) */}
          <div className="col-span-5 space-y-5">
            {sectionOrder.map((secId) => renderRightColumnSection(secId))}
          </div>
        </div>
      </div>
    </div>
  );
};
