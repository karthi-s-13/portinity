import { useState, useEffect } from 'react';
import { 
  HiPencil, 
  HiCamera, 
  HiCheckBadge, 
  HiMapPin, 
  HiCalendarDays, 
  HiGlobeAlt, 
  HiChevronDown,
  HiOutlineUser,
  HiOutlineInformationCircle,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineLanguage,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineSquares2X2
} from 'react-icons/hi2';
import { FaGithub, FaLinkedin, FaBriefcase, FaCode } from 'react-icons/fa';
import API from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import './Sections.css';
import './ProfileSection.css';

export default function ProfileSection({ onProfileUpdate }) {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Controls which modal is open: 'header', 'personal', 'about', 'contact', 'social', 'languages', or null
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile');
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        toast('Failed to load profile data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (section) => {
    setForm(profile || {});
    setEditSection(section);
  };

  const closeEdit = () => {
    setEditSection(null);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/profile', form);
      setProfile(res.data);
      toast('Profile updated successfully', 'success');
      closeEdit();
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section-container profile-page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: 40, width: 200 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const displayProfile = {
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    headline: profile?.headline || '',
    summary: profile?.summary || '',
    location: profile?.location || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    leetcode: profile?.leetcode || '',
    avatar_url: profile?.avatar_url || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    nationality: profile?.nationality || '',
    languages: profile?.languages || ''
  };

  const defaultName = user?.email ? user.email.split('@')[0] : 'No Name Provided';
  const displayName = displayProfile.first_name || displayProfile.last_name 
    ? `${displayProfile.first_name} ${displayProfile.last_name}`.trim() 
    : defaultName;

  const calculateCompleteness = () => {
    const fields = [
      Boolean(displayProfile.first_name || displayProfile.last_name),
      Boolean(displayProfile.headline),
      Boolean(displayProfile.summary),
      Boolean(displayProfile.avatar_url),
      Boolean(displayProfile.location),
      Boolean(displayProfile.email),
      Boolean(displayProfile.phone),
      Boolean(displayProfile.date_of_birth),
      Boolean(displayProfile.gender || displayProfile.nationality),
      Boolean(displayProfile.languages),
      Boolean(displayProfile.github || displayProfile.linkedin || displayProfile.website || displayProfile.leetcode),
    ];
    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const getInitials = () => {
    if (displayProfile.first_name) return displayProfile.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const cleanUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  };

  const renderModalContent = () => {
    switch (editSection) {
      case 'header':
        return (
          <div className="profile-form">
            <div className="profile-form-row">
              <Input label="First Name" value={form.first_name || ''} onChange={handleChange('first_name')} placeholder="John" />
              <Input label="Last Name" value={form.last_name || ''} onChange={handleChange('last_name')} placeholder="Doe" />
            </div>
            <Input label="Headline" value={form.headline || ''} onChange={handleChange('headline')} placeholder="Full Stack Developer" />
            <Input label="Avatar URL" value={form.avatar_url || ''} onChange={handleChange('avatar_url')} placeholder="https://example.com/photo.jpg" />
          </div>
        );
      case 'personal':
        return (
          <div className="profile-form">
            <div className="profile-form-row">
              <Input label="First Name" value={form.first_name || ''} onChange={handleChange('first_name')} placeholder="John" />
              <Input label="Last Name" value={form.last_name || ''} onChange={handleChange('last_name')} placeholder="Doe" />
            </div>
            <div className="profile-form-row">
              <Input label="Date of Birth" value={form.date_of_birth || ''} onChange={handleChange('date_of_birth')} placeholder="e.g. 25 May 2004" />
              <Input label="Gender" value={form.gender || ''} onChange={handleChange('gender')} placeholder="e.g. Male/Female/Other" />
            </div>
            <div className="profile-form-row">
              <Input label="Nationality" value={form.nationality || ''} onChange={handleChange('nationality')} placeholder="e.g. Indian" />
              <Input label="Current Location" value={form.location || ''} onChange={handleChange('location')} placeholder="San Francisco, CA" />
            </div>
            <Input label="Languages Known" value={form.languages || ''} onChange={handleChange('languages')} placeholder="e.g. English, Tamil" />
          </div>
        );
      case 'about':
        return (
          <div className="profile-form">
            <Input label="Summary" textarea value={form.summary || ''} onChange={handleChange('summary')} placeholder="A brief about yourself..." />
          </div>
        );
      case 'contact':
        return (
          <div className="profile-form">
            <Input label="Contact Email" value={form.email || ''} onChange={handleChange('email')} placeholder="john@example.com" />
            <Input label="Phone" value={form.phone || ''} onChange={handleChange('phone')} placeholder="+1 234 567 890" />
            <Input label="Location" value={form.location || ''} onChange={handleChange('location')} placeholder="San Francisco, CA" />
          </div>
        );
      case 'social':
        return (
          <div className="profile-form">
            <Input label="GitHub" value={form.github || ''} onChange={handleChange('github')} placeholder="https://github.com/johndoe" />
            <Input label="LinkedIn" value={form.linkedin || ''} onChange={handleChange('linkedin')} placeholder="https://linkedin.com/in/johndoe" />
            <Input label="Portfolio / Website" value={form.website || ''} onChange={handleChange('website')} placeholder="https://johndoe.com" />
            <Input label="LeetCode" value={form.leetcode || ''} onChange={handleChange('leetcode')} placeholder="https://leetcode.com/johndoe" />
          </div>
        );
      case 'languages':
        return (
          <div className="profile-form">
            <Input label="Languages Known (comma separated)" value={form.languages || ''} onChange={handleChange('languages')} placeholder="e.g. English, Tamil" />
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (editSection) {
      case 'header': return 'Edit Basic Info';
      case 'personal': return 'Edit Personal Information';
      case 'about': return 'Edit About Me';
      case 'contact': return 'Edit Contact Information';
      case 'social': return 'Edit Social Links';
      case 'languages': return 'Edit Languages';
      default: return 'Edit Profile';
    }
  };

  return (
    <div className="section-container profile-page">
      <div className="profile-page-header">
        <div className="breadcrumb">Dashboard / <span>Profile</span></div>
        <div className="profile-header-content">
          <div>
            <h1 className="profile-title">Profile</h1>
            <p className="profile-subtitle">Manage your personal information and public profile.</p>
          </div>
          <Button variant="primary" onClick={() => openEdit('header')}>
            <HiPencil /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="profile-main-card">
        <div className="profile-main-info">
          <div className="profile-avatar-container">
            {displayProfile.avatar_url ? (
              <img src={displayProfile.avatar_url} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{getInitials()}</div>
            )}
            <button className="avatar-edit-btn" onClick={() => openEdit('header')}><HiCamera /></button>
          </div>
          <div className="profile-main-details">
            <h2 className="profile-name">
              {displayName} {displayProfile.first_name && <HiCheckBadge className="verified-badge" />}
            </h2>
            <p className="profile-headline">{displayProfile.headline || 'Add a headline'}</p>
            <div className="profile-tags">
              <span className="profile-tag"><HiMapPin /> {displayProfile.location || 'Location not specified'}</span>
              <span className="profile-tag"><HiCalendarDays /> Joined Recently</span>
              <span className="profile-tag dropdown"><HiGlobeAlt /> Public Profile <HiChevronDown /></span>
            </div>
          </div>
        </div>
        <div className="profile-completeness">
          <div 
            className="progress-circle"
            style={{ background: `conic-gradient(var(--primary-600) ${completeness}%, var(--gray-100) 0)` }}
          >
            <span className="progress-value">{completeness}%</span>
          </div>
          <p className="progress-label">Profile Completeness</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal Information */}
        <div className="info-card card-personal">
          <div className="info-card-header">
            <div className="info-card-title">
              <HiOutlineUser /> Personal Information
            </div>
            <button className="edit-btn-small" onClick={() => openEdit('personal')}><HiPencil /> Edit</button>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">
                {displayName}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{displayProfile.date_of_birth || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{displayProfile.gender || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nationality</span>
              <span className="info-value">{displayProfile.nationality || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Location</span>
              <span className="info-value">{displayProfile.location || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Languages Known</span>
              <span className="info-value">{displayProfile.languages || '-'}</span>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="info-card card-about">
          <div className="info-card-header">
            <div className="info-card-title">
              <HiOutlineInformationCircle /> About Me
            </div>
            <button className="edit-btn-small" onClick={() => openEdit('about')}><HiPencil /> Edit</button>
          </div>
          <div className="about-text">
            {displayProfile.summary || 'Nothing to show here yet.'}
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-card card-contact">
          <div className="info-card-header">
            <div className="info-card-title">
              <HiOutlineArrowPathRoundedSquare /> Contact Information
            </div>
            <button className="edit-btn-small" onClick={() => openEdit('contact')}><HiPencil /> Edit</button>
          </div>
          <div className="info-list contact-list">
            <div className="info-item">
              <HiOutlineEnvelope className="contact-icon" />
              <span className="info-value">{displayProfile.email || '-'}</span>
            </div>
            <div className="info-item">
              <HiOutlinePhone className="contact-icon" />
              <span className="info-value">{displayProfile.phone || '-'}</span>
            </div>
            <div className="info-item">
              <HiMapPin className="contact-icon" />
              <span className="info-value">{displayProfile.location || '-'}</span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="info-card card-social">
          <div className="info-card-header">
            <div className="info-card-title">
              <HiOutlineSquares2X2 /> Social Links
            </div>
            <button className="edit-btn-small" onClick={() => openEdit('social')}><HiPencil /> Edit</button>
          </div>
          <div className="social-list">
            <div className="social-item">
              <span className="social-label"><FaGithub /> GitHub</span>
              {displayProfile.github ? <a href={displayProfile.github} className="social-link" target="_blank" rel="noreferrer" title={displayProfile.github}>{cleanUrl(displayProfile.github)}</a> : <span>-</span>}
            </div>
            <div className="social-item">
              <span className="social-label"><FaLinkedin /> LinkedIn</span>
              {displayProfile.linkedin ? <a href={displayProfile.linkedin} className="social-link" target="_blank" rel="noreferrer" title={displayProfile.linkedin}>{cleanUrl(displayProfile.linkedin)}</a> : <span>-</span>}
            </div>
            <div className="social-item">
              <span className="social-label"><FaBriefcase /> Portfolio</span>
              {displayProfile.website ? <a href={displayProfile.website} className="social-link" target="_blank" rel="noreferrer" title={displayProfile.website}>{cleanUrl(displayProfile.website)}</a> : <span>-</span>}
            </div>
            <div className="social-item">
              <span className="social-label"><FaCode /> LeetCode</span>
              {displayProfile.leetcode ? <a href={displayProfile.leetcode} className="social-link" target="_blank" rel="noreferrer" title={displayProfile.leetcode}>{cleanUrl(displayProfile.leetcode)}</a> : <span>-</span>}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="info-card card-languages">
          <div className="info-card-header">
            <div className="info-card-title">
              <HiOutlineLanguage /> Languages
            </div>
            <button className="edit-btn-small" onClick={() => openEdit('languages')}><HiPencil /> Edit</button>
          </div>
          <div className="lang-tags">
            {displayProfile.languages ? displayProfile.languages.split(',').map((lang, idx) => (
              <span className="lang-tag" key={idx}>{lang.trim()}</span>
            )) : (
              <div className="about-text">No languages specified.</div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!editSection}
        onClose={closeEdit}
        title={getModalTitle()}
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
          </>
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}
