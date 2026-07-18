import { Menu, Folder, Upload, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const navigationItems = [
  { to: '/', label: 'Browse', icon: Folder },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/create', label: 'New Folder', icon: PlusCircle },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentPath } = useAppContext();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Folder size={24} />
          <div>
            <h1>Storage Explorer</h1>
            <p>{currentPath}</p>
          </div>
        </div>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={20} />
        </button>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={() => setMenuOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
