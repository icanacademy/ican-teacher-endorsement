import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EndorsementProvider, useEndorsements } from './context/EndorsementContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateEndorsementPage from './pages/CreateEndorsementPage';
import HistoryPage from './pages/HistoryPage';
import SubstituteViewPage from './pages/SubstituteViewPage';
import './App.css';

function ProtectedRoute({ children }) {
  const { currentUser } = useEndorsements();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser } = useEndorsements();

  // Determine where to redirect based on user type
  const getHomeRoute = () => {
    if (!currentUser) return '/login';
    if (currentUser.isSubstitute) return '/substitute-view';
    return '/';
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={currentUser ? <Navigate to={getHomeRoute()} replace /> : <LoginPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {currentUser?.isSubstitute ? <Navigate to="/substitute-view" replace /> : <DashboardPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateEndorsementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/substitute-view"
            element={
              <ProtectedRoute>
                <SubstituteViewPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <EndorsementProvider>
        <AppRoutes />
      </EndorsementProvider>
    </BrowserRouter>
  );
}

export default App;
