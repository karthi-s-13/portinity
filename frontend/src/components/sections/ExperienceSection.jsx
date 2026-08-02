import { useState, useEffect, useMemo } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMapPin,
  HiOutlineBriefcase, HiOutlineBuildingOffice, HiOutlineClock,
  HiOutlineUserGroup, HiOutlineTrophy, HiOutlineCheckCircle,
  HiArrowTopRightOnSquare, HiEllipsisVertical
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Experience.css';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Freelance'
];

export default function ExperienceSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/experience');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [sortBy, setSortBy] = useState('Most Recent');

  const [form, setForm] = useState({
    role: '',
    company: '',
    company_url: '',
    employment_type: 'Internship',
    location: '',
    company_logo: '',
    is_current: false,
    start_year: '',
    end_year: '',
    description: '',
    skills_used: '',
    achievements: ''
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Compute Stats
  const totalPositions = items.length;
  const uniqueOrgs = useMemo(() => {
    const set = new Set();
    items.forEach(i => { if (i.company) set.add(i.company.trim()); });
    return set.size;
  }, [items]);

  const totalExperienceYears = useMemo(() => {
    let months = 0;
    items.forEach(item => {
      const start = item.start_date ? new Date(item.start_date) : new Date(2024, 0, 1);
      const end = item.is_current || !item.end_date ? new Date() : new Date(item.end_date);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      months += Math.max(1, diffMonths);
    });
    return (months / 12).toFixed(1);
  }, [items]);

  const avgTenureYears = useMemo(() => {
    if (items.length === 0) return '0.0';
    return (parseFloat(totalExperienceYears) / items.length).toFixed(1);
  }, [totalExperienceYears, items.length]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'Most Recent') return b.id - a.id;
      if (sortBy === 'Oldest') return a.id - b.id;
      if (sortBy === 'Company') return a.company.localeCompare(b.company);
      return 0;
    });
  }, [items, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      role: '',
      company: '',
      company_url: '',
      employment_type: 'Internship',
      location: '',
      company_logo: '',
      is_current: false,
      start_year: '',
      end_year: '',
      description: '',
      skills_used: '',
      achievements: ''
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      company_url: item.company_url || '',
      employment_type: item.employment_type || 'Full-time',
      company_logo: item.company_logo || '',
      skills_used: item.skills_used || '',
      achievements: item.achievements || '',
      start_year: item.start_date ? String(item.start_date).substring(0, 4) : '',
      end_year: item.end_date ? String(item.end_date).substring(0, 4) : ''
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.company.trim() || !form.role?.trim()) {
      toast('Please enter both Company and Role', 'error');
      return;
    }

    const payload = {
      company: form.company.trim(),
      role: form.role?.trim() || null,
      location: form.location?.trim() || null,
      company_url: form.company_url?.trim() || null,
      company_logo: form.company_logo?.trim() || null,
      employment_type: form.employment_type || 'Full-time',
      is_current: !!form.is_current,
      start_date: form.start_year ? `${form.start_year}-01-01` : null,
      end_date: form.is_current ? null : form.end_year ? `${form.end_year}-12-31` : null,
      description: form.description?.trim() || null,
      skills_used: form.skills_used?.trim() || null,
      achievements: form.achievements?.trim() || null
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast('Experience updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Experience added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Failed to save experience', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Experience deleted', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete experience', 'error');
    }
  };

  const formatYearRange = (item) => {
    const start = item.start_date ? String(item.start_date).substring(0, 4) : '';
    const end = item.is_current || !item.end_date ? 'Present' : String(item.end_date).substring(0, 4);
    if (!start && !item.end_date && !item.is_current) return null;
    return `${start || '2024'} – ${end}`;
  };

  if (loading) {
    return (
      <div className="section-container exp-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container exp-page">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiOutlineBriefcase /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Experience
            </div>
            <h1 className="section-title">Experience</h1>
            <p className="section-desc">Showcase your professional experience and work history.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Experience
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="exp-stats-grid">
        <div className="exp-stat-card">
          <div className="exp-stat-icon blue"><HiOutlineBriefcase /></div>
          <div className="exp-stat-info">
            <span className="exp-stat-title">Total Experience</span>
            <span className="exp-stat-value">{totalExperienceYears} Years</span>
          </div>
        </div>

        <div className="exp-stat-card">
          <div className="exp-stat-icon green"><HiOutlineUserGroup /></div>
          <div className="exp-stat-info">
            <span className="exp-stat-title">Total Positions</span>
            <span className="exp-stat-value">{totalPositions}</span>
          </div>
        </div>

        <div className="exp-stat-card">
          <div className="exp-stat-icon purple"><HiOutlineBuildingOffice /></div>
          <div className="exp-stat-info">
            <span className="exp-stat-title">Organizations</span>
            <span className="exp-stat-value">{uniqueOrgs}</span>
          </div>
        </div>

        <div className="exp-stat-card" style={{ borderRight: 'none' }}>
          <div className="exp-stat-icon orange"><HiOutlineClock /></div>
          <div className="exp-stat-info">
            <span className="exp-stat-title">Average Tenure</span>
            <span className="exp-stat-value">{avgTenureYears} Years</span>
          </div>
        </div>
      </div>

      {/* Work Experience Section Card */}
      <div className="exp-main-card">
        <div className="exp-card-header">
          <h2 className="exp-card-title">Work Experience</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Sort by:</span>
            <select
              className="exp-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Most Recent">Most Recent</option>
              <option value="Oldest">Oldest</option>
              <option value="Company">Company</option>
            </select>
          </div>
        </div>

        {/* Timeline Entries List */}
        {sortedItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-state-icon"><HiOutlineBriefcase /></div>
            <h3 className="empty-state-title">No work experience added yet</h3>
            <p className="empty-state-desc">Click below to add your first work history or internship.</p>
          </div>
        ) : (
          <div className="exp-timeline-list">
            {sortedItems.map((item) => {
              const skills = item.skills_used ? item.skills_used.split(',') : [];
              const achList = item.achievements
                ? item.achievements.split('\n').filter((a) => a.trim().length > 0)
                : [];
              const companyInitials = item.company
                ? item.company.substring(0, 3).toUpperCase()
                : 'EXP';

              const previewSkills = skills.slice(0, 5);
              const remainingSkills = skills.length - 5;
              const previewAch = achList.slice(0, 3);
              const remainingAch = achList.length - 3;

              return (
                <div key={item.id} className="exp-timeline-item">
                  <div className="exp-timeline-node" />

                  <div
                    className="exp-entry-box"
                    onClick={() => setViewModalItem(item)}
                  >
                    {/* Logo Box */}
                    <div className="exp-logo-box">
                      {item.company_logo ? (
                        <img src={item.company_logo} alt={item.company} className="exp-logo-img" />
                      ) : (
                        <div className="exp-logo-fallback">{companyInitials}</div>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="exp-info-col">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div className="exp-role-title">{item.role || 'Position'}</div>
                        <div className="exp-action-group" onClick={(e) => e.stopPropagation()}>
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
                      <div>
                        {item.company_url ? (
                          <a
                            href={item.company_url}
                            target="_blank"
                            rel="noreferrer"
                            className="exp-company-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.company} <HiArrowTopRightOnSquare />
                          </a>
                        ) : (
                          <span className="exp-company-link" style={{ color: '#2563eb', cursor: 'default' }}>
                            {item.company}
                          </span>
                        )}
                      </div>

                      <div className="exp-meta-row">
                        {formatYearRange(item) && (
                          <span className="exp-meta-item">
                            <HiCalendarDays /> {formatYearRange(item)}
                          </span>
                        )}

                        {item.location && (
                          <>
                            <span className="exp-meta-divider">|</span>
                            <span className="exp-meta-item">
                              <HiMapPin /> {item.location}
                            </span>
                          </>
                        )}

                        {item.employment_type && (
                          <>
                            <span className="exp-meta-divider">|</span>
                            <span className="exp-meta-item">
                              <HiOutlineBriefcase /> {item.employment_type}
                            </span>
                          </>
                        )}
                      </div>

                      {item.description && (
                        <p className="exp-desc">{item.description}</p>
                      )}

                      {skills.length > 0 && (
                        <div className="exp-skills-row">
                          {previewSkills.map((skill, i) => (
                            <span key={i} className="exp-skill-pill">{skill.trim()}</span>
                          ))}
                          {remainingSkills > 0 && (
                            <span className="exp-skill-pill more">+{remainingSkills} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Achievements Box */}
                    {achList.length > 0 && (
                      <div className="exp-achievements-box">
                        <div className="exp-achievements-header">
                          <HiOutlineTrophy className="exp-achievements-icon" /> Key Achievements
                        </div>
                        <div className="exp-achievements-list">
                          {previewAch.map((ach, idx) => (
                            <div key={idx} className="exp-achievement-bullet">
                              <HiOutlineCheckCircle className="exp-check-icon" />
                              <span>{ach.trim()}</span>
                            </div>
                          ))}
                          {remainingAch > 0 && (
                            <div style={{ fontSize: 10, color: 'var(--primary-600)', fontWeight: 600, marginTop: 2 }}>
                              +{remainingAch} more achievements
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Experience Details Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.role || 'Experience Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Experience
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="exp-logo-box" style={{ width: 64, height: 64 }}>
                {viewModalItem.company_logo ? (
                  <img src={viewModalItem.company_logo} alt={viewModalItem.company} className="exp-logo-img" />
                ) : (
                  <div className="exp-logo-fallback" style={{ fontSize: 16 }}>
                    {viewModalItem.company ? viewModalItem.company.substring(0, 3).toUpperCase() : 'EXP'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewModalItem.role}
                </h2>
                {viewModalItem.company_url ? (
                  <a href={viewModalItem.company_url} target="_blank" rel="noreferrer" className="exp-company-link" style={{ fontSize: 'var(--font-md)' }}>
                    {viewModalItem.company} <HiArrowTopRightOnSquare />
                  </a>
                ) : (
                  <span style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: '#2563eb' }}>
                    {viewModalItem.company}
                  </span>
                )}
              </div>
            </div>

            <div className="exp-meta-row" style={{ marginBottom: 0 }}>
              {formatYearRange(viewModalItem) && (
                <span className="exp-meta-item">
                  <HiCalendarDays /> {formatYearRange(viewModalItem)}
                </span>
              )}
              {viewModalItem.location && (
                <>
                  <span className="exp-meta-divider">|</span>
                  <span className="exp-meta-item">
                    <HiMapPin /> {viewModalItem.location}
                  </span>
                </>
              )}
              {viewModalItem.employment_type && (
                <>
                  <span className="exp-meta-divider">|</span>
                  <span className="exp-meta-item">
                    <HiOutlineBriefcase /> {viewModalItem.employment_type}
                  </span>
                </>
              )}
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

            {viewModalItem.skills_used && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Skills & Technologies</label>
                <div className="exp-skills-row" style={{ maxHeight: 'none' }}>
                  {viewModalItem.skills_used.split(',').map((skill, i) => (
                    <span key={i} className="exp-skill-pill" style={{ padding: '5px 12px', fontSize: 12 }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewModalItem.achievements && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Key Achievements</label>
                <div className="exp-achievements-box" style={{ width: '100%', maxHeight: 'none' }}>
                  <div className="exp-achievements-list">
                    {viewModalItem.achievements.split('\n').filter(a => a.trim()).map((ach, idx) => (
                      <div key={idx} className="exp-achievement-bullet" style={{ fontSize: 12, webkitLineClamp: 'none' }}>
                        <HiOutlineCheckCircle className="exp-check-icon" style={{ fontSize: 16 }} />
                        <span>{ach.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Experience Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Experience' : 'Add Experience'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Experience' : 'Save Experience'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Role / Position"
              value={form.role || ''}
              onChange={handleChange('role')}
              placeholder="e.g. AI/ML Intern, Full Stack Engineer"
            />
            <Input
              label="Company Name"
              value={form.company || ''}
              onChange={handleChange('company')}
              placeholder="e.g. BCS Tech Services"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Employment Type</label>
              <select
                className="input-field"
                value={form.employment_type || 'Full-time'}
                onChange={handleChange('employment_type')}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Input
              label="Location"
              value={form.location || ''}
              onChange={handleChange('location')}
              placeholder="e.g. Chennai, India or Remote"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Company Website URL"
              value={form.company_url || ''}
              onChange={handleChange('company_url')}
              placeholder="https://company.com"
            />
            <Input
              label="Company Logo URL"
              value={form.company_logo || ''}
              onChange={handleChange('company_logo')}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Start Year"
              type="number"
              value={form.start_year || ''}
              onChange={handleChange('start_year')}
              placeholder="2024"
            />
            <Input
              label="End Year"
              type="number"
              disabled={!!form.is_current}
              value={form.is_current ? '' : form.end_year || ''}
              onChange={handleChange('end_year')}
              placeholder="2024"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.is_current}
              onChange={(e) => setForm((prev) => ({ ...prev, is_current: e.target.checked }))}
            />
            I currently work here
          </label>

          <Input
            label="Description"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Worked on machine learning models, predictive pipelines, and team collaboration..."
          />

          <Input
            label="Skills Used (comma separated)"
            value={form.skills_used || ''}
            onChange={handleChange('skills_used')}
            placeholder="Python, Scikit-learn, Pandas, Machine Learning, Data Analysis"
          />

          <Input
            label="Key Achievements (1 achievement per line)"
            textarea
            value={form.achievements || ''}
            onChange={handleChange('achievements')}
            placeholder={'Built a readmission model with 64% accuracy\nImproved preprocessing efficiency by 30%'}
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
          Are you sure you want to delete experience at <strong>{deleteConfirm?.company}</strong>?
        </p>
      </Modal>
    </div>
  );
}
