import BlueLineTemplate from './BlueLineTemplate';
import GrayBannerTemplate from './GrayBannerTemplate';
import MinimalClassicTemplate from './MinimalClassicTemplate';
import ElegantBeigeTemplate from './ElegantBeigeTemplate';

export const RESUME_TEMPLATES = [
  {
    id: 'blue-line',
    name: 'Modern Blue Line',
    subtitle: 'Estelle Darcy Style',
    accentColor: '#1E5AA8',
    headerStyle: 'Centered Title with Accent Border Underline',
    description: 'Clean, professional layout with blue accents and clear sections.',
    detailedDesc: 'Clean white background with rich navy blue headings, full-width underline dividers, and centered header contact details.',
    component: BlueLineTemplate,
    badge: 'Popular',
    category: 'Modern',
    tags: ['Modern', 'ATS Friendly'],
    bestFor: 'All Professionals',
    sectionsCount: '7 Sections',
    columnsType: 'Single Column',
    atsScore: 'High ↗',
    previewColors: ['#1E56A0', '#1F2937', '#FFFFFF']
  },
  {
    id: 'gray-banner',
    name: 'Executive Gray Banner',
    subtitle: 'Olivia Sanchez Style',
    accentColor: '#475569',
    bannerBg: '#E2E7EC',
    headerStyle: 'Full-Width Shaded Gray Banner Headers',
    description: 'Bold banner header with a 3-column layout for experienced professionals.',
    detailedDesc: 'Sleek white background with subtle slate-gray shaded banner headers, bold dark text, and multi-column skills list.',
    component: GrayBannerTemplate,
    badge: null,
    category: 'Executive',
    tags: ['Professional', 'Executive'],
    bestFor: 'Experienced & Managers',
    sectionsCount: '7 Sections',
    columnsType: 'Hybrid Layout',
    atsScore: 'High ↗',
    previewColors: ['#E2E7EC', '#111827', '#FFFFFF']
  },

  {
    id: 'elegant-beige',
    name: 'Elegant Beige',
    subtitle: 'Warm Professional',
    accentColor: '#C5A059',
    bannerBg: '#FDFBF7',
    headerStyle: 'Elegant Warm Palette',
    description: 'Subtle beige theme with elegant typography and spacing.',
    detailedDesc: 'Refined typography with warm amber accents, ideal for creative and academic leadership roles.',
    component: ElegantBeigeTemplate,
    badge: null,
    category: 'Creative',
    tags: ['Creative', 'Professional'],
    bestFor: 'Designers & Educators',
    sectionsCount: '7 Sections',
    columnsType: 'Single Column',
    atsScore: 'Good ↗',
    previewColors: ['#fef3c7', '#78350f', '#FFFFFF']
  },

  {
    id: 'minimal-classic',
    name: 'Minimal Black Classic',
    subtitle: 'Timeless Helvetica',
    accentColor: '#111111',
    headerStyle: 'Centered Title with Timeless Horizontal Dividers',
    description: 'Clean, elegant monochrome single-column design.',
    detailedDesc: 'Pure black and white layout using Helvetica, centered headers, and thin gray horizontal rules. Highly ATS compatible and print friendly.',
    component: MinimalClassicTemplate,
    badge: 'Popular',
    category: 'Minimal',
    tags: ['Minimal', 'ATS Friendly', 'Classic'],
    bestFor: 'All Professions & Executives',
    sectionsCount: '7 Sections',
    columnsType: 'Single Column',
    atsScore: 'Excellent ↗',
    previewColors: ['#111111', '#555555', '#FFFFFF']
  }
];

export { default as BlueLineTemplate } from './BlueLineTemplate';
export { default as GrayBannerTemplate } from './GrayBannerTemplate';
export { default as ElegantBeigeTemplate } from './ElegantBeigeTemplate';
export { default as TemplateSelector } from './TemplateSelector';
export { default as ResumeRenderer } from './ResumeRenderer';
export { downloadResumePdf } from './ResumePdfExport';

/**
 * Utility to process sections and handle dynamic replacement if any compulsory section is missing.
 * Compulsory sections: Header, Summary, Education, Tech Skills, Project, Experience, Certification, Achievements.
 * Replacement sections: Publications, Volunteering, Extracurricular.
 */
export function getActiveResumeSections(data) {
  if (!data) return [];

  // Compulsory sections checking
  const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
  const hasProjects = Array.isArray(data.projects) && data.projects.length > 0;
  const hasCertifications = Array.isArray(data.certifications) && data.certifications.length > 0;
  const hasAchievements = Array.isArray(data.achievements) && data.achievements.length > 0;

  // Replacements pool
  const replacements = [];
  const raw = data.raw_data || {};
  
  const pubList = data.publications || raw.publications || [];
  if (Array.isArray(pubList) && pubList.length > 0) {
    replacements.push({ key: 'publications', title: 'Publications', items: pubList, type: 'publication' });
  }

  const volList = data.volunteerings || raw.volunteerings || [];
  if (Array.isArray(volList) && volList.length > 0) {
    replacements.push({ key: 'volunteerings', title: 'Volunteering & Community Service', items: volList, type: 'volunteering' });
  }

  const extraList = data.extracurriculars || raw.extracurriculars || [];
  if (Array.isArray(extraList) && extraList.length > 0) {
    replacements.push({ key: 'extracurriculars', title: 'Extracurricular Activities', items: extraList, type: 'extracurricular' });
  }

  let repIndex = 0;
  const popReplacement = () => {
    if (repIndex < replacements.length) {
      return replacements[repIndex++];
    }
    return null;
  };

  const sections = [];

  // 1. Professional Summary (Compulsory)
  if (data.summary) {
    sections.push({ key: 'summary', title: 'SUMMARY', content: data.summary, type: 'text' });
  }

  // 2. Work Experience (Compulsory or Replaced)
  if (hasExperience) {
    sections.push({ key: 'experience', title: 'PROFESSIONAL EXPERIENCE', items: data.experience, type: 'experience' });
  } else {
    const rep = popReplacement();
    if (rep) sections.push(rep);
  }

  // 3. Projects (Compulsory or Replaced)
  if (hasProjects) {
    sections.push({ key: 'projects', title: 'PROJECTS', items: data.projects, type: 'projects' });
  } else {
    const rep = popReplacement();
    if (rep) sections.push(rep);
  }

  // 4. Technical Skills (Compulsory)
  if (data.skills) {
    sections.push({ key: 'skills', title: 'TECHNICAL SKILLS', items: data.skills, type: 'skills' });
  }

  // 5. Education (Compulsory)
  if (Array.isArray(data.education) && data.education.length > 0) {
    sections.push({ key: 'education', title: 'EDUCATION', items: data.education, type: 'education' });
  }

  // 6. Certifications (Compulsory or Replaced)
  if (hasCertifications) {
    sections.push({ key: 'certifications', title: 'CERTIFICATIONS', items: data.certifications, type: 'certifications' });
  } else {
    const rep = popReplacement();
    if (rep) sections.push(rep);
  }

  // 7. Achievements (Compulsory or Replaced)
  if (hasAchievements) {
    sections.push({ key: 'achievements', title: 'ACHIEVEMENTS', items: data.achievements, type: 'achievements' });
  } else {
    const rep = popReplacement();
    if (rep) sections.push(rep);
  }

  // Push remaining replacements if any left and space permits
  while (repIndex < replacements.length) {
    sections.push(replacements[repIndex++]);
  }

  return sections;
}
