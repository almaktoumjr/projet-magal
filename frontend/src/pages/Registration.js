import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, CheckCircle, Lock, LogIn } from 'lucide-react';
import apiService from '../services/apiService'; // Import corrigé
import { useApiError } from '../ErrorContext'; // Import pour la gestion d'erreurs

const Registration = ({ onSuccessfulRegistration }) => {
  const navigate = useNavigate(); // Hook pour la navigation
  const { handleApiError } = useApiError(); // Hook pour gérer les erreurs
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser l'erreur quand l'utilisateur modifie les champs
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    // Validation de la longueur du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Validation du téléphone (format sénégalais)
    const phoneRegex = /^[0-9\s\-\+]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation du formulaire
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API (exclure confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      console.log('Données envoyées:', registrationData);
      
      // Appel direct à l'endpoint /api/pilgrims
      const response = await apiService.registerPilgrim(registrationData);
      
      console.log('Inscription réussie:', response);
      
      setSuccess(true);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        ville: '',
        password: '',
        confirmPassword: ''
      });
      
      // Appeler la fonction de callback si elle existe
      if (onSuccessfulRegistration) {
        onSuccessfulRegistration();
      }
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur d\'inscription complète:', error);
      console.error('Type d\'erreur:', error.name);
      console.error('Message:', error.message);
      console.error('Réponse erreur:', error.response);
      
      // Gestion détaillée des erreurs
      let errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      
      // Vérifier si c'est une erreur de connexion réseau
      if (error.message === 'Failed to fetch' || error.name === 'TypeError' || !error.response) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend Laravel est démarré sur http://localhost:8000';
        console.error('ERREUR DE CONNEXION: Le backend n\'est probablement pas accessible.');
        console.error('Assurez-vous que le serveur Laravel est démarré avec: php artisan serve');
      } else if (error.response) {
        // Erreur avec réponse du serveur
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 422) {
          // Erreur de validation
          if (data.errors) {
            // Laravel renvoie les erreurs de validation dans data.errors
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors.join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          } else {
            errorMessage = 'Les données fournies ne sont pas valides. Vérifiez tous les champs.';
          }
        } else if (status === 500) {
          errorMessage = 'Erreur serveur. Vérifiez les logs du backend Laravel.';
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Optionnel: utiliser handleApiError pour afficher aussi dans le contexte global
      if (handleApiError) {
        handleApiError(error, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rediriger immédiatement vers la connexion
  const goToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="registration-page">
        <div className="container">
          <div className="success-card">
            <CheckCircle size={80} className="success-icon" />
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p>Vous allez être redirigé vers la page de connexion...</p>
            <div className="countdown">
              <button onClick={goToLogin} className="login-now-btn">
                <LogIn size={18} />
                Se connecter maintenant
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .registration-page {
            padding: 4rem 0;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 0 2rem;
          }

          .success-card {
            background: white;
            padding: 4rem 3rem;
            border-radius: 25px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          }

          .success-icon {
            color: #4CAF50;
            margin-bottom: 2rem;
          }

          .success-card h2 {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 1rem;
          }

          .success-card p {
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .countdown {
            margin-top: 2rem;
          }

          .login-now-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .login-now-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="container">
        <div className="registration-card">
          <div className="card-header">
            <h1>Inscription au Magal</h1>
            <p>Rejoignez des milliers de pèlerins pour cette expérience spirituelle unique</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <div className="input-group">
                  <User size={20} />
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <div className="input-group">
                  <User size={20} />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
            </div>

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
              <label htmlFor="telephone">Téléphone *</label>
              <div className="input-group">
                <Phone size={20} />
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="77 123 45 67"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ville">Ville *</label>
              <div className="input-group">
                <MapPin size={20} />
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Votre ville"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Mot de passe * (min. 6 caractères)</label>
                <div className="input-group">
                  <Lock size={20} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                <div className="input-group">
                  <Lock size={20} />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    required
                    minLength="6"
                  />
                </div>
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
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire maintenant'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>Vous avez déjà un compte ?</p>
            <Link to="/login" className="login-link">
              <LogIn size={18} />
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .registration-page {
          padding: 4rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .registration-card {
          background: white;
          padding: 4rem 3rem;
          border-radius: 25px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .card-header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .card-header p {
          color: #666;
          font-size: 1.2rem;
          line-height: 1.6;
        }

        .registration-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
        }

        .btn-submit {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          color: white;
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
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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

        .login-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          padding: 12px 24px;
          border: 2px solid #667eea;
          border-radius: 25px;
          transition: all 0.3s ease;
        }

        .login-link:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .card-header h1 {
            font-size: 2rem;
          }
          
          .registration-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Registration;