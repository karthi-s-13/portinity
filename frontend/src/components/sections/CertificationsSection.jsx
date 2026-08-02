import { useState, useEffect, useMemo } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiOutlineDocumentCheck, HiOutlineCheckBadge, HiOutlineAcademicCap,
  HiOutlineStar, HiArrowTopRightOnSquare, HiEllipsisVertical,
  HiSquares2X2, HiListBullet, HiOutlineLightBulb, HiCheck
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Certifications.css';

const CATEGORIES = [
  'Cloud Computing',
  'Data & Analytics',
  'Development',
  'Security',
  'AI / ML',
  'Other'
];

const STATUSES = ['Verified', 'Expiring Soon', 'Expired'];

export default function CertificationsSection({ onCountChange }) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud('/certifications');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [viewMode, setViewMode] = useState('list');

  const [form, setForm] = useState({
    title: '',
    issuing_org: '',
    category: 'Cloud Computing',
    status: 'Verified',
    issue_date: '',
    expiry_date: '',
    does_not_expire: true,
    credential_id: '',
    credential_url: '',
    media_url: ''
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Compute Stats
  const totalCerts = items.length;
  const verifiedCerts = useMemo(() => {
    return items.filter(i => (i.status || 'Verified') === 'Verified').length;
  }, [items]);

  const trustedSourcesCount = useMemo(() => {
    const trusted = ['aws', 'amazon', 'google', 'microsoft', 'tableau', 'oracle', 'meta', 'cisco', 'ibm', 'linkedin', 'coursera', 'udemy'];
    return items.filter(i => {
      const org = (i.issuing_org || '').toLowerCase();
      return trusted.some(t => org.includes(t));
    }).length;
  }, [items]);

  const latestCertDate = useMemo(() => {
    if (items.length === 0) return '-';
    const dates = items
      .filter(i => i.issue_date)
      .map(i => new Date(i.issue_date))
      .sort((a, b) => b - a);
    if (dates.length === 0) return '-';
    return dates[0].toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [items]);

  // Donut Chart Data & Top Categories
  const categoryBreakdown = useMemo(() => {
    const counts = { 'Cloud Computing': 0, 'Data & Analytics': 0, 'Development': 0, 'Security': 0, 'AI / ML': 0, 'Other': 0 };
    items.forEach(i => {
      const cat = i.category || 'Other';
      if (counts[cat] !== undefined) counts[cat]++;
      else counts['Other']++;
    });

    const total = items.length;
    const colorMap = {
      'Cloud Computing': '#3b82f6',
      'Data & Analytics': '#10b981',
      'Development': '#a855f7',
      'Security': '#f59e0b',
      'AI / ML': '#ec4899',
      'Other': '#64748b'
    };

    const circ = 2 * Math.PI * 38; // ~238.76
    let currentOffset = 0;

    const list = Object.keys(counts).map(cat => {
      const count = counts[cat];
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const strokeLen = (pct / 100) * circ;
      const strokeDasharray = `${strokeLen} ${circ - strokeLen}`;
      const strokeDashoffset = -currentOffset;
      if (count > 0) currentOffset += strokeLen;

      return {
        category: cat,
        count,
        pct,
        color: colorMap[cat] || '#64748b',
        strokeDasharray,
        strokeDashoffset
      };
    });

    return { total, list, counts };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.issuing_org && item.issuing_org.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemStatus = item.status || 'Verified';
      const matchesStatus = statusFilter === 'All Status' || itemStatus === statusFilter;

      const itemCat = item.category || 'Other';
      const matchesCategory = categoryFilter === 'All Categories' || itemCat === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      issuing_org: '',
      category: 'Cloud Computing',
      status: 'Verified',
      issue_date: '',
      expiry_date: '',
      does_not_expire: true,
      credential_id: '',
      credential_url: '',
      media_url: ''
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      issuing_org: item.issuing_org || '',
      category: item.category || 'Cloud Computing',
      status: item.status || 'Verified',
      issue_date: item.issue_date ? String(item.issue_date).substring(0, 10) : '',
      expiry_date: item.expiry_date ? String(item.expiry_date).substring(0, 10) : '',
      does_not_expire: item.does_not_expire !== undefined ? !!item.does_not_expire : true,
      credential_id: item.credential_id || '',
      credential_url: item.credential_url || '',
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
      toast('Please enter certification title', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      issuing_org: form.issuing_org?.trim() || null,
      category: form.category || 'Other',
      status: form.status || 'Verified',
      issue_date: form.issue_date || null,
      expiry_date: form.does_not_expire ? null : form.expiry_date || null,
      does_not_expire: !!form.does_not_expire,
      credential_id: form.credential_id?.trim() || null,
      credential_url: form.credential_url?.trim() || null,
      media_url: form.media_url?.trim() || null
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast('Certification updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Certification added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Failed to save certification', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteConfirm.id);
      toast('Certification deleted', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete certification', 'error');
    }
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="section-container cert-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container cert-page">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon"><HiOutlineDocumentCheck /></div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} Certifications
            </div>
            <h1 className="section-title">Certifications</h1>
            <p className="section-desc">Showcase your professional certifications and achievements.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add Certification
        </Button>
      </div>

      {/* Top Overview Stats Bar */}
      <div className="cert-stats-grid">
        <div className="cert-stat-card">
          <div className="cert-stat-icon blue"><HiOutlineDocumentCheck /></div>
          <div className="cert-stat-info">
            <span className="cert-stat-title">Total Certifications</span>
            <span className="cert-stat-value">{totalCerts}</span>
          </div>
        </div>

        <div className="cert-stat-card">
          <div className="cert-stat-icon green"><HiOutlineCheckBadge /></div>
          <div className="cert-stat-info">
            <span className="cert-stat-title">Verified Certifications</span>
            <span className="cert-stat-value">{verifiedCerts}</span>
          </div>
        </div>

        <div className="cert-stat-card">
          <div className="cert-stat-icon purple"><HiOutlineAcademicCap /></div>
          <div className="cert-stat-info">
            <span className="cert-stat-title">From Trusted Sources</span>
            <span className="cert-stat-value">{trustedSourcesCount}</span>
          </div>
        </div>

        <div className="cert-stat-card" style={{ borderRight: 'none' }}>
          <div className="cert-stat-icon orange"><HiOutlineStar /></div>
          <div className="cert-stat-info">
            <span className="cert-stat-title">Latest Certification</span>
            <span className="cert-stat-value">{latestCertDate}</span>
          </div>
        </div>
      </div>

      {/* Search & Toolbar Row */}
      <div className="cert-toolbar">
        <div className="cert-search-box">
          <HiMagnifyingGlass className="cert-search-icon" />
          <input
            type="text"
            className="cert-search-input"
            placeholder="Search certifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="cert-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="cert-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All Categories">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="cert-view-toggle">
          <button
            className={`cert-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <HiListBullet />
          </button>
          <button
            className={`cert-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <HiSquares2X2 />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="cert-main-grid">
        {/* Left Column: Certifications List/Grid */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '60px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div className="empty-state-icon"><HiOutlineDocumentCheck /></div>
              <h3 className="empty-state-title">No certifications found</h3>
              <p className="empty-state-desc">Click "Add Certification" to add your professional certifications.</p>
            </div>
          ) : (
            <div className={viewMode === 'list' ? 'cert-list' : 'cert-grid'}>
              {filteredItems.map(item => {
                const status = item.status || 'Verified';
                const statusClass = status === 'Verified' ? 'verified' : status === 'Expiring Soon' ? 'expiring' : 'expired';
                const initials = item.issuing_org
                  ? item.issuing_org.substring(0, 3).toUpperCase()
                  : item.title ? item.title.substring(0, 3).toUpperCase() : 'CRT';

                return (
                  <div
                    key={item.id}
                    className="cert-card-row"
                    onClick={() => setViewModalItem(item)}
                  >
                    {/* Logo */}
                    <div className="cert-logo-box">
                      {item.media_url ? (
                        <img src={item.media_url} alt={item.title} className="cert-logo-img" />
                      ) : (
                        <div className="cert-logo-fallback">{initials}</div>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="cert-card-content">
                      <div className="cert-title-row">
                        <span className="cert-card-title">{item.title}</span>
                        <span className={`cert-status-badge ${statusClass}`}>
                          <HiCheck style={{ fontSize: 12 }} /> {status}
                        </span>
                      </div>

                      {item.issuing_org && (
                        <div className="cert-issuer-name">{item.issuing_org}</div>
                      )}

                      <div className="cert-meta-row">
                        {item.issue_date && (
                          <span className="cert-meta-item">
                            <HiCalendarDays /> {formatDateStr(item.issue_date)}
                          </span>
                        )}

                        {item.credential_id && (
                          <span className="cert-meta-item">
                            Credential ID: {item.credential_id}
                          </span>
                        )}

                        <span className="cert-meta-item">
                          • {item.does_not_expire || !item.expiry_date ? 'No Expiration' : `Expires ${formatDateStr(item.expiry_date)}`}
                        </span>
                      </div>

                      {item.category && (
                        <span className="cert-category-tag">{item.category}</span>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="cert-card-actions" onClick={(e) => e.stopPropagation()}>
                      {item.credential_url && (
                        <a
                          href={item.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="cert-credential-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Credential <HiArrowTopRightOnSquare />
                        </a>
                      )}

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
        <div className="cert-right-panel">
          {/* Widget 1: Certifications Overview SVG Donut Chart */}
          <div className="cert-widget-card">
            <h3 className="cert-widget-title">Certifications Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', margin: '16px 0' }}>
              <div style={{ position: 'relative', width: 90, height: 90 }}>
                <svg viewBox="0 0 100 100" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  {categoryBreakdown.total > 0 && categoryBreakdown.list.map((catItem) => {
                    if (catItem.count === 0) return null;
                    return (
                      <circle
                        key={catItem.category}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={catItem.color}
                        strokeWidth="14"
                        strokeDasharray={catItem.strokeDasharray}
                        strokeDashoffset={catItem.strokeDashoffset}
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
                  {categoryBreakdown.total}
                </div>
              </div>
              <div className="cert-widget-list" style={{ flex: 1 }}>
                {categoryBreakdown.list.map((catItem) => (
                  <div key={catItem.category} className="cert-widget-item">
                    <span className="cert-widget-item-left">
                      <span className="cert-dot" style={{ background: catItem.color }} />
                      {catItem.category}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>
                      {catItem.pct}% ({catItem.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: By Status */}
          <div className="cert-widget-card">
            <h3 className="cert-widget-title">By Status</h3>
            <div className="cert-widget-list">
              <div className="cert-widget-item">
                <span className="cert-widget-item-left"><span className="cert-dot green" /> Verified</span>
                <span style={{ fontWeight: 700 }}>{items.filter(i => (i.status || 'Verified') === 'Verified').length}</span>
              </div>
              <div className="cert-widget-item">
                <span className="cert-widget-item-left"><span className="cert-dot yellow" /> Expiring Soon</span>
                <span style={{ fontWeight: 700 }}>{items.filter(i => i.status === 'Expiring Soon').length}</span>
              </div>
              <div className="cert-widget-item">
                <span className="cert-widget-item-left"><span className="cert-dot red" /> Expired</span>
                <span style={{ fontWeight: 700 }}>{items.filter(i => i.status === 'Expired').length}</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Top Categories */}
          <div className="cert-widget-card">
            <h3 className="cert-widget-title">Top Categories</h3>
            <div className="cert-widget-list">
              {CATEGORIES.slice(0, 4).map(cat => (
                <div key={cat} className="cert-widget-item">
                  <span className="cert-widget-item-left">{cat}</span>
                  <span style={{ fontWeight: 700 }}>{items.filter(i => (i.category || 'Other') === cat).length}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 4: Tip Box */}
          <div className="cert-tip-box">
            <HiOutlineLightBulb className="cert-tip-icon" />
            <div className="cert-tip-content">
              <h4>Tip</h4>
              <p>Keep your certifications up to date to stand out and build credibility.</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Certification Details Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || 'Certification Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            {viewModalItem?.credential_url && (
              <a
                href={viewModalItem.credential_url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="secondary">
                  View Credential <HiArrowTopRightOnSquare />
                </Button>
              </a>
            )}
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Certification
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="cert-logo-box" style={{ width: 72, height: 72 }}>
                {viewModalItem.media_url ? (
                  <img src={viewModalItem.media_url} alt={viewModalItem.title} className="cert-logo-img" />
                ) : (
                  <div className="cert-logo-fallback" style={{ fontSize: 18 }}>
                    {viewModalItem.issuing_org ? viewModalItem.issuing_org.substring(0, 3).toUpperCase() : 'CRT'}
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {viewModalItem.title}
                </h2>
                {viewModalItem.issuing_org && (
                  <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: '#2563eb' }}>
                    {viewModalItem.issuing_org}
                  </div>
                )}
              </div>
            </div>

            <div className="cert-meta-row" style={{ marginTop: 0 }}>
              <span className={`cert-status-badge ${viewModalItem.status === 'Verified' ? 'verified' : viewModalItem.status === 'Expiring Soon' ? 'expiring' : 'expired'}`}>
                <HiCheck style={{ fontSize: 12 }} /> {viewModalItem.status || 'Verified'}
              </span>
              {viewModalItem.category && (
                <span className="cert-category-tag" style={{ marginTop: 0 }}>{viewModalItem.category}</span>
              )}
            </div>

            <div className="cert-meta-row">
              {viewModalItem.issue_date && (
                <span className="cert-meta-item">
                  <HiCalendarDays /> Issued: {formatDateStr(viewModalItem.issue_date)}
                </span>
              )}
              {viewModalItem.credential_id && (
                <span className="cert-meta-item">
                  Credential ID: {viewModalItem.credential_id}
                </span>
              )}
              <span className="cert-meta-item">
                • {viewModalItem.does_not_expire || !viewModalItem.expiry_date ? 'No Expiration' : `Expires ${formatDateStr(viewModalItem.expiry_date)}`}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Certification Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Certification' : 'Add Certification'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Certification' : 'Save Certification'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Certification Title"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. AWS Certified Cloud Practitioner"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Issuing Organization"
              value={form.issuing_org || ''}
              onChange={handleChange('issuing_org')}
              placeholder="e.g. Amazon Web Services, Google Cloud"
            />
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category || 'Cloud Computing'}
                onChange={handleChange('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select
                className="input-field"
                value={form.status || 'Verified'}
                onChange={handleChange('status')}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              label="Issue Date"
              type="date"
              value={form.issue_date || ''}
              onChange={handleChange('issue_date')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Expiry Date"
              type="date"
              disabled={!!form.does_not_expire}
              value={form.does_not_expire ? '' : form.expiry_date || ''}
              onChange={handleChange('expiry_date')}
            />
            <Input
              label="Credential ID"
              value={form.credential_id || ''}
              onChange={handleChange('credential_id')}
              placeholder="e.g. AWS-CP-876543"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.does_not_expire}
              onChange={(e) => setForm((prev) => ({ ...prev, does_not_expire: e.target.checked }))}
            />
            This certification does not expire
          </label>

          <Input
            label="Credential Verification URL"
            value={form.credential_url || ''}
            onChange={handleChange('credential_url')}
            placeholder="https://aws.amazon.com/verification/AWS-CP-876543"
          />

          <Input
            label="Badge / Logo Image URL"
            value={form.media_url || ''}
            onChange={handleChange('media_url')}
            placeholder="https://example.com/aws-badge.png"
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
          Are you sure you want to delete certification <strong>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
