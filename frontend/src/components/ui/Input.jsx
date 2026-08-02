import './Input.css';

export default function Input({
  label,
  error,
  type = 'text',
  textarea = false,
  className = '',
  ...props
}) {
  const id = props.id || props.name || label?.toLowerCase().replace(/\s/g, '-');
  const Component = textarea ? 'textarea' : 'input';

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <Component
        id={id}
        type={textarea ? undefined : type}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
