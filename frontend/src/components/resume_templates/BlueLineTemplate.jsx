import React from 'react';

// Inline SVG Outline Icons styled dynamically
const PhoneIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EmailIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LocationIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LinkedInIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PortfolioIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const GitHubIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function BlueLineTemplate({ data, accentColor = '#1E5AA8', templateId }) {
  if (!data) return null;

  const isDemoData = !!data.isDemo;

  // 1. Core Profile Details & Fallbacks
  const name = data.name || (isDemoData ? 'John Doe' : '');
  const headline = data.headline || (isDemoData ? 'Software Engineer' : '');
  
  let summary = data.summary || (isDemoData ? 'Detail-oriented and passionate software engineer with experience in building scalable web applications, RESTful APIs, and database systems. Strong foundation in data structures, algorithms, and software design principles.' : '');
  if (summary) {
    const summaryWords = summary.trim().split(/\s+/).filter(Boolean);
    if (summaryWords.length > 30) {
      summary = summaryWords.slice(0, 30).join(' ') + '...';
    }
  }

  const phone = data.phone || (isDemoData ? '+1 (555) 019-2834' : '');
  const email = data.email || (isDemoData ? 'johndoe@example.com' : '');
  const location = data.location || (isDemoData ? 'New York, NY' : '');
  const linkedin = data.linkedin || (isDemoData ? 'linkedin.com/in/johndoe' : '');
  const github = data.github || (isDemoData ? 'github.com/johndoe' : '');
  const portfolio = data.portfolio || data.website || '';

  // Render Table-Based Bullet Points for PDF Parity
  const renderBullets = (bullets) => {
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) return null;
    return (
      <div style={{ marginTop: '2px', paddingLeft: '4px', width: '100%' }}>
        {bullets.map((b, bi) => (
          <table key={bi} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3px' }}>
            <tbody>
              <tr>
                <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#222222', fontWeight: 'bold', fontSize: '9.5pt', lineHeight: '1.3' }}>
                  •
                </td>
                <td style={{ verticalAlign: 'top', padding: 0, fontSize: '9.5pt', color: '#222222', lineHeight: '1.3', textAlign: 'justify' }}>
                  {b}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    );
  };

  // 2. Section Lists & Fallbacks
  const educationList = (Array.isArray(data.education) && data.education.length > 0) 
    ? data.education 
    : isDemoData 
      ? [
          {
            degree: "B.S. in Computer Science",
            institution: "State University",
            dates: "2020 – 2024",
            marks: "GPA: 3.8 / 4.0",
            location: "New York, NY"
          },
          {
            degree: "High School Diploma",
            institution: "State High School",
            dates: "2016 – 2020",
            marks: "94%",
            location: "New York, NY"
          }
        ]
      : [];

  let rawSkills = data.skills 
    ? data.skills 
    : isDemoData 
      ? {
          "Languages": ["Python", "Java", "C++", "SQL", "JavaScript"],
          "Frameworks": ["React", "Node.js", "FastAPI"],
          "Databases": ["MySQL", "PostgreSQL", "MongoDB"],
          "Tools": ["Git", "GitHub", "Docker", "Postman"]
        }
      : {};

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
    skillsObj = rawSkills.slice(0, 6);
  }

  let rawCerts = (Array.isArray(data.certifications) && data.certifications.length > 0) 
    ? data.certifications 
    : isDemoData 
      ? [
          { title: "AWS Certified Developer", issuer: "Amazon Web Services", dates: "2024" },
          { title: "SQL Advanced Certification", issuer: "HackerRank", dates: "2023" }
        ]
      : [];
  const certsList = rawCerts.slice(0, 3);

  // Raw personal details parser to extract languages if present
  const rawPersonal = data.personalDetails || (data.raw_data && data.raw_data.personalDetails) || {};
  const rawLanguages = data.languages || rawPersonal.languages;
  const languagesList = Array.isArray(rawLanguages) 
    ? rawLanguages 
    : typeof rawLanguages === 'string' 
      ? rawLanguages.split(',').map(l => l.trim()) 
      : isDemoData 
        ? ["English", "Spanish"]
        : [];

  let rawProjects = (Array.isArray(data.projects) && data.projects.length > 0) 
    ? data.projects 
    : isDemoData 
      ? [
          {
            title: "E-Commerce Microservices Platform",
            tech_stack: "React, FastAPI, PostgreSQL, Docker",
            dates: "Jan 2024 – May 2024",
            subtitle: "A microservices-based e-commerce application with secure checkout and inventory sync.",
            bullets: [
              "Designed and implemented secure payment gateway integration.",
              "Optimized search performance by 35% through query indexing.",
              "Containerized services using Docker to simplify local setup and cloud deployments."
            ],
            repo_url: "https://github.com/johndoe/ecommerce",
            live_url: "https://ecommerce-demo.vercel.app"
          },
          {
            title: "Real-time Collaboration Board",
            tech_stack: "React, WebSockets, Node.js",
            dates: "Mar 2024 – May 2024",
            subtitle: "A collaborative whiteboarding tool allowing real-time edits for distributed teams.",
            bullets: [
              "Built WebSocket connection manager handling concurrent room joins.",
              "Integrated responsive SVG canvas with client-side undo/redo history.",
              "Optimized websocket frame sizes to achieve sub-50ms draw latency."
            ],
            repo_url: "https://github.com/johndoe/collab-board",
            live_url: "https://collabboard-demo.vercel.app"
          }
        ]
      : [];

  const projectsList = rawProjects
    .filter(proj => proj.repo_url && proj.repo_url.trim() !== '')
    .slice(0, 3)
    .map(proj => {
      let bList = proj.bullets || [];
      if (!Array.isArray(bList)) {
        bList = typeof bList === 'string' ? [bList] : [];
      }
      const trimmedBullets = bList.slice(0, 1).map(b => {
        const words = b.split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          return words.slice(0, 10).join(' ') + '...';
        }
        return b;
      });
      return { ...proj, bullets: trimmedBullets };
    });

  let rawExperiences = (Array.isArray(data.experience) && data.experience.length > 0) 
    ? data.experience 
    : isDemoData 
      ? [
          {
            role: "Software Engineering Intern",
            company: "Acme Corporation",
            dates: "Jun 2023 – Aug 2023",
            location: "New York, NY",
            bullets: [
              "Developed and optimized backend service APIs, increasing query performance by 25%.",
              "Collaborated with cross-functional teams to integrate new features into the user dashboard.",
              "Wrote robust unit tests and integration tests, achieving 90% code coverage across repositories."
            ]
          }
        ]
      : [];

  const experienceList = rawExperiences.slice(0, 3).map(exp => {
    let bList = exp.bullets || [];
    if (!Array.isArray(bList)) {
      bList = typeof bList === 'string' ? [bList] : [];
    }
    const trimmedBullets = bList.slice(0, 2).map(b => {
      const words = b.split(/\s+/).filter(Boolean);
      if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
      }
      return b;
    });
    return { ...exp, bullets: trimmedBullets };
  });

  let rawAchievements = (Array.isArray(data.achievements) && data.achievements.length > 0) 
    ? data.achievements 
    : isDemoData 
      ? [
          { title: "First Place — Regional Hackathon 2024." },
          { title: "Dean's List for Academic Excellence (2020-2024)." },
          { title: "Solved 400+ algorithmic coding questions on LeetCode." }
        ]
      : [];
  const achievementsList = rawAchievements.slice(0, 3);

  const leadershipList = []; // Do not display volunteering or extracurriculars

  // Reusable Section Header Component
  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: "10px", marginTop: "12px" }}>
      <h2 style={{
        fontSize: "12pt",
        fontWeight: "700",
        color: accentColor,
        textTransform: "uppercase",
        margin: 0,
        letterSpacing: "0.5px",
        fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif"
      }}>
        {title}
      </h2>
      <div style={{ borderBottom: `1.2px solid ${accentColor}`, marginTop: "6px", height: 0 }} />
    </div>
  );

  return (
    <div 
      className="resume-paper white-blue-line-template"
      style={{
        backgroundColor: "#ffffff",
        color: "#222222",
        fontFamily: "'Source Sans 3', 'Source Sans Pro', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "8mm 14mm 14mm 14mm",
        width: "210mm",
        height: "297mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        borderRadius: "4px",
        lineHeight: 1.3,
        fontSize: "10pt",
        overflow: "hidden"
      }}
    >
      {/* Load Source Sans 3 Font dynamically */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        .white-blue-line-template * {
          box-sizing: border-box;
        }
      `}} />

      {/* 1. HEADER SECTION (Centered and minimal) */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1 style={{
          fontSize: "24pt",
          fontWeight: "700",
          letterSpacing: "1px",
          color: "#222222",
          margin: "0 0 2px 0",
          textTransform: "uppercase"
        }}>
          {name}
        </h1>

        <div style={{
          fontSize: "14pt",
          fontWeight: "500",
          color: accentColor,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          marginBottom: "6px"
        }}>
          {headline}
        </div>
      </div>

      {/* 2. TWO-COLUMN ASYMMETRIC GRID (Sidebar 35% | Main Content 65%) */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* ================= LEFT SIDEBAR (33%) ================= */}
        <div style={{
          width: "33%",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>

          {/* CONTACT INFO */}
          <div>
            <SectionHeader title="CONTACT" />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10pt" }}>
              {phone && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <PhoneIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", color: "#222222", lineHeight: "1.2" }}>
                        {phone}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {email && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <EmailIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", lineHeight: "1.2" }}>
                        <a href={`mailto:${email}`} style={{ color: "#222222", textDecoration: "none", wordBreak: "break-all" }}>
                          {email}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {location && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <LocationIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", color: "#222222", lineHeight: "1.2" }}>
                        {location}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {linkedin && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <LinkedInIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", lineHeight: "1.2" }}>
                        <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "none", wordBreak: "break-all" }}>
                          {linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {github && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <GitHubIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", lineHeight: "1.2" }}>
                        <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "none", wordBreak: "break-all" }}>
                          {github.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {portfolio && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "22px", verticalAlign: "middle", padding: "2px 0" }}>
                        <PortfolioIcon color={accentColor} />
                      </td>
                      <td style={{ verticalAlign: "middle", padding: "2px 0", lineHeight: "1.2" }}>
                        <a href={portfolio.startsWith('http') ? portfolio : `https://${portfolio}`} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "none", wordBreak: "break-all" }}>
                          {portfolio.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* EDUCATION */}
          {educationList.length > 0 && (
            <div>
              <SectionHeader title="EDUCATION" />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {educationList.map((edu, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "12pt", fontWeight: "700", color: "#222222", lineHeight: "1.3" }}>
                      {edu.institution}
                    </div>
                    <div style={{ fontSize: "11pt", fontWeight: "400", color: "#666666", marginTop: "2px" }}>
                      {edu.degree}
                    </div>
                    <div style={{ fontSize: "10pt", color: "#666666", marginTop: "1px" }}>
                      {edu.dates}{edu.location ? ` | ${edu.location}` : ''}
                    </div>
                    {edu.marks && (
                      <div style={{ fontSize: "10pt", color: "#666666", fontStyle: "italic", marginTop: "1px" }}>
                        {edu.marks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TECHNICAL SKILLS */}
          {Object.keys(skillsObj).length > 0 && (
            <div>
              <SectionHeader title="SKILLS" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "10pt" }}>
                {typeof skillsObj === 'object' && !Array.isArray(skillsObj) ? (
                  Object.entries(skillsObj).map(([cat, items], i) => (
                    <div key={i} style={{ marginBottom: "2px" }}>
                      <strong style={{ fontSize: "11pt", fontWeight: "700", color: "#222222" }}>{cat}: </strong>
                      <span style={{ color: "#666666" }}>
                        {Array.isArray(items) ? items.join(', ') : String(items)}
                      </span>
                    </div>
                  ))
                ) : Array.isArray(skillsObj) ? (
                  <div style={{ color: "#666666" }}>{skillsObj.join(', ')}</div>
                ) : (
                  <div style={{ color: "#666666" }}>{String(skillsObj)}</div>
                )}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certsList.length > 0 && (
            <div>
              <SectionHeader title="CERTIFICATIONS" />
              <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "10pt", color: "#666666", listStyleType: "square" }}>
                {certsList.map((c, i) => {
                  const title = typeof c === 'object' ? (c.title || c.name) : c;
                  const issuer = typeof c === 'object' ? c.issuer : '';
                  const dates = typeof c === 'object' ? c.dates : '';
                  const url = typeof c === 'object' ? (c.credential_url || c.url) : null;
                  return (
                    <li key={i} style={{ marginBottom: "6px", lineHeight: "1.3" }}>
                      <span style={{ fontWeight: "600", color: "#222222" }}>{title}</span>
                      {issuer && ` – ${issuer}`}
                      {dates && ` (${dates})`}
                      {url && (
                        <span style={{ marginLeft: "4px" }}>
                          {" – "}
                          <a href={url} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "none", fontWeight: "500" }}>
                            View Credential
                          </a>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* LANGUAGES */}
          {languagesList.length > 0 && (
            <div>
              <SectionHeader title="LANGUAGES" />
              <div style={{ fontSize: "10pt", color: "#666666", lineHeight: "1.4" }}>
                {languagesList.join(', ')}
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT MAIN CONTENT (65%) ================= */}
        <div style={{
          width: "63%",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>

          {/* SUMMARY */}
          {summary && (
            <div>
              <SectionHeader title="SUMMARY" />
              <p style={{
                fontSize: "10pt",
                color: "#222222",
                margin: 0,
                textAlign: "justify",
                lineHeight: "1.45"
              }}>
                {summary}
              </p>
            </div>
          )}

          {/* EXPERIENCE */}
          {experienceList.length > 0 && (
            <div>
              <SectionHeader title="EXPERIENCE" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {experienceList.map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "11pt", fontWeight: "700", color: "#222222" }}>
                        {exp.company}
                      </span>
                      <span style={{ fontSize: "9pt", fontWeight: "500", color: "#666666" }}>
                        {exp.dates}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "1px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "10pt", fontWeight: "400", color: "#666666", fontStyle: "italic" }}>
                        {exp.role || exp.title}
                      </span>
                      {exp.location && (
                        <span style={{ fontSize: "9pt", color: "#666666" }}>
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {renderBullets(exp.bullets)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {projectsList.length > 0 && (
            <div>
              <SectionHeader title="PROJECTS" />
              
              <div style={{
                position: "relative",
                paddingLeft: "14px",
                borderLeft: `1px solid ${accentColor}`,
                marginLeft: "5px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                {projectsList.map((proj, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    
                    {/* Dynamic Timeline Accent Dot */}
                    <div style={{
                      position: "absolute",
                      left: "-18.5px",
                      top: "4px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: accentColor
                    }} />
 
                    {/* Project Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1px" }}>
                      <strong style={{ fontSize: "11pt", color: "#222222" }}>
                        {proj.title}
                        {proj.repo_url && (
                          <a href={proj.repo_url} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "underline", marginLeft: "8px", fontSize: "9pt", fontWeight: "bold" }}>
                            [GitHub]
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noreferrer" style={{ color: accentColor, textDecoration: "underline", marginLeft: "8px", fontSize: "9pt", fontWeight: "bold" }}>
                            [Demo]
                          </a>
                        )}
                      </strong>
                      <span style={{ fontSize: "9pt", fontWeight: "500", color: "#666666" }}>
                        {proj.dates}
                      </span>
                    </div>
 
                    {/* Tech Stack Subtitle */}
                    {proj.tech_stack && (
                      <div style={{ fontSize: "9.5pt", color: accentColor, fontWeight: "500", marginBottom: "2px" }}>
                        Tech Stack: {proj.tech_stack}
                      </div>
                    )}

                    {/* Project Sub-description */}
                    {proj.subtitle && (
                      <div style={{ fontSize: "9.5pt", color: "#666666", marginBottom: "2px" }}>
                        {proj.subtitle}
                      </div>
                    )}

                    {/* Project Bullet Points */}
                    {renderBullets(proj.bullets)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADERSHIP & SERVICE */}
          {leadershipList.length > 0 && (
            <div>
              <SectionHeader title="LEADERSHIP & SERVICE" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {leadershipList.map((lead, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "11pt", fontWeight: "700", color: "#222222" }}>
                        {lead.organization || lead.company}
                      </span>
                      <span style={{ fontSize: "9pt", fontWeight: "500", color: "#666666" }}>
                        {lead.dates}
                      </span>
                    </div>
                    <div style={{ fontSize: "10pt", fontWeight: "400", color: "#666666", fontStyle: "italic", marginTop: "1px" }}>
                      {lead.role || lead.title}
                    </div>
                    {lead.description && (
                      <p style={{ fontSize: "9.5pt", color: "#222222", margin: "2px 0 0 0", lineHeight: "1.3" }}>
                        {lead.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* ACHIEVEMENTS */}
          {achievementsList.length > 0 && (
            <div>
              <SectionHeader title="ACHIEVEMENTS" />
              <div style={{ marginTop: '2px', paddingLeft: '4px' }}>
                {achievementsList.map((ach, i) => {
                  const title = typeof ach === 'object' ? (ach.title || ach.description) : ach;
                  const desc = typeof ach === 'object' ? ach.description : '';
                  return (
                    <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '12px', verticalAlign: 'top', padding: 0, color: '#222222', fontWeight: 'bold', fontSize: '9.5pt', lineHeight: '1.3' }}>
                            •
                          </td>
                          <td style={{ verticalAlign: 'top', padding: 0, fontSize: '9.5pt', color: '#222222', lineHeight: '1.3' }}>
                            <strong style={{ fontWeight: "700", color: "#222222" }}>{title}</strong>
                            {desc && `: ${desc}`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
