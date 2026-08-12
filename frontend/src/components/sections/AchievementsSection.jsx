import { useState, useEffect, useMemo } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiTrophy, HiOutlineSparkles, HiOutlineAcademicCap, HiOutlineStar,
  HiOutlineUserGroup, HiOutlineLightBulb, HiEllipsisVertical,
  HiSquares2X2, HiListBullet, HiFlag
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Achievements.css';

const TYPES = ['Award', 'Recognition', 'Milestone', 'Competition', 'Scholarship', 'Certification', 'Patent', 'Other'];

const CATEGORIES = [
  'Academic',
  'Technical',
  'Leadership',
  'Community',
  'Other'
];

export default function AchievementsSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/achievements');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('list');

  const [form, setForm] = useState({
    title: '',
    achievement_type: 'Award',
    category: 'Technical',
    issuer: '',
    date: '',
    description: '',
    tags: '',
    media_url: ''
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Compute Stats
  const totalAchievements = items.length;
  const awardsCount = useMemo(() => {
    return items.filter(i => (i.achievement_type || 'Award') === 'Award').length;
  }, [items]);

  const recognitionsCount = useMemo(() => {
    return items.filter(i => i.achievement_type === 'Recognition').length;
  }, [items]);

  const milestonesCount = useMemo(() => {
    return items.filter(i => i.achievement_type === 'Milestone').length;
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { Academic: 0, Technical: 0, Leadership: 0, Community: 0, Other: 0 };
    items.forEach(i => {
      const cat = i.category || 'Other';
      if (counts[cat] !== undefined) counts[cat]++;
      else counts['Other']++;
    });
    return counts;
  }, [items]);

  // Donut Chart Data (by Type)
  const typeBreakdown = useMemo(() => {
    const counts = { Award: 0, Recognition: 0, Milestone: 0, Other: 0 };
    items.forEach(i => {
      const t = i.achievement_type || 'Award';
      if (counts[t] !== undefined) counts[t]++;
      else counts['Other']++;
    });

    const total = items.length;
    const colorMap = {
      Award: '#eab308',
      Recognition: '#a855f7',
      Milestone: '#10b981',
      Other: '#f97316'
    };

    const circ = 2 * Math.PI * 38; // ~238.76
    let currentOffset = 0;

    const list = Object.keys(counts).map(t => {
      const count = counts[t];
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const strokeLen = (pct / 100) * circ;
      const strokeDasharray = `${strokeLen} ${circ - strokeLen}`;
      const strokeDashoffset = -currentOffset;
      if (count > 0) currentOffset += strokeLen;

      return {
        type: t,
        count,
        pct,
        color: colorMap[t] || '#64748b',
        strokeDasharray,
        strokeDashoffset
      };
    });

    return { total, list, counts };
  }, [items]);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.issuer && item.issuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemType = item.achievement_type || 'Award';
      const matchesType = typeFilter === 'All Types' || itemType === typeFilter;

      const itemCat = item.category || 'Other';
      const matchesCategory = categoryFilter === 'All Categories' || itemCat === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === 'Latest') return (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0);
      if (sortBy === 'Oldest') return (a.date ? new Date(a.date) : 0) - (b.date ? new Date(b.date) : 0);
      if (sortBy === 'Title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [items, searchQuery, typeFilter, categoryFilter, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      achievement_type: 'Award',
      category: 'Technical',
      issuer: '',
      date: '',
      description: '',
      tags: '',
      media_url: ''
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      achievement_type: item.achievement_type || 'Award',
      category: item.category || 'Technical',
      issuer: item.issuer || '',
      date: item.date ? String(item.date).substring(0, 10) : '',
      description: item.description || '',
      tags: item.tags || '',
      media_url: item.media_url || ''
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast('Please enter achievement title', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      achievement_type: form.achievement_type || 'Award',
      category: form.category || 'Technical',
      issuer: form.issuer?.trim() || null,
      date: form.date || null,
      description: form.description?.trim() || null,
      tags: form.tags?.trim() || null,
      media_url: form.media_url?.trim() || null
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast('Achievement updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Achievement added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Failed to save achievement', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Achievement deleted', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete achievement', 'error');
    }
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderBadgeIcon = (type) => {
    switch (type) {
      case 'Award':
      case 'Competition': return <HiTrophy />;
      case 'Recognition':
      case 'Scholarship': return <HiOutlineAcademicCap />;
      case 'Milestone': return <HiOutlineSparkles />;
      case 'Community': return <HiOutlineUserGroup />;
      default: return <HiOutlineStar />;
    }
  };

  if (loading) {
    return (
      <div className="section-container ach-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container ach-page">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiTrophy /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Achievements
            </div>
            <h1 className="section-title">Achievements</h1>
            <p className="section-desc">Highlight your accomplishments and milestones.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Achievement
        </Button>
      </div>

      {/* Top Overview Stats Bar */}
      <div className="ach-stats-grid">
        <div className="ach-stat-card">
          <div className="ach-stat-icon blue"><HiTrophy /></div>
          <div className="ach-stat-info">
            <span className="ach-stat-title">Total Achievements</span>
            <span className="ach-stat-value">{totalAchievements}</span>
          </div>
        </div>

        <div className="ach-stat-card">
          <div className="ach-stat-icon green"><HiOutlineSparkles /></div>
          <div className="ach-stat-info">
            <span className="ach-stat-title">Awards</span>
            <span className="ach-stat-value">{awardsCount}</span>
          </div>
        </div>

        <div className="ach-stat-card">
          <div className="ach-stat-icon purple"><HiOutlineAcademicCap /></div>
          <div className="ach-stat-info">
            <span className="ach-stat-title">Recognitions</span>
            <span className="ach-stat-value">{recognitionsCount}</span>
          </div>
        </div>

        <div className="ach-stat-card" style={{ borderRight: 'none' }}>
          <div className="ach-stat-icon orange"><HiOutlineStar /></div>
          <div className="ach-stat-info">
            <span className="ach-stat-title">Milestones</span>
            <span className="ach-stat-value">{milestonesCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Toolbar Row */}
      <div className="ach-toolbar">
        <div className="ach-search-box">
          <HiMagnifyingGlass className="ach-search-icon" />
          <input
            type="text"
            className="ach-search-input"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="ach-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All Types">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          className="ach-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All Categories">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="ach-filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Latest">Sort: Latest</option>
          <option value="Oldest">Sort: Oldest</option>
          <option value="Title">Sort: Title</option>
        </select>

        <div className="ach-view-toggle">
          <button
            className={`ach-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <HiListBullet />
          </button>
          <button
            className={`ach-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <HiSquares2X2 />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="ach-main-grid">
        {/* Left Column: Achievements List/Grid */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '60px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div className="empty-state-icon"><HiTrophy /></div>
              <h3 className="empty-state-title">No achievements found</h3>
              <p className="empty-state-desc">Click "Add Achievement" to showcase your awards and honors.</p>
            </div>
          ) : (
            <div className={viewMode === 'list' ? 'ach-list' : 'ach-grid'}>
              {filteredItems.map(item => {
                const type = item.achievement_type || 'Award';
                const typeClass = type.toLowerCase();
                const tagsList = item.tags ? item.tags.split(',') : [];

                return (
                  <div
                    key={item.id}
                    className="ach-card-row"
                    onClick={() => setViewModalItem(item)}
                  >
                    {/* Dynamic Icon Badge */}
                    <div className={`ach-type-badge-icon ${typeClass}`}>
                      {renderBadgeIcon(type)}
                    </div>

                    {/* Middle Content */}
                    <div className="ach-card-content">
                      <div className="ach-title-row">
                        <span className="ach-card-title">{item.title}</span>
                        {item.date && (
                          <span className="ach-card-date">
                            <HiCalendarDays /> {formatDateStr(item.date)}
                          </span>
                        )}
                      </div>

                      <div className="ach-sub-row">
                        <span className={`ach-type-label ${typeClass}`}>{type}</span>
                        {item.issuer && (
                          <>
                            <span className="ach-sub-divider">|</span>
                            <span className="ach-issuer-text">{item.issuer}</span>
                          </>
                        )}
                      </div>

                      {item.description && (
                        <p className="ach-desc">{item.description}</p>
                      )}

                      {tagsList.length > 0 && (
                        <div className="ach-tags-row">
                          {tagsList.map((tag, i) => (
                            <span key={i} className="ach-tag-pill">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Action Menu */}
                    <div className="ach-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="project-kebab-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                        }}
                      >
                        <HiEllipsisVertical />
                      </button>

                      {openDropdownId === item.id && (
                        <div className="project-dropdown-menu">
                          <button
                            className="project-dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(item);
                            }}
                          >
                            <HiPencil /> Edit
                          </button>
                          <button
                            className="project-dropdown-item danger"
                            onClick={(e) => {
                              e.stopPropagation();
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
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Widgets Side Panel */}
        <div className="ach-right-panel">
          {/* Widget 1: Achievements Overview SVG Donut Chart */}
          <div className="ach-widget-card">
            <h3 className="ach-widget-title">Achievements Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', margin: '16px 0' }}>
              <div style={{ position: 'relative', width: 90, height: 90 }}>
                <svg viewBox="0 0 100 100" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  {typeBreakdown.total > 0 && typeBreakdown.list.map((tItem) => {
                    if (tItem.count === 0) return null;
                    return (
                      <circle
                        key={tItem.type}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={tItem.color}
                        strokeWidth="14"
                        strokeDasharray={tItem.strokeDasharray}
                        strokeDashoffset={tItem.strokeDashoffset}
                      />
                    );
                  })}
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {typeBreakdown.total}
                </div>
              </div>
              <div className="ach-widget-list" style={{ flex: 1 }}>
                {typeBreakdown.list.map((tItem) => (
                  <div key={tItem.type} className="ach-widget-item">
                    <span className="ach-widget-item-left">
                      <span className="ach-dot" style={{ background: tItem.color }} />
                      {tItem.type}s
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>
                      {tItem.pct}% ({tItem.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: By Category */}
          <div className="ach-widget-card">
            <h3 className="ach-widget-title">By Category</h3>
            <div className="ach-widget-list">
              {CATEGORIES.map(cat => (
                <div key={cat} className="ach-widget-item">
                  <span className="ach-widget-item-left">{cat}</span>
                  <span style={{ fontWeight: 700 }}>{categoryCounts[cat] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Recent Milestones */}
          <div className="ach-widget-card">
            <h3 className="ach-widget-title">Recent Milestones</h3>
            <div className="ach-widget-list" style={{ gap: 12 }}>
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="ach-milestone-item">
                  <div className="ach-milestone-flag"><HiFlag /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ach-milestone-title">{item.title}</div>
                    <div className="ach-milestone-desc">{formatDateStr(item.date) || 'Recent'}</div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No milestones yet.</div>
              )}
            </div>
          </div>

          {/* Widget 4: Tip Box */}
          <div className="ach-tip-box">
            <HiOutlineLightBulb className="ach-tip-icon" />
            <div className="ach-tip-content">
              <h4>Tip</h4>
              <p>Keep adding your achievements to make your profile stronger and impressive.</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Achievement Details Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || 'Achievement Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Achievement
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className={`ach-type-badge-icon ${(viewModalItem.achievement_type || 'Award').toLowerCase()}`} style={{ width: 64, height: 64, fontSize: 28 }}>
                {renderBadgeIcon(viewModalItem.achievement_type)}
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {viewModalItem.title}
                </h2>
                <div className="ach-sub-row">
                  <span className={`ach-type-label ${(viewModalItem.achievement_type || 'Award').toLowerCase()}`}>
                    {viewModalItem.achievement_type || 'Award'}
                  </span>
                  {viewModalItem.issuer && (
                    <>
                      <span className="ach-sub-divider">|</span>
                      <span className="ach-issuer-text">{viewModalItem.issuer}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {viewModalItem.date && (
              <div className="ach-card-date">
                <HiCalendarDays /> Date: {formatDateStr(viewModalItem.date)}
              </div>
            )}

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

            {viewModalItem.tags && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Skills & Domains</label>
                <div className="ach-tags-row">
                  {viewModalItem.tags.split(',').map((tag, i) => (
                    <span key={i} className="ach-tag-pill" style={{ padding: '5px 12px', fontSize: 12 }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Achievement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Achievement' : 'Add Achievement'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Achievement' : 'Save Achievement'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Achievement Title"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. Winner – Smart India Hackathon 2024"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select
                className="input-field"
                value={form.achievement_type || 'Award'}
                onChange={handleChange('achievement_type')}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category || 'Technical'}
                onChange={handleChange('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Issued By / Level / Scope"
              value={form.issuer || ''}
              onChange={handleChange('issuer')}
              placeholder="e.g. National Level, Saveetha Engineering College"
            />
            <Input
              label="Date"
              type="date"
              value={form.date || ''}
              onChange={handleChange('date')}
            />
          </div>

          <Input
            label="Description"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Secured 1st place in Smart India Hackathon 2024. Built an AI-powered solution..."
          />

          <Input
            label="Skills & Tags (comma separated)"
            value={form.tags || ''}
            onChange={handleChange('tags')}
            placeholder="Problem Solving, AI/ML, Team Leadership"
          />

          <Input
            label="Badge / Certificate Image URL"
            value={form.media_url || ''}
            onChange={handleChange('media_url')}
            placeholder="https://example.com/badge.png"
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
          Are you sure you want to delete achievement <strong>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
