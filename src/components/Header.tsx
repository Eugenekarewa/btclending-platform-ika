import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      const scrolled = window.pageYOffset;
      
      if (header) {
        if (scrolled > 50) {
          header.style.background = 'rgba(0, 0, 0, 0.98)';
          header.style.backdropFilter = 'blur(25px)';
        } else {
          header.style.background = 'rgba(0, 0, 0, 0.95)';
          header.style.backdropFilter = 'blur(20px)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header>
      <nav className="container">
        <a href="#" className="logo">
          <div className="logo-icon">$</div>
          btclend
        </a>
        <ul className="nav-links">
          <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
          <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About</a></li>
          <li><a href="#platform" onClick={(e) => handleSmoothScroll(e, '#platform')}>Platform</a></li>
          <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="btn-login">Dashboard</Link>
              <div className="flex items-center gap-2">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-white text-sm">{user?.name}</span>
                <button 
                  onClick={logout}
                  className="btn-signup bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/signup" className="btn-signup">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;