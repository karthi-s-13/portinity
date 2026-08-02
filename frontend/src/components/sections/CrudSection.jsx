import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCalendarDays, HiMapPin } from 'react-icons/hi2';
import useCrud from '../../hooks/useCrud';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import './Sections.css';

/**
 * Generic CRUD section component.
 * @param {string} endpoint - API path
 * @param {string} title - Section title
 * @param {string} description - Section subtitle
 * @param {React.Element} icon - Section icon
 * @param {Array} fields - Field definitions [{key, label, type?, required?, placeholder?, options?}]
 * @param {Function} renderItem - Custom render for each item card
 * @param {Function} onCountChange - callback with item count
 */
export default function CrudSection({
  endpoint,
  title,
  description,
  icon,
  fields,
  renderItem,
  onCountChange,
}) {
  const toast = useToast();
  const { items, loading, saving, createItem, updateItem, deleteItem } = useCrud(endpoint);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({});

  // Notify parent about count changes
  if (onCountChange) {
    onCountChange(items.length);
  }

  const openCreate = () => {
    setEditItem(null);
    const defaults = {};
    fields.forEach((f) => { defaults[f.key] = f.default ?? ''; });
    setForm(defaults);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const data = {};
    fields.forEach((f) => { data[f.key] = item[f.key] ?? ''; });
    setForm(data);
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleCheckbox = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleSubmit = async () => {
    // Prepare data — convert empty strings to null for optional fields
    const data = {};
    fields.forEach((f) => {
      const val = form[f.key];
      if (f.type === 'number') {
        data[f.key] = val === '' || val === null ? null : Number(val);
      } else if (f.type === 'checkbox') {
        data[f.key] = !!val;
      } else {
        data[f.key] = val === '' ? null : val;
      }
    });

    try {
      if (editItem) {
        await updateItem(editItem.id, data);
        toast(`${title.slice(0, -1) || title} updated!`, 'success');
      } else {
        await createItem(data);
        toast(`${title.slice(0, -1) || title} added!`, 'success');
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
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const defaultRenderItem = (item, index) => {
    const primaryField = fields[0]?.key;
    const secondaryField = fields.length > 1 ? fields[1]?.key : null;
    return (
      <div key={item.id} className="entry-card" style={{ animationDelay: `${index * 60}ms` }}>
        <div className="entry-card-header">
          <div className="entry-card-main">
            <div className="entry-card-title">{item[primaryField] || 'Untitled'}</div>
            {secondaryField && item[secondaryField] && (
              <div className="entry-card-subtitle">{item[secondaryField]}</div>
            )}
            <div className="entry-card-meta">
              {item.start_date && (
                <span className="entry-card-meta-item">
                  <HiCalendarDays />
                  {formatDate(item.start_date)} — {item.end_date ? formatDate(item.end_date) : 'Present'}
                </span>
              )}
              {item.location && (
                <span className="entry-card-meta-item">
                  <HiMapPin /> {item.location}
                </span>
              )}
            </div>
            {item.description && (
              <div className="entry-card-desc">{item.description}</div>
            )}
          </div>
          <div className="entry-card-actions">
            <Button variant="ghost" icon onClick={() => openEdit(item)} title="Edit">
              <HiPencil />
            </Button>
            <Button variant="ghost" icon onClick={() => setDeleteConfirm(item)} title="Delete">
              <HiTrash />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="section-container">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-icon">{icon}</div>
            <div>
              <h1 className="section-title">{title}</h1>
              <p className="section-desc">{description}</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon">{icon}</div>
          <div>
            <h1 className="section-title">{title}</h1>
            <p className="section-desc">{description}</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus /> Add {title.replace(/s$/, '').replace(/ies$/, 'y')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{icon}</div>
          <h3 className="empty-state-title">No {title.toLowerCase()} yet</h3>
          <p className="empty-state-desc">
            Click the button above to add your first entry.
          </p>
          <Button variant="primary" onClick={openCreate}>
            <HiPlus /> Add Your First {title.replace(/s$/, '').replace(/ies$/, 'y')}
          </Button>
        </div>
      ) : (
        <div className="entry-list">
          {items.map((item, index) =>
            renderItem ? renderItem(item, index, openEdit, setDeleteConfirm, formatDate) : defaultRenderItem(item, index)
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editItem ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        {fields.map((field) => {
          if (field.type === 'checkbox') {
            return (
              <label key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!form[field.key]}
                  onChange={handleCheckbox(field.key)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-600)' }}
                />
                {field.label}
              </label>
            );
          }
          if (field.type === 'select') {
            return (
              <div key={field.key} className="input-group">
                <label className="input-label">{field.label}</label>
                <select
                  className="input-field"
                  value={form[field.key] || ''}
                  onChange={handleChange(field.key)}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.row) {
            return null; // handled by row grouping
          }
          return (
            <Input
              key={field.key}
              label={field.label}
              type={field.type || 'text'}
              value={form[field.key] || ''}
              onChange={handleChange(field.key)}
              placeholder={field.placeholder || ''}
              textarea={field.type === 'textarea'}
            />
          );
        })}
      </Modal>

      {/* Delete Confirmation */}
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
        <div className="confirm-delete">
          <p>Are you sure you want to delete this entry?</p>
          <p><strong>{deleteConfirm?.[fields[0]?.key]}</strong></p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
