import React from 'react';
import { 
  HiUser, HiBriefcase, HiCommandLine, HiCpuChip, 
  HiAcademicCap, HiShieldCheck, HiTrophy,
  HiEnvelope, HiPhone, HiMapPin
} from 'react-icons/hi2';
import { getActiveResumeSections } from './index';

// Custom SVGs for LinkedIn and GitHub (monochrome white/light-gray for header)
const LinkedInIcon = ({ color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function GrayBannerTemplate({ data }) {
  if (!data) return null;

  const isDemoData = !!data.isDemo;

  // 1. Create a deep copy/custom object for Gray Banner constraints
  const cleanedData = { ...data };

  // Remove excluded sections
  cleanedData.publications = [];
  cleanedData.volunteerings = [];
  cleanedData.extracurriculars = [];
  if (cleanedData.raw_data) {
    cleanedData.raw_data = {
      ...cleanedData.raw_data,
      publications: [],
      volunteerings: [],
      extracurriculars: []
    };
  }

  // Summary constraint: max 50 words
  let summary = cleanedData.summary || '';
  if (isDemoData && !summary) {
    summary = 'Detail-oriented and passionate software engineer with experience in building scalable web applications, RESTful APIs, and database systems. Strong foundation in data structures, algorithms, and software design principles.';
  }
  if (summary) {
    const summaryWords = summary.trim().split(/\s+/).filter(Boolean);
    if (summaryWords.length > 50) {
      summary = summaryWords.slice(0, 50).join(' ') + '...';
    }
  }
  cleanedData.summary = summary;

  // Experience constraint: max 3 at most, exactly 2 bullets of 15 to 18 words
  let expList = cleanedData.experience || [];
  if (isDemoData && expList.length === 0) {
    expList = [
      {
        role: "Software Engineering Intern",
        company: "Acme Corporation",
        dates: "Jun 2023 – Aug 2023",
        location: "New York, NY",
        bullets: [
          "Developed and optimized backend service APIs, increasing query performance by 25%.",
          "Collaborated with cross-functional teams to integrate new features into the user dashboard."
        ]
      }
    ];
  }
  cleanedData.experience = expList.slice(0, 3).map(exp => {
    let bList = exp.bullets || [];
    if (!Array.isArray(bList)) {
      bList = typeof bList === 'string' ? [bList] : [];
    }
    const trimmedBullets = bList.slice(0, 2).map(b => {
      const words = b.split(/\s+/).filter(Boolean);
      if (words.length > 18) {
        return words.slice(0, 18).join(' ') + '...';
      }
      return b;
    });
    return { ...exp, bullets: trimmedBullets };
  });

  // Projects constraint: max 3 at most, GitHub link mandatory, exactly 2 bullets of 15 to 18 words
  let projList = cleanedData.projects || [];
  if (isDemoData && projList.length === 0) {
    projList = [
      {
        title: "E-Commerce Microservices Platform",
        tech_stack: "React, FastAPI, PostgreSQL, Docker",
        dates: "Jan 2024 – May 2024",
        bullets: [
          "Designed and implemented secure payment gateway integration.",
          "Optimized search performance by 35% through query indexing."
        ],
        repo_url: "https://github.com/johndoe/ecommerce"
      }
    ];
  }
  cleanedData.projects = projList
    .filter(proj => proj.repo_url && proj.repo_url.trim() !== '')
    .slice(0, 3)
    .map(proj => {
      let bList = proj.bullets || [];
      if (!Array.isArray(bList)) {
        bList = typeof bList === 'string' ? [bList] : [];
      }
      const trimmedBullets = bList.slice(0, 2).map(b => {
        const words = b.split(/\s+/).filter(Boolean);
        if (words.length > 18) {
          return words.slice(0, 18).join(' ') + '...';
        }
        return b;
      });
      return { ...proj, bullets: trimmedBullets };
    });

  // Certifications constraint: max 3 certs
  let rawCerts = cleanedData.certifications || [];
  if (isDemoData && rawCerts.length === 0) {
    rawCerts = [
      { title: "AWS Certified Developer", issuer: "Amazon Web Services", dates: "2024" },
      { title: "SQL Advanced Certification", issuer: "HackerRank", dates: "2023" }
    ];
  }
  cleanedData.certifications = rawCerts.slice(0, 3);

  // Education constraint: max 1 top education
  let rawEdus = cleanedData.education || [];
  if (isDemoData && rawEdus.length === 0) {
    rawEdus = [
      {
        degree: "B.S. in Computer Science",
        institution: "State University",
        dates: "2020 – 2024",
        marks: "GPA: 3.8 / 4.0",
        location: "New York, NY"
      }
    ];
  }
  cleanedData.education = rawEdus.slice(0, 1);

  // Achievements constraint: max 3 achievements
  let rawAchievements = cleanedData.achievements || [];
  if (isDemoData && rawAchievements.length === 0) {
    rawAchievements = [
      { title: "First Place — Regional Hackathon 2024." },
      { title: "Dean's List for Academic Excellence (2020-2024)." },
      { title: "Solved 400+ algorithmic coding questions on LeetCode." }
    ];
  }
  cleanedData.achievements = rawAchievements.slice(0, 3);

  // Skills constraint: max 15 skills total
  let rawSkills = cleanedData.skills || {};
  if (isDemoData && Object.keys(rawSkills).length === 0) {
    rawSkills = {
      "Languages": ["Python", "Java", "C++", "SQL", "JavaScript"],
      "Frameworks": ["React", "Node.js", "FastAPI"],
      "Databases": ["MySQL", "PostgreSQL", "MongoDB"],
      "Tools": ["Git", "GitHub", "Docker", "Postman"]
    };
  }
  let skillsObj = {};
  if (typeof rawSkills === 'object' && !Array.isArray(rawSkills)) {
    for (const [cat, items] of Object.entries(rawSkills)) {
      if (Array.isArray(items) && items.length > 0) {
        skillsObj[cat] = items.slice(0, 6);
      } else if (typeof items === 'string' && items.trim() !== '') {
        const list = items.split(',').map(s => s.trim()).filter(Boolean);
        skillsObj[cat] = list.slice(0, 6);
      }
    }
  } else if (Array.isArray(rawSkills)) {
    skillsObj = rawSkills.slice(0, 15);
  }
  cleanedData.skills = skillsObj;

  const sections = getActiveResumeSections(cleanedData);

  // Parse direct contact fields
  const name = cleanedData.name || (isDemoData ? 'John Doe' : '');
  const headline = cleanedData.headline || (isDemoData ? 'Software Engineer' : '');
  const email = cleanedData.email || (isDemoData ? 'johndoe@example.com' : '');
  const phone = cleanedData.phone || (isDemoData ? '+1 (555) 019-2834' : '');
  const location = cleanedData.location || (isDemoData ? 'New York, NY' : '');
  const linkedin = cleanedData.linkedin || (isDemoData ? 'linkedin.com/in/johndoe' : '');
  const github = cleanedData.github || (isDemoData ? 'github.com/johndoe' : '');

  // Partition sections into Top (Full Width) vs Bottom (Split Columns)
  const topSections = sections.filter(s => ['summary', 'experience', 'projects', 'volunteering', 'publication'].includes(s.key));
  const bottomLeftSections = sections.filter(s => ['skills', 'certifications'].includes(s.key));
  const bottomRightSections = sections.filter(s => ['education', 'achievements', 'extracurriculars'].includes(s.key));

  // Helper to resolve section icons
  const getSectionIcon = (key) => {
    const iconStyle = { fontSize: '11pt', display: 'inline-block', verticalAlign: 'middle' };
    switch (key) {
      case 'summary':
        return <HiUser style={iconStyle} />;
      case 'experience':
      case 'volunteering':
        return <HiBriefcase style={iconStyle} />;
      case 'projects':
      case 'publication':
        return <HiCommandLine style={iconStyle} />;
      case 'skills':
        return <HiCpuChip style={iconStyle} />;
      case 'education':
        return <HiAcademicCap style={iconStyle} />;
      case 'certifications':
        return <HiShieldCheck style={iconStyle} />;
      case 'achievements':
      case 'extracurriculars':
        return <HiTrophy style={iconStyle} />;
      default:
        return <HiUser style={iconStyle} />;
    }
  };

  // Render Table-Based Bullet Points for PDF Parity
  const renderBullets = (bullets) => {
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) return null;
    return (
      <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
        {bullets.map((b, bi) => (
          <table key={bi} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
            <tbody>
              <tr>
                <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#27272A', fontWeight: 'bold', fontSize: '9pt' }}>
                  •
                </td>
                <td style={{ verticalAlign: 'top', padding: 0, fontSize: '9pt', color: '#18181B', lineHeight: '1.3' }}>
                  {b}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    );
  };

  // Table-based Section Header to prevent flex-line bleed
  const SectionHeader = ({ title, sectionKey }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px', marginTop: '2px' }}>
      <tbody>
        <tr>
          <td style={{
            width: '1px',
            whiteSpace: 'nowrap',
            padding: '4px 8px',
            backgroundColor: '#27272A',
            color: '#ffffff',
            borderRadius: '2px',
            fontSize: '9pt',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: '1',
            verticalAlign: 'middle'
          }}>
            <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', lineHeight: '1' }}>
              {getSectionIcon(sectionKey)}
            </span>
            <span style={{ display: 'inline-block', verticalAlign: 'middle', lineHeight: '1', position: 'relative', top: '-1px' }}>
              {title}
            </span>
          </td>
          <td style={{ padding: '0 0 0 8px', verticalAlign: 'middle', width: '100%' }}>
            <div style={{ height: '0.8pt', backgroundColor: '#27272A', width: '100%' }} />
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div 
      className="resume-paper gray-banner-template"
      style={{
        backgroundColor: '#ffffff',
        color: '#18181B',
        fontFamily: "'TeX Gyre Heros', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        width: '210mm',
        height: '297mm',
        minHeight: '297mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: '4px',
        lineHeight: 1.3,
        fontSize: '9.5pt',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. TOP EXECUTIVE HEADER BANNER (Unified gray block) */}
      <div style={{
        backgroundColor: '#27272A',
        padding: '20px 24px 14px 24px',
        color: '#ffffff',
        textAlign: 'center',
        boxSizing: 'border-box',
        width: '100%',
        flexShrink: 0
      }}>
        {/* Name */}
        <h1 style={{
          fontSize: '22pt',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#ffffff',
          margin: '0 0 4px 0'
        }}>
          {name}
        </h1>
        
        {/* Headline */}
        <div style={{
          fontSize: '11pt',
          fontWeight: '500',
          color: '#E5E7EB',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          {headline}
        </div>

        {/* Contacts Sub-Bar housing secondary contact info */}
        <div style={{
          backgroundColor: '#F4F4F5',
          borderRadius: '4px',
          padding: '6px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px 16px',
          fontSize: '8.5pt',
          color: '#18181B',
          width: '100%',
          boxSizing: 'border-box',
          marginTop: '6px'
        }}>
          {email && (
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              <table style={{ borderCollapse: 'collapse', display: 'inline-table', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 0, paddingRight: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
                      <HiEnvelope style={{ color: '#27272A', fontSize: '10pt', display: 'block' }} />
                    </td>
                    <td style={{ padding: 0, verticalAlign: 'middle', lineHeight: 1 }}>
                      <a href={`mailto:${email}`} style={{ color: '#18181B', textDecoration: 'none' }}>{email}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          )}
          {phone && (
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              <table style={{ borderCollapse: 'collapse', display: 'inline-table', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 0, paddingRight: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
                      <HiPhone style={{ color: '#27272A', fontSize: '10pt', display: 'block' }} />
                    </td>
                    <td style={{ padding: 0, verticalAlign: 'middle', lineHeight: 1 }}>
                      <span>{phone}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          )}
          {location && (
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              <table style={{ borderCollapse: 'collapse', display: 'inline-table', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 0, paddingRight: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
                      <HiMapPin style={{ color: '#27272A', fontSize: '10pt', display: 'block' }} />
                    </td>
                    <td style={{ padding: 0, verticalAlign: 'middle', lineHeight: 1 }}>
                      <span>{location}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          )}
          {linkedin && (
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              <table style={{ borderCollapse: 'collapse', display: 'inline-table', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 0, paddingRight: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
                      <LinkedInIcon color="#27272A" />
                    </td>
                    <td style={{ padding: 0, verticalAlign: 'middle', lineHeight: 1 }}>
                      <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#18181B', textDecoration: 'none' }}>
                        {linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          )}
          {github && (
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              <table style={{ borderCollapse: 'collapse', display: 'inline-table', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 0, paddingRight: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
                      <GitHubIcon color="#27272A" />
                    </td>
                    <td style={{ padding: 0, verticalAlign: 'middle', lineHeight: 1 }}>
                      <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noreferrer" style={{ color: '#18181B', textDecoration: 'none' }}>
                        {github.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div style={{
        padding: '12.7mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        overflow: 'hidden'
      }}>
        
        {/* ================= FULL WIDTH TOP SECTIONS ================= */}
        {topSections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '2px' }}>
            <SectionHeader title={sec.title} sectionKey={sec.key} />

            {/* Summary */}
            {sec.type === 'text' && (
              <p style={{ margin: '0 4px', color: '#18181B', fontSize: '9pt', textAlign: 'justify', lineHeight: '1.3' }}>
                {sec.content}
              </p>
            )}

            {/* Experience */}
            {sec.type === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.items.map((item, i) => (
                  <div key={i} style={{ paddingLeft: '4px', paddingRight: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '700', color: '#27272A', fontSize: '9.5pt', textAlign: 'left', padding: 0 }}>
                            {item.role || item.title}
                          </td>
                          <td style={{ color: '#52525B', fontWeight: '500', fontSize: '8.5pt', textAlign: 'right', padding: 0 }}>
                            {item.dates}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '9pt', color: '#52525B', fontStyle: 'italic', textAlign: 'left', padding: '1px 0 2px 0' }}>
                            {item.company}
                          </td>
                          <td style={{ fontSize: '8.5pt', color: '#52525B', textAlign: 'right', padding: '1px 0 2px 0' }}>
                            {item.location || ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {renderBullets(item.bullets)}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {sec.type === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.items.map((item, i) => (
                  <div key={i} style={{ paddingLeft: '4px', paddingRight: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '700', color: '#27272A', fontSize: '9.5pt', textAlign: 'left', padding: 0 }}>
                            {item.title}
                            {item.repo_url && (
                              <a href={item.repo_url} target="_blank" rel="noreferrer" style={{ color: '#52525B', textDecoration: 'none', marginLeft: '6px', fontSize: '8pt', fontWeight: '500' }}>
                                [GitHub]
                              </a>
                            )}
                            {item.live_url && (
                              <a href={item.live_url} target="_blank" rel="noreferrer" style={{ color: '#52525B', textDecoration: 'none', marginLeft: '6px', fontSize: '8pt', fontWeight: '500' }}>
                                [Demo]
                              </a>
                            )}
                          </td>
                          <td style={{ color: '#52525B', fontWeight: '500', fontSize: '8.5pt', textAlign: 'right', padding: 0 }}>
                            {item.dates}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {item.tech_stack && (
                      <div style={{ fontSize: '8.5pt', color: '#52525B', fontWeight: '500', marginTop: '1px', marginBottom: '2px' }}>
                        Tech Stack: {item.tech_stack}
                      </div>
                    )}
                    {renderBullets(item.bullets)}
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}

        {/* ================= 2-COLUMN BOTTOM SPLIT LAYOUT ================= */}
        <div style={{
          width: '100%',
          boxSizing: 'border-box',
          fontSize: 0, // Prevent inline-block space gaps
          marginTop: '2px',
          flexShrink: 0
        }}>
          {/* Left Column (Skills & Certifications) */}
          <div style={{ 
            width: '48%', 
            display: 'inline-block', 
            verticalAlign: 'top', 
            fontSize: '9.5pt', 
            boxSizing: 'border-box'
          }}>
            {bottomLeftSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <SectionHeader title={sec.title} sectionKey={sec.key} />
                
                {/* Skills */}
                {sec.type === 'skills' && (
                  <div style={{ paddingLeft: '4px', fontSize: '8.5pt', lineHeight: '1.35' }}>
                    {typeof sec.items === 'object' && !Array.isArray(sec.items) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {Object.entries(sec.items).map(([cat, sk], i) => (
                          <div key={i}>
                            <strong style={{ color: '#222222' }}>{cat}: </strong>
                            <span style={{ color: '#4B5563' }}>{Array.isArray(sk) ? sk.join(', ') : String(sk)}</span>
                          </div>
                        ))}
                      </div>
                    ) : Array.isArray(sec.items) ? (
                      <div style={{ color: '#4B5563' }}>{sec.items.join(', ')}</div>
                    ) : (
                      <div style={{ color: '#4B5563' }}>{String(sec.items)}</div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {sec.type === 'certifications' && (
                  <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
                    {sec.items.map((c, i) => {
                      const url = c.credential_url || c.url;
                      return (
                        <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#3F3F46', fontWeight: 'bold', fontSize: '9pt' }}>•</td>
                              <td style={{ verticalAlign: 'top', padding: 0, fontSize: '8.5pt', color: '#222222', lineHeight: '1.25' }}>
                                <strong style={{ color: '#222222', fontWeight: '600' }}>{c.title || c.name}</strong>
                                {c.issuer && ` – ${c.issuer}`}
                                {c.dates && ` (${c.dates})`}
                                {url && (
                                  <span style={{ marginLeft: '3px' }}>
                                    {' – '}
                                    <a href={url} target="_blank" rel="noreferrer" style={{ color: '#3F3F46', textDecoration: 'none', fontWeight: '600' }}>
                                      View Credential
                                    </a>
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Spacer Div (4%) */}
          <div style={{ width: '4%', display: 'inline-block' }} />

          {/* Right Column (Education & Achievements) */}
          <div style={{ 
            width: '48%', 
            display: 'inline-block', 
            verticalAlign: 'top', 
            fontSize: '9.5pt', 
            boxSizing: 'border-box'
          }}>
            {bottomRightSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <SectionHeader title={sec.title} sectionKey={sec.key} />

                {/* Education */}
                {sec.type === 'education' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sec.items.map((edu, i) => (
                      <div key={i} style={{ paddingLeft: '4px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#222222', fontSize: '9pt', textAlign: 'left', padding: 0 }}>
                                {edu.institution}
                              </td>
                              <td style={{ color: '#6B7280', fontWeight: '500', fontSize: '8pt', textAlign: 'right', padding: 0 }}>
                                {edu.dates}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ fontSize: '8.5pt', color: '#6B7280', textAlign: 'left', padding: '1px 0 0 0' }}>
                                {edu.degree}
                              </td>
                              <td style={{ fontStyle: 'italic', fontSize: '8pt', color: '#6B7280', textAlign: 'right', padding: '1px 0 0 0' }}>
                                {edu.location || ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {edu.marks && <div style={{ fontSize: '8pt', color: '#6b7280', marginTop: '2.5px' }}>{edu.marks}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {sec.type === 'achievements' && (
                  <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
                    {sec.items.map((a, i) => {
                      const title = typeof a === 'object' ? (a.title || a.description) : a;
                      const desc = typeof a === 'object' ? a.description : '';
                      return (
                        <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#3F3F46', fontWeight: 'bold', fontSize: '9pt' }}>•</td>
                              <td style={{ verticalAlign: 'top', padding: 0, fontSize: '8.5pt', color: '#222222', lineHeight: '1.25' }}>
                                <strong style={{ color: '#222222', fontWeight: '700' }}>{title}</strong>
                                {desc && `: ${desc}`}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
