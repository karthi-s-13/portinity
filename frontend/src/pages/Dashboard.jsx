import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardOverview from '../components/sections/DashboardOverview';
import ProfileSection from '../components/sections/ProfileSection';
import EducationSection from '../components/sections/EducationSection';
import SkillsSection from '../components/sections/SkillsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import CertificationsSection from '../components/sections/CertificationsSection';
import AchievementsSection from '../components/sections/AchievementsSection';
import PublicationsSection from '../components/sections/PublicationsSection';
import VolunteeringSection from '../components/sections/VolunteeringSection';
import ExtracurricularSection from '../components/sections/ExtracurricularSection';
import './Dashboard.css';

const SECTIONS = {
  dashboard: DashboardOverview,
  profile: ProfileSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  experience: ExperienceSection,
  certifications: CertificationsSection,
  achievements: AchievementsSection,
  publications: PublicationsSection,
  volunteering: VolunteeringSection,
  extracurricular: ExtracurricularSection,
};

export default function Dashboard() {
  const getInitialSection = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && SECTIONS[hash]) {
      return hash;
    }
    const saved = localStorage.getItem('activeSection');
    if (saved && SECTIONS[saved]) {
      return saved;
    }
    return 'dashboard';
  };

  const [activeSection, setActiveSectionState] = useState(getInitialSection);
  const [counts, setCounts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setActiveSection = (section) => {
    if (SECTIONS[section]) {
      setActiveSectionState(section);
      localStorage.setItem('activeSection', section);
      window.location.hash = section;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash && SECTIONS[hash]) {
        setActiveSectionState(hash);
        localStorage.setItem('activeSection', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCountChange = useCallback((section) => (count) => {
    setCounts((prev) => {
      if (prev[section] === count) return prev;
      return { ...prev, [section]: count };
    });
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const ActiveComponent = SECTIONS[activeSection] || DashboardOverview;

  return (
    <div className="dashboard">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s) => { setActiveSection(s); setSidebarOpen(false); }}
        counts={counts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="dashboard-main">
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          <ActiveComponent
            key={activeSection}
            onNavigate={(section) => setActiveSection(section)}
            onCountChange={handleCountChange(activeSection)}
          />
        </main>
      </div>
    </div>
  );
}

