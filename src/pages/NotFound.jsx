import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Logo } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card card center">
        <Logo />
        <div className="empty-icon" style={{ margin: '24px auto 12px' }}><Compass size={28} /></div>
        <h1>404 · Page not found</h1>
        <p className="muted">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  );
}
