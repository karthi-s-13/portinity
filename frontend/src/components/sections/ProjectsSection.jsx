import { useState, useEffect, useMemo } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiOutlineFolder, HiOutlineCodeBracket, HiOutlineRocketLaunch,
  HiOutlineStar, HiOutlineUser, HiOutlineTag, HiOutlineSquares2X2,
  HiOutlineListBullet, HiEllipsisVertical, HiArrowTopRightOnSquare,
  HiArrowDown
} from 'react-icons/hi2';
import { FaGithub } from 'react-icons/fa';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Projects.css';

const DEFAULT_CATEGORIES = [
  'Healthcare',
  'FinTech',
  'AI/ML',
  'Web',
  'Mobile',
  'Portfolio'
];

// Fallback banner gradient themes
const BANNER_THEMES = ['blue', 'green', 'purple', 'teal'];

export default function ProjectsSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/projects');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    role: '',
    category: 'Web',
    status: 'Completed',
    is_current: false,
    tech_stack: '',
    live_url: '',
    repo_url: '',
    image_url: '',
    start_year: '',
    end_year: ''
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Compute Stats
  const totalProjects = items.length;
  const completedProjects = items.filter(
    (p) => (p.end_date && p.end_date !== 'Present') || p.status === 'Completed'
  ).length;
  const inProgressProjects = items.filter(
    (p) => !p.end_date || p.end_date === 'Present' || p.status === 'In Progress'
  ).length;

  const totalTechs = useMemo(() => {
    const set = new Set();
    items.forEach((p) => {
      if (p.tech_stack) {
        p.tech_stack.split(',').forEach((t) => set.add(t.trim()));
      }
    });
    return set.size;
  }, [items]);

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    return items
      .filter((p) => {
        // Search filter
        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tech_stack?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const isCompleted = (p.end_date && p.end_date !== 'Present') || p.status === 'Completed';
        const matchesStatus =
          selectedStatus === 'All Status' ||
          (selectedStatus === 'Completed' && isCompleted) ||
          (selectedStatus === 'In Progress' && !isCompleted);

        // Category filter
        const matchesCategory =
          selectedCategory === 'All Categories' || p.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'Newest') return b.id - a.id;
        if (sortBy === 'Oldest') return a.id - b.id;
        if (sortBy === 'Name') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, searchQuery, selectedStatus, selectedCategory, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      description: '',
      role: 'Full Stack Developer',
      category: 'Web',
      status: 'Completed',
      is_current: false,
      tech_stack: '',
      live_url: '',
      repo_url: '',
      image_url: '',
      start_month: '',
      end_month: ''
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const isCompleted = (item.end_date && item.end_date !== 'Present') || item.status === 'Completed';
    setForm({
      ...item,
      role: item.role || 'Developer',
      category: item.category || 'Web',
      status: isCompleted ? 'Completed' : 'In Progress',
      is_current: !item.end_date,
      start_month: item.start_date ? String(item.start_date).substring(0, 7) : '',
      end_month: item.end_date ? String(item.end_date).substring(0, 7) : ''
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast('Please enter a project title', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      tech_stack: form.tech_stack?.trim() || null,
      live_url: form.live_url?.trim() || null,
      repo_url: form.repo_url?.trim() || null,
      image_url: form.image_url?.trim() || null,
      role: form.role?.trim() || null,
      category: form.category || 'Web',
      start_date: form.start_month ? `${form.start_month}-01` : null,
      end_date: form.is_current ? null : form.end_month ? `${form.end_month}-01` : null
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast('Project updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Project added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Failed to save project', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Project deleted', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete project', 'error');
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatYearRange = (item) => {
    const start = item.start_date ? formatDateLabel(item.start_date) : '';
    const end = item.is_current || !item.end_date ? 'Present' : formatDateLabel(item.end_date);
    if (!start && !item.end_date && !item.is_current) return null;
    return `${start || '2024'} – ${end}`;
  };

  if (loading) {
    return (
      <div className="section-container projects-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container projects-page">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiOutlineFolder /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Projects
            </div>
            <h1 className="section-title">Projects</h1>
            <p className="section-desc">Showcase your work and the impact you've made.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Project
        </Button>
      </div>

      {/* Top Stats Bar */}
      <div className="projects-stats-grid">
        <div className="projects-stat-card">
          <div className="projects-stat-icon blue"><HiOutlineFolder /></div>
          <div className="projects-stat-info">
            <span className="projects-stat-title">Total Projects</span>
            <span className="projects-stat-value">{totalProjects}</span>
          </div>
        </div>

        <div className="projects-stat-card">
          <div className="projects-stat-icon green"><HiOutlineCodeBracket /></div>
          <div className="projects-stat-info">
            <span className="projects-stat-title">Completed Projects</span>
            <span className="projects-stat-value">{completedProjects}</span>
          </div>
        </div>

        <div className="projects-stat-card">
          <div className="projects-stat-icon purple"><HiOutlineRocketLaunch /></div>
          <div className="projects-stat-info">
            <span className="projects-stat-title">In Progress</span>
            <span className="projects-stat-value">{inProgressProjects}</span>
          </div>
        </div>

        <div className="projects-stat-card" style={{ borderRight: 'none' }}>
          <div className="projects-stat-icon orange"><HiOutlineStar /></div>
          <div className="projects-stat-info">
            <span className="projects-stat-title">Technologies Used</span>
            <span className="projects-stat-value">{totalTechs}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="projects-toolbar">
        <div className="projects-toolbar-left">
          <div className="projects-search-box">
            <HiMagnifyingGlass className="projects-search-icon" />
            <input
              type="text"
              className="projects-search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="projects-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>

          <select
            className="projects-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="projects-toolbar-right">
          <select
            className="projects-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Newest">Sort: Newest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Name">Sort: Name</option>
          </select>

          <div className="projects-view-toggle">
            <button
              className={`projects-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <HiOutlineSquares2X2 />
            </button>
            <button
              className={`projects-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <HiOutlineListBullet />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiOutlineFolder /></div>
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-desc">Click the button above to add your first project.</p>
        </div>
      ) : (
        <div className="projects-list">
          {filteredProjects.map((item, index) => {
            const isCompleted = (item.end_date && item.end_date !== 'Present') || item.status === 'Completed';
            const theme = BANNER_THEMES[index % BANNER_THEMES.length];
            const techPills = item.tech_stack ? item.tech_stack.split(',') : [];

            return (
              <div
                key={item.id}
                className="project-card"
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => setViewModalItem(item)}
              >
                {/* Banner Thumbnail */}
                <div className="project-banner-col">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="project-banner-img" />
                  ) : (
                    <div className={`project-banner-fallback ${theme}`}>
                      <div className="project-banner-title">{item.title}</div>
                      <div className="project-banner-sub">
                        {item.role || 'Project Showcase'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="project-main-col">
                  <div className="project-title-row">
                    <span className="project-title">{item.title}</span>
                    <span className={`project-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="project-desc">{item.description}</p>
                  )}

                  <div className="project-meta">
                    {formatYearRange(item) && (
                      <span className="project-meta-item">
                        <HiCalendarDays /> {formatYearRange(item)}
                      </span>
                    )}

                    {item.role && (
                      <>
                        <span className="project-meta-divider">|</span>
                        <span className="project-meta-item">
                          <HiOutlineUser /> {item.role}
                        </span>
                      </>
                    )}

                    {item.category && (
                      <>
                        <span className="project-meta-divider">|</span>
                        <span className="project-meta-item">
                          <HiOutlineTag /> {item.category}
                        </span>
                      </>
                    )}
                  </div>

                  {techPills.length > 0 && (
                    <div className="project-tags-row">
                      {techPills.map((tech, i) => (
                        <span key={i} className="project-tech-pill">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="project-actions-col" onClick={(e) => e.stopPropagation()}>
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

                  <button
                    className="project-btn-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewModalItem(item);
                    }}
                  >
                    View Details
                  </button>

                  {item.live_url && (
                    <a
                      href={item.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiArrowTopRightOnSquare /> Live Demo
                    </a>
                  )}

                  {item.repo_url && (
                    <a
                      href={item.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub /> GitHub
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Link */}
      {filteredProjects.length > 0 && (
        <div className="projects-load-more">
          <button className="projects-load-btn">
            Load More Projects <HiArrowDown />
          </button>
        </div>
      )}

      {/* View Project Details Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || 'Project Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Project
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {viewModalItem.image_url && (
              <div style={{ width: '100%', maxHeight: 280, overflow: 'hidden', borderRadius: 8 }}>
                <img src={viewModalItem.image_url} alt={viewModalItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12 }}>
              <span className={`project-badge ${((viewModalItem.end_date && viewModalItem.end_date !== 'Present') || viewModalItem.status === 'Completed') ? 'completed' : 'in-progress'}`}>
                {((viewModalItem.end_date && viewModalItem.end_date !== 'Present') || viewModalItem.status === 'Completed') ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <div className="project-meta" style={{ marginBottom: 0 }}>
              {formatYearRange(viewModalItem) && (
                <span className="project-meta-item">
                  <HiCalendarDays /> {formatYearRange(viewModalItem)}
                </span>
              )}
              {viewModalItem.role && (
                <>
                  <span className="project-meta-divider">|</span>
                  <span className="project-meta-item">
                    <HiOutlineUser /> {viewModalItem.role}
                  </span>
                </>
              )}
              {viewModalItem.category && (
                <>
                  <span className="project-meta-divider">|</span>
                  <span className="project-meta-item">
                    <HiOutlineTag /> {viewModalItem.category}
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

            {viewModalItem.tech_stack && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Tech Stack</label>
                <div className="project-tags-row">
                  {viewModalItem.tech_stack.split(',').map((tech, i) => (
                    <span key={i} className="project-tech-pill" style={{ padding: '6px 12px', fontSize: 12 }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {viewModalItem.live_url && (
                <a
                  href={viewModalItem.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link-action"
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  <HiArrowTopRightOnSquare /> Live Demo
                </a>
              )}

              {viewModalItem.repo_url && (
                <a
                  href={viewModalItem.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link-action"
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  <FaGithub /> GitHub Repository
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Project' : 'Add Project'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Project' : 'Create Project'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Project Title"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. MedIntel - Hospital Readmission Prediction"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Role"
              value={form.role || ''}
              onChange={handleChange('role')}
              placeholder="e.g. Full Stack Developer"
            />
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category || ''}
                onChange={handleChange('category')}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Describe the problem solved, architecture, and impact..."
          />

          <Input
            label="Tech Stack (comma separated)"
            value={form.tech_stack || ''}
            onChange={handleChange('tech_stack')}
            placeholder="React, FastAPI, Python, MySQL, Tailwind CSS"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Live Demo URL"
              value={form.live_url || ''}
              onChange={handleChange('live_url')}
              placeholder="https://myproject.com"
            />
            <Input
              label="GitHub Repository URL"
              value={form.repo_url || ''}
              onChange={handleChange('repo_url')}
              placeholder="https://github.com/user/repository"
            />
          </div>

          <Input
            label="Image / Cover Banner URL"
            value={form.image_url || ''}
            onChange={handleChange('image_url')}
            placeholder="https://example.com/banner.png"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Start Month & Year"
              type="month"
              value={form.start_month || ''}
              onChange={handleChange('start_month')}
            />
            <Input
              label="End Month & Year"
              type="month"
              disabled={!!form.is_current}
              value={form.is_current ? '' : form.end_month || ''}
              onChange={handleChange('end_month')}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.is_current}
              onChange={(e) => setForm((prev) => ({ ...prev, is_current: e.target.checked }))}
            />
            Currently working on this project (In Progress)
          </label>
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
          Are you sure you want to delete project <strong>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
