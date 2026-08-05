import {
  HiOutlineSquares2X2, HiUser, HiAcademicCap, HiWrenchScrewdriver, HiCommandLine,
  HiBriefcase, HiDocumentCheck, HiTrophy, HiBookOpen,
  HiHeart, HiPuzzlePiece, HiArrowRightOnRectangle, HiBars3,
  HiXMark, HiSparkles,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import logoUrl from '../../assests/portinify_logo.png';
import './Sidebar.css';

const NAV_ITEMS = [
  { key: 'ai-resume', label: 'AI Resume Generator', icon: <HiSparkles style={{ color: '#8b5cf6' }} />, section: 'general' },
  { key: 'profile', label: 'Profile', icon: <HiUser />, section: 'general' },
  { key: 'education', label: 'Education', icon: <HiAcademicCap />, section: 'background' },
  { key: 'skills', label: 'Skills', icon: <HiWrenchScrewdriver />, section: 'background' },
  { key: 'projects', label: 'Projects', icon: <HiCommandLine />, section: 'background' },
  { key: 'experience', label: 'Experience', icon: <HiBriefcase />, section: 'career' },
  { key: 'certifications', label: 'Certifications', icon: <HiDocumentCheck />, section: 'career' },
  { key: 'achievements', label: 'Achievements', icon: <HiTrophy />, section: 'career' },
  { key: 'publications', label: 'Publications', icon: <HiBookOpen />, section: 'extras' },
  { key: 'volunteering', label: 'Volunteering', icon: <HiHeart />, section: 'extras' },
  { key: 'extracurricular', label: 'Extracurricular', icon: <HiPuzzlePiece />, section: 'extras' },
];

const SECTION_LABELS = {
  general: 'GENERAL',
  background: 'EDUCATION',
  career: 'CAREER',
  extras: 'MORE',
};

export default function Sidebar({ activeSection, onSectionChange, counts = {}, isOpen, onClose }) {
  const { user, logout } = useAuth();

  const handleNav = (key) => {
    onSectionChange(key);
    if (onClose) onClose();
  };

  const renderNav = () => {
    let lastSection = null;
    return NAV_ITEMS.map((item) => {
      const sectionLabel = item.section !== lastSection;
      lastSection = item.section;
      return (
        <div key={item.key}>
          {sectionLabel && (
            <div className="sidebar-section-label">{SECTION_LABELS[item.section]}</div>
          )}
          <button
            className={`sidebar-item ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => handleNav(item.key)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
          </button>
        </div>
      );
    });
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={onClose}>
        {isOpen ? <HiXMark /> : <HiBars3 />}
      </button>

      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logoUrl} alt="Portinity Logo" className="sidebar-logo-img" />
          <div className="sidebar-brand-name">Portinity</div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-dashboard-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNav('dashboard')}
          >
            <span className="sidebar-item-icon"><HiOutlineSquares2X2 /></span>
            Dashboard
          </button>
          {renderNav()}
        </nav>
      </aside>
    </>
  );
}

