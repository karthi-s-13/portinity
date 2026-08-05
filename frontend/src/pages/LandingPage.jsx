import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assests/portinify_logo.png';
import './LandingPage.css';

/* ─── tiny inline SVGs (no external dep) ─── */
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
  </svg>
);

const WandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="15" y1="4" x2="15" y2="2"/>
    <line x1="15" y1="16" x2="15" y2="14"/>
    <line x1="8" y1="9" x2="10" y2="9"/>
    <line x1="20" y1="9" x2="22" y2="9"/>
    <line x1="17.8" y1="11.8" x2="19.2" y2="13.2"/>
    <line x1="10.2" y1="4.2" x2="11.6" y2="5.6"/>
    <line x1="17.8" y1="6.2" x2="19.2" y2="4.8"/>
    <line x1="10.2" y1="13.8" x2="11.6" y2="12.4"/>
    <path d="M3 21l9-9"/>
  </svg>
);

const LayoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const RobotIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <line x1="12" y1="7" x2="12" y2="11"/>
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3"/>
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3"/>
    <line x1="9" y1="19" x2="15" y2="19"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TargetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const MagicWandIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
    <line x1="15" y1="4" x2="15" y2="2"/>
    <line x1="15" y1="16" x2="15" y2="14"/>
    <line x1="8" y1="9" x2="10" y2="9"/>
    <line x1="20" y1="9" x2="22" y2="9"/>
    <line x1="17.8" y1="11.8" x2="19.2" y2="13.2"/>
    <line x1="10.2" y1="4.2" x2="11.6" y2="5.6"/>
    <line x1="17.8" y1="6.2" x2="19.2" y2="4.8"/>
    <line x1="10.2" y1="13.8" x2="11.6" y2="12.4"/>
    <path d="M3 21l9-9"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const HOW_IT_WORKS_STEPS = [
  {
    icon: <UserIcon />,
    title: 'Fill Your Profile',
    desc: 'Enter your work history, projects, education, and skills. This acts as your single source of truth.',
  },
  {
    icon: <TargetIcon />,
    title: 'Paste Job Description',
    desc: 'Input the job posting you are targeting. Our AI instantly extracts key skills and experiences required.',
  },
  {
    icon: <MagicWandIcon />,
    title: 'AI Tailors Content',
    desc: 'Our semantic search algorithm matches and highlights your achievements, optimizing them for ATS systems.',
  },
  {
    icon: <ExportIcon />,
    title: 'Download & Apply',
    desc: 'Select from 7 gorgeous templates and download your new resume in PDF, LaTeX, or Word format.',
  },
];

const PRICING_TIERS = [
  {
    name: 'Free',
    emoji: '🆓',
    price: '₹0',
    period: '',
    bestFor: 'Try the platform',
    limit: '2 Resumes',
    features: [
      '2 AI resume generations',
      'Access to standard templates',
      'High-quality PDF downloads',
      'Standard RAG intelligence',
    ],
    ctaText: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter',
    emoji: '🌱',
    price: '₹19',
    period: 'One-time',
    bestFor: 'Occasional users',
    limit: '5 Resumes',
    features: [
      '5 AI resume generations',
      'Access to all templates',
      'PDF + LaTeX downloads',
      'Resume optimization tips',
    ],
    ctaText: 'Buy Now',
    popular: false,
  },
  {
    name: 'Cup of Tea',
    emoji: '☕',
    price: '₹79',
    period: 'One-time',
    bestFor: 'Active job seekers',
    limit: '25 Resumes',
    features: [
      '25 AI resume generations',
      'Access to all templates',
      'PDF + LaTeX + DOCX export',
      'ATS score analysis',
      'Standard RAG intelligence',
    ],
    ctaText: 'Buy Now',
    popular: false,
  },
  {
    name: 'Pro',
    emoji: '⭐',
    price: '₹299',
    period: '/month',
    bestFor: 'Frequent users',
    limit: '100 Resumes/month',
    features: [
      '100 AI resume generations / mo',
      'Access to all templates',
      'PDF + LaTeX + DOCX export',
      'Full ATS score analysis',
      'Keyword density optimization',
      'Priority email support',
    ],
    ctaText: 'Subscribe Now',
    popular: true,
  },
  {
    name: 'Ultra',
    emoji: '🚀',
    price: '₹699',
    period: '/month',
    bestFor: 'Professionals & recruiters',
    limit: '300 Resumes/month (Fair Use)',
    features: [
      '300 AI resume generations / mo',
      'Access to all templates',
      'PDF + LaTeX + DOCX export',
      'Detailed ATS feedback reports',
      'AI cover letter generator',
      '24/7 dedicated support',
    ],
    popular: false,
  },
];

const RESOURCES_DATA = [
  {
    category: 'Guide',
    title: 'How to Write an ATS-Optimized Resume in 2026',
    desc: 'Learn the exact rules modern Applicant Tracking Systems use to filter candidates, and how to structure your resume to score in the top 10%.',
    readTime: '5 min read',
    icon: '📝',
    badgeColor: '#e0e7ff',
    textColor: '#4f46e5',
  },
  {
    category: 'Handbook',
    title: '200+ Power Verbs to Elevate Your Experience',
    desc: 'Stop using weak verbs like "managed" or "assisted". Use these high-impact action verbs categorized by skill area to stand out to recruiters.',
    readTime: '8 min read',
    icon: '📚',
    badgeColor: '#fce7f3',
    textColor: '#db2777',
  },
  {
    category: 'Interview Prep',
    title: 'Top 10 Interview Questions & Model Answers',
    desc: 'Prepare for behavioral questions using the STAR method. Includes model answers for software developers, product managers, and design roles.',
    readTime: '12 min read',
    icon: '💡',
    badgeColor: '#fef3c7',
    textColor: '#d97706',
  },
  {
    category: 'LaTeX Tips',
    title: 'LaTeX Layouts: Spacing & Font Selections',
    desc: 'Unlock typographic excellence. Discover how to fine-tune margin sizes, vertical spacing, and clean sans-serif font families for print-ready resumes.',
    readTime: '6 min read',
    icon: '💻',
    badgeColor: '#dcfce7',
    textColor: '#15803d',
  },
];

const CORE_PILLARS = [
  {
    title: 'Recruiter-Approved Precision',
    desc: 'Every template is designed to typesetting perfection. Clean margins, optimal line heights, and machine-readable structures ensure maximum readability.',
    icon: '🎯',
    color: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  {
    title: 'RAG-Powered Intelligence',
    desc: 'Our semantic retrieval engine doesn\'t just match keywords—it understands context, matching your achievements directly with target job details.',
    icon: '⚡',
    color: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  {
    title: 'Privacy & Security First',
    desc: 'We do not sell your personal data. Your education, skills, work history, and custom resumes are stored securely and remain entirely yours.',
    icon: '🔒',
    color: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    title: 'Equal Access to Success',
    desc: 'We believe career progression tools shouldn\'t cost a fortune. That\'s why we offer generous free usage and highly accessible one-time pricing.',
    icon: '🌱',
    color: '#fffbeb',
    borderColor: '#fde68a',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  const handleCreateResume = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">

      {/* ===== NAVBAR ===== */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          {/* Logo */}
          <a href="#" className="lp-nav-logo" onClick={e => { e.preventDefault(); }}>
            <img src={logoImg} alt="Portinity" />
            <span className="lp-nav-logo-text">Portinity</span>
          </a>

          {/* Nav Links */}
          <div className="lp-nav-links">
            <button className="lp-nav-link">
              Features <ChevronIcon />
            </button>
            <a href="#templates" className="lp-nav-link">Templates</a>
            <a href="#how-it-works" className="lp-nav-link">How It Works</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
            <a href="#resources" className="lp-nav-link">Resources</a>
            <a href="#about" className="lp-nav-link">About</a>
          </div>

          {/* Right side */}
          <div className="lp-nav-right">
            <button className="lp-nav-icon-btn" aria-label="Light mode">
              <SunIcon />
            </button>
            <button className="lp-nav-icon-btn" aria-label="Dark mode">
              <MoonIcon />
            </button>
            <button className="lp-btn-cta" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="lp-hero">
        {/* Left: copy */}
        <div className="lp-hero-left">
          {/* Badge */}
          <div className="lp-hero-badge">
            <SparkleIcon />
            AI-Powered Resume Builder
          </div>

          {/* Headline */}
          <h1 className="lp-hero-headline">
            Build a Smarter Resume.<br />
            Get <span className="lp-hero-highlight">Better Opportunities.</span>
          </h1>

          {/* Description */}
          <p className="lp-hero-desc">
            Portinity uses AI to craft ATS-optimized resumes that highlight your skills, match job descriptions, and help you stand out to recruiters.
          </p>

          {/* Bullet points */}
          <div className="lp-hero-bullets">
            {[
              'AI matches your profile with job requirements',
              'ATS-optimized formatting for higher shortlisting',
              'Professional templates designed to impress',
            ].map((text, i) => (
              <div className="lp-hero-bullet" key={i}>
                <span className="lp-hero-bullet-icon"><CheckIcon /></span>
                {text}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={handleCreateResume}>
              <WandIcon /> Create My Resume
            </button>
            <button className="lp-btn-secondary" onClick={() => navigate('/login')}>
              <LayoutIcon /> View Templates
            </button>
          </div>

          {/* Trust signal */}
          <div className="lp-hero-trust">
            <div className="lp-trust-avatars">
              {['KS', 'RP', 'AM', 'JD'].map((initials, i) => (
                <div
                  key={i}
                  className="lp-trust-avatar"
                  style={{
                    background: [
                      'linear-gradient(135deg,#667eea,#764ba2)',
                      'linear-gradient(135deg,#f093fb,#f5576c)',
                      'linear-gradient(135deg,#4facfe,#00f2fe)',
                      'linear-gradient(135deg,#43e97b,#38f9d7)',
                    ][i],
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="lp-trust-text">
              <strong>Trusted by 10,000+ students and professionals</strong>
              <div className="lp-trust-stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                <span className="lp-trust-score">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: app mockup */}
        <div className="lp-hero-right">
          <div className="lp-mockup-shell">
            {/* Title bar */}
            <div className="lp-mockup-topbar">
              <span className="lp-mockup-dot lp-mockup-dot-red" />
              <span className="lp-mockup-dot lp-mockup-dot-yellow" />
              <span className="lp-mockup-dot lp-mockup-dot-green" />
              <div className="lp-mockup-title">
                <img src={logoImg} alt="" />
                Portinity
              </div>
            </div>

            {/* Mockup body */}
            <div className="lp-mockup-body">
              {/* Sidebar */}
              <div className="lp-mock-sidebar">
                {[
                  { label: 'Dashboard', icon: '⊞' },
                ].map((item, i) => (
                  <div className="lp-mock-sidebar-item" key={i}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                ))}
                <div className="lp-mock-sidebar-item active">
                  <span className="lp-mock-sidebar-dot active-dot" />
                  AI Resume Generator
                </div>
                <div className="lp-mock-sidebar-sep">PROFILE</div>
                {['Profile Overview', 'Projects', 'Experience', 'Skills', 'Education', 'Certifications', 'Achievements'].map((label, i) => (
                  <div className="lp-mock-sidebar-item" key={i}>
                    <span className="lp-mock-sidebar-dot" />
                    {label}
                  </div>
                ))}
                <div className="lp-mock-sidebar-sep">AI TOOLS</div>
                {['Templates', 'Cover Letter', 'Interview Prep'].map((label, i) => (
                  <div className="lp-mock-sidebar-item" key={i}>
                    <span className="lp-mock-sidebar-dot" />
                    {label}
                  </div>
                ))}
                <div className="lp-mock-sidebar-sep">MORE</div>
                {['Analytics', 'Settings'].map((label, i) => (
                  <div className="lp-mock-sidebar-item" key={i}>
                    <span className="lp-mock-sidebar-dot" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="lp-mock-main" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Step bar */}
                <div className="lp-mock-steps">
                  {['Job Details', 'Template', 'Customize', 'Review'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`lp-mock-step ${i === 0 ? 'active' : ''}`}>
                        <span className="lp-mock-step-num">{i + 1}</span>
                        {step}
                      </div>
                      {i < 3 && <div className="lp-mock-step-sep" />}
                    </div>
                  ))}
                </div>

                {/* Two-column content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
                  {/* Job form panel */}
                  <div className="lp-mock-form-panel">
                    <div className="lp-mock-form-label">
                      <span>🎯 Target Job Description</span>
                      <span className="lp-mock-form-badge">How it works</span>
                    </div>
                    <textarea
                      className="lp-mock-textarea"
                      readOnly
                      value="We are looking for a Full Stack Engineer with experience in Python, FastAPI, React, PostgreSQL, Docker, CI/CD and cloud technologies..."
                    />
                    <div className="lp-mock-chars">170/1000</div>

                    <div className="lp-mock-form-label">Job Role (Optional)</div>
                    <input className="lp-mock-input" readOnly value="Full Stack Engineer" />

                    <div className="lp-mock-form-label">
                      Experience Level ℹ
                    </div>
                    <select className="lp-mock-select" readOnly>
                      <option>Mid Level (2-5 Years)</option>
                    </select>

                    <button className="lp-mock-generate-btn">
                      ✦ Generate AI Resume
                    </button>
                    <div className="lp-mock-note">
                      ⏱ This may take 20-40 seconds
                    </div>
                  </div>

                  {/* Resume preview panel */}
                  <div className="lp-mock-resume">
                    <div className="lp-mock-resume-name">ALEX MORGAN</div>
                    <div className="lp-mock-resume-role">FULL STACK ENGINEER</div>
                    <div className="lp-mock-resume-contact">
                      <span>✉ alex.morgan@example.com</span>
                      <span>📱 +1 (555) 019-2834</span>
                      <span>📍 San Francisco, CA</span>
                    </div>
                    <div className="lp-mock-resume-contact">
                      <span>🔗 linkedin.com/in/alexmorgan</span>
                      <span>🐙 github.com/alexmorgan</span>
                    </div>
                    <div className="lp-mock-resume-divider" />

                    <div className="lp-mock-section-title">SUMMARY</div>
                    <div className="lp-mock-resume-text">
                      Full Stack Engineer with 3+ years of experience building scalable web applications using Python, FastAPI, React, PostgreSQL, Docker and cloud technologies. Passionate about writing clean code and solving real-world problems.
                    </div>

                    <div className="lp-mock-section-title">SKILLS</div>
                    <div className="lp-mock-tag-row">
                      {['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'AWS', 'CI/CD', 'JavaScript', 'Git', 'Linux', 'REST APIs'].map(t => (
                        <span className="lp-mock-tag" key={t}>{t}</span>
                      ))}
                    </div>

                    <div className="lp-mock-section-title">EXPERIENCE</div>
                    <div className="lp-mock-exp-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>AI/ML Intern — Business Core Solution</span>
                      <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.52rem' }}>Jun 2025 – Dec 2025</span>
                    </div>
                    {[
                      'Designed and implemented an end-to-end hospital readmission prediction pipeline.',
                      'Built a React dashboard for clinicians to visualize risk scores and insights.',
                      'Collaborated in a 4-person agile team and containerized the stack with Docker.',
                    ].map((b, i) => (
                      <div className="lp-mock-bullet" key={i}><span>·</span><span>{b}</span></div>
                    ))}

                    <div className="lp-mock-section-title" style={{ marginTop: 4 }}>PROJECTS</div>
                    <div className="lp-mock-exp-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>AI Resume Builder (Portinity)</span>
                      <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.52rem' }}>Mar 2024 – Present</span>
                    </div>
                    {[
                      'Built an AI-powered resume builder using FastAPI, React, PostgreSQL, pgvector and NVIDIA models via OpenRouter.',
                      'Implemented RAG pipeline for job relevance and personalized resume generation.',
                      'Generated ATS-optimized resumes in LaTeX and exported to PDF.',
                    ].map((b, i) => (
                      <div className="lp-mock-bullet" key={i}><span>·</span><span>{b}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FULL FEATURES SECTION ===== */}
      <section id="features" className="lp-features-section">
        <div className="lp-features-section-inner">

          {/* Section Header */}
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">
              <SparkleIcon /> Everything You Need
            </div>
            <h2 className="lp-section-title">
              Powerful Features to<br />Accelerate Your Career
            </h2>
            <p className="lp-section-subtitle">
              From AI-powered resume generation to ATS optimization and professional templates — Portinity gives you every tool to land your dream job faster.
            </p>
          </div>

          {/* 6-card Feature Grid */}
          <div className="lp-feat-grid">

            {/* Card 1 — AI Matching */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #6d28d9, #4f46e5)' }} />
              <div className="lp-feat-card-badge">Core</div>
              <div className="lp-feat-icon lp-feat-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <line x1="12" y1="7" x2="12" y2="11"/>
                  <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3"/>
                  <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3"/>
                  <line x1="9" y1="19" x2="15" y2="19"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">AI-Powered Job Matching</h3>
              <p className="lp-feat-card-desc">
                Our RAG-powered AI analyzes the job description and cross-references it with your profile to generate a perfectly tailored resume in seconds.
              </p>
              <div className="lp-feat-card-bullets">
                {['Understands job requirements deeply', 'Highlights your most relevant skills', 'Adapts tone to industry & role level'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-purple">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                Learn more →
              </a>
            </div>

            {/* Card 2 — ATS Optimization */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #15803d, #16a34a)' }} />
              <div className="lp-feat-icon lp-feat-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">ATS Score Optimization</h3>
              <p className="lp-feat-card-desc">
                Every resume is formatted and keyword-tuned to score highly in Applicant Tracking Systems, so you never get filtered out before a human reads it.
              </p>
              <div className="lp-feat-card-bullets">
                {['Keyword density analysis', 'Clean machine-readable formatting', 'Section ordering for ATS compliance'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-green">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                Learn more →
              </a>
            </div>

            {/* Card 3 — Professional Templates */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }} />
              <div className="lp-feat-icon lp-feat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">7 Professional Templates</h3>
              <p className="lp-feat-card-desc">
                Choose from recruiter-approved templates ranging from minimal classic to bold executive layouts. Each template is pixel-perfect and print-ready.
              </p>
              <div className="lp-feat-card-bullets">
                {['Blue Line, Gray Banner, Elegant Beige & more', 'Minimal Classic for Helvetica purists', 'Single & multi-column layouts'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-blue">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                View templates →
              </a>
            </div>

            {/* Card 4 — Multi-format Export */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #c2410c, #ea580c)' }} />
              <div className="lp-feat-icon lp-feat-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">Export in Any Format</h3>
              <p className="lp-feat-card-desc">
                Download your finished resume as a pixel-perfect PDF, editable LaTeX source, or Word-compatible DOCX — all with a single click.
              </p>
              <div className="lp-feat-card-bullets">
                {['High-quality PDF via html2pdf', 'LaTeX source for academic roles', 'DOCX for Word-based workflows'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-orange">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                Learn more →
              </a>
            </div>

            {/* Card 5 — Profile Management */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #be123c, #e11d48)' }} />
              <div className="lp-feat-icon lp-feat-icon-rose">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">Smart Profile Manager</h3>
              <p className="lp-feat-card-desc">
                Maintain a rich, structured profile with all your experience, skills, projects, and certifications — your single source of truth for every application.
              </p>
              <div className="lp-feat-card-bullets">
                {['Experience, Skills, Education & more', 'Reuse data across multiple resumes', 'Auto-populated from your profile'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-rose">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                Learn more →
              </a>
            </div>

            {/* Card 6 — Cover Letter & Interview Prep */}
            <div className="lp-feat-card">
              <div className="lp-feat-card-accent" style={{ background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }} />
              <div className="lp-feat-icon lp-feat-icon-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className="lp-feat-card-title">Cover Letter & Interview Prep</h3>
              <p className="lp-feat-card-desc">
                Generate a tailored cover letter to match your resume, and use our AI interview coach to practice answers to role-specific questions.
              </p>
              <div className="lp-feat-card-bullets">
                {['AI-generated cover letters', 'Role-specific interview questions', 'Tips and model answers'].map(b => (
                  <div className="lp-feat-card-bullet" key={b}>
                    <span className="lp-feat-bullet-dot lp-feat-bullet-dot-teal">
                      <CheckIcon />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <a href="#" className="lp-feat-card-link" onClick={e => e.preventDefault()}>
                Coming soon →
              </a>
            </div>

          </div>{/* end lp-feat-grid */}

          {/* ---- AI Workflow Showcase ---- */}
          <div className="lp-feat-showcase">

            {/* Left: dark deep-dive panel */}
            <div className="lp-feat-showcase-left">
              <div className="lp-feat-showcase-badge">
                <SparkleIcon /> How the AI Works
              </div>
              <h3 className="lp-feat-showcase-title">
                From Job Description<br />to Perfect Resume in Seconds
              </h3>
              <p className="lp-feat-showcase-desc">
                Portinity's AI engine uses Retrieval-Augmented Generation to understand what recruiters actually want — then builds a resume that speaks their language.
              </p>
              <div className="lp-feat-showcase-steps">
                {[
                  {
                    title: 'Paste the Job Description',
                    text: 'Drop the full JD into the generator. Our AI reads every requirement and keyword.',
                  },
                  {
                    title: 'AI Retrieves Your Best Matches',
                    text: 'RAG finds the most relevant experience and skills from your profile using semantic search.',
                  },
                  {
                    title: 'Resume is Generated & Scored',
                    text: 'A tailored, ATS-optimized resume is built and scored against the JD in real time.',
                  },
                  {
                    title: 'Download & Apply Instantly',
                    text: 'Export your polished resume as PDF, LaTeX or DOCX — ready to submit immediately.',
                  },
                ].map((step, i) => (
                  <div className="lp-feat-step" key={i}>
                    <span className="lp-feat-step-num">{i + 1}</span>
                    <div className="lp-feat-step-body">
                      <div className="lp-feat-step-title">{step.title}</div>
                      <div className="lp-feat-step-text">{step.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: two mini feature cards */}
            <div className="lp-feat-showcase-right">

              <div className="lp-feat-mini-card">
                <div className="lp-feat-mini-card-header">
                  <div className="lp-feat-mini-icon lp-feat-icon-purple">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <h4 className="lp-feat-mini-card-title">RAG-Powered Intelligence</h4>
                </div>
                <p className="lp-feat-mini-card-desc">
                  Our Retrieval-Augmented Generation engine reads your entire profile and semantically retrieves the most relevant experience for any job description — no guesswork, no generic output.
                </p>
                <div className="lp-feat-mini-tags">
                  {['pgvector', 'OpenRouter', 'NVIDIA NIM', 'Semantic Search'].map(t => (
                    <span className="lp-feat-mini-tag lp-feat-mini-tag-purple" key={t}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="lp-feat-mini-card">
                <div className="lp-feat-mini-card-header">
                  <div className="lp-feat-mini-icon lp-feat-icon-teal">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <h4 className="lp-feat-mini-card-title">LaTeX-Quality Output</h4>
                </div>
                <p className="lp-feat-mini-card-desc">
                  Every resume is rendered from a battle-tested LaTeX template, ensuring typographic precision, consistent spacing, and flawless PDF exports that look stunning on paper and screen.
                </p>
                <div className="lp-feat-mini-tags">
                  {['PDF', 'LaTeX', 'DOCX', 'A4 Ready'].map(t => (
                    <span className="lp-feat-mini-tag lp-feat-mini-tag-teal" key={t}>{t}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>{/* end lp-feat-showcase */}

          {/* ---- Stats bar ---- */}
          <div className="lp-feat-stats">
            {[
              { value: '10K+',   label: 'Resumes Generated' },
              { value: '94%',    label: 'ATS Pass Rate' },
              { value: '7',      label: 'Resume Templates' },
              { value: '< 40s',  label: 'Average Generation Time' },
            ].map(({ value, label }) => (
              <div className="lp-feat-stat" key={label}>
                <div className="lp-feat-stat-value">{value}</div>
                <div className="lp-feat-stat-label">{label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="lp-how-section">
        <div className="lp-how-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">
              <SparkleIcon /> Simple Process
            </div>
            <h2 className="lp-section-title">
              Get Started in 4 Easy Steps
            </h2>
            <p className="lp-section-subtitle">
              Portinity makes it effortless to create and customize resumes tailored to any job opening. Here's how it works:
            </p>
          </div>

          <div className="lp-how-grid">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div className="lp-how-card" key={i}>
                <div className="lp-how-card-num-bg">0{i + 1}</div>
                <div className="lp-how-icon-container">
                  {step.icon}
                </div>
                <h3 className="lp-how-card-title">{step.title}</h3>
                <p className="lp-how-card-desc">{step.desc}</p>
                {i < 3 && (
                  <div className="lp-how-connector">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lp-how-cta">
            <button className="lp-btn-primary" onClick={handleGetStarted}>
              <MagicWandIcon /> Try It Now — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES SECTION ===== */}
      <TemplatesSection onGetStarted={handleGetStarted} />

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="lp-pricing-section">
        <div className="lp-pricing-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">
              <SparkleIcon /> Flexible Plans
            </div>
            <h2 className="lp-section-title">
              Choose the Plan That Fits Your Goals
            </h2>
            <p className="lp-section-subtitle">
              Whether you are just starting out or actively submitting targeted job applications, we have a plan for you.
            </p>
          </div>

          <div className="lp-pricing-grid">
            {PRICING_TIERS.map((tier, i) => (
              <div className={`lp-pricing-card ${tier.popular ? 'popular' : ''}`} key={i}>
                {tier.popular && (
                  <div className="lp-pricing-card-badge">Most Popular</div>
                )}
                <div className="lp-pricing-card-header">
                  <span className="lp-pricing-card-emoji">{tier.emoji}</span>
                  <h3 className="lp-pricing-card-title">{tier.name}</h3>
                  <p className="lp-pricing-card-best-for">Best for: {tier.bestFor}</p>
                </div>

                <div className="lp-pricing-card-price-box">
                  <span className="lp-pricing-card-price">{tier.price}</span>
                  {tier.period && (
                    <span className="lp-pricing-card-period">{tier.period}</span>
                  )}
                </div>

                <div className="lp-pricing-card-limit">
                  <strong>{tier.limit}</strong>
                </div>

                <ul className="lp-pricing-card-features">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="lp-pricing-card-feature">
                      <span className="lp-pricing-card-check"><CheckIcon /></span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  className={`lp-pricing-card-btn ${tier.popular ? 'btn-popular' : 'btn-normal'}`}
                  onClick={handleGetStarted}
                >
                  {tier.ctaText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RESOURCES SECTION ===== */}
      <section id="resources" className="lp-resources-section">
        <div className="lp-resources-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">
              <SparkleIcon /> Knowledge Center
            </div>
            <h2 className="lp-section-title">
              Free Career & Resume Resources
            </h2>
            <p className="lp-section-subtitle">
              Expand your job application strategy with expert insights, guides, and handbook articles written by professional recruiters.
            </p>
          </div>

          <div className="lp-resources-grid">
            {RESOURCES_DATA.map((res, i) => (
              <div className="lp-resource-card" key={i}>
                <div className="lp-resource-card-header">
                  <div className="lp-resource-card-icon-box">{res.icon}</div>
                  <span
                    className="lp-resource-card-badge"
                    style={{ background: res.badgeColor, color: res.textColor }}
                  >
                    {res.category}
                  </span>
                </div>
                <h3 className="lp-resource-card-title">{res.title}</h3>
                <p className="lp-resource-card-desc">{res.desc}</p>
                <div className="lp-resource-card-footer">
                  <span className="lp-resource-card-readtime">{res.readTime}</span>
                  <a href="#" className="lp-resource-card-link" onClick={e => e.preventDefault()}>
                    Read article →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="lp-about-section">
        <div className="lp-about-section-inner">
          
          <div className="lp-about-left">
            <div className="lp-section-eyebrow">
              <SparkleIcon /> Our Story
            </div>
            <h2 className="lp-about-title">
              Democratizing High-Quality Resume Creation
            </h2>
            <p className="lp-about-text">
              Portinity was born out of a simple frustration: talented students and professionals were constantly getting filtered out by applicant tracking systems (ATS) because of bad formatting and unoptimized keywords.
            </p>
            <p className="lp-about-text">
              We realized that premium resume formatting tools were either expensive, rigid, or lacked intelligent help. By combining <strong>Retrieval-Augmented Generation (RAG)</strong> with professional <strong>LaTeX rendering engines</strong>, we created a platform that understands your target job and reformats your experience with precision—giving everyone access to a recruiter-ready resume in seconds.
            </p>
            <div className="lp-about-stats-row">
              <div className="lp-about-stat-item">
                <span className="lp-about-stat-num">10K+</span>
                <span className="lp-about-stat-lbl">Resumes Built</span>
              </div>
              <div className="lp-about-stat-item">
                <span className="lp-about-stat-num">94%</span>
                <span className="lp-about-stat-lbl">ATS Pass Rate</span>
              </div>
              <div className="lp-about-stat-item">
                <span className="lp-about-stat-num">40s</span>
                <span className="lp-about-stat-lbl">Gen Time</span>
              </div>
            </div>
          </div>

          <div className="lp-about-right">
            <div className="lp-about-pillars-grid">
              {CORE_PILLARS.map((pillar, i) => (
                <div 
                  className="lp-about-pillar-card" 
                  key={i}
                  style={{ background: pillar.color, borderColor: pillar.borderColor }}
                >
                  <div className="lp-about-pillar-icon">{pillar.icon}</div>
                  <h3 className="lp-about-pillar-title">{pillar.title}</h3>
                  <p className="lp-about-pillar-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

/* ─── Extracted to keep the render function clean ─── */
const TEMPLATES = [
  {
    id: 'blue-line',
    name: 'Modern Blue Line',
    subtitle: 'Estelle Darcy Style',
    badge: 'Popular',
    category: 'Modern',
    tags: ['Modern', 'ATS Friendly'],
    bestFor: 'All Professionals',
    columnsType: 'Single Column',
    atsScore: 'High ↗',
    accentColor: '#1E5AA8',
    bgColor: '#ffffff',
    headerBg: '#ffffff',
    swatches: ['#1E56A0', '#1F2937', '#ffffff'],
  },
  {
    id: 'gray-banner',
    name: 'Executive Gray Banner',
    subtitle: 'Olivia Sanchez Style',
    badge: null,
    category: 'Executive',
    tags: ['Professional', 'Executive'],
    bestFor: 'Experienced & Managers',
    columnsType: 'Hybrid Layout',
    atsScore: 'High ↗',
    accentColor: '#475569',
    bgColor: '#ffffff',
    headerBg: '#E2E7EC',
    swatches: ['#E2E7EC', '#111827', '#475569'],
  },

  {
    id: 'elegant-beige',
    name: 'Elegant Beige',
    subtitle: 'Warm Professional',
    badge: null,
    category: 'Creative',
    tags: ['Creative', 'Professional'],
    bestFor: 'Designers & Educators',
    columnsType: 'Single Column',
    atsScore: 'Good ↗',
    accentColor: '#C5A059',
    bgColor: '#FDFBF7',
    headerBg: '#FDFBF7',
    swatches: ['#C5A059', '#78350f', '#fef3c7'],
  },

  {
    id: 'minimal-classic',
    name: 'Minimal Black Classic',
    subtitle: 'Timeless Helvetica',
    badge: 'Popular',
    category: 'Minimal',
    tags: ['Minimal', 'ATS Friendly', 'Classic'],
    bestFor: 'All Professions & Executives',
    columnsType: 'Single Column',
    atsScore: 'Excellent ↗',
    accentColor: '#111111',
    bgColor: '#ffffff',
    headerBg: '#ffffff',
    swatches: ['#111111', '#555555', '#e5e7eb'],
  },
];

const FILTERS = ['All', 'Modern', 'Minimal', 'Executive', 'Creative'];

function TemplatePreview({ tpl }) {
  const isDark = tpl.bgColor === '#1e1b4b';
  const lineColor = isDark ? '#c4b5fd' : tpl.accentColor;
  const bodyLineColor = isDark ? '#a78bfa' : '#94a3b8';

  return (
    <div
      className="lp-tpl-preview"
      style={{ background: tpl.bgColor, color: tpl.accentColor }}
    >
      {/* Header region */}
      <div
        className="lp-tpl-preview-header"
        style={{ background: tpl.headerBg }}
      >
        <div className="lp-tpl-preview-name" style={{ color: tpl.accentColor }} />
        <div className="lp-tpl-preview-role" style={{ color: tpl.accentColor }} />
        <div className="lp-tpl-preview-contact">
          <span style={{ color: tpl.accentColor }} />
          <span style={{ color: tpl.accentColor }} />
          <span style={{ color: tpl.accentColor }} />
        </div>
      </div>

      {/* Divider */}
      <div
        className="lp-tpl-preview-divider"
        style={{ background: tpl.accentColor }}
      />

      {/* Body */}
      <div className="lp-tpl-preview-body">
        <div
          className="lp-tpl-preview-section-label"
          style={{ background: lineColor }}
        />
        <div className="lp-tpl-preview-line full" style={{ background: bodyLineColor }} />
        <div className="lp-tpl-preview-line w90"  style={{ background: bodyLineColor }} />
        <div className="lp-tpl-preview-line w75"  style={{ background: bodyLineColor }} />

        <div
          className="lp-tpl-preview-section-label"
          style={{ background: lineColor, marginTop: 4 }}
        />
        <div className="lp-tpl-preview-line full" style={{ background: bodyLineColor }} />
        <div className="lp-tpl-preview-line w60"  style={{ background: bodyLineColor }} />

        <div
          className="lp-tpl-preview-section-label"
          style={{ background: lineColor, marginTop: 4 }}
        />
        <div className="lp-tpl-preview-line w90" style={{ background: bodyLineColor }} />
        <div className="lp-tpl-preview-line w50" style={{ background: bodyLineColor }} />
      </div>
    </div>
  );
}

function TemplatesSection({ onGetStarted }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeFilter);

  return (
    <section id="templates" className="lp-tpl-section">
      <div className="lp-tpl-section-inner">

        {/* Header */}
        <div className="lp-section-header">
          <div className="lp-section-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            Resume Templates
          </div>
          <h2 className="lp-section-title">
            Choose Your Perfect<br />Resume Template
          </h2>
          <p className="lp-section-subtitle">
            Seven professionally crafted templates — from clean monochrome classics to bold dark-mode developer layouts. Every template is ATS-optimized and print-ready.
          </p>
        </div>

        {/* Filter pills */}
        <div className="lp-tpl-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`lp-tpl-pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="lp-tpl-grid">
          {filtered.map(tpl => (
            <div
              className="lp-tpl-card"
              key={tpl.id}
              onClick={onGetStarted}
            >
              {/* Badge */}
              {tpl.badge && (
                <span className={`lp-tpl-badge lp-tpl-badge-${tpl.badge.toLowerCase()}`}>
                  {tpl.badge}
                </span>
              )}

              {/* Colour preview thumbnail */}
              <TemplatePreview tpl={tpl} />

              {/* Hover overlay */}
              <div className="lp-tpl-card-overlay" />
              <span className="lp-tpl-card-cta">Use This Template →</span>

              {/* Info footer */}
              <div className="lp-tpl-card-info">
                <p className="lp-tpl-card-name">{tpl.name}</p>
                <p className="lp-tpl-card-sub">{tpl.subtitle}</p>

                {/* Tags row */}
                <div className="lp-tpl-card-meta">
                  {tpl.tags.map(tag => (
                    <span className="lp-tpl-meta-tag" key={tag}>{tag}</span>
                  ))}
                  <span className="lp-tpl-meta-dot" />
                  <span className="lp-tpl-ats-tag">ATS: {tpl.atsScore}</span>
                </div>

                {/* Meta */}
                <div className="lp-tpl-card-meta" style={{ marginTop: 2 }}>
                  <span className="lp-tpl-meta-tag">{tpl.columnsType}</span>
                  <span className="lp-tpl-meta-tag">{tpl.bestFor}</span>
                </div>

                {/* Colour swatches */}
                <div className="lp-tpl-swatches">
                  {tpl.swatches.map((c, i) => (
                    <span
                      key={i}
                      className="lp-tpl-swatch"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="lp-tpl-cta-strip">
          <p className="lp-tpl-cta-text">Can't decide? Let the AI pick the best template for your role.</p>
          <p className="lp-tpl-cta-sub">Our AI recommends the optimal template based on your industry, experience level, and target job description.</p>
          <div className="lp-tpl-cta-btns">
            <button className="lp-btn-primary" onClick={onGetStarted}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="15" y1="4" x2="15" y2="2"/><line x1="15" y1="16" x2="15" y2="14"/>
                <line x1="8" y1="9" x2="10" y2="9"/><line x1="20" y1="9" x2="22" y2="9"/>
                <line x1="17.8" y1="11.8" x2="19.2" y2="13.2"/><line x1="10.2" y1="4.2" x2="11.6" y2="5.6"/>
                <line x1="17.8" y1="6.2" x2="19.2" y2="4.8"/><line x1="10.2" y1="13.8" x2="11.6" y2="12.4"/>
                <path d="M3 21l9-9"/>
              </svg>
              Get Started Free
            </button>
            <button className="lp-btn-secondary" onClick={onGetStarted}>
              Browse All Templates
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
