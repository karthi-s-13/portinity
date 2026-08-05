import { useState, useRef, useEffect } from 'react';
import { 
  HiSparkles, HiArrowPath, HiClipboardDocument, HiDocumentArrowDown,
  HiBriefcase, HiCheck, HiCommandLine, HiCpuChip, HiCheckCircle,
  HiEye, HiCodeBracket, HiPrinter, HiArrowUpTray, HiInformationCircle,
  HiLightBulb, HiShieldCheck, HiDocumentText, HiCloudArrowUp, HiSquares2X2,
  HiQuestionMarkCircle, HiAdjustmentsHorizontal, HiOutlineSparkles,
  HiTrash
} from 'react-icons/hi2';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import { TemplateSelector, ResumeRenderer, downloadResumePdf } from '../resume_templates';
import './AiResume.css';

const SAMPLE_JD = `We are looking for a Full Stack Engineer with experience in Python, FastAPI, React, PostgreSQL, Docker, CI/CD and cloud technologies. You will build scalable web applications and work with cross-functional teams.`;

const DEFAULT_TAGS = ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Linux', 'REST APIs'];

export default function AiResumeSection() {
  const toast = useToast();
  const resumePdfRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stepper state: 'job-details' | 'template' | 'customize' | 'review'
  const [activeStep, setActiveStep] = useState('job-details');

  // Input states
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [highlightFocus, setHighlightFocus] = useState('Projects & Technical Skills');
  const [includeAchievements, setIncludeAchievements] = useState(true);
  
  // Focus area tags selection (up to 6)
  const [selectedTags, setSelectedTags] = useState([]);

  // Selected Resume Template ID ('blue-line' | 'gray-banner')
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    return localStorage.getItem('portinity_selected_template') || 'blue-line';
  });

  // Action states
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Resume data state
  const [latexCode, setLatexCode] = useState('');
  const [structuredData, setStructuredData] = useState(null);

  const [syncResult, setSyncResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Resume history states
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/ai-resume/history');
      setHistoryList(res.data);
    } catch (err) {
      console.error('Failed to fetch resume history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLoadHistory = (item) => {
    setLatexCode(item.latex_code);
    setStructuredData(item.resume_json);
    setJobDescription(item.job_description);
    setTargetRole(item.target_role || '');
    setExperienceLevel(item.experience_level || '');
    if (item.template_id) {
      setSelectedTemplateId(item.template_id);
      localStorage.setItem('portinity_selected_template', item.template_id);
    }
    
    localStorage.setItem('portinity_last_latex_code', item.latex_code);
    localStorage.setItem('portinity_last_resume_json', JSON.stringify(item.resume_json));
    
    setViewMode('preview');
    setActiveStep('review');
    toast(`Loaded resume for ${item.target_role || 'Target Role'}`, 'success');
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume from your history?')) {
      return;
    }
    try {
      await api.delete(`/ai-resume/history/${id}`);
      setHistoryList(historyList.filter(item => item.id !== id));
      toast('Resume deleted from history', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete resume history entry', 'error');
    }
  };

  // Handle template selection
  const handleTemplateSelect = (id) => {
    setSelectedTemplateId(id);
    localStorage.setItem('portinity_selected_template', id);
    toast(`Switched template format`, 'info');
  };

  // Toggle Focus Area tags (max 6)
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 6) {
        toast('You can select up to 6 focus areas', 'info');
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle text/file upload for JD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (text) {
        setJobDescription(text.slice(0, 2000));
        toast(`Uploaded ${file.name} successfully`, 'success');
      }
    };
    reader.onerror = () => {
      toast('Failed to read file text', 'error');
    };
    reader.readAsText(file);
  };

  // Sync profile embeddings to vector DB
  const handleSyncEmbeddings = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/ai-resume/sync-embeddings');
      setSyncResult(res.data);
      toast(res.data.message || 'Profile indexed successfully into pgvector!', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to sync vector embeddings', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Generate tailored ATS Resume
  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast('Please paste or enter a Job Description first', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/ai-resume/generate', {
        job_description: jobDescription,
        target_role: targetRole,
        template_id: selectedTemplateId,
        experience_level: experienceLevel
      });
      
      const code = res.data.latex_code;
      const data = res.data.resume_json || res.data.static_info;

      setLatexCode(code);
      setStructuredData(data);
      
      localStorage.setItem('portinity_last_latex_code', code);
      if (data) {
        localStorage.setItem('portinity_last_resume_json', JSON.stringify(data));
      }

      setViewMode('preview');
      setActiveStep('review');
      toast('Tailored ATS Resume generated successfully!', 'success');
      fetchHistory(); // Refresh history list
    } catch (err) {
      toast(err.response?.data?.detail || 'Resume generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    toast('LaTeX code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_Resume_${targetRole.replace(/\s+/g, '_')}.tex`;
    link.click();
    URL.revokeObjectURL(url);
    toast('Downloaded .tex file!', 'success');
  };

  const handleDownloadPdf = async () => {
    if (!resumePdfRef.current) {
      toast('No resume preview found to export', 'error');
      return;
    }
    setDownloadingPdf(true);
    try {
      const fileName = `${structuredData?.name ? structuredData.name.replace(/\s+/g, '_') : 'Tailored'}_Resume.pdf`;
      await downloadResumePdf(resumePdfRef.current, fileName);
      toast('Resume downloaded as PDF!', 'success');
    } catch (err) {
      toast('Failed to download PDF: ' + err.message, 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleConfirmTemplate = (id) => {
    setSelectedTemplateId(id);
    localStorage.setItem('portinity_selected_template', id);
    toast(`Activated ${id} template format!`, 'success');
    setActiveStep('review');
  };

  return (
    <div className="section-container ai-resume-v2-page">
      {/* 1. TOP STEPPER NAV & ATS SCORE BADGE BAR */}
      <div className="ai-v2-topbar">
        <div className="ai-v2-stepper">
          <button 
            className={`ai-step-item ${activeStep === 'job-details' ? 'active' : ''} ${jobDescription ? 'completed' : ''}`}
            onClick={() => setActiveStep('job-details')}
          >
            <span className="ai-step-badge green-circle">1</span> Job Details
            {jobDescription && <HiCheck className="ai-step-check" />}
          </button>
          
          <button 
            className={`ai-step-item ${activeStep === 'template' ? 'active' : ''}`}
            onClick={() => setActiveStep('template')}
          >
            <span className="ai-step-badge purple-circle">2</span> Template
          </button>

          <button 
            className={`ai-step-item ${activeStep === 'review' ? 'active' : ''}`}
            onClick={() => setActiveStep('review')}
          >
            <span className="ai-step-badge">3</span> Review & Download
          </button>
        </div>

        {/* ATS Score Badge (Top Right) */}
        <div className="ai-v2-ats-badge-container">
          <div className="ai-v2-ats-pill">
            <HiShieldCheck className="ai-ats-icon" />
            <span className="ai-ats-title">ATS Score</span>
          </div>

          <div className="ai-ats-ring-box">
            <svg width="34" height="34" viewBox="0 0 36 36" className="ai-ats-svg">
              <path
                className="ai-ats-circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="ai-ats-circle-val"
                strokeDasharray="92, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="ai-ats-number">92<small>/100</small></span>
          </div>

          <div className="ai-ats-text-group">
            <div className="ai-ats-status">Excellent</div>
            <div className="ai-ats-subtext">Great match for the job!</div>
          </div>
        </div>
      </div>

      {/* TEMPLATE STEP (Step 2: Template Selection View) */}
      {activeStep === 'template' ? (
        <TemplateSelector 
          selectedTemplateId={selectedTemplateId} 
          onSelectTemplate={handleTemplateSelect} 
          onConfirmTemplate={handleConfirmTemplate}
          resumeData={structuredData}
        />
      ) : (
        /* MAIN DASHBOARD VIEW (Job Details, Customize, Review) */
        <>
          {/* HOW IT WORKS MODAL */}
          {showHowItWorks && (
            <div className="ai-modal-backdrop" onClick={() => setShowHowItWorks(false)}>
              <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>How AI RAG Resume Generation Works</h3>
                <p>1. We parse your target Job Description into high-dimensional vector embeddings using Nemotron-3-Embed-1B.</p>
                <p>2. We query PostgreSQL 17 pgvector database using cosine similarity to select your most relevant projects, experience, skills, and certifications.</p>
                <p>3. Nemotron-3-Ultra synthesizes your background into an ATS-optimized, recruiter-ready LaTeX & PDF resume.</p>
                <button className="ai-modal-close-btn" onClick={() => setShowHowItWorks(false)}>Got It</button>
              </div>
            </div>
          )}

      {/* 2. THREE COLUMN MAIN LAYOUT */}
      <div className="ai-v2-grid">
        
        {/* ================= COLUMN 1: LEFT COLUMN WRAPPER ================= */}
        <div className="ai-v2-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ================= COLUMN 1A: LEFT INPUT & AI PREFERENCES ================= */}
          <div className="ai-v2-card ai-v2-input-card">
            <div className="ai-v2-card-header">
              <div className="ai-v2-title-row">
                <span className="ai-title-icon">🤖</span>
                <h2 className="ai-v2-card-title">Target Job Description</h2>
              </div>
              <button 
                className="ai-v2-link-btn"
                onClick={() => setShowHowItWorks(true)}
              >
                <HiInformationCircle /> How it works
              </button>
            </div>

            <p className="ai-v2-subdesc">Paste the job description to tailor your resume</p>

            {/* JD Textarea with character counter */}
            <div className="ai-v2-textarea-wrapper">
              <textarea
                className="ai-v2-textarea"
                rows={6}
                placeholder="We are looking for a Full Stack Engineer with experience in Python, FastAPI, React, PostgreSQL..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={2000}
              />
              <div className="ai-v2-char-counter">{jobDescription.length}/2000</div>
            </div>

            {/* File Upload Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.pdf,.docx" 
              style={{ display: 'none' }} 
            />
            <button 
              className="ai-v2-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <HiArrowUpTray /> Upload JD File <small style={{ color: '#64748b', fontStyle: 'italic' }}>(PDF, DOCX or TXT)</small>
            </button>

            {/* Job Role Input */}
            <div className="ai-v2-field-group">
              <label className="ai-v2-label">Job Role (Optional)</label>
              <input
                type="text"
                className="ai-v2-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Full Stack Engineer"
              />
            </div>

            {/* Experience Level Dropdown */}
            <div className="ai-v2-field-group">
              <label className="ai-v2-label">
                Experience Level <HiQuestionMarkCircle style={{ color: '#94a3b8' }} />
              </label>
              <select
                className="ai-v2-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="">Select Experience Level</option>
                <option value="Entry Level (0-2 Years)">Entry Level (0-2 Years)</option>
                <option value="Mid Level (2-5 Years)">Mid Level (2-5 Years)</option>
                <option value="Senior Level (5-8 Years)">Senior Level (5-8 Years)</option>
                <option value="Lead / Executive (8+ Years)">Lead / Executive (8+ Years)</option>
              </select>
            </div>

            {/* MAIN GRADIENT GENERATE BUTTON */}
            <button
              className="ai-v2-gradient-btn"
              onClick={handleGenerateResume}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="ai-v2-btn-spinner" /> Generating Resume...
                </>
              ) : (
                <>
                  <HiSparkles className="ai-v2-btn-sparkle" /> Generate AI Resume
                </>
              )}
            </button>
            <div className="ai-v2-btn-subtext">⏱️ This may take 20-40 seconds</div>
          </div>

          {/* ================= COLUMN 1B: RESUME HISTORY CARD ================= */}
          <div className="ai-v2-card ai-v2-history-card">
            <div className="ai-v2-card-header">
              <div className="ai-v2-title-row">
                <span className="ai-title-icon">📜</span>
                <h2 className="ai-v2-card-title">Saved Resumes</h2>
              </div>
              <span className="ai-v2-subcard-badge">{historyList.length} Saved</span>
            </div>
            <p className="ai-v2-subdesc">Click a saved resume to load it</p>

            <div className="ai-v2-history-list">
              {loadingHistory ? (
                <div className="ai-history-loading">
                  <div className="ai-v2-btn-spinner" style={{ borderColor: '#cbd5e1', borderTopColor: '#6366f1', margin: '0 auto' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading history...</span>
                </div>
              ) : historyList.length > 0 ? (
                <div className="ai-history-scroll" style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {historyList.map((item) => (
                    <div 
                      key={item.id} 
                      className="ai-history-item"
                      onClick={() => handleLoadHistory(item)}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="ai-history-item-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <div className="ai-history-item-role" style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.target_role || 'Software Engineer'}
                        </div>
                        <div className="ai-history-item-meta" style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ textTransform: 'capitalize' }}>{item.template_id?.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>{item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
                        </div>
                      </div>
                      <button 
                        className="ai-history-delete-btn"
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        title="Delete resume history entry"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <HiTrash style={{ fontSize: '0.95rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-history-empty" style={{ textAlign: 'center', padding: '16px 8px', color: '#94a3b8', fontSize: '0.75rem', border: '1px dashed #e2e8f0', borderRadius: '10px' }}>
                  No saved resumes yet.
                </div>
              )}
            </div>
          </div>
          
        </div>



        {/* ================= COLUMN 3: RIGHT RESUME PREVIEW & ACTIONS ================= */}
        <div className="ai-v2-card ai-v2-preview-card">
          <div className="ai-v2-preview-topbar">
            <h2 className="ai-v2-preview-title">Resume Preview</h2>

            <div className="ai-v2-preview-actions">
              {/* View mode tab buttons */}
              <div className="ai-v2-preview-tabs">
                <button
                  className={`ai-v2-tab ${viewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setViewMode('preview')}
                >
                  <HiEye /> Preview
                </button>
                <button
                  className={`ai-v2-tab ${viewMode === 'code' ? 'active' : ''}`}
                  onClick={() => setViewMode('code')}
                >
                  <HiCodeBracket /> Source
                </button>
              </div>

              {/* Action buttons based on view mode */}
              {viewMode === 'code' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="ai-v2-download-pdf-btn"
                    onClick={handleCopyCode}
                    style={{ backgroundColor: '#475569' }}
                  >
                    <HiClipboardDocument /> Copy Code
                  </button>
                  <button 
                    className="ai-v2-download-pdf-btn"
                    onClick={handleDownloadTex}
                  >
                    <HiDocumentArrowDown /> Download .tex
                  </button>
                </div>
              ) : (
                <button 
                  className="ai-v2-download-pdf-btn"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf || !structuredData}
                >
                  <HiPrinter /> Download PDF
                </button>
              )}
            </div>
          </div>

          {/* PREVIEW CONTAINER VIEW */}
          <div className="ai-v2-paper-viewport">
            {generating ? (
              <div className="ai-v2-loading-state">
                <div className="loader" />
                <h4>Retrieving Profile Chunks & Generating Resume...</h4>
                <p>pgvector cosine similarity search + Nemotron LLM execution</p>
              </div>
            ) : structuredData ? (
              viewMode === 'code' ? (
                <div className="ai-v2-code-viewport">
                  <pre><code>{latexCode}</code></pre>
                </div>
              ) : (
                <div className="ai-v2-paper-scroll">
                  <ResumeRenderer 
                    templateId={selectedTemplateId} 
                    data={structuredData} 
                    containerRef={resumePdfRef} 
                  />
                </div>
              )
            ) : (
              <div className="ai-v2-empty-state">
                <HiSparkles className="ai-v2-empty-icon" />
                <h4>No Resume Generated Yet</h4>
                <p>Paste a job description on the left and click "Generate AI Resume" to build your tailored PDF resume.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )}
</div>
);
}
