import { useState, useEffect } from 'react';
import { 
  HiAcademicCap, HiPencil, HiTrash, HiCalendarDays, HiMapPin, 
  HiEllipsisVertical, HiPlus, HiTrophy, HiStar, HiBuildingLibrary,
  HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineClock, HiOutlineUser
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Education.css';

export default function EducationSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/education');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ is_current: false, score_type: 'CGPA', score_max: 10.0, start_year: '', end_year: '', status: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ 
      ...item,
      start_year: item.start_date ? item.start_date.substring(0, 4) : '',
      end_year: item.end_date ? item.end_date.substring(0, 4) : ''
    });
    setOpenDropdownId(null);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleCheckbox = (key) => (e) => {
    setForm((prev) => {
      const next = { ...prev, [key]: e.target.checked };
      if (key === 'is_current') {
        if (e.target.checked && !next.status?.startsWith('Currently Pursuing')) {
          next.status = 'Currently Pursuing (1st Year)';
        } else if (!e.target.checked && next.status?.startsWith('Currently Pursuing')) {
          next.status = 'Completed';
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const data = { ...form };
    
    if (data.start_year) data.start_date = `${data.start_year}-01-01`;
    if (data.end_year) data.end_date = `${data.end_year}-12-31`;
    delete data.start_year;
    delete data.end_year;

    if (data.score_value === '') data.score_value = null;
    if (data.score_value !== null) data.score_value = Number(data.score_value);
    if (data.score_max === '') data.score_max = null;
    if (data.score_max !== null) data.score_max = Number(data.score_max);
    
    // Replace empty strings with null
    Object.keys(data).forEach(key => {
      if (data[key] === '') data[key] = null;
    });

    try {
      if (editItem) {
        await updateItem(editItem.id, data);
        toast('Education updated!', 'success');
      } else {
        await createItem(data);
        toast('Education added!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.response?.data?.detail || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
  };

  const formatScore = (item) => {
    if (!item.score_value) return null;
    if (item.score_type === 'CGPA') {
      const val = Number(item.score_value).toFixed(2);
      const max = item.score_max ? Number(item.score_max).toFixed(2) : '10.00';
      return `CGPA: ${val} / ${max}`;
    } else if (item.score_type === 'Percentage') {
      return `Percentage: ${item.score_value}%`;
    }
    return `${item.score_type}: ${item.score_value}`;
  };

  // Stats calculation
  const totalInstitutions = items.length;
  const totalDegrees = items.filter(i => i.degree).length;
  const totalHonors = items.reduce((acc, curr) => {
    if (curr.honors) return acc + curr.honors.split(',').length;
    return acc;
  }, 0);
  
  const cgpaItems = items.filter(i => i.score_type === 'CGPA' && i.score_value);
  const avgCgpa = cgpaItems.length > 0 
    ? (cgpaItems.reduce((acc, curr) => acc + curr.score_value, 0) / cgpaItems.length).toFixed(2)
    : '-';

  if (loading) {
    return (
      <div className="section-container animate-fade-in">
        <div className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container animate-fade-in">
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiAcademicCap /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Education
            </div>
            <h1 className="section-title">Education</h1>
            <p className="section-desc">Add your academic journey and qualifications.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Education
        </Button>
      </div>

      {items.length > 0 && (
        <div className="education-stats-bar">
          <div className="stat-item">
            <div className="stat-icon blue"><HiAcademicCap /></div>
            <div className="stat-info">
              <span className="stat-label">Total Institutions</span>
              <span className="stat-value">{totalInstitutions}</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon green"><HiBuildingLibrary /></div>
            <div className="stat-info">
              <span className="stat-label">Total Degrees</span>
              <span className="stat-value">{totalDegrees}</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon purple"><HiStar /></div>
            <div className="stat-info">
              <span className="stat-label">Honors</span>
              <span className="stat-value">{totalHonors}</span>
            </div>
          </div>
          <div className="stat-item" style={{ borderRight: 'none' }}>
            <div className="stat-icon orange"><HiTrophy /></div>
            <div className="stat-info">
              <span className="stat-label">CGPA (Overall)</span>
              <span className="stat-value">{avgCgpa} / 10</span>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiAcademicCap /></div>
          <h3 className="empty-state-title">No education history yet</h3>
          <p className="empty-state-desc">Click the button above to add your first institution.</p>
        </div>
      ) : (
        <div className="entry-list">
          {items.map((item, index) => (
            <div key={item.id} className="edu-card" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="edu-logo-col">
                {item.institution_logo ? (
                  <img src={item.institution_logo} alt="logo" className="edu-logo" />
                ) : (
                  <div className="edu-logo-placeholder">
                    {item.institution ? item.institution.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              
              <div className="edu-main-col">
                <div className="edu-title-row">
                  <div className="edu-title">{item.institution}</div>
                  {item.is_current && <span className="edu-badge current">Current</span>}
                </div>
                
                <div className="edu-subtitle">
                  {item.degree 
                    ? (item.field_of_study ? `${item.degree} in ${item.field_of_study}` : item.degree)
                    : (item.stream ? `${item.level || 'Higher Secondary'} (${item.stream})` : item.level || '')}
                </div>
                
                <div className="edu-meta">
                  {(item.start_date || item.end_date) && (
                    <span className="edu-meta-item">
                      <HiCalendarDays />
                      {formatDate(item.start_date)} – {item.end_date ? formatDate(item.end_date) : 'Present'}
                    </span>
                  )}
                  {item.location && (
                    <>
                      <span className="edu-meta-divider">|</span>
                      <span className="edu-meta-item">
                        <HiMapPin />
                        {item.location}
                      </span>
                    </>
                  )}
                </div>
                
                {item.description && (
                  <div className="edu-desc">{item.description}</div>
                )}
                
                {item.score_value && (
                  <div>
                    <span className="edu-score">
                      {formatScore(item)}
                    </span>
                  </div>
                )}
              </div>

              <div className="edu-right-col">
                <div className="edu-actions-row">
                  <div className="edu-actions-dropdown">
                    <button 
                      className="edu-actions-btn" 
                      onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                    >
                      Actions <span>▾</span>
                    </button>
                    {openDropdownId === item.id && (
                      <div className="edu-dropdown-menu">
                        <button className="edu-dropdown-item" onClick={() => openEdit(item)}>
                          <HiPencil /> Edit
                        </button>
                        <button className="edu-dropdown-item danger" onClick={() => {
                          setDeleteConfirm(item);
                          setOpenDropdownId(null);
                        }}>
                          <HiTrash /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="edu-actions-btn" style={{ padding: '6px' }}>
                    <HiEllipsisVertical />
                  </button>
                </div>

                <div className="edu-details-wrapper">
                  <div className="edu-detail-group">
                    <div className="edu-detail-icon"><HiOutlineUser /> Level</div>
                    <div className="edu-detail-value">{item.level || '-'}</div>
                  </div>
                  <div className="edu-detail-group">
                    <div className="edu-detail-icon"><HiOutlineAcademicCap /> {item.stream ? 'Stream' : 'Field of Study'}</div>
                    <div className="edu-detail-value">{item.stream || item.field_of_study || '-'}</div>
                  </div>
                  <div className="edu-detail-group">
                    <div className="edu-detail-icon"><HiOutlineClock /> Status</div>
                    <div className="edu-detail-value">{item.status || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Education" : "Add Education"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Institution Name" value={form.institution || ''} onChange={handleChange('institution')} placeholder="Harvard University" />
          <Input label="Institution Logo URL" value={form.institution_logo || ''} onChange={handleChange('institution_logo')} placeholder="https://..." />
          <Input label="Location" value={form.location || ''} onChange={handleChange('location')} placeholder="Cambridge, MA" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Level</label>
              <select className="input-field" value={form.level || ''} onChange={handleChange('level')}>
                <option value="">Select Level</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Secondary School">Secondary School</option>
                <option value="Doctorate / Ph.D.">Doctorate / Ph.D.</option>
                <option value="Diploma">Diploma</option>
                <option value="Vocational / Certification">Vocational / Certification</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status || ''} onChange={handleChange('status')}>
                <option value="">Select status</option>
                <option value="Completed">Completed</option>
                <option value="Currently Pursuing (1st Year)">Currently Pursuing (1st Year)</option>
                <option value="Currently Pursuing (2nd Year)">Currently Pursuing (2nd Year)</option>
                <option value="Currently Pursuing (3rd Year)">Currently Pursuing (3rd Year)</option>
                <option value="Currently Pursuing (4th Year)">Currently Pursuing (4th Year)</option>
                <option value="Currently Pursuing">Currently Pursuing</option>
                <option value="Dropped Out">Dropped Out</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Degree" value={form.degree || ''} onChange={handleChange('degree')} placeholder="B.S." />
            <Input label="Field of Study / Stream" value={form.field_of_study || form.stream || ''} onChange={(e) => {
              handleChange('field_of_study')(e);
              handleChange('stream')(e); // Set both for simplicity
            }} placeholder="Computer Science" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Start Year" type="number" value={form.start_year || ''} onChange={handleChange('start_year')} placeholder="2020" />
            <Input label="End Year" type="number" value={form.end_year || ''} onChange={handleChange('end_year')} placeholder="2024" />
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.is_current} onChange={handleCheckbox('is_current')} />
            Currently pursuing
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Score Type</label>
              <select className="input-field" value={form.score_type || ''} onChange={handleChange('score_type')}>
                <option value="CGPA">CGPA</option>
                <option value="Percentage">Percentage</option>
              </select>
            </div>
            <Input label="Score Value" type="number" value={form.score_value || ''} onChange={handleChange('score_value')} placeholder="8.6" />
            <Input label="Max Score" type="number" value={form.score_max || ''} onChange={handleChange('score_max')} placeholder="10.0" />
          </div>

          <Input label="Honors (comma separated)" value={form.honors || ''} onChange={handleChange('honors')} placeholder="Dean's List, Cum Laude" />
          <Input label="Description" textarea value={form.description || ''} onChange={handleChange('description')} placeholder="Relevant coursework, activities..." />
        </div>
      </Modal>

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
          Are you sure you want to delete your education at <strong>{deleteConfirm?.institution}</strong>?
        </p>
      </Modal>
    </div>
  );
}
