import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FolderKanban, LayoutDashboard, LogOut, Menu, UserCircle, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, Logo } from './ui.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="icon-btn only-mobile" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <Avatar name={user.name} size={36} />
            <div className="user-chip-text">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="nav-link logout" onClick={handleLogout}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main-col">
        <header className="topbar">
          <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="topbar-title">Welcome back, <b>{user.name.split(' ')[0]}</b> 👋</div>
          <button className="topbar-user" onClick={() => navigate('/profile')} aria-label="Open profile">
            <Avatar name={user.name} size={34} />
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
