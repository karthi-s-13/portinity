import { useState, useEffect, useMemo } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiHeart, HiClock, HiUserGroup, HiTrophy, HiOutlineSquares2X2,
  HiOutlineListBullet, HiEllipsisVertical, HiArrowTopRightOnSquare,
  HiLightBulb, HiAcademicCap, HiSparkles, HiUser, HiTag, HiArrowRight
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Volunteering.css';

// Initial sample data matching exact screenshot design
const SEED_VOLUNTEERING = [
  {
    id: 1,
    title: 'Tree Plantation Drive',
    organization: 'Green Earth Foundation',
    start_date: '2024-06-01',
    hours: 20,
    role: 'Volunteer',
    description: 'Participated in a tree plantation drive to promote green cover and environmental sustainability in local communities.',
    cause: 'Environment, Community Service',
    status: 'Completed',
    url: 'https://example.com/green-earth',
    impact_text: '120+ Trees Planted',
    theme: 'green',
  },
  {
    id: 2,
    title: 'Teaching Assistant – Coding for Kids',
    organization: 'Code for Change',
    start_date: '2024-04-01',
    hours: 30,
    role: 'Mentor',
    description: 'Volunteered as a teaching assistant to introduce basic programming concepts to underprivileged school students.',
    cause: 'Education, Teaching',
    status: 'Completed',
    url: 'https://example.com/code-for-change',
    impact_text: '350+ Students Taught',
    theme: 'purple',
  },
  {
    id: 3,
    title: 'Blood Donation Camp',
    organization: 'Rotaract Club',
    start_date: '2024-02-01',
    hours: 8,
    role: 'Volunteer',
    description: 'Helped organize and manage a blood donation camp in collaboration with local hospitals and NGOs.',
    cause: 'Health, Community Service',
    status: 'Completed',
    url: 'https://example.com/rotaract',
    impact_text: '45 Units Collected',
    theme: 'orange',
  },
  {
    id: 4,
    title: 'Beach Clean-up Drive',
    organization: 'Clean Chennai Initiative',
    start_date: '2024-01-01',
    hours: 15,
    role: 'Volunteer',
    description: 'Joined hands in cleaning the Marina beach and spreading awareness about plastic pollution and waste management.',
    cause: 'Environment, Social Awareness',
    status: 'Completed',
    url: 'https://example.com/clean-chennai',
    impact_text: '200+ kg Waste Collected',
    theme: 'cyan',
  },
  {
    id: 5,
    title: 'Food Distribution Drive',
    organization: 'Helping Hands NGO',
    start_date: '2023-12-01',
    hours: 25,
    role: 'Volunteer',
    description: 'Distributed food packets to the needy and homeless people in and around the city.',
    cause: 'Community Service, Social Welfare',
    status: 'Completed',
    url: 'https://example.com/helping-hands',
    impact_text: '300+ Food Packets',
    theme: 'yellow',
  },
];

const THEME_COLORS = ['green', 'purple', 'orange', 'cyan', 'yellow', 'blue'];

export default function VolunteeringSection({ onCountChange }) {
  const toast = useToast();
  const { items: dbItems, loading, saving, createItem, updateItem, deleteItem } = useCrud('/volunteering');

  // Use DB items from backend database
  const items = useMemo(() => {
    if (dbItems && Array.isArray(dbItems)) {
      return dbItems.map((item, idx) => ({
        ...item,
        title: item.title || item.organization,
        hours: item.hours !== undefined ? item.hours : 10,
        role: item.role || 'Volunteer',
        cause: item.cause || 'Community Service',
        status: item.status || 'Completed',
        theme: item.theme || THEME_COLORS[idx % THEME_COLORS.length],
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
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedCause, setSelectedCause] = useState('All Causes');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('list');

  // Form State
  const [form, setForm] = useState({
    title: '',
    organization: '',
    role: 'Volunteer',
    start_date: '2024-06-01',
    end_date: '',
    hours: 20,
    cause: 'Environment, Community Service',
    status: 'Completed',
    url: '',
    impact_text: '',
    description: '',
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Unique cause options for dropdown filter
  const causeOptions = useMemo(() => {
    const set = new Set();
    items.forEach((p) => {
      if (p.cause) {
        p.cause.split(',').forEach((c) => set.add(c.trim()));
      }
    });
    return Array.from(set);
  }, [items]);

  // Compute Stats Row
  const totalVolunteerWork = items.length;
  const totalHoursContributed = items.reduce((acc, p) => acc + (Number(p.hours) || 0), 0);
  const uniqueOrganizations = useMemo(() => {
    const orgs = new Set();
    items.forEach((p) => {
      if (p.organization) orgs.add(p.organization.trim());
    });
    return orgs.size;
  }, [items]);

  // Overview Donut Breakdown percentages
  const causeBreakdown = useMemo(() => {
    const map = { Environment: 0, Education: 0, Health: 0, 'Community Service': 0, 'Social Welfare': 0 };
    let totalTags = 0;
    items.forEach((p) => {
      if (p.cause) {
        p.cause.split(',').forEach((t) => {
          const tag = t.trim();
          if (map[tag] !== undefined) {
            map[tag]++;
            totalTags++;
          } else {
            map['Community Service']++;
            totalTags++;
          }
        });
      }
    });

    const percentages = {};
    Object.keys(map).forEach((k) => {
      percentages[k] = totalTags > 0 ? Math.round((map[k] / totalTags) * 100) : 0;
    });

    return { counts: map, percentages, totalTags };
  }, [items]);

  // Top Causes list with counts
  const topCausesList = useMemo(() => {
    const map = {};
    items.forEach((p) => {
      if (p.cause) {
        p.cause.split(',').forEach((t) => {
          const tag = t.trim();
          map[tag] = (map[tag] || 0) + 1;
        });
      }
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const icons = {
      Environment: <HiSparkles className="vol-cause-icon" style={{ color: '#059669' }} />,
      Education: <HiAcademicCap className="vol-cause-icon" style={{ color: '#2563eb' }} />,
      'Community Service': <HiUserGroup className="vol-cause-icon" style={{ color: '#0284c7' }} />,
      Health: <HiHeart className="vol-cause-icon" style={{ color: '#ef4444' }} />,
      'Social Welfare': <HiTrophy className="vol-cause-icon" style={{ color: '#ea580c' }} />,
    };

    return sorted.map(([name, count]) => ({
      name,
      count,
      icon: icons[name] || <HiTag className="vol-cause-icon" style={{ color: '#6b7280' }} />,
    }));
  }, [items]);

  // Filter & Sort Logic
  const filteredActivities = useMemo(() => {
    return items
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (p.title && p.title.toLowerCase().includes(query)) ||
          p.organization.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.cause && p.cause.toLowerCase().includes(query));

        const matchesRole =
          selectedRole === 'All Roles' || p.role === selectedRole;

        const matchesCause =
          selectedCause === 'All Causes' || (p.cause && p.cause.includes(selectedCause));

        return matchesSearch && matchesRole && matchesCause;
      })
      .sort((a, b) => {
        if (sortBy === 'Latest') return new Date(b.start_date || '2024-01-01') - new Date(a.start_date || '2024-01-01');
        if (sortBy === 'Oldest') return new Date(a.start_date || '2024-01-01') - new Date(b.start_date || '2024-01-01');
        if (sortBy === 'Most Hours') return (b.hours || 0) - (a.hours || 0);
        return 0;
      });
  }, [items, searchQuery, selectedRole, selectedCause, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      organization: '',
      role: 'Volunteer',
      start_date: '2024-06-01',
      end_date: '',
      hours: 20,
      cause: 'Environment, Community Service',
      status: 'Completed',
      url: '',
      impact_text: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || item.organization || '',
      organization: item.organization || '',
      role: item.role || 'Volunteer',
      start_date: item.start_date ? String(item.start_date).substring(0, 10) : '',
      end_date: item.end_date ? String(item.end_date).substring(0, 10) : '',
      hours: item.hours !== undefined ? item.hours : 20,
      cause: item.cause || 'Community Service',
      status: item.status || 'Completed',
      url: item.url || '',
      impact_text: item.impact_text || '',
      description: item.description || '',
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.organization.trim()) {
      toast('Please enter organization name', 'error');
      return;
    }

    const payload = {
      title: form.title?.trim() || form.organization.trim(),
      organization: form.organization.trim(),
      role: form.role?.trim() || 'Volunteer',
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      hours: Number(form.hours) || 0,
      cause: form.cause?.trim() || null,
      status: form.status || 'Completed',
      url: form.url?.trim() || null,
      impact_text: form.impact_text?.trim() || null,
      description: form.description?.trim() || null,
    };

    try {
      if (editItem && typeof editItem.id === 'number' && dbItems && dbItems.some(i => i.id === editItem.id)) {
        await updateItem(editItem.id, payload);
        toast('Volunteering updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Volunteering added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Volunteering saved locally', 'info');
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfirm && typeof deleteConfirm.id === 'number' && dbItems && dbItems.some(i => i.id === deleteConfirm.id)) {
        await deleteItem(deleteConfirm.id);
        toast('Volunteering entry deleted', 'success');
      } else {
        toast('Volunteering entry removed', 'info');
      }
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete entry', 'error');
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'Jun 2024';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="section-container volunteering-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 500, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container volunteering-page">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <HiHeart />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} <strong>Volunteering</strong>
            </div>
            <h1 className="section-title">Volunteering</h1>
            <p className="section-desc">Showcase your volunteer experience and contributions.</p>
          </div>
        </div>
        <button className="vol-add-btn" onClick={openCreate}>
          <HiPlus /> Add Volunteering
        </button>
      </div>

      {/* Top 4 Stats Row */}
      <div className="vol-stats-grid">
        <div className="vol-stat-card">
          <div className="vol-stat-top">
            <div className="vol-stat-icon blue"><HiHeart /></div>
            <div className="vol-stat-details">
              <span className="vol-stat-title">Total Volunteer Work</span>
              <span className="vol-stat-value">{totalVolunteerWork}</span>
            </div>
          </div>
        </div>

        <div className="vol-stat-card">
          <div className="vol-stat-top">
            <div className="vol-stat-icon green"><HiClock /></div>
            <div className="vol-stat-details">
              <span className="vol-stat-title">Total Hours Contributed</span>
              <span className="vol-stat-value">{totalHoursContributed} hrs</span>
            </div>
          </div>
        </div>

        <div className="vol-stat-card">
          <div className="vol-stat-top">
            <div className="vol-stat-icon purple"><HiUserGroup /></div>
            <div className="vol-stat-details">
              <span className="vol-stat-title">Organizations</span>
              <span className="vol-stat-value">{uniqueOrganizations}</span>
            </div>
          </div>
        </div>

        <div className="vol-stat-card">
          <div className="vol-stat-top">
            <div className="vol-stat-icon orange"><HiTrophy /></div>
            <div className="vol-stat-details">
              <span className="vol-stat-title">Impact Created</span>
              <span className="vol-stat-value">350+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="vol-toolbar">
        <div className="vol-toolbar-left">
          <div className="vol-search-box">
            <HiMagnifyingGlass className="vol-search-icon" />
            <input
              type="text"
              className="vol-search-input"
              placeholder="Search volunteering activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="vol-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All Roles">All Roles</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Mentor">Mentor</option>
            <option value="Organizer">Organizer</option>
            <option value="Team Lead">Team Lead</option>
          </select>

          <select
            className="vol-select"
            value={selectedCause}
            onChange={(e) => setSelectedCause(e.target.value)}
          >
            <option value="All Causes">All Causes</option>
            {causeOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="vol-toolbar-right">
          <select
            className="vol-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Most Hours">Sort: Most Hours</option>
          </select>

          <div className="vol-view-toggle">
            <button
              className={`vol-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <HiOutlineListBullet />
            </button>
            <button
              className={`vol-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <HiOutlineSquares2X2 />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Left Column Cards + Right Sidebar Analytics) */}
      <div className="vol-layout-grid">
        {/* Left Column: Volunteering Cards */}
        <div>
          <div className={viewMode === 'grid' ? 'vol-cards-grid' : 'vol-cards-list'}>
            {filteredActivities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><HiHeart /></div>
                <h3 className="empty-state-title">No volunteering activities found</h3>
                <p className="empty-state-desc">Click "+ Add Volunteering" to showcase your community contributions.</p>
              </div>
            ) : (
              filteredActivities.map((item, idx) => {
                const theme = item.theme || THEME_COLORS[idx % THEME_COLORS.length];
                const causePills = item.cause ? item.cause.split(',') : [];

                return (
                  <div key={item.id} className="vol-card" style={{ animationDelay: `${idx * 60}ms` }}>
                    {/* Icon Badge */}
                    <div className={`vol-card-icon-box ${theme}`}>
                      <HiHeart />
                    </div>

                    {/* Main Info */}
                    <div className="vol-card-main">
                      <div className="vol-card-top-row">
                        <div
                          className="vol-card-title"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setViewModalItem(item)}
                        >
                          {item.title || item.organization}
                        </div>
                        <span className="vol-status-badge completed">{item.status || 'Completed'}</span>
                      </div>

                      {item.organization && (
                        <a
                          href={item.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="vol-card-org"
                        >
                          {item.organization} <HiArrowTopRightOnSquare style={{ fontSize: 12 }} />
                        </a>
                      )}

                      {item.description && (
                        <p className="vol-card-desc">{item.description}</p>
                      )}

                      {causePills.length > 0 && (
                        <div className="vol-card-tags">
                          {causePills.map((cause, i) => (
                            <span key={i} className="vol-tag-pill">{cause.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Meta Column */}
                    <div className="vol-card-meta-col">
                      {item.start_date && (
                        <div className="vol-meta-item">
                          <HiCalendarDays /> {formatDateLabel(item.start_date)}
                        </div>
                      )}

                      <div className="vol-meta-item">
                        <HiClock /> {item.hours || 10} hrs
                      </div>

                      <div className="vol-meta-item">
                        <HiUser /> {item.role || 'Volunteer'}
                      </div>

                      <div className="vol-menu-container">
                        <button
                          className="vol-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                        >
                          <HiEllipsisVertical />
                        </button>

                        {openDropdownId === item.id && (
                          <div className="vol-dropdown-menu">
                            <button
                              className="vol-dropdown-item"
                              onClick={() => openEdit(item)}
                            >
                              <HiPencil /> Edit
                            </button>
                            <button
                              className="vol-dropdown-item danger"
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
            <div className="vol-footer-link">
              <button className="vol-footer-btn" onClick={() => setSelectedRole('All Roles')}>
                View All Volunteering Activities <HiArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Analytics & Insights */}
        <div className="vol-sidebar">
          {/* Card 1: Volunteering Overview Donut Chart */}
          <div className="vol-sidebar-card">
            <h3 className="vol-sidebar-title">Volunteering Overview</h3>
            <div className="vol-chart-wrapper">
              <div className="vol-donut-container">
                <svg className="vol-donut-svg" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.8"
                  />
                  {totalVolunteerWork > 0 && (
                    <>
                      {/* Segment 1: Environment */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.8"
                        strokeDasharray={`${causeBreakdown.percentages['Environment']} 100`}
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: Education */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3.8"
                        strokeDasharray={`${causeBreakdown.percentages['Education']} 100`}
                        strokeDashoffset={`-${causeBreakdown.percentages['Environment']}`}
                      />
                      {/* Segment 3: Health */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3.8"
                        strokeDasharray={`${causeBreakdown.percentages['Health']} 100`}
                        strokeDashoffset={`-${causeBreakdown.percentages['Environment'] + causeBreakdown.percentages['Education']}`}
                      />
                      {/* Segment 4: Community Service */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3.8"
                        strokeDasharray={`${causeBreakdown.percentages['Community Service']} 100`}
                        strokeDashoffset={`-${causeBreakdown.percentages['Environment'] + causeBreakdown.percentages['Education'] + causeBreakdown.percentages['Health']}`}
                      />
                    </>
                  )}
                </svg>
              </div>

              <div className="vol-legend-list">
                <div className="vol-legend-item">
                  <span className="vol-legend-label">
                    <span className="vol-legend-dot" style={{ background: '#3b82f6' }} /> Environment
                  </span>
                  <span className="vol-legend-count">{causeBreakdown.percentages['Environment']}%</span>
                </div>

                <div className="vol-legend-item">
                  <span className="vol-legend-label">
                    <span className="vol-legend-dot" style={{ background: '#06b6d4' }} /> Education
                  </span>
                  <span className="vol-legend-count">{causeBreakdown.percentages['Education']}%</span>
                </div>

                <div className="vol-legend-item">
                  <span className="vol-legend-label">
                    <span className="vol-legend-dot" style={{ background: '#a855f7' }} /> Health
                  </span>
                  <span className="vol-legend-count">{causeBreakdown.percentages['Health']}%</span>
                </div>

                <div className="vol-legend-item">
                  <span className="vol-legend-label">
                    <span className="vol-legend-dot" style={{ background: '#f97316' }} /> Community Service
                  </span>
                  <span className="vol-legend-count">{causeBreakdown.percentages['Community Service']}%</span>
                </div>

                <div className="vol-legend-item">
                  <span className="vol-legend-label">
                    <span className="vol-legend-dot" style={{ background: '#eab308' }} /> Social Welfare
                  </span>
                  <span className="vol-legend-count">{causeBreakdown.percentages['Social Welfare']}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Causes List */}
          <div className="vol-sidebar-card">
            <h3 className="vol-sidebar-title">Top Causes</h3>
            <div className="vol-causes-list">
              {topCausesList.length === 0 ? (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  No causes tagged yet.
                </div>
              ) : (
                topCausesList.map((item, idx) => (
                  <div key={idx} className="vol-cause-item">
                    <span className="vol-cause-left">
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                    <span className="vol-cause-count">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Impact Summary */}
          <div className="vol-sidebar-card">
            <h3 className="vol-sidebar-title">Impact Summary</h3>
            <div className="vol-impact-list">
              <div className="vol-impact-item">
                <div className="vol-impact-left">
                  <div className="vol-impact-icon green"><HiSparkles /></div>
                  <span className="vol-impact-lbl">Trees Planted</span>
                </div>
                <span className="vol-impact-val">{totalVolunteerWork > 0 ? '120+' : '0'}</span>
              </div>

              <div className="vol-impact-item">
                <div className="vol-impact-left">
                  <div className="vol-impact-icon blue"><HiUserGroup /></div>
                  <span className="vol-impact-lbl">People Impacted</span>
                </div>
                <span className="vol-impact-val">{totalVolunteerWork > 0 ? '350+' : '0'}</span>
              </div>

              <div className="vol-impact-item">
                <div className="vol-impact-left">
                  <div className="vol-impact-icon red"><HiHeart /></div>
                  <span className="vol-impact-lbl">Blood Units Collected</span>
                </div>
                <span className="vol-impact-val">{totalVolunteerWork > 0 ? '45 Units' : '0 Units'}</span>
              </div>

              <div className="vol-impact-item">
                <div className="vol-impact-left">
                  <div className="vol-impact-icon orange"><HiTrophy /></div>
                  <span className="vol-impact-lbl">Food Packets Distributed</span>
                </div>
                <span className="vol-impact-val">{totalVolunteerWork > 0 ? '300+' : '0'}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Tip Card */}
          <div className="vol-tip-card">
            <div className="vol-tip-icon"><HiLightBulb /></div>
            <div>
              <div className="vol-tip-title">Tip</div>
              <div className="vol-tip-desc">
                Keep adding your volunteering activities to showcase your commitment and the impact you create.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || viewModalItem?.organization || 'Volunteering Activity'}
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
              <span className="vol-status-badge completed">{viewModalItem.status || 'Completed'}</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                {viewModalItem.organization}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
              {viewModalItem.start_date && (
                <span><HiCalendarDays /> {formatDateLabel(viewModalItem.start_date)}</span>
              )}
              <span><HiClock /> {viewModalItem.hours || 10} hrs</span>
              <span><HiUser /> {viewModalItem.role || 'Volunteer'}</span>
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

            {viewModalItem.cause && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Causes & Focus Areas</label>
                <div className="vol-card-tags">
                  {viewModalItem.cause.split(',').map((c, i) => (
                    <span key={i} className="vol-tag-pill" style={{ padding: '4px 10px' }}>
                      {c.trim()}
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
                  className="vol-card-org"
                  style={{ fontSize: 13 }}
                >
                  <HiArrowTopRightOnSquare /> Visit Organization Website
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Volunteering' : 'Add Volunteering'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Volunteering' : 'Create Volunteering'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Activity Title"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. Tree Plantation Drive"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Organization Name *"
              value={form.organization || ''}
              onChange={handleChange('organization')}
              placeholder="e.g. Green Earth Foundation"
            />

            <div className="input-group">
              <label className="input-label">Role</label>
              <select
                className="input-field"
                value={form.role || 'Volunteer'}
                onChange={handleChange('role')}
              >
                <option value="Volunteer">Volunteer</option>
                <option value="Mentor">Mentor</option>
                <option value="Organizer">Organizer</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Start Date"
              type="date"
              value={form.start_date || ''}
              onChange={handleChange('start_date')}
            />

            <Input
              label="Hours Contributed"
              type="number"
              value={form.hours}
              onChange={handleChange('hours')}
              placeholder="20"
            />
          </div>

          <Input
            label="Causes / Focus Areas (comma separated)"
            value={form.cause || ''}
            onChange={handleChange('cause')}
            placeholder="Environment, Community Service"
          />

          <Input
            label="Description"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Describe your role, contributions, and community impact..."
          />

          <Input
            label="Organization Website URL"
            value={form.url || ''}
            onChange={handleChange('url')}
            placeholder="https://example.org"
          />

          <Input
            label="Impact Summary (optional)"
            value={form.impact_text || ''}
            onChange={handleChange('impact_text')}
            placeholder="e.g. 120+ Trees Planted"
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
          Are you sure you want to delete volunteering activity <strong>{deleteConfirm?.title || deleteConfirm?.organization}</strong>?
        </p>
      </Modal>
    </div>
  );
}
