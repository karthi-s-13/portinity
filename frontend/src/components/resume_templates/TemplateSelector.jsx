import { useState, useRef } from 'react';
import { RESUME_TEMPLATES } from './index';
import ResumeRenderer from './ResumeRenderer';
import { 
  HiCheck, HiSparkles, HiFunnel, HiChevronDown, HiArrowsPointingOut, 
  HiShoppingBag, HiClipboardDocumentList, HiViewColumns, HiShieldCheck
} from 'react-icons/hi2';
import './TemplateSelector.css';

const CATEGORIES = ['All Templates', 'Modern', 'Professional', 'Creative', 'Minimal', 'Executive'];

const GRAY_BANNER_PREVIEW_DATA = {
  isDemo: true,
  name: "Alex Morgan",
  headline: "Senior Full Stack Engineer | Tech Lead",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA, USA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Innovative and results-driven Senior Full Stack Engineer with over 8 years of experience designing, building, and deploying scalable web applications and cloud architectures. Expert in Python, React, and database systems. Passionate about solving complex problems and leading collaborative engineering teams.",
  skills: {
    "Languages": ["Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"],
    "Frameworks": ["FastAPI", "React", "Node.js", "Express", "Next.js"],
    "Databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "Tools": ["Docker", "Git", "AWS", "CI/CD", "Kubernetes"],
    "Concepts": ["Data Structures", "System Design", "OOP", "RESTful APIs", "Agile"]
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "CloudScale Systems",
      dates: "Jan 2024 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and deployed high-performance microservices using FastAPI and AWS ECS.",
        "Led a team of 4 engineers to rebuild the analytics dashboard in React, improving load times by 40%.",
        "Designed and optimized PostgreSQL database structures for high-concurrency workloads."
      ]
    },
    {
      role: "Full Stack Developer",
      company: "AppForge Technologies",
      dates: "Jun 2021 - Dec 2023",
      location: "San Francisco, CA",
      bullets: [
        "Developed responsive web applications using React, Node.js, and MongoDB.",
        "Implemented secure OAuth2 authentication flow and integrated third-party payment APIs.",
        "Wrote comprehensive unit and integration tests using Jest and PyTest."
      ]
    }
  ],
  projects: [
    {
      title: "DataStream - Real-Time Dashboard",
      tech_stack: "FastAPI, React, Redis, WebSocket",
      dates: "Jan 2024 - May 2024",
      bullets: [
        "Built a web application for real-time visualization of streaming data.",
        "Utilized WebSockets and Redis Pub/Sub to push updates with sub-100ms latency."
      ],
      repo_url: "https://github.com/alexmorgan/datastream"
    },
    {
      title: "DocuSearch AI - Document Search Engine",
      tech_stack: "Python, LangChain, PostgreSQL, React",
      dates: "Mar 2024 - May 2024",
      bullets: [
        "Developed an AI-powered document QA system using semantic search and pgvector.",
        "Created an interactive user interface for uploading documents and viewing highlighted search results."
      ],
      repo_url: "https://github.com/alexmorgan/docusearch"
    },
    {
      title: "SpendWise - Expense Analytics",
      tech_stack: "Node.js, Express, Chart.js, React",
      dates: "Nov 2023 - Jan 2024",
      bullets: [
        "Built a personal finance application with category tracking and automated monthly reporting.",
        "Designed dynamic SVG visualizations and user dashboards using Chart.js."
      ],
      repo_url: "https://github.com/alexmorgan/spendwise"
    }
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      dates: "2017 - 2021",
      location: "San Francisco, CA",
      marks: "GPA: 3.85 / 4.00"
    },
    {
      institution: "Westlake High School",
      degree: "High School Diploma",
      dates: "2013 - 2017",
      marks: "GPA: 3.90 / 4.00"
    }
  ],
  certifications: [
    { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", dates: "2024" },
    { title: "Professional Scrum Master", issuer: "Scrum.org", dates: "2023" }
  ],
  achievements: [
    { title: "Hackathon Winner", description: "Placed 1st out of 50 teams at TechCrunch Disrupt Hackathon" },
    { title: "Open Source Contributor", description: "Active contributor to Python FastAPI and React libraries" }
  ]
};

const BLUE_LINE_PREVIEW_DATA = {
  isDemo: true,
  name: "Alex Morgan",
  headline: "Senior Full Stack Engineer",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA, USA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Innovative and results-driven Senior Full Stack Engineer with over 8 years of experience designing, building, and deploying scalable web applications and cloud architectures. Expert in Python, React, and database systems.",
  skills: {
    "Languages": ["Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"],
    "Frameworks": ["FastAPI", "React", "Node.js", "Express", "Next.js"],
    "Databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "Tools": ["Docker", "Git", "AWS", "CI/CD", "Kubernetes"],
    "Concepts": ["Data Structures", "System Design", "OOP", "RESTful APIs", "Agile"]
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "CloudScale Systems",
      dates: "Jan 2024 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and deployed high-performance microservices using FastAPI and AWS ECS.",
        "Led a team of 4 engineers to rebuild the analytics dashboard in React, improving load times by 40%.",
        "Designed and optimized PostgreSQL database structures for high-concurrency workloads."
      ]
    },
    {
      role: "Full Stack Developer",
      company: "AppForge Technologies",
      dates: "Jun 2021 - Dec 2023",
      location: "San Francisco, CA",
      bullets: [
        "Developed responsive web applications using React, Node.js, and MongoDB.",
        "Implemented secure OAuth2 authentication flow and integrated third-party payment APIs.",
        "Wrote comprehensive unit and integration tests using Jest and PyTest."
      ]
    }
  ],
  projects: [
    {
      title: "DataStream - Real-Time Dashboard",
      tech_stack: "FastAPI, React, Redis, WebSocket",
      dates: "Jan 2024 - May 2024",
      bullets: [
        "Built a web application for real-time visualization of streaming data.",
        "Utilized WebSockets and Redis Pub/Sub to push updates with sub-100ms latency."
      ],
      repo_url: "https://github.com/alexmorgan/datastream"
    },
    {
      title: "DocuSearch AI - Document Search Engine",
      tech_stack: "Python, LangChain, PostgreSQL, React",
      dates: "Mar 2024 - May 2024",
      bullets: [
        "Developed an AI-powered document QA system using semantic search and pgvector.",
        "Created an interactive user interface for uploading documents and viewing highlighted search results."
      ],
      repo_url: "https://github.com/alexmorgan/docusearch"
    },
    {
      title: "SpendWise - Expense Analytics",
      tech_stack: "Node.js, Express, Chart.js, React",
      dates: "Nov 2023 - Jan 2024",
      bullets: [
        "Built a personal finance application with category tracking and automated monthly reporting.",
        "Designed dynamic SVG visualizations and user dashboards using Chart.js."
      ],
      repo_url: "https://github.com/alexmorgan/spendwise"
    }
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      dates: "2017 - 2021",
      location: "San Francisco, CA",
      marks: "GPA: 3.85 / 4.00"
    }
  ],
  certifications: [
    { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", dates: "2024" },
    { title: "Professional Scrum Master", issuer: "Scrum.org", dates: "2023" }
  ],
  achievements: [
    { title: "Hackathon Winner", description: "Placed 1st out of 50 teams at TechCrunch Disrupt Hackathon" },
    { title: "Open Source Contributor", description: "Active contributor to Python FastAPI and React libraries" }
  ]
};


const ELEGANT_BEIGE_PREVIEW_DATA = {
  isDemo: true,
  name: "Alex Morgan",
  headline: "Senior Full Stack Engineer",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA, USA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Innovative and results-driven Senior Full Stack Engineer with over 8 years of experience designing, building, and deploying scalable web applications and cloud architectures. Expert in Python, React, and database systems.",
  skills: {
    "Languages": ["Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"],
    "Frameworks": ["FastAPI", "React", "Node.js", "Express", "Next.js"],
    "Databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "Tools": ["Docker", "Git", "AWS", "CI/CD", "Kubernetes"],
    "Concepts": ["Data Structures", "System Design", "OOP", "RESTful APIs", "Agile"]
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "CloudScale Systems",
      dates: "Jan 2024 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and deployed high-performance microservices using FastAPI and AWS ECS.",
        "Led a team of 4 engineers to rebuild the analytics dashboard in React, improving load times by 40%.",
        "Designed and optimized PostgreSQL database structures for high-concurrency workloads."
      ]
    },
    {
      role: "Full Stack Developer",
      company: "AppForge Technologies",
      dates: "Jun 2021 - Dec 2023",
      location: "San Francisco, CA",
      bullets: [
        "Developed responsive web applications using React, Node.js, and MongoDB.",
        "Implemented secure OAuth2 authentication flow and integrated third-party payment APIs.",
        "Wrote comprehensive unit and integration tests using Jest and PyTest."
      ]
    }
  ],
  projects: [
    {
      title: "DataStream - Real-Time Dashboard",
      tech_stack: "FastAPI, React, Redis, WebSocket",
      dates: "Jan 2024 - May 2024",
      bullets: [
        "Built a web application for real-time visualization of streaming data.",
        "Utilized WebSockets and Redis Pub/Sub to push updates with sub-100ms latency."
      ],
      repo_url: "https://github.com/alexmorgan/datastream"
    },
    {
      title: "DocuSearch AI - Document Search Engine",
      tech_stack: "Python, LangChain, PostgreSQL, React",
      dates: "Mar 2024 - May 2024",
      bullets: [
        "Developed an AI-powered document QA system using semantic search and pgvector.",
        "Created an interactive user interface for uploading documents and viewing highlighted search results."
      ],
      repo_url: "https://github.com/alexmorgan/docusearch"
    },
    {
      title: "SpendWise - Expense Analytics",
      tech_stack: "Node.js, Express, Chart.js, React",
      dates: "Nov 2023 - Jan 2024",
      bullets: [
        "Built a personal finance application with category tracking and automated monthly reporting.",
        "Designed dynamic SVG visualizations and user dashboards using Chart.js."
      ],
      repo_url: "https://github.com/alexmorgan/spendwise"
    }
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      dates: "2017 - 2021",
      location: "San Francisco, CA",
      marks: "GPA: 3.85 / 4.00"
    }
  ],
  certifications: [
    { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", dates: "2024" },
    { title: "Professional Scrum Master", issuer: "Scrum.org", dates: "2023" }
  ],
  achievements: [
    { title: "Hackathon Winner", description: "Placed 1st out of 50 teams at TechCrunch Disrupt Hackathon" },
    { title: "Open Source Contributor", description: "Active contributor to Python FastAPI and React libraries" }
  ]
};

const MINIMAL_CLASSIC_PREVIEW_DATA = {
  isDemo: true,
  name: "Alex Morgan",
  headline: "Senior Full Stack Engineer | Tech Lead",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA, USA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Innovative and results-driven Senior Full Stack Engineer with over 8 years of experience designing, building, and deploying scalable web applications and cloud architectures. Expert in Python, React, and database systems. Passionate about solving complex problems and leading collaborative engineering teams.",
  skills: {
    "Languages": ["Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"],
    "Frameworks": ["FastAPI", "React", "Node.js", "Express", "Next.js"],
    "Databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "Tools": ["Docker", "Git", "AWS", "CI/CD", "Kubernetes"],
    "Concepts": ["Data Structures", "System Design", "OOP", "RESTful APIs", "Agile"]
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "CloudScale Systems",
      dates: "Jan 2024 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and deployed high-performance microservices using FastAPI and AWS ECS.",
        "Led a team of 4 engineers to rebuild the analytics dashboard in React, improving load times by 40%.",
        "Designed and optimized PostgreSQL database structures for high-concurrency workloads."
      ]
    }
  ],
  projects: [
    {
      title: "DataStream - Real-Time Dashboard",
      tech_stack: "FastAPI, React, Redis, WebSocket",
      dates: "Jan 2024 - May 2024",
      bullets: [
        "Built a web application for real-time visualization of streaming data.",
        "Utilized WebSockets and Redis Pub/Sub to push updates with sub-100ms latency."
      ],
      repo_url: "https://github.com/alexmorgan/datastream"
    },
    {
      title: "DocuSearch AI - Document Search Engine",
      tech_stack: "Python, LangChain, PostgreSQL, React",
      dates: "Mar 2024 - May 2024",
      bullets: [
        "Developed an AI-powered document QA system using semantic search and pgvector.",
        "Created an interactive user interface for uploading documents and viewing highlighted search results."
      ],
      repo_url: "https://github.com/alexmorgan/docusearch"
    }
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      dates: "2017 - 2021",
      location: "San Francisco, CA",
      marks: "GPA: 3.85 / 4.00"
    }
  ],
  certifications: [
    { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", dates: "2024" },
    { title: "Professional Scrum Master", issuer: "Scrum.org", dates: "2023" }
  ],
  achievements: [
    { title: "Hackathon Winner", description: "Placed 1st out of 50 teams at TechCrunch Disrupt Hackathon" },
    { title: "Open Source Contributor", description: "Active contributor to Python FastAPI and React libraries" }
  ]
};

export default function TemplateSelector({ selectedTemplateId, onSelectTemplate, onConfirmTemplate, resumeData }) {
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewRef = useRef(null);

  const activeTemplate = RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESUME_TEMPLATES[0];

  const filteredTemplates = RESUME_TEMPLATES.filter((tpl) => {
    if (activeCategory === 'All Templates') return true;
    return tpl.category === activeCategory || tpl.tags.includes(activeCategory);
  });

  const previewData = selectedTemplateId === 'elegant-beige' 
    ? ELEGANT_BEIGE_PREVIEW_DATA 
    : (selectedTemplateId === 'minimal-classic' 
       ? MINIMAL_CLASSIC_PREVIEW_DATA 
       : (selectedTemplateId === 'gray-banner' ? GRAY_BANNER_PREVIEW_DATA : BLUE_LINE_PREVIEW_DATA));

  return (
    <div className="template-step-v2-container">
      {/* 2-COLUMN SPLIT LAYOUT */}
      <div className="template-v2-split-grid">
        
        {/* ================= LEFT COLUMN: TEMPLATE GALLERY (60%) ================= */}
        <div className="template-v2-gallery-col">
          
          <div className="template-v2-header">
            <h2 className="template-v2-title">Choose Resume Template</h2>
            <p className="template-v2-subtitle">
              Select a template that best represents your style and the job you're applying for.
            </p>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="template-v2-filter-bar">
            <div className="template-v2-category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`template-v2-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button className="template-v2-filter-btn">
              <HiFunnel /> Filters
            </button>
          </div>

          {/* Template Cards Grid (2 rows x 3 columns) */}
          <div className="template-v2-cards-grid">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`template-v2-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTemplate(tpl.id)}
                >
                  {/* Mock Thumbnail Preview */}
                  <div className="template-v2-thumb-box">
                    {/* Selected Checkmark Badge (Top Right) */}
                    {isSelected && (
                      <div className="template-v2-selected-check">
                        <HiCheck />
                      </div>
                    )}

                    <div className={`template-v2-mini-paper ${tpl.id}`}>
                      <div className="mini-paper-header" style={{ borderColor: tpl.accentColor }} />
                      <div className="mini-paper-title" style={{ backgroundColor: tpl.accentColor }} />
                      <div className="mini-paper-sub" />
                      <div className="mini-paper-sec" style={{ backgroundColor: tpl.bannerBg || tpl.accentColor }} />
                      <div className="mini-paper-lines" />
                      <div className="mini-paper-sec" style={{ backgroundColor: tpl.bannerBg || tpl.accentColor }} />
                      <div className="mini-paper-lines" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="template-v2-card-body">
                    <div className="template-v2-card-title-row">
                      <span className="template-v2-card-name">{tpl.name}</span>
                      {tpl.badge && <span className={`template-v2-badge ${tpl.badge.toLowerCase()}`}>{tpl.badge}</span>}
                    </div>

                    <p className="template-v2-card-desc">{tpl.description}</p>

                    <div className="template-v2-card-tags">
                      {tpl.tags.map((tag, i) => (
                        <span key={i} className="template-v2-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="template-v2-load-more">
            <button className="template-v2-load-btn">
              Load More Templates <HiChevronDown />
            </button>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: TEMPLATE PREVIEW & METADATA (40%) ================= */}
        <div className="template-v2-preview-col">
          
          <div className="template-v2-preview-card">
            
            <div className="template-v2-preview-topbar">
              <h3 className="template-v2-preview-head">Template Preview</h3>
              <button 
                className="template-v2-fullscreen-btn"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                <HiArrowsPointingOut /> {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
            </div>

            {/* Embedded Live Paper Viewport */}
            <div className="template-v2-paper-box">
              <ResumeRenderer 
                templateId={selectedTemplateId} 
                data={previewData} 
                containerRef={previewRef} 
              />
            </div>

            {/* Selected Template Details Sub-Card */}
            <div className="template-v2-meta-card">
              <div className="template-v2-meta-title-row">
                <h4 className="template-v2-meta-name">{activeTemplate.name}</h4>
                {activeTemplate.badge && (
                  <span className={`template-v2-badge ${activeTemplate.badge.toLowerCase()}`}>
                    {activeTemplate.badge}
                  </span>
                )}
              </div>

              <p className="template-v2-meta-desc">{activeTemplate.detailedDesc}</p>

              {/* 4 Feature Stats Row */}
              <div className="template-v2-stats-grid">
                
                <div className="template-v2-stat-item">
                  <div className="stat-icon icon-purple"><HiShoppingBag /></div>
                  <div className="stat-text-box">
                    <span className="stat-label">Best For</span>
                    <span className="stat-val">{activeTemplate.bestFor}</span>
                  </div>
                </div>

                <div className="template-v2-stat-item">
                  <div className="stat-icon icon-blue"><HiClipboardDocumentList /></div>
                  <div className="stat-text-box">
                    <span className="stat-label">Sections</span>
                    <span className="stat-val">{activeTemplate.sectionsCount}</span>
                  </div>
                </div>

                <div className="template-v2-stat-item">
                  <div className="stat-icon icon-indigo"><HiViewColumns /></div>
                  <div className="stat-text-box">
                    <span className="stat-label">Columns</span>
                    <span className="stat-val">{activeTemplate.columnsType}</span>
                  </div>
                </div>

                <div className="template-v2-stat-item">
                  <div className="stat-icon icon-green"><HiShieldCheck /></div>
                  <div className="stat-text-box">
                    <span className="stat-label">ATS Score</span>
                    <span className="stat-val green-text">{activeTemplate.atsScore}</span>
                  </div>
                </div>

              </div>

              {/* SIMILAR LAYOUT SUGGESTIONS */}
              {(() => {
                const singleColumnGroup = ['gray-banner', 'elegant-beige', 'minimal-classic'];
                const blueLineGroup = ['blue-line'];
                let similarTemplates = [];
                
                if (singleColumnGroup.includes(selectedTemplateId)) {
                  similarTemplates = RESUME_TEMPLATES.filter(
                    t => singleColumnGroup.includes(t.id) && t.id !== selectedTemplateId
                  );
                } else if (blueLineGroup.includes(selectedTemplateId)) {
                  similarTemplates = RESUME_TEMPLATES.filter(
                    t => blueLineGroup.includes(t.id) && t.id !== selectedTemplateId
                  );
                }

                if (similarTemplates.length > 0) {
                  return (
                    <div style={{
                      marginTop: '16px',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px dashed #E2E8F0',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        fontSize: '8.5pt',
                        fontWeight: '600',
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <HiSparkles style={{ color: '#F59E0B' }} />
                        <span>View Similar Layouts (Same Constraints)</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {similarTemplates.map(tpl => (
                          <button
                            key={tpl.id}
                            onClick={() => onSelectTemplate(tpl.id)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '8pt',
                              fontWeight: '500',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {tpl.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                } else if (selectedTemplateId === 'blue-line') {
                  return (
                    <div style={{
                      marginTop: '16px',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#EFF6FF',
                      border: '1px dashed #BFDBFE',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        fontSize: '8.5pt',
                        fontWeight: '600',
                        color: '#1E40AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <HiSparkles style={{ color: '#3B82F6' }} />
                        <span>Layout Group Info</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '8pt', color: '#1E3A8A', lineHeight: '1.25' }}>
                        This is a distinct two-column layout. Future templates matching the Blue Line constraints will be suggested here.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* PRIMARY ACTION BUTTON */}
              <button 
                className="template-v2-use-btn"
                onClick={() => onConfirmTemplate && onConfirmTemplate(selectedTemplateId)}
              >
                <HiCheck className="use-icon" /> Use This Template
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Fullscreen A4 Preview Modal */}
      {isFullScreen && (
        <div 
          className="template-fullscreen-modal-backdrop"
          onClick={() => setIsFullScreen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '40px 20px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div 
            className="template-fullscreen-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '24px',
              width: '860px',
              maxWidth: '95vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header controls inside modal */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                {activeTemplate.name} Preview (A4 Size)
              </h3>
              <button 
                onClick={() => setIsFullScreen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Close Preview
              </button>
            </div>

            {/* A4 Paper container */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              padding: '0',
              boxSizing: 'border-box',
              overflow: 'hidden',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <ResumeRenderer 
                templateId={selectedTemplateId} 
                data={previewData} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
