import React, { useState, useEffect } from 'react';
import { MapPin, Home, Utensils, Building, Wrench } from 'lucide-react';
import { apiService } from '../services/api';

const PointsInterest = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPointsInterest();
      console.log('Réponse complète:', response); // Déboguer la structure complète
      console.log('Données reçues:', response.data); // Pour déboguer
      
      // Gérer différentes structures de réponse
      let pointsData = [];
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          // Si la structure est { data: { data: [...] } }
          pointsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Si la structure est { data: [...] }
          pointsData = response.data;
        }
      } else if (Array.isArray(response)) {
        // Si la réponse est directement un tableau
        pointsData = response;
      }
      
      console.log('Points traités:', pointsData);
      setPoints(pointsData);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des points d\'intérêt:', error);
      setError('Impossible de charger les points d\'intérêt');
      setPoints([]); // S'assurer que points reste un tableau
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = points.filter(point => 
    filter === 'all' || point.type === filter
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mosquee': return <Home size={24} />;
      case 'restaurant': return <Utensils size={24} />;
      case 'logement': return <Building size={24} />;
      case 'service': return <Wrench size={24} />;
      default: return <MapPin size={24} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'mosquee': return '#4CAF50';
      case 'restaurant': return '#FF9800';
      case 'logement': return '#2196F3';
      case 'service': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'mosquee': return 'Mosquée';
      case 'restaurant': return 'Restaurant';
      case 'logement': return 'Logement';
      case 'service': return 'Service';
      default: return type;
    }
  };

  // Vérifier si un point a des coordonnées GPS
  const hasCoordinates = (point) => {
    return point.latitude && point.longitude;
  };

  if (loading) {
    return (
      <div className="points-page">
        <div className="container">
          <div className="loading">Chargement des points d'intérêt...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="points-page">
        <div className="container">
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchPoints} className="retry-btn">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="points-page">
      <div className="container">
        <div className="page-header">
          <h1>Points d'Intérêt</h1>
          <p>Découvrez les lieux essentiels de Touba</p>
          <p className="data-count">{points.length} point(s) d'intérêt disponible(s)</p>
        </div>

        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Tous ({points.length})
          </button>
          <button 
            className={filter === 'mosquee' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('mosquee')}
          >
            <Home size={16} />
            Mosquées ({points.filter(p => p.type === 'mosquee').length})
          </button>
          <button 
            className={filter === 'restaurant' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('restaurant')}
          >
            <Utensils size={16} />
            Restaurants ({points.filter(p => p.type === 'restaurant').length})
          </button>
          <button 
            className={filter === 'logement' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('logement')}
          >
            <Building size={16} />
            Logements ({points.filter(p => p.type === 'logement').length})
          </button>
          <button 
            className={filter === 'service' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('service')}
          >
            <Wrench size={16} />
            Services ({points.filter(p => p.type === 'service').length})
          </button>
        </div>

        <div className="points-grid">
          {filteredPoints.map(point => (
            <div key={point.id} className="point-card">
              <div className="point-header">
                <div 
                  className="point-icon"
                  style={{ backgroundColor: getTypeColor(point.type) }}
                >
                  {getTypeIcon(point.type)}
                </div>
                <span 
                  className="point-type"
                  style={{ color: getTypeColor(point.type) }}
                >
                  {getTypeLabel(point.type)}
                </span>
              </div>

              <h3 className="point-name">{point.nom}</h3>
              <p className="point-description">{point.description}</p>

              <div className="point-address">
                <MapPin size={16} />
                <span>{point.adresse}</span>
              </div>

              {/* Informations supplémentaires si disponibles */}
              {point.telephone && (
                <div className="point-contact">
                  <strong>Téléphone:</strong> {point.telephone}
                </div>
              )}

              {point.horaires && (
                <div className="point-hours">
                  <strong>Horaires:</strong> {point.horaires}
                </div>
              )}

              <div className="point-actions">
                {hasCoordinates(point) ? (
                  <button className="btn-directions">
                    <MapPin size={16} />
                    Itinéraire
                  </button>
                ) : (
                  <button className="btn-directions disabled" disabled>
                    <MapPin size={16} />
                    Pas de coordonnées
                  </button>
                )}
                <button className="btn-info">
                  Plus d'infos
                </button>
              </div>

              {/* Indicateur de statut */}
              {point.actif === "0" && (
                <div className="status-inactive">
                  Non actif
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPoints.length === 0 && (
          <div className="no-points">
            <p>Aucun point d'intérêt trouvé pour ce filtre.</p>
          </div>
        )}
      </div>

      <style>{`
        .points-page {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .page-header p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .data-count {
          font-size: 1rem;
          color: #999;
          font-style: italic;
        }

        .filter-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .points-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .point-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .point-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .point-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .point-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .point-type {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        .point-name {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .point-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          white-space: pre-line; /* Pour respecter les retours à la ligne */
        }

        .point-address {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .point-contact, .point-hours {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
        }

        .point-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-directions {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
        }

        .btn-directions:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-directions.disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-info {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-info:hover {
          background: #667eea;
          color: white;
        }

        .status-inactive {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ff4444;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .loading, .no-points, .error {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.2rem;
        }

        .error {
          color: #d32f2f;
        }

        .retry-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .points-grid {
            grid-template-columns: 1fr;
          }
          
          .page-header h1 {
            font-size: 2rem;
          }
          
          .filter-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PointsInterest;