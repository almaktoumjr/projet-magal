import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import apiService from '../services/apiService'; // Import corrigé
import { useApiError } from '../ErrorContext'; // Import pour la gestion d'erreurs

const Login = ({ onSuccessfulLogin }) => {
  const navigate = useNavigate();
  const { handleApiError } = useApiError();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('Tentative de connexion avec:', formData);

      const response = await apiService.loginPilgrim(formData);

      // On attend une réponse du type { token, user }
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      const user = response.data?.user || response.data;
      onSuccessfulLogin(user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (handleApiError) {
        handleApiError(error, 'Erreur lors de la connexion');
      } else {
        setError(
          error.response?.data?.message || 
          error.response?.data?.error ||
          error.message ||
          'Email ou mot de passe incorrect'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-card">
          <div className="card-header">
            <LogIn size={60} className="login-icon" />
            <h1>Connexion</h1>
            <p>Connectez-vous pour accéder à votre espace pèlerin</p>
          </div>

          {/* Instructions temporaires pour les tests */}
          <div className="test-credentials">
            <h4>Identifiants de test :</h4>
            <p><strong>Admin :</strong> admin@magal.com / admin123</p>
            <p><strong>Utilisateur :</strong> N'importe quel email existant dans les pèlerins</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <div className="input-group">
                <Mail size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <div className="input-group">
                <Lock size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <strong>Erreur:</strong> {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>Vous n'avez pas encore de compte ?</p>
            <Link to="/registration" className="register-link">
              <UserPlus size={18} />
              S'inscrire maintenant
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          padding: 4rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%);
          display: flex;
          align-items: center;
        }

        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .login-card {
          background: white;
          padding: 4rem 3rem;
          border-radius: 25px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon {
          color: #FFD700;
          margin-bottom: 1.5rem;
        }

        .card-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .card-header p {
          color: #666;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .test-credentials {
          background: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .test-credentials h4 {
          color: #1976d2;
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .test-credentials p {
          margin: 5px 0;
          color: #1565c0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-group svg {
          position: absolute;
          left: 15px;
          color: #999;
          z-index: 1;
        }

        .input-group input {
          width: 100%;
          padding: 15px 15px 15px 50px;
          border: 2px solid #e0e0e0;
          border-radius: 15px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #1B5E20;
          box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.1);
        }

        .input-group input::placeholder {
          color: #999;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #ffcdd2;
          font-weight: 500;
          text-align: center;
        }

        .btn-submit {
          background: linear-gradient(45deg, #FFD700, #FFC107);
          color: #1B5E20;
          border: none;
          padding: 18px 36px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
          background: linear-gradient(45deg, #FFC107, #FFD700);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
          border-top: 1px solid #e0e0e0;
          padding-top: 2rem;
        }

        .form-footer p {
          color: #666;
          margin-bottom: 1rem;
        }

        .register-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #1B5E20;
          text-decoration: none;
          font-weight: 600;
          padding: 12px 24px;
          border: 2px solid #1B5E20;
          border-radius: 25px;
          transition: all 0.3s ease;
        }

        .register-link:hover {
          background: #1B5E20;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .login-card {
            padding: 2rem 1.5rem;
          }
          
          .card-header h1 {
            font-size: 2rem;
          }
          
          .container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;