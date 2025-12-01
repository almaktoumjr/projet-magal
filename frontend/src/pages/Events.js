import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { apiService } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.type === filter
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'priere': return '#4CAF50';
      case 'conference': return '#2196F3';
      case 'evenement': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'priere': return 'Prière';
      case 'conference': return 'Conférence';
      case 'evenement': return 'Événement';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="loading">Chargement des événements...</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1>Tous les Événements</h1>
          <p>Découvrez tous les événements du Magal de Touba</p>
        </div>

        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button 
            className={filter === 'priere' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('priere')}
          >
            Prières
          </button>
          <button 
            className={filter === 'conference' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('conference')}
          >
            Conférences
          </button>
          <button 
            className={filter === 'evenement' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('evenement')}
          >
            Événements
          </button>
        </div>

        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div 
                  className="event-type-badge"
                  style={{ backgroundColor: getTypeColor(event.type) }}
                >
                  {getTypeLabel(event.type)}
                </div>
                <div className="event-date">
                  <Calendar size={16} />
                  {new Date(event.date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <h3 className="event-title">{event.titre}</h3>
              <p className="event-description">{event.description}</p>

              <div className="event-details">
                <div className="event-time">
                  <Clock size={16} />
                  {event.heure}
                </div>
                <div className="event-location">
                  <MapPin size={16} />
                  {event.lieu}
                </div>
              </div>

              <button className="btn-participate">
                <Users size={16} />
                Participer
              </button>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="no-events">
            <p>Aucun événement trouvé pour ce filtre.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .events-page {
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
        }

        .filter-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .filter-btn {
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

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .event-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .event-type-badge {
          padding: 6px 15px;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-weight: 500;
        }

        .event-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .event-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .event-details {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .event-time, .event-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-weight: 500;
        }

        .btn-participate {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          justify-content: center;
        }

        .btn-participate:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .loading, .no-events {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .events-grid {
            grid-template-columns: 1fr;
          }
          
          .page-header h1 {
            font-size: 2rem;
          }

          .filter-buttons {
            gap: 0.5rem;
          }

          .filter-btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }

          .event-details {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Events;