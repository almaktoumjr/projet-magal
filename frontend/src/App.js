import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Users, Calendar, MapPin, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import apiService from './services/apiService'; // Importez apiService
import { useApiError } from './ErrorContext'; // Importez useApiError pour gérer les erreurs
import Home from './pages/Home';
import Events from './pages/Events';
import Registration from './pages/Registration';
import Login from './pages/Login';
import PointsInterest from './pages/PointsInterest';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const { handleApiError } = useApiError(); // Utilisez useApiError pour gérer les erreurs

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const adminStatus = localStorage.getItem('isAdmin');
    const userData = localStorage.getItem('userData');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Fonction appelée après une inscription réussie
  // La page Registration gère déjà la redirection vers /login,
  // donc ici on ne fait rien de spécial.
  const handleSuccessfulRegistration = () => {};

  // Fonction appelée après une connexion réussie
  const handleSuccessfulLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Vérifier si l'utilisateur est admin et activer l'accès admin
    if (userData.isAdmin || userData.role === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Essayer d'appeler l'API de déconnexion si elle existe
      // Mais ne pas échouer si la route n'existe pas
      try {
        await apiService.logoutPilgrim();
        console.log('Déconnexion API réussie');
      } catch (apiError) {
        console.log('Route de déconnexion API non disponible, déconnexion locale uniquement');
        // Ne pas afficher d'erreur à l'utilisateur, car la déconnexion locale fonctionne
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Optionnel: utiliser handleApiError seulement pour les erreurs critiques
      // handleApiError(error, 'Erreur lors de la déconnexion.');
    } finally {
      // Nettoyer l'état local (TOUJOURS exécuté)
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      
      console.log('Déconnexion locale terminée');
    }
  };

  // Accès admin via URL spécifique : /admin-access-magal-2024
  // Et aussi le raccourci clavier pour les admins existants
  useEffect(() => {
    let keySequence = [];
    const requiredKeys = ['ControlLeft', 'ShiftLeft', 'KeyA', 'KeyD', 'KeyM'];
    let keyTimeout;

    const handleKeyDown = (e) => {
      clearTimeout(keyTimeout);
      
      keySequence.push(e.code);
      
      // Garder seulement les 5 dernières touches
      if (keySequence.length > 5) {
        keySequence.shift();
      }
      
      // Vérifier si la séquence correspond
      if (keySequence.length === 5) {
        const isCorrectSequence = keySequence.every((key, index) => key === requiredKeys[index]);
        
        if (isCorrectSequence) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
          alert('Accès administrateur activé !');
          keySequence = [];
        }
      }
      
      // Réinitialiser après 2 secondes d'inactivité
      keyTimeout = setTimeout(() => {
        keySequence = [];
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimeout);
    };
  }, []);

  // Composant de protection pour les routes admin
  const AdminRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/" replace />;
  };

  // Composant de protection pour les routes authentifiées
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Composant spécial pour l'accès admin via URL
  const AdminAccess = () => {
    useEffect(() => {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    }, []);
    
    return <Navigate to="/admin" replace />;
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              Magal Touba 2025
            </Link>
            <div className="nav-links">
              {/* Lien Accueil - TOUJOURS visible */}
              <Link to="/" className="nav-link">
                <Users size={20} />
                Accueil
              </Link>
              
              {/* Navigation pour ADMIN uniquement */}
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  <Settings size={20} />
                  Admin
                </Link>
              )}
              
              {/* Navigation pour utilisateurs AUTHENTIFIÉS (non admin) */}
              {isAuthenticated && !isAdmin && (
                <>
                  <Link to="/events" className="nav-link">
                    <Calendar size={20} />
                    Événements
                  </Link>
                  <Link to="/points-interest" className="nav-link">
                    <MapPin size={20} />
                    Points d'intérêt
                  </Link>
                </>
              )}

              {/* Navigation pour utilisateurs NON AUTHENTIFIÉS */}
              {!isAuthenticated && !isAdmin && (
                <>
                  <Link to="/login" className="nav-link">
                    <LogIn size={20} />
                    Connexion
                  </Link>
                  <Link to="/registration" className="nav-link">
                    <UserPlus size={20} />
                    Inscription
                  </Link>
                </>
              )}

              {/* Section utilisateur - Visible pour tous les utilisateurs connectés */}
              {(isAuthenticated || isAdmin) && (
                <div className="user-section">
                  {user && (
                    <span className="user-welcome">
                      Bonjour, {user.prenom || 'Utilisateur'}
                      {isAdmin && <span className="admin-badge"> (Admin)</span>}
                    </span>
                  )}
                  <button onClick={handleLogout} className="nav-link logout-btn">
                    <LogOut size={20} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Route spéciale pour l'accès admin */}
            <Route 
              path="/admin-access-magal-2024" 
              element={<AdminAccess />} 
            />
            
            {/* Routes d'inscription et connexion - accessibles seulement si pas authentifié et pas admin */}
            <Route 
              path="/registration" 
              element={
                (!isAuthenticated && !isAdmin) ? 
                <Registration onSuccessfulRegistration={handleSuccessfulRegistration} /> : 
                <Navigate to="/" replace />
              } 
            />
            
            <Route 
              path="/login" 
              element={
                (!isAuthenticated && !isAdmin) ? 
                <Login onSuccessfulLogin={handleSuccessfulLogin} /> : 
                <Navigate to="/" replace />
              } 
            />
            
            {/* Routes protégées pour les utilisateurs authentifiés (non admin) */}
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/points-interest" 
              element={
                <ProtectedRoute>
                  <PointsInterest />
                </ProtectedRoute>
              } 
            />
            
            {/* Route admin protégée */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            
            {/* Redirection pour toutes les autres routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      <style>{`
        .navbar {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%);
          padding: 1rem 0;
          box-shadow: 0 4px 20px rgba(27, 94, 32, 0.3);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }

        .nav-brand {
          color: white;
          text-decoration: none;
          font-size: 1.8rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 25px;
          transition: all 0.3s ease;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .admin-link {
          background: rgba(255, 215, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.4);
        }

        .admin-link:hover {
          background: #FFD700;
          border-color: #FFD700;
          color: #1B5E20;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-welcome {
          color: white;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .admin-badge {
          background: #FFD700;
          color: #1B5E20;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          font-size: 0.8rem;
          margin-left: 0.5rem;
          font-weight: 600;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .main-content {
          min-height: calc(100vh - 80px);
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
            padding: 0 1rem;
          }

          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .user-section {
            flex-direction: column;
            gap: 0.5rem;
          }

          .user-welcome {
            font-size: 0.9rem;
          }

          .admin-badge {
            display: block;
            margin-left: 0;
            margin-top: 0.2rem;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;