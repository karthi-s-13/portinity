import { useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineBriefcase, HiOutlineDocumentCheck, HiOutlineEye, HiOutlineTrophy, HiOutlineDocumentText, HiArrowRight, HiOutlineCodeBracket } from 'react-icons/hi2';
import Button from '../ui/Button';
import API from '../../api/axios';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate }) {
  const [data, setData] = useState({
    profile: null,
    projects: [],
    certifications: [],
    achievements: [],
    education: [],
    skills: [],
    experience: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profile, projects, certs, achievements, edu, skills, exp] = await Promise.all([
          API.get('/profile').catch(() => ({ data: null })),
          API.get('/projects').catch(() => ({ data: [] })),
          API.get('/certifications').catch(() => ({ data: [] })),
          API.get('/achievements').catch(() => ({ data: [] })),
          API.get('/education').catch(() => ({ data: [] })),
          API.get('/skills').catch(() => ({ data: [] })),
          API.get('/experience').catch(() => ({ data: [] }))
        ]);

        setData({
          profile: profile.data,
          projects: projects.data,
          certifications: certs.data,
          achievements: achievements.data,
          education: edu.data,
          skills: skills.data,
          experience: exp.data
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading dashboard...</div>;
  }

  return (
    <div className="overview-container">
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Dashboard</h1>
          <p className="overview-subtitle">Welcome back! Here's what's happening with your profile.</p>
        </div>
        <div className="overview-actions">
          <Button variant="secondary" onClick={() => onNavigate('profile')}>
            <HiOutlineUser /> View Profile
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-title">Skills Mastered</div>
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <HiOutlineCodeBracket />
            </div>
          </div>
          <div>
            <div className="stat-value">{data.skills.length}</div>
            <div className="stat-trend neutral">
              {data.skills.length > 0 ? `${data.skills.length} skills listed` : 'Add your top skills'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-title">Projects</div>
            <div className="stat-icon"><HiOutlineBriefcase /></div>
          </div>
          <div>
            <div className="stat-value">{data.projects.length}</div>
            <div className="stat-trend">+0 this month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-title">Certifications</div>
            <div className="stat-icon"><HiOutlineDocumentCheck /></div>
          </div>
          <div>
            <div className="stat-value">{data.certifications.length}</div>
            <div className="stat-trend">+0 this month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-title">Total Views</div>
            <div className="stat-icon"><HiOutlineEye /></div>
          </div>
          <div>
            <div className="stat-value">128</div>
            <div className="stat-trend">+18 this month</div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        {/* Featured Skills Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Featured Skills</h2>
            <button className="panel-link" onClick={() => onNavigate('skills')}>Manage Skills</button>
          </div>
          <p className="panel-subtitle">Key technologies and competencies added to your profile.</p>
          
          <div className="skills-overview-list">
            {data.skills.length > 0 ? (
              <div className="skills-tags-container">
                {data.skills.slice(0, 10).map((skill) => (
                  <div key={skill.id || skill.name} className="overview-skill-badge">
                    <span className="skill-badge-name">{skill.name}</span>
                    {skill.proficiency && (
                      <span className={`skill-badge-prof ${skill.proficiency.toLowerCase()}`}>
                        {skill.proficiency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-skills-state">
                <div className="empty-skills-icon"><HiOutlineCodeBracket /></div>
                <p>No skills added yet.</p>
              </div>
            )}
          </div>

          <button className="complete-profile-btn" onClick={() => onNavigate('skills')}>
            {data.skills.length > 0 ? `Manage All Skills (${data.skills.length}) →` : '+ Add Skills to Profile →'}
          </button>
        </div>

        {/* Recent Projects */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Projects</h2>
            <button className="panel-link" onClick={() => onNavigate('projects')}>View All</button>
          </div>
          <div className="recent-list" style={{ marginTop: 12 }}>
            {data.projects.slice(0, 3).map(proj => (
              <div key={proj.id} className="recent-item" onClick={() => onNavigate('projects')}>
                {proj.image_url ? (
                  <img src={proj.image_url} alt={proj.title} className="recent-item-thumb" />
                ) : (
                  <div className="recent-item-icon">
                    <HiOutlineBriefcase />
                  </div>
                )}
                <div className="recent-item-content">
                  <div className="recent-item-title">{proj.title}</div>
                </div>
              </div>
            ))}
            {data.projects.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>No projects added yet.</div>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Achievements</h2>
            <button className="panel-link" onClick={() => onNavigate('achievements')}>View All</button>
          </div>
          <div className="recent-list" style={{ marginTop: 16 }}>
            {data.achievements.slice(0, 3).map(ach => (
              <div key={ach.id} className="recent-item">
                <div className="recent-item-icon" style={{ background: '#fefce8', color: '#ca8a04', borderRadius: '50%' }}>
                  <HiOutlineTrophy />
                </div>
                <div className="recent-item-content">
                  <div className="recent-item-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ach.title}</span>
                    <span className="recent-item-date">{formatDate(ach.date)}</span>
                  </div>
                  <div className="recent-item-desc">{ach.description || ach.issuer || 'No details'}</div>
                </div>
              </div>
            ))}
            {data.achievements.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>No achievements added yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="resume-banner">
        <div className="resume-banner-left">
          <div className="resume-banner-icon">
            <HiOutlineDocumentText />
          </div>
          <div className="resume-banner-content">
            <h3>Generate Your Resume</h3>
            <p>Create ATS-friendly resumes in seconds with AI.</p>
          </div>
        </div>
        <Button variant="primary">
          Create Resume <HiArrowRight style={{ marginLeft: 4 }} />
        </Button>
      </div>
    </div>
  );
}
