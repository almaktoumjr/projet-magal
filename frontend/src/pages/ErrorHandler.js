import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import './ErrorDisplay.css'; // Importez le fichier CSS

// Contexte pour les erreurs globales
const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Provider pour les erreurs
export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = (message, type = 'error') => {
    // Validation du type
    const validTypes = ['error', 'warning', 'success', 'info'];
    if (!validTypes.includes(type)) {
      console.warn(`Invalid error type: ${type}. Defaulting to 'error'.`);
      type = 'error';
    }

    const error = {
      id: Date.now() + Math.random(), // À remplacer par uuid si possible
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setErrors(prev => [...prev, error]);

    // Auto-remove après 5 secondes
    const timeoutId = setTimeout(() => {
      removeError(error.id);
    }, 5000);

    // Retourner l'ID du timeout pour un nettoyage éventuel
    return timeoutId;
  };

  const removeError = (id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  // Nettoyage des timeouts lors du démontage
  useEffect(() => {
    return () => {
      // Supprimer tous les timeouts si le composant est démonté
      setErrors([]);
    };
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearAllErrors }}>
      {children}
      <ErrorDisplay />
    </ErrorContext.Provider>
  );
};

// Composant d'affichage des erreurs
const ErrorDisplay = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="error-container">
      {errors.map(error => (
        <div 
          key={error.id} 
          className={`error-alert ${error.type}`}
          role="alert"
        >
          <div className="error-content">
            <AlertCircle size={20} className="error-icon" />
            <span className="error-message">{error.message}</span>
          </div>
          <button 
            onClick={() => removeError(error.id)}
            className="error-close"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook personnalisé pour gérer les erreurs API
export const useApiError = () => {
  const { addError } = useError();

  const handleApiError = (error, customMessage = null) => {
    let message = customMessage;

    if (!message) {
      if (error.response?.status === 401) {
        message = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.response?.status === 403) {
        message = 'Accès non autorisé.';
      } else if (error.response?.status === 404) {
        message = 'Ressource non trouvée.';
      } else if (error.response?.status >= 500) {
        message = 'Erreur du serveur. Veuillez réessayer plus tard.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      } else {
        message = 'Une erreur inattendue s\'est produite.';
      }
    }

    addError(message, 'error');
  };

  const showSuccess = (message) => {
    addError(message, 'success');
  };

  const showWarning = (message) => {
    addError(message, 'warning');
  };

  const showInfo = (message) => {
    addError(message, 'info');
  };

  return {
    handleApiError,
    showSuccess,
    showWarning,
    showInfo
  };
};

export default ErrorProvider;