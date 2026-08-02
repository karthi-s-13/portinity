import './Card.css';

export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, subtitle, children }) {
  return (
    <div className="card-header">
      <div className="card-header-left">
        {icon && <div className="card-header-icon">{icon}</div>}
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}
