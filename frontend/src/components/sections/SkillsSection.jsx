import { useState, useEffect, useMemo } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiChevronDown, HiChevronUp,
  HiOutlineCodeBracket, HiOutlineTv, HiOutlineServer, HiOutlineCircleStack,
  HiOutlineCpuChip, HiOutlineWrench, HiOutlineCloud, HiOutlineUserGroup,
  HiOutlineLightBulb, HiOutlineSparkles, HiOutlineTag, HiOutlineSquares2X2,
  HiOutlineChartBar, HiOutlineRectangleStack, HiOutlineArrowTrendingUp,
  HiOutlineArrowsPointingOut, HiArrowRight
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Skills.css';

const DEFAULT_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Database',
  'AI / Machine Learning',
  'Tools & Technologies',
  'Cloud & DevOps',
  'Soft Skills'
];

const CATEGORY_ICONS = {
  'Programming Languages': <HiOutlineCodeBracket />,
  'Frontend Development': <HiOutlineTv />,
  'Backend Development': <HiOutlineServer />,
  'Database': <HiOutlineCircleStack />,
  'AI / Machine Learning': <HiOutlineCpuChip />,
  'Tools & Technologies': <HiOutlineWrench />,
  'Cloud & DevOps': <HiOutlineCloud />,
  'Soft Skills': <HiOutlineUserGroup />
};



export default function SkillsSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/skills');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form states with custom category support
  const [form, setForm] = useState({ name: '', category: '', customCategory: '', proficiency: 'Advanced' });
  const [isModalCustom, setIsModalCustom] = useState(false);

  // Inline form state
  const [inlineForm, setInlineForm] = useState({ name: '', category: '', customCategory: '', proficiency: 'Advanced' });
  const [isInlineCustom, setIsInlineCustom] = useState(false);

  // Accordion state (all open by default)
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Group items by category
  const groupedSkills = useMemo(() => {
    const map = {};
    items.forEach((skill) => {
      const cat = skill.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(skill);
    });
    return map;
  }, [items]);

  const categories = useMemo(() => {
    const list = Object.keys(groupedSkills);
    return list.length > 0 ? list : DEFAULT_CATEGORIES;
  }, [groupedSkills]);

  // Donut chart calculations
  const breakdown = useMemo(() => {
    if (items.length === 0) {
      return {
        Advanced: { count: 0, pct: 0 },
        Intermediate: { count: 0, pct: 0 },
        Beginner: { count: 0, pct: 0 },
        Expert: { count: 0, pct: 0 }
      };
    }
    const counts = { Advanced: 0, Intermediate: 0, Beginner: 0, Expert: 0 };
    items.forEach((item) => {
      const level = item.proficiency || 'Intermediate';
      counts[level] = (counts[level] || 0) + 1;
    });
    const total = items.length;
    return {
      Advanced: { count: counts.Advanced, pct: Math.round((counts.Advanced / total) * 100) },
      Intermediate: { count: counts.Intermediate, pct: Math.round((counts.Intermediate / total) * 100) },
      Beginner: { count: counts.Beginner, pct: Math.round((counts.Beginner / total) * 100) },
      Expert: { count: counts.Expert, pct: Math.round((counts.Expert / total) * 100) }
    };
  }, [items]);

  // Rank Top 5 Skills by proficiency weight (Expert > Advanced > Intermediate > Beginner)
  const topSkillsList = useMemo(() => {
    if (items.length === 0) return [];
    const weight = { Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1 };
    return [...items]
      .sort((a, b) => (weight[b.proficiency] || 0) - (weight[a.proficiency] || 0))
      .slice(0, 5);
  }, [items]);

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleAllCategories = () => {
    const allExpanded = categories.every((cat) => expandedCategories[cat]);
    const nextState = {};
    categories.forEach((cat) => { nextState[cat] = !allExpanded; });
    setExpandedCategories(nextState);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', category: DEFAULT_CATEGORIES[0], customCategory: '', proficiency: 'Advanced' });
    setIsModalCustom(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const isCustom = item.category && !DEFAULT_CATEGORIES.includes(item.category);
    setForm({ 
      ...item, 
      category: isCustom ? 'Other' : (item.category || ''), 
      customCategory: isCustom ? item.category : '' 
    });
    setIsModalCustom(isCustom);
    setModalOpen(true);
  };

  const handleInlineSubmit = async () => {
    if (!inlineForm.name.trim()) {
      toast('Please enter a skill name', 'error');
      return;
    }
    const finalCategory = isInlineCustom ? inlineForm.customCategory.trim() : inlineForm.category;
    if (isInlineCustom && !inlineForm.customCategory.trim()) {
      toast('Please enter your custom category name', 'error');
      return;
    }

    try {
      await createItem({
        name: inlineForm.name.trim(),
        category: finalCategory || 'Other',
        proficiency: inlineForm.proficiency
      });
      toast(`Skill "${inlineForm.name}" added!`, 'success');
      setInlineForm({ name: '', category: '', customCategory: '', proficiency: 'Advanced' });
      setIsInlineCustom(false);
    } catch (err) {
      toast('Failed to add skill', 'error');
    }
  };

  const handleModalSubmit = async () => {
    if (!form.name.trim()) {
      toast('Please enter a skill name', 'error');
      return;
    }
    const finalCategory = isModalCustom ? form.customCategory.trim() : form.category;
    if (isModalCustom && !form.customCategory.trim()) {
      toast('Please enter your custom category name', 'error');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: finalCategory || 'Other',
      proficiency: form.proficiency
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast('Skill updated!', 'success');
      } else {
        await createItem(payload);
        toast('Skill added!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Skill deleted', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete skill', 'error');
    }
  };

  const getDotsCount = (level) => {
    switch (level) {
      case 'Expert': return 5;
      case 'Advanced': return 4;
      case 'Intermediate': return 3;
      case 'Beginner': return 2;
      default: return 3;
    }
  };

  const renderDots = (level) => {
    const count = getDotsCount(level);
    return (
      <div className="skills-dot-rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`skills-dot ${i <= count ? 'filled' : ''}`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="section-container skills-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container skills-page">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiOutlineSquares2X2 /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Skills
            </div>
            <h1 className="section-title">Skills</h1>
            <p className="section-desc">Showcase your technical and professional skills.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Skill
        </Button>
      </div>

      {/* Top Stats & Breakdown */}
      <div className="skills-top-row">
        <div className="skills-stats-grid">
          <div className="skills-stat-card">
            <div>
              <div className="skills-stat-header">
                <div className="skills-stat-icon blue"><HiOutlineChartBar /></div>
              </div>
              <div className="skills-stat-title">Overall Skills</div>
              <div className="skills-stat-value">{items.length}</div>
            </div>
          </div>

          <div className="skills-stat-card">
            <div>
              <div className="skills-stat-header">
                <div className="skills-stat-icon green"><HiOutlineRectangleStack /></div>
              </div>
              <div className="skills-stat-title">Top Skill Categories</div>
              <div className="skills-stat-value">{Object.keys(groupedSkills).length}</div>
            </div>
          </div>

          <div className="skills-stat-card" style={{ borderRight: 'none' }}>
            <div>
              <div className="skills-stat-header">
                <div className="skills-stat-icon purple"><HiOutlineArrowTrendingUp /></div>
              </div>
              <div className="skills-stat-title">Average Skill Level</div>
              <div className="skills-stat-value text">
                {items.length > 0 ? 'Advanced' : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="skills-breakdown-card">
          <div className="skills-breakdown-title">Skills Breakdown</div>
          <div className="skills-breakdown-content">
            <div className="skills-donut-chart">
              <svg viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.8"
                  strokeDasharray={`${breakdown.Advanced.pct || 55}, 100`}
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3.8"
                  strokeDasharray={`${breakdown.Intermediate.pct || 32}, 100`}
                  strokeDashoffset={`-${breakdown.Advanced.pct || 55}`}
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.8"
                  strokeDasharray={`${breakdown.Beginner.pct || 13}, 100`}
                  strokeDashoffset={`-${(breakdown.Advanced.pct || 55) + (breakdown.Intermediate.pct || 32)}`}
                />
              </svg>
            </div>
            <div className="skills-legend">
              <div className="skills-legend-item">
                <div className="skills-legend-label">
                  <div className="skills-legend-dot advanced" /> Advanced
                </div>
                <div className="skills-legend-val">{breakdown.Advanced.pct}% ({breakdown.Advanced.count})</div>
              </div>
              <div className="skills-legend-item">
                <div className="skills-legend-label">
                  <div className="skills-legend-dot intermediate" /> Intermediate
                </div>
                <div className="skills-legend-val">{breakdown.Intermediate.pct}% ({breakdown.Intermediate.count})</div>
              </div>
              <div className="skills-legend-item">
                <div className="skills-legend-label">
                  <div className="skills-legend-dot beginner" /> Beginner
                </div>
                <div className="skills-legend-val">{breakdown.Beginner.pct}% ({breakdown.Beginner.count})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Accordion Categories, Right Sidebar */}
      <div className="skills-main-grid">
        {/* Left Column: Skills by Category */}
        <div className="skills-category-card">
          <div className="skills-category-header">
            <h2 className="skills-category-title">Skills by Category</h2>
            <button className="skills-expand-btn" onClick={toggleAllCategories}>
              <HiOutlineArrowsPointingOut /> Expand All
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon"><HiOutlineSquares2X2 /></div>
              <h3 className="empty-state-title">No skills added yet</h3>
              <p className="empty-state-desc">Use the "Add a New Skill" form on the right to start building your skills profile.</p>
            </div>
          ) : (
            <div className="skills-accordion-list">
              {Object.keys(groupedSkills).map((catName) => {
                const categorySkills = groupedSkills[catName] || [];
                const isOpen = !!expandedCategories[catName];
                const previewTags = categorySkills.slice(0, 4);
                const remainingCount = categorySkills.length - 4;
                const catIcon = CATEGORY_ICONS[catName] || <HiOutlineTag />;

                return (
                  <div key={catName} className="skills-accordion-row">
                    <div className="skills-row-header" onClick={() => toggleCategory(catName)}>
                      <div className="skills-row-left">
                        <div className="skills-cat-icon">{catIcon}</div>
                        <div className="skills-cat-info">
                          <span className="skills-cat-name">{catName}</span>
                          <span className="skills-cat-count">{categorySkills.length} skills</span>
                        </div>
                        <div className="skills-tags-row">
                          {previewTags.map((skill) => (
                            <span key={skill.id} className="skill-tag-pill">{skill.name}</span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="skill-tag-pill more">+{remainingCount}</span>
                          )}
                        </div>
                      </div>

                      <div className="skills-row-right">
                        <div className="skills-level-badge">
                          <span className="skills-level-text">Advanced</span>
                          {renderDots('Advanced')}
                        </div>
                        {isOpen ? <HiChevronUp style={{ color: 'var(--text-tertiary)' }} /> : <HiChevronDown style={{ color: 'var(--text-tertiary)' }} />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="skills-accordion-body">
                        {categorySkills.map((skill) => (
                          <div key={skill.id} className="skills-detail-chip">
                            <span className="skills-chip-name">{skill.name}</span>
                            <div className="skills-chip-actions">
                              <Button variant="ghost" icon size="sm" onClick={() => openEdit(skill)}>
                                <HiPencil />
                              </Button>
                              <Button variant="ghost" icon size="sm" onClick={() => setDeleteConfirm(skill)}>
                                <HiTrash />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="skills-sidebar-col">
          {/* My Top Skills */}
          <div className="skills-card-side">
            <div className="skills-side-header">
              <span className="skills-side-title">My Top Skills</span>
            </div>
            {topSkillsList.length === 0 ? (
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', padding: '8px 0' }}>
                No skills added yet.
              </div>
            ) : (
              <div className="skills-top-list">
                {topSkillsList.map((skill, idx) => (
                  <div key={skill.id || idx} className="skills-top-item">
                    <div className="skills-top-rank">{idx + 1}</div>
                    <span className="skills-top-name">{skill.name}</span>
                    <div className="skills-top-meta">
                      <span className="skills-top-level">{skill.proficiency || 'Advanced'}</span>
                      {renderDots(skill.proficiency || 'Advanced')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add a New Skill Inline Form */}
          <div className="skills-card-side">
            <div className="skills-side-header">
              <span className="skills-side-title">Add a New Skill</span>
            </div>
            <div className="skills-add-form">
              <Input
                label="Skill Name"
                value={inlineForm.name}
                onChange={(e) => setInlineForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Python, Project Management"
              />

              <div className="input-group">
                <label className="input-label">Select Category</label>
                <select
                  className="input-field"
                  value={inlineForm.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isOther = val === 'Other';
                    setIsInlineCustom(isOther);
                    setInlineForm((prev) => ({ ...prev, category: val }));
                  }}
                >
                  <option value="">Choose a category</option>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other / Custom...</option>
                </select>
              </div>

              {isInlineCustom && (
                <Input
                  label="Type Custom Category"
                  value={inlineForm.customCategory}
                  onChange={(e) => setInlineForm((prev) => ({ ...prev, customCategory: e.target.value }))}
                  placeholder="e.g., Mobile App Development"
                />
              )}

              <div className="input-group">
                <label className="input-label">Proficiency Level</label>
                <div className="skills-pill-selector">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`skills-pill-option ${inlineForm.proficiency === level ? 'active' : ''}`}
                      onClick={() => setInlineForm((prev) => ({ ...prev, proficiency: level }))}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" onClick={handleInlineSubmit} style={{ width: '100%', marginTop: 8 }}>
                <HiPlus /> Add Skill
              </Button>
            </div>
          </div>

          {/* Tip Box */}
          <div className="skills-tip-card">
            <HiOutlineLightBulb className="skills-tip-icon" />
            <div className="skills-tip-text">
              <span className="skills-tip-title">Tip</span>
              <span className="skills-tip-desc">
                Keep your skills updated to get better job matches and recommendations.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Edit / Add */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Skill' : 'Add Skill'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleModalSubmit} loading={saving}>
              {editItem ? 'Update' : 'Add Skill'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Skill Name"
            value={form.name || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. React.js"
          />
          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={form.category || ''}
              onChange={(e) => {
                const val = e.target.value;
                const isOther = val === 'Other';
                setIsModalCustom(isOther);
                setForm((prev) => ({ ...prev, category: val }));
              }}
            >
              <option value="">Select Category</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Other">Other / Custom...</option>
            </select>
          </div>

          {isModalCustom && (
            <Input
              label="Type Custom Category"
              value={form.customCategory || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
              placeholder="e.g., Mobile App Development"
            />
          )}
          <div className="input-group">
            <label className="input-label">Proficiency Level</label>
            <div className="skills-pill-selector">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`skills-pill-option ${form.proficiency === level ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, proficiency: level }))}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
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
          Are you sure you want to delete the skill <strong>{deleteConfirm?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
