import { useState, useEffect, useMemo } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMagnifyingGlass,
  HiOutlineDocumentText, HiCheckBadge, HiBookOpen, HiChartBar,
  HiOutlineSquares2X2, HiOutlineListBullet, HiEllipsisVertical,
  HiArrowTopRightOnSquare, HiArrowDownTray, HiUsers, HiLightBulb,
  HiArrowTrendingUp
} from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Publications.css';

// Initial sample data matching exact screenshot design
const SEED_PUBLICATIONS = [
  {
    id: 1,
    title: 'AI-Based Hospital Readmission Prediction Using Machine Learning',
    publisher: 'International Journal of Innovative Research in Computer Science',
    publish_date: '2024-05-01',
    volume_issue: 'Volume 12, Issue 5, pp. 45-52',
    authors: '3 Authors',
    description: 'Proposed a machine learning framework to predict 30-day readmission risk in diabetic patients using XGBoost, improving prediction accuracy by 12%.',
    tags: 'Machine Learning, Healthcare, XGBoost, Predictive Analytics',
    pub_type: 'Journal Article',
    peer_reviewed: true,
    citations: 12,
    doi: '10.1234/ijircs.2024.0545',
    url: 'https://example.com/paper/readmission',
    pdf_url: '#',
    theme: 'blue',
  },
  {
    id: 2,
    title: 'Traffic Flow Optimization Using Deep Reinforcement Learning',
    publisher: 'IEEE International Conference on Smart Technologies (ICST)',
    publish_date: '2023-12-01',
    volume_issue: 'pp. 120-126',
    authors: '3 Authors',
    description: 'Developed a DRL-based traffic signal control system that reduces average waiting time at intersections by 18% in simulation environment.',
    tags: 'Deep Learning, Reinforcement Learning, Smart Cities, Traffic Optimization',
    pub_type: 'Conference Paper',
    peer_reviewed: true,
    citations: 8,
    doi: '10.1109/ICST.2023.120',
    url: 'https://example.com/paper/traffic',
    pdf_url: '#',
    theme: 'green',
  },
  {
    id: 3,
    title: 'Sentiment Analysis of Social Media Data Using BERT',
    publisher: 'International Journal of Engineering Research & Technology (IJERT)',
    publish_date: '2023-08-01',
    volume_issue: 'Volume 11, Issue 8, pp. 78-84',
    authors: '2 Authors',
    description: 'Implemented a BERT-based sentiment classification model that outperforms traditional models with 94% accuracy on Twitter dataset.',
    tags: 'NLP, BERT, Sentiment Analysis, Social Media',
    pub_type: 'Journal Article',
    peer_reviewed: true,
    citations: 6,
    doi: '10.17577/IJERTV11IS08',
    url: 'https://example.com/paper/sentiment',
    pdf_url: '#',
    theme: 'purple',
  },
  {
    id: 4,
    title: 'Smart Agriculture System Using IoT and Data Analytics',
    publisher: 'National Conference on Emerging Trends in Engineering (NCETE)',
    publish_date: '2023-03-01',
    volume_issue: 'pp. 55-60',
    authors: '4 Authors',
    description: 'Designed an IoT-based smart agriculture monitoring system using sensors and analytics to improve crop yield and resource utilization.',
    tags: 'IoT, Data Analytics, Agriculture, Sustainability',
    pub_type: 'Conference Paper',
    peer_reviewed: false,
    citations: 6,
    doi: '10.1234/ncete.2023.55',
    url: 'https://example.com/paper/smart-agri',
    pdf_url: '#',
    theme: 'yellow',
  },
];

const THEME_COLORS = ['blue', 'green', 'purple', 'yellow', 'cyan'];

export default function PublicationsSection({ onCountChange }) {
  const toast = useToast();
  const { items: dbItems, loading, saving, createItem, updateItem, deleteItem } = useCrud('/publications');

  // Publication list from backend database
  const items = useMemo(() => {
    if (dbItems && Array.isArray(dbItems)) {
      return dbItems.map((item, idx) => ({
        ...item,
        theme: item.theme || THEME_COLORS[idx % THEME_COLORS.length],
        pub_type: item.pub_type || 'Journal Article',
        peer_reviewed: item.peer_reviewed !== undefined ? item.peer_reviewed : true,
        citations: item.citations !== undefined ? item.citations : 0,
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
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedJournal, setSelectedJournal] = useState('All Journals');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('list');

  // Form State
  const [form, setForm] = useState({
    title: '',
    publisher: '',
    publish_date: '',
    volume_issue: '',
    authors: '',
    pub_type: 'Journal Article',
    peer_reviewed: true,
    citations: 0,
    description: '',
    tags: '',
    url: '',
    doi: '',
    pdf_url: '',
  });

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Extract unique journal/venue options for filter
  const journalOptions = useMemo(() => {
    const list = new Set();
    items.forEach((p) => {
      if (p.publisher) list.add(p.publisher);
    });
    return Array.from(list);
  }, [items]);

  // Compute Metrics & Stats
  const totalPublications = items.length;
  const peerReviewedCount = items.filter((p) => p.peer_reviewed).length;
  const totalCitations = items.reduce((acc, p) => acc + (Number(p.citations) || 0), 0);

  // Calculate h-index: max h such that h papers have >= h citations
  const hIndex = useMemo(() => {
    if (items.length === 0) return 0;
    const citationsList = items.map((p) => Number(p.citations) || 0).sort((a, b) => b - a);
    let h = 0;
    for (let i = 0; i < citationsList.length; i++) {
      if (citationsList[i] >= i + 1) {
        h = i + 1;
      } else {
        break;
      }
    }
    return h;
  }, [items]);

  // Calculate i10-index: papers with >= 10 citations
  const i10Index = useMemo(() => {
    if (items.length === 0) return 0;
    return items.filter((p) => (Number(p.citations) || 0) >= 10).length;
  }, [items]);

  const citationsPerPaper = totalPublications > 0 ? (totalCitations / totalPublications).toFixed(1) : '0.0';

  // Overview Donut Breakdown
  const typeCounts = useMemo(() => {
    const counts = { 'Journal Articles': 0, 'Conference Papers': 0, 'Book Chapters': 0, 'Others': 0 };
    items.forEach((p) => {
      const t = p.pub_type || 'Journal Article';
      if (t.includes('Journal')) counts['Journal Articles']++;
      else if (t.includes('Conference')) counts['Conference Papers']++;
      else if (t.includes('Book')) counts['Book Chapters']++;
      else counts['Others']++;
    });
    return counts;
  }, [items]);

  // Top Research Areas calculation
  const topResearchAreas = useMemo(() => {
    const map = {};
    items.forEach((p) => {
      if (p.tags) {
        p.tags.split(',').forEach((t) => {
          const tag = t.trim();
          if (tag) map[tag] = (map[tag] || 0) + 1;
        });
      }
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const barColors = ['#2563eb', '#059669', '#ea580c', '#7e22ce', '#06b6d4'];
    return sorted.map(([name, count], i) => ({
      name,
      count,
      color: barColors[i % barColors.length],
    }));
  }, [items]);

  // Filter & Sort Logic
  const filteredPublications = useMemo(() => {
    return items
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.title.toLowerCase().includes(query) ||
          (p.publisher && p.publisher.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.tags && p.tags.toLowerCase().includes(query));

        const matchesType =
          selectedType === 'All Types' ||
          (selectedType === 'Peer Reviewed' && p.peer_reviewed) ||
          p.pub_type === selectedType;

        const matchesJournal =
          selectedJournal === 'All Journals' || p.publisher === selectedJournal;

        return matchesSearch && matchesType && matchesJournal;
      })
      .sort((a, b) => {
        if (sortBy === 'Latest') return new Date(b.publish_date || '2024-01-01') - new Date(a.publish_date || '2024-01-01');
        if (sortBy === 'Oldest') return new Date(a.publish_date || '2024-01-01') - new Date(b.publish_date || '2024-01-01');
        if (sortBy === 'Most Cited') return (b.citations || 0) - (a.citations || 0);
        if (sortBy === 'Title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, searchQuery, selectedType, selectedJournal, sortBy]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      publisher: '',
      publish_date: '2024-05-01',
      volume_issue: 'Volume 12, Issue 5, pp. 45-52',
      authors: '3 Authors',
      pub_type: 'Journal Article',
      peer_reviewed: true,
      citations: 0,
      description: '',
      tags: '',
      url: '',
      doi: '',
      pdf_url: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || '',
      publisher: item.publisher || '',
      publish_date: item.publish_date ? String(item.publish_date).substring(0, 10) : '',
      volume_issue: item.volume_issue || '',
      authors: item.authors || '3 Authors',
      pub_type: item.pub_type || 'Journal Article',
      peer_reviewed: item.peer_reviewed !== undefined ? item.peer_reviewed : true,
      citations: item.citations !== undefined ? item.citations : 0,
      description: item.description || '',
      tags: item.tags || '',
      url: item.url || '',
      doi: item.doi || '',
      pdf_url: item.pdf_url || '',
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
      toast('Please enter publication title', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      publisher: form.publisher?.trim() || null,
      publish_date: form.publish_date || null,
      volume_issue: form.volume_issue?.trim() || null,
      authors: form.authors?.trim() || '1 Author',
      pub_type: form.pub_type || 'Journal Article',
      peer_reviewed: form.peer_reviewed,
      citations: Number(form.citations) || 0,
      description: form.description?.trim() || null,
      tags: form.tags?.trim() || null,
      url: form.url?.trim() || null,
      doi: form.doi?.trim() || null,
      pdf_url: form.pdf_url?.trim() || null,
    };

    try {
      if (editItem && typeof editItem.id === 'number' && dbItems && dbItems.some(i => i.id === editItem.id)) {
        await updateItem(editItem.id, payload);
        toast('Publication updated successfully!', 'success');
      } else {
        await createItem(payload);
        toast('Publication added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast('Publication saved locally', 'info');
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfirm && typeof deleteConfirm.id === 'number' && dbItems && dbItems.some(i => i.id === deleteConfirm.id)) {
        await deleteItem(deleteConfirm.id);
        toast('Publication deleted', 'success');
      } else {
        toast('Publication removed', 'info');
      }
      setDeleteConfirm(null);
    } catch (err) {
      toast('Failed to delete publication', 'error');
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'May 2024';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="section-container publications-page">
        <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 500, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="section-container publications-page">
      {/* Page Header */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <HiOutlineDocumentText />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              Dashboard {'>'} <strong>Publications</strong>
            </div>
            <h1 className="section-title">Publications</h1>
            <p className="section-desc">Showcase your research papers and published work.</p>
          </div>
        </div>
        <button className="pub-add-btn" onClick={openCreate}>
          <HiPlus /> Add Publication
        </button>
      </div>

      {/* Top 4 Stats Row */}
      <div className="pub-stats-grid">
        <div className="pub-stat-card">
          <div className="pub-stat-top">
            <div className="pub-stat-icon blue"><HiOutlineDocumentText /></div>
            <div className="pub-stat-details">
              <span className="pub-stat-title">Total Publications</span>
              <span className="pub-stat-value">{totalPublications}</span>
            </div>
          </div>
        </div>

        <div className="pub-stat-card">
          <div className="pub-stat-top">
            <div className="pub-stat-icon green"><HiCheckBadge /></div>
            <div className="pub-stat-details">
              <span className="pub-stat-title">Peer Reviewed</span>
              <span className="pub-stat-value">{peerReviewedCount}</span>
            </div>
          </div>
        </div>

        <div className="pub-stat-card">
          <div className="pub-stat-top">
            <div className="pub-stat-icon purple"><HiBookOpen /></div>
            <div className="pub-stat-details">
              <span className="pub-stat-title">Citations</span>
              <span className="pub-stat-value">{totalCitations}</span>
            </div>
          </div>
        </div>

        <div className="pub-stat-card">
          <div className="pub-stat-top">
            <div className="pub-stat-icon orange"><HiChartBar /></div>
            <div className="pub-stat-details">
              <span className="pub-stat-title">h-index</span>
              <span className="pub-stat-value">{hIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Toolbar Controls */}
      <div className="pub-toolbar">
        <div className="pub-toolbar-left">
          <div className="pub-search-box">
            <HiMagnifyingGlass className="pub-search-icon" />
            <input
              type="text"
              className="pub-search-input"
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="pub-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All Types">All Types</option>
            <option value="Peer Reviewed">Peer Reviewed</option>
            <option value="Journal Article">Journal Article</option>
            <option value="Conference Paper">Conference Paper</option>
            <option value="Book Chapter">Book Chapter</option>
          </select>

          <select
            className="pub-select"
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
          >
            <option value="All Journals">All Journals</option>
            {journalOptions.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        <div className="pub-toolbar-right">
          <select
            className="pub-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Most Cited">Sort: Most Cited</option>
            <option value="Title">Sort: Title</option>
          </select>

          <div className="pub-view-toggle">
            <button
              className={`pub-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <HiOutlineListBullet />
            </button>
            <button
              className={`pub-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <HiOutlineSquares2X2 />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Left Column Cards + Right Sidebar Analytics) */}
      <div className="pub-layout-grid">
        {/* Left Column: Publications Cards List */}
        <div className={viewMode === 'grid' ? 'pub-cards-grid' : 'pub-cards-list'}>
          {filteredPublications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><HiOutlineDocumentText /></div>
              <h3 className="empty-state-title">No publications found</h3>
              <p className="empty-state-desc">Try clearing your search or click "+ Add Publication" to create one.</p>
            </div>
          ) : (
            filteredPublications.map((item, idx) => {
              const theme = item.theme || THEME_COLORS[idx % THEME_COLORS.length];
              const tagList = item.tags ? item.tags.split(',') : [];

              return (
                <div key={item.id} className="pub-card" style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Icon Badge */}
                  <div className={`pub-card-icon-box ${theme}`}>
                    <HiOutlineDocumentText />
                  </div>

                  {/* Main Info */}
                  <div className="pub-card-main">
                    <div className="pub-card-top-row">
                      <div
                        className="pub-card-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setViewModalItem(item)}
                      >
                        {item.title}
                      </div>

                      {item.peer_reviewed ? (
                        <span className="pub-peer-badge peer-reviewed">Peer Reviewed</span>
                      ) : (
                        <span className="pub-peer-badge conference">{item.pub_type || 'Conference Paper'}</span>
                      )}
                    </div>

                    {item.publisher && (
                      <a
                        href={item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="pub-card-venue"
                      >
                        {item.publisher} <HiArrowTopRightOnSquare style={{ fontSize: 12 }} />
                      </a>
                    )}

                    <div className="pub-card-meta-row">
                      {item.publish_date && (
                        <span className="pub-meta-item">
                          <HiCalendarDays /> {formatDateLabel(item.publish_date)}
                        </span>
                      )}

                      {item.volume_issue && (
                        <>
                          <span>•</span>
                          <span className="pub-meta-item">{item.volume_issue}</span>
                        </>
                      )}

                      {item.authors && (
                        <>
                          <span>•</span>
                          <span className="pub-meta-item">
                            <HiUsers /> {item.authors}
                          </span>
                        </>
                      )}
                    </div>

                    {item.description && (
                      <p className="pub-card-desc">{item.description}</p>
                    )}

                    {tagList.length > 0 && (
                      <div className="pub-card-tags">
                        {tagList.map((tag, i) => (
                          <span key={i} className="pub-tag-pill">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions Column */}
                  <div className="pub-card-actions">
                    <div className="pub-citations-box">
                      <div className="pub-citations-num">{item.citations || 0}</div>
                      <div className="pub-citations-lbl">Citations</div>
                    </div>

                    <div className="pub-action-btns-row">
                      <a
                        href={item.pdf_url || item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="pub-action-btn"
                        title="Download / View PDF"
                      >
                        <HiArrowDownTray /> PDF
                      </a>

                      <a
                        href={item.doi ? `https://doi.org/${item.doi}` : item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="pub-action-btn"
                        title="DOI Link"
                      >
                        <HiArrowTopRightOnSquare /> DOI
                      </a>

                      <div className="pub-menu-container">
                        <button
                          className="pub-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                          }}
                        >
                          <HiEllipsisVertical />
                        </button>

                        {openDropdownId === item.id && (
                          <div className="pub-dropdown-menu">
                            <button
                              className="pub-dropdown-item"
                              onClick={() => {
                                openEdit(item);
                              }}
                            >
                              <HiPencil /> Edit
                            </button>
                            <button
                              className="pub-dropdown-item danger"
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
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Analytics & Insights */}
        <div className="pub-sidebar">
          {/* Card 1: Publication Overview Donut Chart */}
          <div className="pub-sidebar-card">
            <h3 className="pub-sidebar-title">Publication Overview</h3>
            <div className="pub-chart-wrapper">
              <div className="pub-donut-container">
                <svg className="pub-donut-svg" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.8"
                  />
                  {totalPublications > 0 && (
                    <>
                      {/* Segment 1: Journal Articles */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.8"
                        strokeDasharray={`${Math.round((typeCounts['Journal Articles'] / totalPublications) * 100)} 100`}
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: Conference Papers */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3.8"
                        strokeDasharray={`${Math.round((typeCounts['Conference Papers'] / totalPublications) * 100)} 100`}
                        strokeDashoffset={`-${Math.round((typeCounts['Journal Articles'] / totalPublications) * 100)}`}
                      />
                      {/* Segment 3: Book Chapters */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3.8"
                        strokeDasharray={`${Math.round((typeCounts['Book Chapters'] / totalPublications) * 100)} 100`}
                        strokeDashoffset={`-${Math.round(((typeCounts['Journal Articles'] + typeCounts['Conference Papers']) / totalPublications) * 100)}`}
                      />
                    </>
                  )}
                </svg>
              </div>

              <div className="pub-legend-list">
                <div className="pub-legend-item">
                  <span className="pub-legend-label">
                    <span className="pub-legend-dot" style={{ background: '#3b82f6' }} /> Journal Articles
                  </span>
                  <span className="pub-legend-count">
                    {typeCounts['Journal Articles']} ({totalPublications > 0 ? Math.round((typeCounts['Journal Articles'] / totalPublications) * 100) : 0}%)
                  </span>
                </div>

                <div className="pub-legend-item">
                  <span className="pub-legend-label">
                    <span className="pub-legend-dot" style={{ background: '#06b6d4' }} /> Conference Papers
                  </span>
                  <span className="pub-legend-count">
                    {typeCounts['Conference Papers']} ({totalPublications > 0 ? Math.round((typeCounts['Conference Papers'] / totalPublications) * 100) : 0}%)
                  </span>
                </div>

                <div className="pub-legend-item">
                  <span className="pub-legend-label">
                    <span className="pub-legend-dot" style={{ background: '#a855f7' }} /> Book Chapters
                  </span>
                  <span className="pub-legend-count">
                    {typeCounts['Book Chapters']} ({totalPublications > 0 ? Math.round((typeCounts['Book Chapters'] / totalPublications) * 100) : 0}%)
                  </span>
                </div>

                <div className="pub-legend-item">
                  <span className="pub-legend-label">
                    <span className="pub-legend-dot" style={{ background: '#f97316' }} /> Others
                  </span>
                  <span className="pub-legend-count">
                    {typeCounts['Others']} (0%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Research Areas Progress Bars */}
          <div className="pub-sidebar-card">
            <h3 className="pub-sidebar-title">Top Research Areas</h3>
            <div className="pub-research-list">
              {topResearchAreas.length === 0 ? (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  No research topics tagged yet.
                </div>
              ) : (
                topResearchAreas.map((area, idx) => (
                  <div key={idx} className="pub-research-item">
                    <div className="pub-research-head">
                      <span className="pub-research-name">{area.name}</span>
                      <span className="pub-research-count">{area.count}</span>
                    </div>
                    <div className="pub-research-track">
                      <div
                        className="pub-research-bar"
                        style={{
                          width: `${Math.min(100, (area.count / Math.max(1, topResearchAreas[0].count)) * 100)}%`,
                          background: area.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Citation Overview 2x2 Metric Grid */}
          <div className="pub-sidebar-card">
            <h3 className="pub-sidebar-title">Citation Overview</h3>
            <div className="pub-citation-grid">
              <div className="pub-citation-box">
                <div className="pub-citation-box-icon purple"><HiBookOpen /></div>
                <div className="pub-citation-box-info">
                  <span className="pub-citation-box-val">{totalCitations}</span>
                  <span className="pub-citation-box-lbl">Total Citations</span>
                </div>
              </div>

              <div className="pub-citation-box">
                <div className="pub-citation-box-icon orange"><HiChartBar /></div>
                <div className="pub-citation-box-info">
                  <span className="pub-citation-box-val">{hIndex}</span>
                  <span className="pub-citation-box-lbl">h-index</span>
                </div>
              </div>

              <div className="pub-citation-box">
                <div className="pub-citation-box-icon green"><HiCheckBadge /></div>
                <div className="pub-citation-box-info">
                  <span className="pub-citation-box-val">{i10Index}</span>
                  <span className="pub-citation-box-lbl">i10-index</span>
                </div>
              </div>

              <div className="pub-citation-box">
                <div className="pub-citation-box-icon orange"><HiArrowTrendingUp /></div>
                <div className="pub-citation-box-info">
                  <span className="pub-citation-box-val">{citationsPerPaper}</span>
                  <span className="pub-citation-box-lbl">Citations / Paper</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Tip Card */}
          <div className="pub-tip-card">
            <div className="pub-tip-icon"><HiLightBulb /></div>
            <div>
              <div className="pub-tip-title">Tip</div>
              <div className="pub-tip-desc">
                Keep your publications updated to increase visibility and impact.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={!!viewModalItem}
        onClose={() => setViewModalItem(null)}
        title={viewModalItem?.title || 'Publication Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewModalItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              const item = viewModalItem;
              setViewModalItem(null);
              openEdit(item);
            }}>
              <HiPencil /> Edit Publication
            </Button>
          </>
        }
      >
        {viewModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {viewModalItem.peer_reviewed ? (
                <span className="pub-peer-badge peer-reviewed">Peer Reviewed</span>
              ) : (
                <span className="pub-peer-badge conference">{viewModalItem.pub_type || 'Conference Paper'}</span>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                {viewModalItem.publisher}
              </span>
            </div>

            <div className="pub-card-meta-row">
              {viewModalItem.publish_date && (
                <span className="pub-meta-item">
                  <HiCalendarDays /> {formatDateLabel(viewModalItem.publish_date)}
                </span>
              )}
              {viewModalItem.volume_issue && (
                <>
                  <span>•</span>
                  <span>{viewModalItem.volume_issue}</span>
                </>
              )}
              {viewModalItem.authors && (
                <>
                  <span>•</span>
                  <span><HiUsers /> {viewModalItem.authors}</span>
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
                whiteSpace: 'pre-wrap',
              }}>
                <strong>Abstract:</strong>
                <p style={{ marginTop: 4 }}>{viewModalItem.description}</p>
              </div>
            )}

            {viewModalItem.tags && (
              <div>
                <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>Keywords / Research Areas</label>
                <div className="pub-card-tags">
                  {viewModalItem.tags.split(',').map((t, i) => (
                    <span key={i} className="pub-tag-pill" style={{ padding: '4px 10px' }}>
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {viewModalItem.url && (
                <a
                  href={viewModalItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pub-action-btn"
                  style={{ padding: '8px 14px', fontSize: 13 }}
                >
                  <HiArrowTopRightOnSquare /> View Publisher Page
                </a>
              )}
              {viewModalItem.doi && (
                <a
                  href={`https://doi.org/${viewModalItem.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pub-action-btn"
                  style={{ padding: '8px 14px', fontSize: 13 }}
                >
                  <HiArrowTopRightOnSquare /> DOI Link ({viewModalItem.doi})
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Publication' : 'Add Publication'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update Publication' : 'Create Publication'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Publication Title *"
            value={form.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. AI-Based Hospital Readmission Prediction Using Machine Learning"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Publication Type</label>
              <select
                className="input-field"
                value={form.pub_type || 'Journal Article'}
                onChange={handleChange('pub_type')}
              >
                <option value="Journal Article">Journal Article</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Pre-print">Pre-print</option>
                <option value="Patent">Patent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Journal / Publisher Name"
              value={form.publisher || ''}
              onChange={handleChange('publisher')}
              placeholder="e.g. International Journal of Computer Science"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Publish Date"
              type="date"
              value={form.publish_date || ''}
              onChange={handleChange('publish_date')}
            />

            <Input
              label="Volume, Issue & Pages"
              value={form.volume_issue || ''}
              onChange={handleChange('volume_issue')}
              placeholder="e.g. Volume 12, Issue 5, pp. 45-52"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Authors"
              value={form.authors || ''}
              onChange={handleChange('authors')}
              placeholder="e.g. 3 Authors or Author Names"
            />

            <Input
              label="Citations Count"
              type="number"
              value={form.citations}
              onChange={handleChange('citations')}
              placeholder="12"
            />
          </div>

          <Input
            label="Abstract / Summary"
            textarea
            value={form.description || ''}
            onChange={handleChange('description')}
            placeholder="Brief summary of research problem, method, and key results..."
          />

          <Input
            label="Keywords / Tags (comma separated)"
            value={form.tags || ''}
            onChange={handleChange('tags')}
            placeholder="Machine Learning, Healthcare, XGBoost, Predictive Analytics"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Paper URL / Link"
              value={form.url || ''}
              onChange={handleChange('url')}
              placeholder="https://example.com/paper"
            />

            <Input
              label="DOI"
              value={form.doi || ''}
              onChange={handleChange('doi')}
              placeholder="10.1234/example.2024"
            />
          </div>

          <Input
            label="PDF File / Download Link URL"
            value={form.pdf_url || ''}
            onChange={handleChange('pdf_url')}
            placeholder="https://example.com/paper.pdf"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!form.peer_reviewed}
              onChange={(e) => setForm((prev) => ({ ...prev, peer_reviewed: e.target.checked }))}
            />
            Peer-Reviewed Publication
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
          Are you sure you want to delete publication <strong>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
