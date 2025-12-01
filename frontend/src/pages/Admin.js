import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Save, X } from 'lucide-react';
import { apiService } from '../services/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [points, setPoints] = useState([]);
  const [pilgrims, setPilgrims] = useState([]);
  const [stats, setStats] = useState({ pilgrims: 0, events: 0, points: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState({ fetch: true, submit: false, delete: false });
  const [error, setError] = useState(null);

  // Fonction memoized pour éviter les re-renders inutiles
  const fetchData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);

      const [eventsRes, pointsRes, pilgrimsRes] = await Promise.all([
        apiService.getEvents().catch(err => {
          console.warn('Erreur lors du chargement des événements:', err);
          return { data: [] };
        }),
        apiService.getPointsInterest().catch(err => {
          console.warn('Erreur lors du chargement des points d\'intérêt:', err);
          return { data: [] };
        }),
        apiService.getPilgrims().catch(err => {
          console.warn('Erreur lors du chargement des pèlerins:', err);
          return { data: [] };
        })
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

      setEvents(eventsData);
      setPoints(pointsData);
      setPilgrims(pilgrimsData);

      // Calculer les stats localement
      const calculatedStats = {
        pilgrims: pilgrimsData.length,
        events: eventsData.length,
        points: pointsData.length
      };

      setStats(calculatedStats);

      // Optionnel : essayer de récupérer les stats via API
      try {
        const statsRes = await apiService.getStats();
        if (statsRes?.data && typeof statsRes.data === 'object') {
          setStats(prevStats => ({ ...prevStats, ...statsRes.data }));
        }
      } catch (statsError) {
        console.log('Stats API non disponible, utilisation des stats calculées');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInitialFormData = useCallback((type) => {
    return type === 'events' ? {
      titre: '',
      description: '',
      lieu: '',
      heure: '',
      date: '',
      type: 'evenement'
    } : {
      nom: '',
      description: '',
      adresse: '',
      type: 'service'
    };
  }, []);

  const handleAdd = useCallback((type) => {
    setFormData(getInitialFormData(type));
    setEditingItem(null);
    setShowModal(true);
  }, [getInitialFormData]);

  const handleEdit = useCallback((item, type) => {
    if (!item || !item.id) {
      console.error('Item invalide pour l\'édition:', item);
      setError('Impossible de modifier cet élément : ID manquant.');
      return;
    }

    setFormData({ ...item });
    setEditingItem({ ...item, itemType: type });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id, type) => {
    if (!id || !type) {
      console.error('ID ou type manquant pour la suppression');
      setError('Erreur : ID ou type manquant pour la suppression.');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      setError(null);

      if (type === 'events') {
        await apiService.deleteEvent(id);
      } else if (type === 'points') {
        await apiService.deletePointInterest(id);
      } else {
        throw new Error(`Type de suppression non supporté: ${type}`);
      }

      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchData]);

  const validateFormData = useCallback((data, itemType) => {
    const errors = [];

    if (itemType === 'events') {
      if (!data.titre?.trim()) errors.push('Le titre est obligatoire');
      if (!data.description?.trim()) errors.push('La description est obligatoire');
      if (!data.lieu?.trim()) errors.push('Le lieu est obligatoire');
      if (!data.date) errors.push('La date est obligatoire');
      else if (isNaN(new Date(data.date).getTime())) errors.push('La date est invalide');
      if (!data.heure) errors.push('L\'heure est obligatoire');
      if (!data.type) errors.push('Le type est obligatoire');
    } else {
      if (!data.nom?.trim()) errors.push('Le nom est obligatoire');
      if (!data.description?.trim()) errors.push('La description est obligatoire');
      if (!data.adresse?.trim()) errors.push('L\'adresse est obligatoire');
      if (!data.type) errors.push('Le type est obligatoire');
    }

    return errors;
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (loading.submit) return;

    const itemType = editingItem?.itemType || activeTab;
    const errors = validateFormData(formData, itemType);

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);

      // Nettoyer les données
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value
        ])
      );

      if (editingItem?.id) {
        // Modification
        if (editingItem.itemType === 'events') {
          await apiService.updateEvent(editingItem.id, cleanedData);
        } else if (editingItem.itemType === 'points') {
          await apiService.updatePointInterest(editingItem.id, cleanedData);
        }
      } else {
        // Création
        if (activeTab === 'events') {
          await apiService.createEvent(cleanedData);
        } else if (activeTab === 'points') {
          await apiService.createPointInterest(cleanedData);
        }
      }

      setShowModal(false);
      setFormData({});
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(`Erreur lors de la sauvegarde : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }, [loading.submit, editingItem, activeTab, formData, validateFormData, fetchData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Effacer l'erreur lors de la modification
  }, []);

  const closeModal = useCallback(() => {
    if (loading.submit) return;

    // Vérifier les modifications non enregistrées
    if (formData && Object.keys(formData).some(key => formData[key])) {
      if (!window.confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?')) {
        return;
      }
    }

    setShowModal(false);
    setFormData({});
    setEditingItem(null);
    setError(null);
  }, [loading.submit, formData]);

  const getTypeLabel = useCallback((type) => {
    const labels = {
      priere: 'Prière',
      conference: 'Conférence',
      evenement: 'Événement',
      mosquee: 'Mosquée',
      restaurant: 'Restaurant',
      logement: 'Logement',
      service: 'Service'
    };
    return labels[type] || type;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }, []);

  // Gérer l'événement d'échappement pour fermer le modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal && !loading.submit) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, closeModal, loading.submit]);

  if (loading.fetch) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="loading-state">
            <h2>Chargement des données...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Administration</h1>
          <p>Gérez les événements et points d'intérêt</p>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="btn-close-error"
              aria-label="Fermer l'erreur"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-card">
            <Users size={32} aria-hidden="true" />
            <div>
              <h3>{stats.pilgrims}</h3>
              <p>Pèlerins inscrits</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={32} aria-hidden="true" />
            <div>
              <h3>{stats.events}</h3>
              <p>Événements actifs</p>
            </div>
          </div>
          <div className="stat-card">
            <MapPin size={32} aria-hidden="true" />
            <div>
              <h3>{stats.points}</h3>
              <p>Points d'intérêt</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'events'}
            className={activeTab === 'events' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('events')}
            disabled={loading.fetch}
          >
            <Calendar size={20} aria-hidden="true" />
            Événements
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'points'}
            className={activeTab === 'points' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('points')}
            disabled={loading.fetch}
          >
            <MapPin size={20} aria-hidden="true" />
            Points d'intérêt
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pilgrims'}
            className={activeTab === 'pilgrims' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('pilgrims')}
            disabled={loading.fetch}
          >
            <Users size={20} aria-hidden="true" />
            Pèlerins
          </button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {(activeTab === 'events' || activeTab === 'points') && (
            <div className="content-header">
              <button
                className="btn-add"
                onClick={() => handleAdd(activeTab)}
                disabled={loading.fetch || loading.submit}
                aria-label={`Ajouter ${activeTab === 'events' ? 'un événement' : 'un point d\'intérêt'}`}
              >
                <Plus size={20} aria-hidden="true" />
                Ajouter {activeTab === 'events' ? 'un événement' : 'un point d\'intérêt'}
              </button>
            </div>
          )}

          {/* Events Table */}
          {activeTab === 'events' && (
            <div className="data-table">
              {events.length === 0 ? (
                <div className="empty-state">
                  <p>Aucun événement trouvé</p>
                </div>
              ) : (
                <div className="table-container">
                  <table role="grid">
                    <thead>
                      <tr>
                        <th scope="col">Titre</th>
                        <th scope="col">Type</th>
                        <th scope="col">Date</th>
                        <th scope="col">Heure</th>
                        <th scope="col">Lieu</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>{event.titre || '-'}</td>
                          <td>
                            <span className={`type-badge ${event.type || 'evenement'}`}>
                              {getTypeLabel(event.type)}
                            </span>
                          </td>
                          <td>{formatDate(event.date)}</td>
                          <td>{event.heure || '-'}</td>
                          <td>{event.lieu || '-'}</td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(event, 'events')}
                                title="Modifier"
                                disabled={loading.fetch || loading.delete}
                                aria-label={`Modifier l'événement ${event.titre || 'sans titre'}`}
                              >
                                <Edit size={16} aria-hidden="true" />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(event.id, 'events')}
                                title="Supprimer"
                                disabled={loading.fetch || loading.delete || !event.id}
                                aria-label={`Supprimer l'événement ${event.titre || 'sans titre'}`}
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Points Table */}
          {activeTab === 'points' && (
            <div className="data-table">
              {points.length === 0 ? (
                <div className="empty-state">
                  <p>Aucun point d'intérêt trouvé</p>
                </div>
              ) : (
                <div className="table-container">
                  <table role="grid">
                    <thead>
                      <tr>
                        <th scope="col">Nom</th>
                        <th scope="col">Type</th>
                        <th scope="col">Adresse</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {points.map(point => (
                        <tr key={point.id}>
                          <td>{point.nom || '-'}</td>
                          <td>
                            <span className={`type-badge ${point.type || 'service'}`}>
                              {getTypeLabel(point.type)}
                            </span>
                          </td>
                          <td>{point.adresse || '-'}</td>
                          <td>
                            <div className="actions">
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(point, 'points')}
                                title="Modifier"
                                disabled={loading.fetch || loading.delete}
                                aria-label={`Modifier le point d'intérêt ${point.nom || 'sans nom'}`}
                              >
                                <Edit size={16} aria-hidden="true" />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(point.id, 'points')}
                                title="Supprimer"
                                disabled={loading.fetch || loading.delete || !point.id}
                                aria-label={`Supprimer le point d'intérêt ${point.nom || 'sans nom'}`}
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pilgrims Table */}
          {activeTab === 'pilgrims' && (
            <div className="data-table">
              {pilgrims.length === 0 ? (
                <div className="empty-state">
                  <p>Aucun pèlerin inscrit</p>
                </div>
              ) : (
                <div className="table-container">
                  <table role="grid">
                    <thead>
                      <tr>
                        <th scope="col">Nom</th>
                        <th scope="col">Prénom</th>
                        <th scope="col">Email</th>
                        <th scope="col">Téléphone</th>
                        <th scope="col">Ville</th>
                        <th scope="col">Date d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pilgrims.map(pilgrim => (
                        <tr key={pilgrim.id}>
                          <td>{pilgrim.nom || '-'}</td>
                          <td>{pilgrim.prenom || '-'}</td>
                          <td>{pilgrim.email || '-'}</td>
                          <td>{pilgrim.telephone || '-'}</td>
                          <td>{pilgrim.ville || '-'}</td>
                          <td>{formatDate(pilgrim.date_inscription)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal} aria-modal="true" role="dialog">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editingItem ? 'Modifier' : 'Ajouter'} {
                    (editingItem?.itemType || activeTab) === 'events' ? 'un événement' : 'un point d\'intérêt'
                  }
                </h3>
                <button
                  className="btn-close"
                  onClick={closeModal}
                  title="Fermer"
                  disabled={loading.submit}
                  aria-label="Fermer le modal"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {(editingItem?.itemType || activeTab) === 'events' ? (
                  <>
                    <div className="form-group">
                      <label htmlFor="titre">Titre *</label>
                      <input
                        id="titre"
                        type="text"
                        name="titre"
                        value={formData.titre || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Entrez le titre de l'événement"
                        disabled={loading.submit}
                        aria-required="true"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="type">Type *</label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type || 'evenement'}
                          onChange={handleInputChange}
                          required
                          disabled={loading.submit}
                          aria-required="true"
                        >
                          <option value="priere">Prière</option>
                          <option value="conference">Conférence</option>
                          <option value="evenement">Événement</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="date">Date *</label>
                        <input
                          id="date"
                          type="date"
                          name="date"
                          value={formData.date || ''}
                          onChange={handleInputChange}
                          required
                          disabled={loading.submit}
                          aria-required="true"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="heure">Heure *</label>
                        <input
                          id="heure"
                          type="time"
                          name="heure"
                          value={formData.heure || ''}
                          onChange={handleInputChange}
                          required
                          disabled={loading.submit}
                          aria-required="true"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lieu">Lieu *</label>
                        <input
                          id="lieu"
                          type="text"
                          name="lieu"
                          value={formData.lieu || ''}
                          onChange={handleInputChange}
                          required
                          placeholder="Lieu de l'événement"
                          disabled={loading.submit}
                          aria-required="true"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Description *</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        required
                        placeholder="Description de l'événement"
                        disabled={loading.submit}
                        aria-required="true"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="nom">Nom *</label>
                      <input
                        id="nom"
                        type="text"
                        name="nom"
                        value={formData.nom || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Nom du point d'intérêt"
                        disabled={loading.submit}
                        aria-required="true"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="type">Type *</label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type || 'service'}
                          onChange={handleInputChange}
                          required
                          disabled={loading.submit}
                          aria-required="true"
                        >
                          <option value="mosquee">Mosquée</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="logement">Logement</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="adresse">Adresse *</label>
                        <input
                          id="adresse"
                          type="text"
                          name="adresse"
                          value={formData.adresse || ''}
                          onChange={handleInputChange}
                          required
                          placeholder="Adresse complète"
                          disabled={loading.submit}
                          aria-required="true"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Description *</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        required
                        placeholder="Description du point d'intérêt"
                        disabled={loading.submit}
                        aria-required="true"
                      />
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeModal}
                    disabled={loading.submit}
                    aria-label="Annuler"
                  >
                    <X size={16} aria-hidden="true" />
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={loading.submit}
                    aria-label={loading.submit ? 'Sauvegarde en cours' : 'Sauvegarder'}
                  >
                    <Save size={16} aria-hidden="true" />
                    {loading.submit ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-page {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .admin-header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .admin-header p {
          font-size: 1.2rem;
          color: #666;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .loading-state h2 {
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1B5E20;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background: #ffebee;
          border: 1px solid #f44336;
          color: #c62828;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-close-error {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          color: #c62828;
        }

        .btn-close-error:hover {
          background: rgba(198, 40, 40, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .stat-card svg {
          color: #1B5E20;
          flex-shrink: 0;
        }

        .stat-card h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .stat-card p {
          color: #666;
          font-weight: 500;
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab:hover:not(:disabled) {
          background: rgba(27, 94, 32, 0.1);
          color: #1B5E20;
        }

        .tab.active {
          background: #1B5E20;
          color: white;
        }

        .tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-content {
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .content-header {
          padding: 2rem;
          border-bottom: 1px solid #eee;
        }

        .btn-add {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #1B5E20, #4CAF50);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(27, 94, 32, 0.4);
        }

        .btn-add:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .data-table {
          padding: 0 2rem 2rem 2rem;
          overflow-x: auto;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        th, td {
          text-align: left;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        th {
          font-weight: 600;
          color: #333;
          background: #f8f9fa;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        tbody tr:hover {
          background: #f8f9fa;
        }

        .type-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .type-badge.priere { background: #e8f5e8; color: #2e7d32; }
        .type-badge.conference { background: #e3f2fd; color: #1565c0; }
        .type-badge.evenement { background: #f3e5f5; color: #7b1fa2; }
        .type-badge.mosquee { background: #e8f5e8; color: #2e7d32; }
        .type-badge.restaurant { background: #fff3e0; color: #f57c00; }
        .type-badge.logement { background: #e3f2fd; color: #1565c0; }
        .type-badge.service { background: #f3e5f5; color: #7b1fa2; }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit, .btn-delete {
          padding: 8px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: #e3f2fd;
          color: #1565c0;
        }

        .btn-edit:hover:not(:disabled) {
          background: #1565c0;
          color: white;
        }

        .btn-edit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-delete {
          background: #ffebee;
          color: #c62828;
        }

        .btn-delete:hover:not(:disabled) {
          background: #c62828;
          color: white;
        }

        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        .btn-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-close:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .btn-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1B5E20;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-cancel, .btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
          justify-content: center;
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #666;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-save {
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .admin-header h1 {
            font-size: 2rem;
          }

          .admin-tabs {
            gap: 0.5rem;
            padding: 0.5rem;
          }

          .tab {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .stats-dashboard {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .modal {
            margin: 1rem;
          }

          .data-table {
            padding: 1rem;
          }

          .table-container {
            font-size: 0.9rem;
          }

          .actions {
            flex-direction: column;
            gap: 0.25rem;
          }
        }

        @media (max-width: 480px) {
          .admin-header h1 {
            font-size: 1.5rem;
          }

          .stat-card {
            padding: 1rem;
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .modal {
            margin: 0.5rem;
            max-height: 95vh;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;