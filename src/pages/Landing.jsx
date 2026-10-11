import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, KanbanSquare, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/ui.jsx';

const FEATURES = [
  { icon: KanbanSquare, title: 'Kanban task boards', text: 'Drag tasks across To Do, In Progress and Done. Every move is saved instantly.' },
  { icon: Users, title: 'Team collaboration', text: 'Add classmates to projects, assign responsibilities and see who is working on what.' },
  { icon: BarChart3, title: 'Productivity analytics', text: 'Live charts built from your real task data: progress, workload and weekly output.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'Only project members can see a project. Secure sign-in with hashed passwords and JWT.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <div className="landing-nav-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="pill">Built for student teams</span>
          <h1>Plan projects. Ship assignments. <span className="grad-text">Stay in flow.</span></h1>
          <p>CampusFlow brings projects, tasks, deadlines and team progress into one clean workspace, so group work stops being chaotic.</p>
          <div className="hero-actions">
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              {user ? 'Go to dashboard' : 'Create free account'} <ArrowRight size={18} />
            </Link>
            {!user && <Link to="/login" className="btn btn-secondary btn-lg">I already have an account</Link>}
          </div>
          <ul className="hero-points">
            <li><CheckCircle2 size={16} /> Projects &amp; Kanban boards</li>
            <li><CheckCircle2 size={16} /> Deadlines &amp; overdue alerts</li>
            <li><CheckCircle2 size={16} /> Real analytics</li>
          </ul>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="mock card">
            <div className="mock-head"><span /><span /><span /></div>
            <div className="mock-cols">
              {['To Do', 'In Progress', 'Done'].map((c, i) => (
                <div className="mock-col" key={c}>
                  <b>{c}</b>
                  {Array.from({ length: 3 - (i === 1 ? 1 : 0) }).map((_, j) => (
                    <div className="mock-card" key={j}><i style={{ width: `${60 + ((j * 17 + i * 11) % 35)}%` }} /><i className="short" /></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div className="card feature" key={title}>
            <div className="stat-icon tone-indigo"><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <footer className="landing-foot">© {new Date().getFullYear()} CampusFlow · Smart Campus Task &amp; Project Management</footer>
    </div>
  );
}
