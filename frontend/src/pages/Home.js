import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight, Star, Clock, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pilgrims: 0,
    events: 0,
    points: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pointsInterest, setPointsInterest] = useState([]);
  const [animatedStats, setAnimatedStats] = useState({
    pilgrims: 0,
    events: 0,
    points: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes, pointsRes, pilgrimsRes] = await Promise.all([
        apiService.getStats().catch(() => ({ data: null })),
        apiService.getUpcomingEvents().catch(() => ({ data: [] })),
        apiService.getPointsInterest().catch(() => ({ data: [] })),
        apiService.getPilgrims().catch(() => ({ data: [] }))
      ]);
      
      // Traiter les événements
      let eventsData = [];
      if (eventsRes.data) {
        if (Array.isArray(eventsRes.data.data)) {
          eventsData = eventsRes.data.data;
        } else if (Array.isArray(eventsRes.data)) {
          eventsData = eventsRes.data;
        }
      } else if (Array.isArray(eventsRes)) {
        eventsData = eventsRes;
      }

      // Traiter les points d'intérêt
      let pointsData = [];
      if (pointsRes.data) {
        if (Array.isArray(pointsRes.data.data)) {
          pointsData = pointsRes.data.data;
        } else if (Array.isArray(pointsRes.data)) {
          pointsData = pointsRes.data;
        }
      } else if (Array.isArray(pointsRes)) {
        pointsData = pointsRes;
      }

      // Traiter les pèlerins
      let pilgrimsData = [];
      if (pilgrimsRes.data) {
        if (Array.isArray(pilgrimsRes.data.data)) {
          pilgrimsData = pilgrimsRes.data.data;
        } else if (Array.isArray(pilgrimsRes.data)) {
          pilgrimsData = pilgrimsRes.data;
        }
      } else if (Array.isArray(pilgrimsRes)) {
        pilgrimsData = pilgrimsRes;
      }
      
      // Calculer les stats à partir des données réelles
      const calculatedStats = {
        pilgrims: pilgrimsData.length,
        events: eventsData.length,
        points: pointsData.length
      };

      // Utiliser les stats de l'API si disponibles, sinon utiliser les stats calculées
      if (statsRes.data && typeof statsRes.data === 'object') {
        setStats({
          pilgrims: statsRes.data.pilgrims || calculatedStats.pilgrims,
          events: statsRes.data.events || calculatedStats.events,
          points: statsRes.data.points || calculatedStats.points
        });
      } else {
        setStats(calculatedStats);
      }

      setUpcomingEvents(eventsData.slice(0, 3)); // Limiter à 3 événements
      setPointsInterest(pointsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && stats.pilgrims > 0) {
      // Animation des statistiques
      const animateValue = (start, end, duration, key) => {
        let startTimestamp = null;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const value = Math.floor(progress * (end - start) + start);
          setAnimatedStats(prev => ({ ...prev, [key]: value }));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateValue(0, stats.pilgrims, 2000, 'pilgrims');
            animateValue(0, stats.events, 1500, 'events');
            animateValue(0, stats.points, 1000, 'points');
            observer.unobserve(entry.target);
          }
        });
      });

      const statsSection = document.querySelector('.stats-section');
      if (statsSection) {
        observer.observe(statsSection);
      }

      return () => observer.disconnect();
    }
  }, [stats, loading]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'priere': return 'linear-gradient(45deg, #4CAF50, #45a049)';
      case 'conference': return 'linear-gradient(45deg, #2196F3, #1976D2)';
      case 'evenement': return 'linear-gradient(45deg, #9C27B0, #7B1FA2)';
      default: return 'linear-gradient(45deg, #757575, #616161)';
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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="floating-elements">
            <div className="floating-element" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>
              <Sparkles size={20} />
            </div>
            <div className="floating-element" style={{ top: '60%', right: '15%', animationDelay: '1s' }}>
              <Star size={16} />
            </div>
            <div className="floating-element" style={{ top: '30%', right: '25%', animationDelay: '2s' }}>
              <Sparkles size={24} />
            </div>
          </div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Bienvenue au <span className="highlight">Magal de Touba 2024</span>
          </h1>
          <p className="hero-subtitle">
            Organisez votre pèlerinage en toute sérénité avec notre plateforme moderne
          </p>
          <div className="hero-features">
            <div className="feature-tag">
              <Clock size={16} />
              <span>Horaires en temps réel</span>
            </div>
            <div className="feature-tag">
              <MapPin size={16} />
              <span>Navigation GPS</span>
            </div>
            <div className="feature-tag">
              <Users size={16} />
              <span>Communauté active</span>
            </div>
          </div>
          <button 
            className="btn-primary hero-btn"
            onClick={() => navigate('/registration')}
          >
            <span>Commencer votre inscription</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">En chiffres</h2>
          {!loading && (
            <div className="stats-grid">
              <div className="stat-card pilgrims">
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{animatedStats.pilgrims.toLocaleString()}+</h3>
                  <p>Pèlerins inscrits</p>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card events">
                <div className="stat-icon">
                  <Calendar size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{animatedStats.events}</h3>
                  <p>Événements programmés</p>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card points">
                <div className="stat-icon">
                  <MapPin size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{animatedStats.points}</h3>
                  <p>Points d'intérêt</p>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="upcoming-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Prochains événements</h2>
            <p className="section-subtitle">Ne manquez aucun moment important du Magal</p>
          </div>
          
          <div className="upcoming-events">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className="event-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="event-time-badge">
                  <Clock size={16} />
                  {event.heure}
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h3 className="event-title">{event.titre}</h3>
                    <span 
                      className="event-type"
                      style={{ background: getTypeColor(event.type) }}
                    >
                      {getTypeLabel(event.type)}
                    </span>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-location">
                    <MapPin size={16} />
                    <span>{event.lieu}</span>
                  </div>
                </div>
                
                <div className="event-action">
                  <button 
                    className="btn-outline"
                    onClick={() => navigate('/events')}
                  >
                    <span>Voir tous</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {upcomingEvents.length === 0 && !loading && (
            <div className="no-events">
              <p>Aucun événement à venir pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Rejoignez la communauté</h2>
            <p>Des milliers de pèlerins utilisent déjà notre plateforme</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/registration')}>
                S'inscrire maintenant
              </button>
              <button className="btn-outline-white" onClick={() => navigate('/events')}>
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style>{`
        .home-page {
          flex: 1;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%);
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .floating-element {
          position: absolute;
          color: rgba(255, 255, 255, 0.3);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          padding: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 1s ease-out;
          line-height: 1.2;
        }

        .highlight {
          background: linear-gradient(45deg, #FFD700, #FFC107);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.4rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          animation: fadeInUp 1s ease-out 0.2s both;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
          animation: fadeInUp 1s ease-out 0.4s both;
          flex-wrap: wrap;
        }

        .feature-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .feature-tag:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .hero-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(45deg, #FFD700, #FFC107);
          color: #1B5E20;
          border: none;
          padding: 18px 36px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
          animation: fadeInUp 1s ease-out 0.6s both;
          margin: 0 auto;
        }

        .hero-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
          background: linear-gradient(45deg, #FFC107, #FFD700);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Stats Section */
        .stats-section {
          padding: 6rem 0;
          background: white;
          position: relative;
        }

        .section-title {
          text-align: center;
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 4rem;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: linear-gradient(45deg, #1B5E20, #4CAF50);
          border-radius: 2px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
        }

        .stat-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 25px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 2rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #1B5E20, #2E7D32, #4CAF50);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }

        .stat-card:hover::before {
          transform: translateX(0);
        }

        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .stat-card.pilgrims .stat-icon {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
        }

        .stat-card.events .stat-icon {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
        }

        .stat-card.points .stat-icon {
          background: linear-gradient(135deg, #FFD700, #FFC107);
          color: #1B5E20;
        }

        .stat-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .stat-content p {
          color: #666;
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .stat-progress {
          height: 6px;
          background: #f0f0f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #1B5E20, #4CAF50);
          border-radius: 3px;
          transition: width 1s ease;
        }

        /* Upcoming Events Section */
        .upcoming-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-top: 1rem;
        }

        .upcoming-events {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .event-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 2rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.6s ease-out both;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .event-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(45deg, #1B5E20, #4CAF50);
        }

        .event-card:hover {
          transform: translateX(10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .event-time-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1B5E20;
          background: rgba(27, 94, 32, 0.1);
          padding: 15px 20px;
          border-radius: 15px;
          min-width: 120px;
          justify-content: center;
        }

        .event-content {
          flex: 1;
        }

        .event-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .event-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        .event-type {
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-weight: 500;
        }

        .event-action {
          flex-shrink: 0;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 2px solid #1B5E20;
          color: #1B5E20;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: #1B5E20;
          color: white;
          transform: translateY(-2px);
        }

        .no-events {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.2rem;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%);
          color: white;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(45deg, #FFD700, #FFC107);
          color: #1B5E20;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
          background: linear-gradient(45deg, #FFC107, #FFD700);
        }

        .btn-outline-white {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline-white:hover {
          background: white;
          color: #1B5E20;
          transform: translateY(-3px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .event-card {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .event-header {
            justify-content: center;
          }

          .hero-features {
            flex-direction: column;
            align-items: center;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            padding: 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;