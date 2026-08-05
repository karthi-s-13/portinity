import React from 'react';
import { getActiveResumeSections } from './index';

export default function ElegantBeigeTemplate({ data }) {
  if (!data) return null;

  const isDemoData = !!data.isDemo;

  // 1. Create a deep copy/custom object for Elegant Beige constraints
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

  // Partition sections
  const topSections = sections.filter(s => ['summary', 'experience', 'projects', 'volunteering', 'publication'].includes(s.key));
  const bottomLeftSections = sections.filter(s => ['education', 'certifications'].includes(s.key));
  const bottomRightSections = sections.filter(s => ['skills', 'achievements', 'extracurriculars'].includes(s.key));

  // Render Table-Based Bullet Points
  const renderBullets = (bullets) => {
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) return null;
    return (
      <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
        {bullets.map((b, bi) => (
          <table key={bi} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5px' }}>
            <tbody>
              <tr>
                <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#C5A059', fontWeight: 'bold', fontSize: '9pt' }}>
                  ·
                </td>
                <td style={{ verticalAlign: 'top', padding: 0, fontSize: '9pt', color: '#2C2A29', lineHeight: '1.3' }}>
                  {b}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    );
  };

  // Section Header with Gold Underline
  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: '8px', marginTop: '12px', flexShrink: 0 }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: '700',
        color: '#2C2A29',
        textTransform: 'uppercase',
        margin: 0,
        letterSpacing: '0.8px',
        fontFamily: "'Georgia', 'Garamond', serif",
        fontStyle: 'italic'
      }}>
        {title}
      </h2>
      <div style={{ borderBottom: '1px solid #C5A059', marginTop: '6px' }} />
    </div>
  );

  return (
    <div
      className="resume-paper elegant-beige-template"
      style={{
        backgroundColor: '#FDFBF7',
        color: '#2C2A29',
        fontFamily: "'Georgia', 'Garamond', 'Times New Roman', serif",
        width: '210mm',
        height: '297mm',
        minHeight: '297mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: '4px',
        lineHeight: 1.25,
        fontSize: '9.5pt',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. HEADER BANNER */}
      <div style={{
        padding: '24px 24px 10px 24px',
        textAlign: 'center',
        boxSizing: 'border-box',
        width: '100%',
        flexShrink: 0
      }}>
        {/* Name */}
        <h1 style={{
          fontSize: '28pt',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#2C2A29',
          margin: '0 0 4px 0',
          fontFamily: "'Georgia', 'Garamond', serif"
        }}>
          {name}
        </h1>

        {/* Headline */}
        <div style={{
          fontSize: '11pt',
          fontWeight: '500',
          color: '#66615C',
          letterSpacing: '0.5px',
          margin: '0 0 6px 0',
          fontFamily: "'Georgia', 'Garamond', serif"
        }}>
          {headline}
        </div>

        {/* Contacts Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px 14px',
          fontSize: '8.5pt',
          color: '#66615C',
          width: '100%',
          marginTop: '6px',
          fontFamily: "Arial, sans-serif" // Clean sans accent
        }}>
          {location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <span>{location}</span>
              <span style={{ color: '#C5A059', fontWeight: 'bold' }}>·</span>
            </span>
          )}
          {phone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <span>{phone}</span>
              <span style={{ color: '#C5A059', fontWeight: 'bold' }}>·</span>
            </span>
          )}
          {email && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <a href={`mailto:${email}`} style={{ color: '#2C2A29', textDecoration: 'underline' }}>{email}</a>
              {(linkedin || github) && <span style={{ color: '#C5A059', fontWeight: 'bold' }}>·</span>}
            </span>
          )}
          {linkedin && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#2C2A29', textDecoration: 'underline' }}>
                {linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
              {github && <span style={{ color: '#C5A059', fontWeight: 'bold' }}>·</span>}
            </span>
          )}
          {github && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noreferrer" style={{ color: '#2C2A29', textDecoration: 'underline' }}>
                {github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </span>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div style={{
        padding: '4mm 12mm 10mm 12mm',
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
            <SectionHeader title={sec.title} />

            {/* Summary / Profile */}
            {sec.type === 'text' && (
              <p style={{ margin: '0 4px', color: '#2C2A29', fontSize: '9pt', textAlign: 'justify', lineHeight: '1.3' }}>
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
                          <td style={{ fontWeight: '700', color: '#2C2A29', fontSize: '9.5pt', textAlign: 'left', padding: 0 }}>
                            {item.role || item.title}
                            {item.company && (
                              <span style={{ fontWeight: 'normal', color: '#66615C', fontStyle: 'italic' }}>
                                &nbsp;— {item.company}
                              </span>
                            )}
                          </td>
                          <td style={{ color: '#C5A059', fontWeight: '700', fontSize: '8.5pt', textAlign: 'right', padding: 0, fontFamily: "Arial, sans-serif" }}>
                            {item.dates}
                          </td>
                        </tr>
                        {item.location && (
                          <tr>
                            <td colSpan="2" style={{ fontSize: '8.5pt', color: '#66615C', textAlign: 'left', padding: '1px 0 2px 0' }}>
                              {item.location}
                            </td>
                          </tr>
                        )}
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
                          <td style={{ fontWeight: '700', color: '#2C2A29', fontSize: '9.5pt', textAlign: 'left', padding: 0 }}>
                            {item.title}
                            {item.repo_url && (
                              <a href={item.repo_url} target="_blank" rel="noreferrer" style={{ color: '#C5A059', textDecoration: 'underline', marginLeft: '8px', fontSize: '8.5pt', fontWeight: 'bold' }}>
                                [GitHub]
                              </a>
                            )}
                            {item.live_url && (
                              <a href={item.live_url} target="_blank" rel="noreferrer" style={{ color: '#C5A059', textDecoration: 'underline', marginLeft: '8px', fontSize: '8.5pt', fontWeight: 'bold' }}>
                                [Demo]
                              </a>
                            )}
                          </td>
                          <td style={{ color: '#C5A059', fontWeight: '700', fontSize: '8.5pt', textAlign: 'right', padding: 0, fontFamily: "Arial, sans-serif" }}>
                            {item.dates}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* --- CHANGE HERE: Tech Stack moved to its own line below the table --- */}
                    {item.tech_stack && (
                      <div style={{ fontWeight: 'normal', color: '#66615C', fontSize: '8.5pt', marginTop: '2px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '600' }}>Tech Stack:</span> {item.tech_stack}
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
          fontSize: 0,
          marginTop: '2px',
          flexShrink: 0
        }}>
          {/* Left Column (Education & Certifications) */}
          <div style={{
            width: '48%',
            display: 'inline-block',
            verticalAlign: 'top',
            fontSize: '9.5pt',
            boxSizing: 'border-box'
          }}>
            {bottomLeftSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <SectionHeader title={sec.title} />

                {/* Education */}
                {sec.type === 'education' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sec.items.map((edu, i) => (
                      <div key={i} style={{ paddingLeft: '4px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#2C2A29', fontSize: '9pt', textAlign: 'left', padding: 0 }}>
                                {edu.institution}
                              </td>
                              <td style={{ color: '#66615C', fontWeight: '500', fontSize: '8pt', textAlign: 'right', padding: 0, fontFamily: "Arial, sans-serif" }}>
                                {edu.dates}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ fontSize: '8.5pt', color: '#66615C', textAlign: 'left', padding: '1px 0 0 0', fontStyle: 'italic' }}>
                                {edu.degree}
                              </td>
                              <td style={{ fontSize: '8pt', color: '#66615C', textAlign: 'right', padding: '1px 0 0 0' }}>
                                {edu.location || ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {edu.marks && <div style={{ fontSize: '8pt', color: '#66615C', marginTop: '2.5px' }}>{edu.marks}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {sec.type === 'certifications' && (
                  <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
                    {sec.items.map((c, i) => (
                      <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5px' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#C5A059', fontWeight: 'bold', fontSize: '9pt' }}>·</td>
                            <td style={{ verticalAlign: 'top', padding: 0, fontSize: '8.5pt', color: '#2C2A29', lineHeight: '1.25' }}>
                              <strong style={{ color: '#2C2A29', fontWeight: '600' }}>{c.title || c.name}</strong>
                              {c.issuer && ` – ${c.issuer}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Spacer Div (4%) */}
          <div style={{ width: '4%', display: 'inline-block' }} />

          {/* Right Column (Technical Skills & Achievements) */}
          <div style={{
            width: '48%',
            display: 'inline-block',
            verticalAlign: 'top',
            fontSize: '9.5pt',
            boxSizing: 'border-box'
          }}>
            {bottomRightSections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <SectionHeader title={sec.title} />

                {/* Skills */}
                {sec.type === 'skills' && (
                  <div style={{ paddingLeft: '4px', fontSize: '8.5pt', lineHeight: '1.35' }}>
                    {typeof sec.items === 'object' && !Array.isArray(sec.items) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {Object.entries(sec.items).map(([cat, sk], i) => (
                          <div key={i}>
                            <strong style={{ color: '#2C2A29' }}>{cat}: </strong>
                            <span style={{ color: '#66615C' }}>{Array.isArray(sk) ? sk.join(', ') : String(sk)}</span>
                          </div>
                        ))}
                      </div>
                    ) : Array.isArray(sec.items) ? (
                      <div style={{ color: '#66615C' }}>{sec.items.join(', ')}</div>
                    ) : (
                      <div style={{ color: '#66615C' }}>{String(sec.items)}</div>
                    )}
                  </div>
                )}

                {/* Achievements */}
                {sec.type === 'achievements' && (
                  <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
                    {sec.items.map((a, i) => {
                      const title = typeof a === 'object' ? (a.title || a.description) : a;
                      const desc = typeof a === 'object' ? a.description : '';
                      return (
                        <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5px' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#C5A059', fontWeight: 'bold', fontSize: '9pt' }}>·</td>
                              <td style={{ verticalAlign: 'top', padding: 0, fontSize: '8.5pt', color: '#2C2A29', lineHeight: '1.25' }}>
                                <strong style={{ color: '#2C2A29', fontWeight: '700' }}>{title}</strong>
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
