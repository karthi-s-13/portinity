import { HiMagnifyingGlass, HiBars3, HiChevronDown, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ toggleSidebar, profile }) {
  const { user, logout } = useAuth();
  
  const getDisplayName = () => {
    if (profile && (profile.first_name || profile.last_name)) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    if (user && user.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'User';
  };

  const displayName = getDisplayName();

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <HiBars3 />
        </button>
      </div>
      
      <div className="header-right">
        
        <button className="header-btn" onClick={logout} title="Logout" style={{ marginLeft: 8 }}>
          <HiArrowRightOnRectangle />
        </button>

        <div className="header-user" style={{ marginLeft: 16 }}>
          <div className="header-user-avatar" title={user?.email}>
            {displayName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{displayName}</span>
          </div>
          <HiChevronDown style={{ color: 'var(--gray-400)', fontSize: 16 }} />
        </div>
      </div>
    </header>
  );
}

