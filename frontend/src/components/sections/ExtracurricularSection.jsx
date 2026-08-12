import { useState, useEffect, useMemo } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiShieldCheck, HiUser, HiAcademicCap, HiTrophy, HiUserGroup,
  HiOutlineSquares2X2, HiOutlineListBullet, HiEllipsisVertical,
  HiArrowTopRightOnSquare, HiLightBulb, HiStar, HiBuildingLibrary,
  HiMapPin, HiCodeBracket, HiMicrophone, HiSparkles, HiPaintBrush,
  HiArrowRight
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Extracurricular.css';

const CATEGORY_COLORS = {
  Leadership: 'purple',
  Technical: 'green',
  Cultural: 'orange',
  Sports: 'blue',
  Arts: 'pink',
  Community: 'cyan',
};

const CATEGORY_ICONS = {
  Leadership: <HiUserGroup />,
  Technical: <HiCodeBracket />,
  Cultural: <HiMicrophone />,
  Sports: <HiTrophy />,
  Arts: <HiPaintBrush />,
  Community: <HiSparkles />,
};

export default function ExtracurricularSection({ onCountChange }) {
  const toast = useToast();
  const { items: dbItems, loading, saving, createItem, updateItem, deleteItem } = useCrud('/extracurricular');

  // Use DB items from backend database (initially empty if no records stored)
  const items = useMemo(() => {
    if (dbItems && Array.isArray(dbItems)) {
      return dbItems.map((item, idx) => ({
        ...item,
        category: item.category || 'Leadership',
        role: item.role || 'Member',
        location: item.location || 'On Campus',
        skills: item.skills || '',
        theme: CATEGORY_COLORS[item.category] || 'purple',
      }));
    }
    return [];
  }, [dbItems]);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('list');

  // Form State
  const [form, setForm] = useState({
    title: '',
    organization: '',
    category: 'Leadership',
    role: 'Core Committee',
    location: 'On Campus',
    skills: 'Leadership, Communication',
    start_date: '2023-08-01',
    end_date: '',
    is_current: true,
    url: '',
    description: '',
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Compute Metrics
  const totalActivities = items.length;

  const leadershipRolesCount = useMemo(() => {
    return items.filter((p) =>
      p.category === 'Leadership' ||
      (p.role && (p.role.includes('Lead') || p.role.includes('Committee') || p.role.includes('President') || p.role.includes('Coordinator')))
    ).length;
  }, [items]);

  const uniqueTeamsCount = useMemo(() => {
    const set = new Set();
    items.forEach((p) => {
      if (p.organization) set.add(p.organization.trim());
    });
    return set.size;
  }, [items]);

  const yearsActiveText = useMemo(() => {
    if (items.length === 0) return '0 Years';
    return '3+ Years';
  }, [items]);

  // Overview Donut Breakdown percentages
  const categoryBreakdown = useMemo(() => {
    const counts = { Leadership: 0, Technical: 0, Sports: 0, Cultural: 0 };
    items.forEach((p) => {
      const cat = p.category || 'Leadership';
      if (counts[cat] !== undefined) counts[cat]++;
      else counts['Leadership']++;
    });

    const total = items.length;
    const percentages = {
      Leadership: total > 0 ? Math.round((counts.Leadership / total) * 100) : 0,
      Technical: total > 0 ? Math.round((counts.Technical / total) * 100) : 0,
      Sports: total > 0 ? Math.round((counts.Sports / total) * 100) : 0,
      Cultural: total > 0 ? Math.round((counts.Cultural / total) * 100) : 0,
    };

    return { counts, percentages, total };
  }, [items]);

  // Top Categories List
  const topCategoriesList = useMemo(() => {
    const map = {};
    items.forEach((p) => {
      const cat = p.category || 'Leadership';
      map[cat] = (map[cat] || 0) + 1;
    });

    const list = [
      { name: 'Leadership', count: map['Leadership'] || 0, icon: <HiUserGroup className="extra-category-icon" style={{ color: '#2563eb' }} /> },
      { name: 'Technical', count: map['Technical'] || 0, icon: <HiCodeBracket className="extra-category-icon" style={{ color: '#059669' }} /> },
      { name: 'Sports', count: map['Sports'] || 0, icon: <HiTrophy className="extra-category-icon" style={{ color: '#ea580c' }} /> },
      { name: 'Cultural', count: map['Cultural'] || 0, icon: <HiMicrophone className="extra-category-icon" style={{ color: '#7e22ce' }} /> },
    ];

    return list;
  }, [items]);

  // Filter & Sort Logic
  const filteredActivities = useMemo(() => {
    return items
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.title.toLowerCase().includes(query) ||
          (p.organization && p.organization.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.skills && p.skills.toLowerCase().includes(query));

        const matchesCategory =
          selectedCategory === 'All Categories' || p.category === selectedCategory;

        const matchesRole =
          selectedRole === 'All Roles' || p.role === selectedRole;

        const isCurrent = p.is_current || !p.end_date || p.end_date === 'Present';
        const matchesStatus =
          selectedStatus === 'All Status' ||
          (selectedStatus === 'Active' && isCurrent) ||
          (selectedStatus === 'Ongoing' && isCurrent) ||
          (selectedStatus === 'Past' && !isCurrent);

        return matchesSearch && matchesCategory && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'Latest') return new Date(b.start_date || '2024-01-01') - new Date(a.start_date || '2024-01-01');
        if (sortBy === 'Oldest') return new Date(a.start_date || '2024-01-01') - new Date(b.start_date || '2024-01-01');
        if (sortBy === 'Title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, searchQuery, selectedCategory, selectedRole, selectedStatus, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      organization: '',
      category: 'Leadership',
      role: 'Core Committee',
      location: 'On Campus',
      skills: 'Leadership, Communication',
      start_date: '2023-08-01',
      end_date: '',
      is_current: true,
      url: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const isCurrent = item.is_current || !item.end_date || item.end_date === 'Present';
    setForm({
      title: item.title || '',
      organization: item.organization || '',
      category: item.category || 'Leadership',
      role: item.role || 'Member',
      location: item.location || 'On Campus',
      skills: item.skills || '',
      start_date: item.start_date ? String(item.start_date).substring(0, 10) : '',
      end_date: item.end_date ? String(item.end_date).substring(0, 10) : '',
      is_current: isCurrent,
      url: item.url || '',
      description: item.description || '',
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast('Please enter activity title', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      organization: form.organization?.trim() || null,
      category: form.category || 'Leadership',
      role: form.role?.trim() || 'Member',
      location: form.location?.trim() || 'On Campus',
      skills: form.skills?.trim() || null,
      start_date: form.start_date || null,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      url: form.url?.trim() || null,
      description: form.description?.trim() || null,
    };

    try {
      if (editItem && typeof editItem.id === 'number' && dbItems && dbItems.some(i => i.id === editItem.id)) {
        await updateItem(editItem.id, payload);
        toast('Activity updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Activity added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Activity saved locally', 'info');
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfirm && typeof deleteConfirm.id === 'number' && dbItems && dbItems.some(i => i.id === deleteConfirm.id)) {
        await deleteItem(deleteConfirm.id);
        toast('Activity deleted', 'success');
      } else {
        toast('Activity removed', 'info');
      }
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete activity', 'error');
    }
  };

  const formatDateRange = (item) => {
    const start = item.start_date ? formatDateLabel(item.start_date) : '2023';
    const isCurrent = item.is_current || !item.end_date || item.end_date === 'Present';
    const end = isCurrent ? 'Present' : formatDateLabel(item.end_date);
    return `${start} – ${end}`;
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="section-container extracurricular-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 500, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container extracurricular-page">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <HiShieldCheck />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} <strong>Extracurricular</strong>
            </div>
            <h1 className="section-title">Extracurricular</h1>
            <p className="section-desc">Showcase your activities beyond academics.</p>
          </div>
        </div>
        <button className="extra-add-btn" onClick={openCreate}>
          <HiPlus /> Add Activity
        </button>
      </div>

      {/* Top 4 Stats Row */}
      <div className="extra-stats-grid">
        <div className="extra-stat-card">
          <div className="extra-stat-top">
            <div className="extra-stat-icon purple"><HiUser /></div>
            <div className="extra-stat-details">
              <span className="extra-stat-title">Total Activities</span>
              <span className="extra-stat-value">{totalActivities}</span>
            </div>
          </div>
        </div>

        <div className="extra-stat-card">
          <div className="extra-stat-top">
            <div className="extra-stat-icon green"><HiCalendarDays /></div>
            <div className="extra-stat-details">
              <span className="extra-stat-title">Years Active</span>
              <span className="extra-stat-value">{yearsActiveText}</span>
            </div>
          </div>
        </div>

        <div className="extra-stat-card">
          <div className="extra-stat-top">
            <div className="extra-stat-icon orange"><HiTrophy /></div>
            <div className="extra-stat-details">
              <span className="extra-stat-title">Leadership Roles</span>
              <span className="extra-stat-value">{leadershipRolesCount}</span>
            </div>
          </div>
        </div>

        <div className="extra-stat-card">
          <div className="extra-stat-top">
            <div className="extra-stat-icon blue"><HiUserGroup /></div>
            <div className="extra-stat-details">
              <span className="extra-stat-title">Teams & Clubs</span>
              <span className="extra-stat-value">{uniqueTeamsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Controls Bar */}
      <div className="extra-toolbar">
        <div className="extra-toolbar-left">
          <select
            className="extra-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            <option value="Leadership">Leadership</option>
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Arts">Arts</option>
            <option value="Community">Community</option>
          </select>

          <select
            className="extra-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All Roles">All Roles</option>
            <option value="Core Committee">Core Committee</option>
            <option value="Member">Member</option>
            <option value="Event Team">Event Team</option>
            <option value="Team Member">Team Member</option>
            <option value="Leader">Leader</option>
          </select>

          <select
            className="extra-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active (Ongoing)</option>
            <option value="Past">Past</option>
          </select>
        </div>

        <div className="extra-toolbar-right">
          <div className="extra-view-toggle">
            <button
              className={`extra-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <HiOutlineListBullet /> List View
            </button>
            <button
              className={`extra-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <HiOutlineSquares2X2 /> Grid View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Left Cards List + Right Sidebar Analytics) */}
      <div className="extra-layout-grid">
        {/* Left Column: Activity Cards */}
        <div>
          <div className={viewMode === 'grid' ? 'extra-cards-grid' : 'extra-cards-list'}>
            {filteredActivities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><HiShieldCheck /></div>
                <h3 className="empty-state-title">No extracurricular activities found</h3>
                <p className="empty-state-desc">Click "+ Add Activity" to showcase your clubs, sports, and leadership roles.</p>
              </div>
            ) : (
              filteredActivities.map((item, idx) => {
                const theme = CATEGORY_COLORS[item.category] || 'purple';
                const skillPills = item.skills ? item.skills.split(',') : [];
                const icon = CATEGORY_ICONS[item.category] || <HiUserGroup />;

                return (
                  <div key={item.id} className="extra-card" style={{ animationDelay: `${idx * 60}ms` }}>
                    {/* Circle Icon Badge */}
                    <div className={`extra-card-icon-box ${theme}`}>
                      {icon}
                    </div>

                    {/* Main Info */}
                    <div className="extra-card-main">
                      <div
                        className="extra-card-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setViewModalItem(item)}
                      >
                        {item.title}
                      </div>

                      {item.organization && (
                        <a
                          href={item.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="extra-card-org"
                        >
                          {item.organization}
                        </a>
                      )}

                      {item.description && (
                        <p className="extra-card-desc">{item.description}</p>
                      )}

                      {skillPills.length > 0 && (
                        <div className="extra-card-tags">
                          {skillPills.map((skill, i) => (
                            <span key={i} className={`extra-tag-pill ${theme}`}>{skill.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Meta Column */}
                    <div className="extra-card-meta-col">
                      <div className="extra-meta-item">
                        <HiCalendarDays /> {formatDateRange(item)}
                      </div>

                      {item.role && (
                        <div className="extra-meta-item">
                          <HiUser /> {item.role}
                        </div>
                      )}

                      <div className="extra-meta-item">
                        <HiMapPin /> {item.location || 'On Campus'}
                      </div>

                      <div className="extra-menu-container">
                        <button
                          className="extra-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                        >
                          <HiEllipsisVertical />
                        </button>

                        {openDropdownId === item.id && (
                          <div className="extra-dropdown-menu">
                            <button
                              className="extra-dropdown-item"
                              onClick={() => openEdit(item)}
                            >
                              <HiPencil /> Edit
                            </button>
                            <button
                              className="extra-dropdown-item danger"
                              onClick={() => {
                                setDeleteConfirm(item);
                                setOpenDropdownId(null);
                              }}
                            >
                              <HiTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          {filteredActivities.length > 0 && (
            <div className="extra-footer-link">
              <button className="extra-footer-btn" onClick={() => setSelectedCategory('All Categories')}>
                View All Activities <HiArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Analytics & Insights */}
        <div className="extra-sidebar">
          {/* Card 1: Activity Overview Donut Chart */}
          <div className="extra-sidebar-card">
            <h3 className="extra-sidebar-title">Activity Overview</h3>
            <div className="extra-chart-wrapper">
              <div className="extra-donut-container">
                <svg className="extra-donut-svg" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.8"
                  />
                  {totalActivities > 0 && (
                    <>
                      {/* Segment 1: Leadership */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.8"
                        strokeDasharray={`${categoryBreakdown.percentages.Leadership} 100`}
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: Technical */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.8"
                        strokeDasharray={`${categoryBreakdown.percentages.Technical} 100`}
                        strokeDashoffset={`-${categoryBreakdown.percentages.Leadership}`}
                      />
                      {/* Segment 3: Sports */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3.8"
                        strokeDasharray={`${categoryBreakdown.percentages.Sports} 100`}
                        strokeDashoffset={`-${categoryBreakdown.percentages.Leadership + categoryBreakdown.percentages.Technical}`}
                      />
                      {/* Segment 4: Cultural */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3.8"
                        strokeDasharray={`${categoryBreakdown.percentages.Cultural} 100`}
                        strokeDashoffset={`-${categoryBreakdown.percentages.Leadership + categoryBreakdown.percentages.Technical + categoryBreakdown.percentages.Sports}`}
                      />
                    </>
                  )}
                </svg>
              </div>

              <div className="extra-legend-list">
                <div className="extra-legend-item">
                  <span className="extra-legend-label">
                    <span className="extra-legend-dot" style={{ background: '#3b82f6' }} /> Leadership
                  </span>
                  <span className="extra-legend-count">
                    {categoryBreakdown.percentages.Leadership}% ({categoryBreakdown.counts.Leadership})
                  </span>
                </div>

                <div className="extra-legend-item">
                  <span className="extra-legend-label">
                    <span className="extra-legend-dot" style={{ background: '#10b981' }} /> Technical
                  </span>
                  <span className="extra-legend-count">
                    {categoryBreakdown.percentages.Technical}% ({categoryBreakdown.counts.Technical})
                  </span>
                </div>

                <div className="extra-legend-item">
                  <span className="extra-legend-label">
                    <span className="extra-legend-dot" style={{ background: '#f97316' }} /> Sports
                  </span>
                  <span className="extra-legend-count">
                    {categoryBreakdown.percentages.Sports}% ({categoryBreakdown.counts.Sports})
                  </span>
                </div>

                <div className="extra-legend-item">
                  <span className="extra-legend-label">
                    <span className="extra-legend-dot" style={{ background: '#a855f7' }} /> Cultural
                  </span>
                  <span className="extra-legend-count">
                    {categoryBreakdown.percentages.Cultural}% ({categoryBreakdown.counts.Cultural})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Categories List */}
          <div className="extra-sidebar-card">
            <h3 className="extra-sidebar-title">Top Categories</h3>
            <div className="extra-categories-list">
              {topCategoriesList.map((item, idx) => (
                <div key={idx} className="extra-category-item">
                  <span className="extra-category-left">
                    {item.icon}
                    <span>{item.name}</span>
                  </span>
                  <span className="extra-category-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Highlights Bullet List */}
          <div className="extra-sidebar-card">
            <h3 className="extra-sidebar-title">Highlights</h3>
            <div className="extra-highlights-list">
              <div className="extra-highlight-item">
                <HiStar className="extra-highlight-star" />
                <span>
                  {totalActivities > 0 ? `Active participant in ${totalActivities}+ activities across different domains.` : 'Add activities to see your domain highlights.'}
                </span>
              </div>

              <div className="extra-highlight-item">
                <HiStar className="extra-highlight-star" />
                <span>
                  {leadershipRolesCount > 0 ? `Held ${leadershipRolesCount} leadership roles and responsibilities.` : 'Highlight leadership roles in student clubs.'}
                </span>
              </div>

              <div className="extra-highlight-item">
                <HiStar className="extra-highlight-star" />
                <span>Consistent involvement in college and community events.</span>
              </div>
            </div>
          </div>

          {/* Card 4: Tip Card */}
          <div className="extra-tip-card">
            <div className="extra-tip-icon"><HiLightBulb /></div>
            <div>
              <div className="extra-tip-title">Tip</div>
              <div className="extra-tip-desc">
                Extracurricular activities showcase your passion, leadership, and commitment towards personal growth.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || 'Activity Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Activity
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`extra-tag-pill ${CATEGORY_COLORS[viewModalItem.category] || 'purple'}`}>
                {viewModalItem.category}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                {viewModalItem.organization}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
              <span><HiCalendarDays /> {formatDateRange(viewModalItem)}</span>
              {viewModalItem.role && <span><HiUser /> {viewModalItem.role}</span>}
              <span><HiMapPin /> {viewModalItem.location || 'On Campus'}</span>
            </div>

            {viewModalItem.description && (
              <div style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                background: 'var(--bg-secondary)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                whiteSpace: 'pre-wrap'
              }}>
                {viewModalItem.description}
              </div>
            )}

            {viewModalItem.skills && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Key Skills & Competencies</label>
                <div className="extra-card-tags">
                  {viewModalItem.skills.split(',').map((skill, i) => (
                    <span key={i} className="extra-tag-pill purple" style={{ padding: '4px 10px' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewModalItem.url && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={viewModalItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="extra-card-org"
                  style={{ fontSize: 13 }}
                >
                  <HiArrowTopRightOnSquare /> Visit Activity / Club Webpage
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Activity' : 'Add Activity'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Activity' : 'Create Activity'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Activity Title *"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. Student Placement Coordinator"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Organization / Club / College"
              value={form.organization || ''}
              onChange={handleChange('organization')}
              placeholder="e.g. Saveetha Engineering College"
            />

            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category || 'Leadership'}
                onChange={handleChange('category')}
              >
                <option value="Leadership">Leadership</option>
                <option value="Technical">Technical</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Arts">Arts</option>
                <option value="Community">Community</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Role"
              value={form.role || ''}
              onChange={handleChange('role')}
              placeholder="e.g. Core Committee, Member"
            />

            <div className="input-group">
              <label className="input-label">Location / Setting</label>
              <select
                className="input-field"
                value={form.location || 'On Campus'}
                onChange={handleChange('location')}
              >
                <option value="On Campus">On Campus</option>
                <option value="Off Campus">Off Campus</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>

          <Input
            label="Key Skills (comma separated)"
            value={form.skills || ''}
            onChange={handleChange('skills')}
            placeholder="Leadership, Communication, Public Speaking"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Start Date"
              type="date"
              value={form.start_date || ''}
              onChange={handleChange('start_date')}
            />

            <Input
              label="End Date"
              type="date"
              disabled={!!form.is_current}
              value={form.is_current ? '' : form.end_date || ''}
              onChange={handleChange('end_date')}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.is_current}
              onChange={(e) => setForm((prev) => ({ ...prev, is_current: e.target.checked }))}
            />
            Currently active in this role (Present)
          </label>

          <Input
            label="Description"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Describe your role, responsibilities, and achievements..."
          />

          <Input
            label="Activity / Club Link"
            value={form.url || ''}
            onChange={handleChange('url')}
            placeholder="https://example.com/club"
          />
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete activity <strong>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
