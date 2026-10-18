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

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, config, labels }) => {
  const { personal, summary, experiences, education, skills, languages, projects, certifications, interests } = data;
  const { primaryColor, fontStyle, density, showPhoto, photoShape } = config;

  const fontClass = fontStyle === 'mono' ? 'font-mono-cv' : fontStyle === 'sans' ? 'font-sans-cv' : 'font-serif-cv';
  const mbSection = density === 'compact' ? 'mb-4' : density === 'spacious' ? 'mb-6' : 'mb-5';

  const photoRadiusClass =
    photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-md' : 'rounded-none';

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  const renderMainSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className={mbSection}>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
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
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b-2"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold text-slate-950">{exp.position}</span>
                    <span className="text-[10px] text-slate-500 font-semibold tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-1">
                    {exp.company} {exp.location && `| ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
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
          <section key="projects">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b-2"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.projects}
            </h2>
            <div className="space-y-2 text-[11px]">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.role && <span className="text-slate-500 text-[10px]"> — {proj.role}</span>}
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

  const renderSideSection = (secId: SectionId) => {
    switch (secId) {
      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <section key="education">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.education}
            </h2>
            <div className="space-y-2 text-[11px]">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900 leading-snug">{edu.degree}</div>
                  <div className="text-[10.5px] text-slate-600">{edu.institution}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {edu.startDate && `${edu.startDate} – `}{edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (!skills || skills.length === 0) return null;
        return (
          <section key="skills">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.skills}
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="text-[11px]">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-medium text-slate-800">{skill.name}</span>
                    <span className="text-[9px] text-slate-400 tabular-nums">{skill.level}/5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
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
          <section key="languages">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.languages}
            </h2>
            <div className="space-y-1 text-[11px]">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between py-0.5">
                  <span className="font-medium text-slate-800">{l.name}</span>
                  <span className="text-[10px] text-slate-500">{l.level}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.certifications}
            </h2>
            <div className="space-y-1.5 text-[10.5px]">
              {certifications.map((c) => (
                <div key={c.id}>
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {c.issuer} {c.date && `(${c.date})`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'interests':
        if (!interests || interests.length === 0) return null;
        return (
          <section key="interests">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderBottomColor: `${primaryColor}40` }}
            >
              {labels.interests}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((int) => (
                <span
                  key={int.id}
                  className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700"
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
    <div className={`w-full min-h-[297mm] bg-white text-slate-900 ${fontClass} flex flex-col justify-between shadow-sm print:shadow-none`}>
      <div>
        {/* Executive Top Header */}
        <header className="bg-slate-900 text-white p-7 border-b-4" style={{ borderBottomColor: primaryColor }}>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
                {personal.fullName || 'Votre Nom'}
              </h1>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#93c5fd' }}
              >
                {personal.title || 'Titre Professionnel'}
              </p>
            </div>

            {showPhoto && personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className={`w-20 h-20 object-cover border-2 border-white/40 shadow-sm ${photoRadiusClass} shrink-0`}
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
            {personal.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {personal.phone}
              </span>
            )}
            {personal.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {personal.address}
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {personal.website.replace(/^https?:\/\//, '')}
              </span>
            )}
            {personal.linkedin && (
              <span className="flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-7 grid grid-cols-12 gap-7">
          {/* Main Column */}
          <div className="col-span-8 space-y-5">
            {sectionOrder.map((secId) => renderMainSection(secId))}
          </div>

          {/* Right Sidebar Column */}
          <div className="col-span-4 space-y-5 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
            {sectionOrder.map((secId) => renderSideSection(secId))}
          </div>
        </div>
      </div>
    </div>
  );
};
