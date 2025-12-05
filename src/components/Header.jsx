import { useEndorsements } from '../context/EndorsementContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { currentUser, logout } = useEndorsements();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  // Substitute teacher header
  if (currentUser.isSubstitute) {
    return (
      <header className="header substitute-header">
        <div className="header-left">
          <h1>Lesson Plans</h1>
          <span className="viewing-teacher">for {currentUser.viewingTeacherName}</span>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Back to Home
          </button>
        </div>
      </header>
    );
  }

  // Regular teacher header
  return (
    <header className="header">
      <div className="header-left">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          ICAN Class Endorsement
        </h1>
      </div>
      <nav className="header-nav">
        <button
          className={`nav-btn ${location.pathname === '/create' ? 'active' : ''}`}
          onClick={() => navigate('/create')}
        >
          Create Endorsement
        </button>
        <button
          className={`nav-btn ${location.pathname === '/history' ? 'active' : ''}`}
          onClick={() => navigate('/history')}
        >
          My History
        </button>
      </nav>
      <div className="header-right">
        <span className="user-info">
          {currentUser.nickname || currentUser.name}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
