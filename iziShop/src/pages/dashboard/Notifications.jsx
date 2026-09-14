/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Component, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  listerNotifications,
  marquerNotificationsLues,
  supprimerNotification,
  obtenirPreferencesNotifications,
  mettreAJourPreferencesNotifications,
  testerPushNotification,
  listerMesDevices
} from '../../lib/api';
import LayoutDashboard from '../../components/LayoutDashboard';

const R = '5px';
const basePlaceholderStyle = {
  backgroundColor: '#e9ecef',
  borderRadius: R,
};

// ==========================================
// ERROR BOUNDARY
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[Notifications] Erreur React:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <LayoutDashboard>
          <div className="p-4 flex-grow-1">
            <div className="alert alert-danger" role="alert" style={{ borderRadius: R }}>
              <h5 className="alert-heading fw-bold">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Une erreur est survenue
              </h5>
              <p className="mb-2 small">Le composant Notifications a rencontré une erreur inattendue.</p>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => window.location.reload()}
                style={{ borderRadius: R }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>Recharger
              </button>
            </div>
          </div>
        </LayoutDashboard>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// SKELETON LOADER
// ==========================================
const SkeletonNotifications = () => (
  <LayoutDashboard>
    <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 placeholder-glow">
        <div>
          <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '220px', height: '22px' }}></div>
          <div className="placeholder" style={{ ...basePlaceholderStyle, width: '320px', height: '12px' }}></div>
        </div>
        <div className="d-flex gap-2">
          <div className="placeholder" style={{ ...basePlaceholderStyle, width: '140px', height: '30px', borderRadius: R }}></div>
          <div className="placeholder" style={{ ...basePlaceholderStyle, width: '140px', height: '30px', borderRadius: R }}></div>
        </div>
      </div>
      <div className="row g-2 mb-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-6 col-md-3">
            <div className="carte-izishop p-2 text-center placeholder-glow" style={{ borderRadius: R }}>
              <div className="placeholder mx-auto mb-1" style={{ ...basePlaceholderStyle, width: '36px', height: '36px', borderRadius: '50%' }}></div>
              <div className="placeholder mx-auto mb-1" style={{ ...basePlaceholderStyle, width: '50px', height: '20px' }}></div>
              <div className="placeholder mx-auto" style={{ ...basePlaceholderStyle, width: '70px', height: '10px' }}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="carte-izishop p-3 mb-3 placeholder-glow" style={{ borderRadius: R }}>
        <div className="placeholder mb-3" style={{ ...basePlaceholderStyle, width: '150px', height: '18px' }}></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="d-flex gap-3 align-items-start mb-3 pb-3 border-bottom">
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}></div>
            <div className="flex-grow-1">
              <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '70%', height: '14px' }}></div>
              <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '90%', height: '12px' }}></div>
              <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40%', height: '10px' }}></div>
            </div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '24px', height: '24px', borderRadius: '50%' }}></div>
          </div>
        ))}
      </div>
    </div>
  </LayoutDashboard>
);

// ==========================================
// HELPERS
// ==========================================
const formatDate = (d) => {
  try {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    const maintenant = new Date();
    const diffMs = maintenant - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffJ = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH} h`;
    if (diffJ < 7) return `Il y a ${diffJ} j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
};

const getTypeConfig = (type) => {
  const map = {
    'COMMANDE': { icon: 'bi-bag-check-fill', color: '#2563EB', bg: 'rgba(59, 130, 246, 0.12)' },
    'PAIEMENT': { icon: 'bi-credit-card-fill', color: '#047857', bg: 'rgba(16, 185, 129, 0.12)' },
    'ABONNEMENT': { icon: 'bi-star-fill', color: '#B45309', bg: 'rgba(251, 190, 36, 0.15)' },
    'EXPIRATION': { icon: 'bi-exclamation-triangle-fill', color: '#B91C1C', bg: 'rgba(239, 68, 68, 0.12)' },
    'KYC': { icon: 'bi-shield-check', color: '#7C3AED', bg: 'rgba(139, 92, 246, 0.12)' },
    'PARRAINAGE': { icon: 'bi-people-fill', color: '#0891B2', bg: 'rgba(8, 145, 178, 0.12)' },
    'SYSTEME': { icon: 'bi-gear-fill', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
    'MARKETING': { icon: 'bi-megaphone-fill', color: '#DB2777', bg: 'rgba(219, 39, 119, 0.12)' },
    'STOCK': { icon: 'bi-box-seam-fill', color: '#C2410C', bg: 'rgba(249, 115, 22, 0.12)' },
  };
  return map[type?.toUpperCase()] || { icon: 'bi-bell-fill', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' };
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [devices, setDevices] = useState([]);
  const [fcmDisponible, setFcmDisponible] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('toutes');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [marquageEnCours, setMarquageEnCours] = useState(false);
  const [testPushEnCours, setTestPushEnCours] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [nbNonLues, setNbNonLues] = useState(0);
  const LIMITE = 10;

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // === CHARGEMENT INITIAL & FILTRES ===
  const chargerDonnees = useCallback(async () => {
    setChargement(true);
    try {
      const params = { page, limite: LIMITE };
      if (filtre === 'non_lues') params.nonLues = true;

      const [resNotifs, resPrefs, resDevices] = await Promise.all([
        listerNotifications(params).catch(() => null),
        obtenirPreferencesNotifications().catch(() => null),
        listerMesDevices().catch(() => null),
      ]);

      if (resNotifs?.donnees) {
        setNotifications(resNotifs.donnees.notifications || []);
        setTotal(resNotifs.donnees.pagination?.total || 0);
        setTotalPages(resNotifs.donnees.pagination?.totalPages || 0);
        setNbNonLues(resNotifs.donnees.nbNonLues || 0);
      }
      if (resPrefs?.donnees?.preferences) {
        setPreferences(resPrefs.donnees.preferences);
      }
      if (resDevices?.donnees) {
        setDevices(resDevices.donnees.devices || []);
        setFcmDisponible(resDevices.donnees.fcmDisponible || false);
      }
    } catch (err) {
      console.error('[Notifications] Erreur:', err);
      afficherMessage('danger', 'Impossible de charger les notifications.');
    } finally {
      setChargement(false);
    }
  }, [filtre, page]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  // === STATS ===
  const stats = useMemo(() => {
    const toutes = total;
    const nonLues = nbNonLues;
    const lues = toutes - nonLues;
    return { toutes, nonLues, lues };
  }, [total, nbNonLues]);

  // === ACTIONS ===
  const marquerLue = async (id) => {
    try {
      await marquerNotificationsLues({ ids: [id] });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLue: true } : n));
      setNbNonLues(prev => Math.max(0, prev - 1));
    } catch (err) {
      afficherMessage('danger', 'Impossible de marquer comme lu.');
    }
  };

  const marquerToutesLues = async () => {
    setMarquageEnCours(true);
    try {
      await marquerNotificationsLues({ toutes: true });
      setNotifications(prev => prev.map(n => ({ ...n, estLue: true })));
      setNbNonLues(0);
      afficherMessage('success', 'Toutes les notifications ont été marquées comme lues.');
    } catch (err) {
      afficherMessage('danger', err?.message || 'Erreur lors du marquage.');
    } finally {
      setMarquageEnCours(false);
    }
  };

  const supprimerNotif = async (id) => {
    try {
      await supprimerNotification(id);
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.estLue) {
        setNbNonLues(prev => Math.max(0, prev - 1));
      }
      afficherMessage('success', 'Notification supprimée.');
    } catch (err) {
      afficherMessage('danger', 'Impossible de supprimer la notification.');
    }
  };

  const modifierPreference = async (cle, valeur) => {
    const anciennes = { ...preferences };
    setPreferences(prev => ({ ...prev, [cle]: valeur }));
    try {
      await mettreAJourPreferencesNotifications({ [cle]: valeur });
    } catch (err) {
      setPreferences(anciennes);
      afficherMessage('danger', 'Impossible de modifier la préférence.');
    }
  };

  const envoyerTestPush = async () => {
    setTestPushEnCours(true);
    try {
      const res = await testerPushNotification({
        titre: 'Test iziShop',
        message: 'Si vous recevez ceci, les notifications push fonctionnent ! 🎉'
      });
      if (res?.donnees?.succes) {
        afficherMessage('success', 'Push de test envoyé avec succès !');
      } else {
        afficherMessage('warning', res?.donnees?.raison || 'Test envoyé mais certains appareils ont échoué.');
      }
    } catch (err) {
      afficherMessage('danger', err?.message || 'Erreur lors du test push.');
    } finally {
      setTestPushEnCours(false);
    }
  };

  const handleClickNotif = async (notif) => {
    if (!notif.estLue) {
      await marquerLue(notif.id);
    }
    if (notif.lienAction) {
      window.location.href = notif.lienAction;
    } else if (notif.type?.toUpperCase() === 'COMMANDE') {
      window.location.href = '/dashboard/commandes';
    } else if (['ABONNEMENT', 'PAIEMENT', 'EXPIRATION'].includes(notif.type?.toUpperCase())) {
      window.location.href = '/dashboard/abonnement';
    }
  };

  if (chargement) return <SkeletonNotifications />;

  const prefs = preferences || {};

  return (
    <LayoutDashboard>
      <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
        {/* === EN-TÊTE === */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-bell-fill me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
              Centre de notifications
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              Gérez vos alertes, préférences et appareils connectés.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              onClick={marquerToutesLues}
              disabled={marquageEnCours || stats.nonLues === 0}
              style={{
                borderRadius: R,
                borderWidth: '1px',
                borderColor: 'var(--izishop-secondaire)',
                color: 'var(--izishop-secondaire)',
                fontSize: '0.78rem'
              }}
            >
              {marquageEnCours ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check2-all"></i>}
              <span>Tout marquer lu</span>
            </button>
            <Link
              to="/dashboard"
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                borderRadius: R,
                borderWidth: '1px',
                borderColor: 'rgba(30, 41, 59, 0.15)',
                color: 'var(--izishop-secondaire)',
                fontSize: '0.78rem'
              }}
            >
              <i className="bi bi-arrow-left"></i> Tableau de bord
            </Link>
          </div>
        </div>

        {/* === MESSAGE === */}
        {message.text && (
          <div
            className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2`}
            style={{ borderRadius: R, animation: 'fadeIn 0.3s ease' }}
          >
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'}`} style={{ fontSize: '0.9rem' }}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        {/* === STATS KPI === */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
              <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                <i className="bi bi-bell-fill" style={{ color: '#2563EB', fontSize: '1rem' }}></i>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>
                {stats.toutes}
              </h4>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Total</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R, border: stats.nonLues > 0 ? '2px solid var(--izishop-primaire)' : 'none' }}>
              <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.2)' }}>
                <i className="bi bi-envelope-fill" style={{ color: 'var(--izishop-primaire)', fontSize: '1rem' }}></i>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>
                {stats.nonLues}
              </h4>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Non lues</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
              <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                <i className="bi bi-check2-circle" style={{ color: 'var(--izishop-succes)', fontSize: '1rem' }}></i>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>
                {stats.lues}
              </h4>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lues</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
              <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                <i className="bi bi-phone-fill" style={{ color: '#7C3AED', fontSize: '1rem' }}></i>
              </div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>
                {devices.length}
              </h4>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Appareils</small>
            </div>
          </div>
        </div>

        {/* === FILTRES === */}
        <div className="carte-izishop p-3 mb-3" style={{ borderRadius: R }}>
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'toutes', label: 'Toutes', icon: 'bi-inbox-fill' },
              { id: 'non_lues', label: 'Non lues', icon: 'bi-envelope-fill' },
            ].map(f => (
              <button
                key={f.id}
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{
                  borderRadius: R,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: filtre === f.id ? 'var(--izishop-secondaire)' : 'rgba(30, 41, 59, 0.05)',
                  color: filtre === f.id ? 'white' : 'var(--izishop-secondaire)',
                  border: 'none',
                }}
                onClick={() => { setFiltre(f.id); setPage(1); }}
              >
                <i className={`bi ${f.icon}`}></i>
                {f.label}
                {f.id === 'non_lues' && stats.nonLues > 0 && (
                  <span className="badge ms-1" style={{ backgroundColor: 'var(--izishop-primaire)', color: 'white', fontSize: '0.6rem' }}>
                    {stats.nonLues}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* === LISTE DES NOTIFICATIONS === */}
        <div className="carte-izishop p-3 mb-3" style={{ borderRadius: R }}>
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
              <i className="bi bi-list-ul me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
              Notifications
              {total > 0 && (
                <span className="badge ms-2" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.7rem' }}>
                  {total}
                </span>
              )}
            </h5>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.1)' }}>
                <i className="bi bi-bell-slash fs-2" style={{ color: 'var(--izishop-primaire)' }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                {filtre === 'non_lues' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h6>
              <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                {filtre === 'non_lues' ? 'Vous êtes à jour ! 🎉' : 'Les notifications apparaîtront ici dès qu\'il y en aura.'}
              </p>
            </div>
          ) : (
            <>
              <div className="d-flex flex-column gap-2">
                {notifications.map(notif => {
                  const typeConf = getTypeConfig(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className="d-flex gap-3 align-items-start p-3 transition-all"
                      style={{
                        backgroundColor: notif.estLue ? 'transparent' : typeConf.bg,
                        border: notif.estLue ? '1px solid rgba(0,0,0,0.05)' : `1px solid ${typeConf.color}40`,
                        borderRadius: R,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleClickNotif(notif)}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: notif.estLue ? 'rgba(100, 116, 139, 0.1)' : typeConf.bg,
                          border: `2px solid ${notif.estLue ? 'rgba(100, 116, 139, 0.2)' : typeConf.color}`,
                        }}
                      >
                        <i className={`bi ${typeConf.icon}`} style={{ color: notif.estLue ? '#64748b' : typeConf.color, fontSize: '1rem' }}></i>
                      </div>

                      <div className="flex-grow-1 overflow-hidden">
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                          <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                            {notif.titre}
                          </h6>
                          {!notif.estLue && (
                            <span className="badge flex-shrink-0" style={{ backgroundColor: 'var(--izishop-primaire)', color: 'white', fontSize: '0.6rem', borderRadius: R }}>
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="mb-1 small" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          {notif.message}
                        </p>
                        <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                          <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(notif.dateCreation)}
                          </small>
                          <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.06)', color: 'var(--izishop-secondaire)', fontSize: '0.62rem', borderRadius: R }}>
                            {notif.type || 'Général'}
                          </span>
                          {notif.canal && (
                            <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.06)', color: 'var(--izishop-secondaire)', fontSize: '0.62rem', borderRadius: R }}>
                              <i className="bi bi-broadcast me-1"></i>{notif.canal}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-1 flex-shrink-0">
                        {!notif.estLue && (
                          <button
                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                            style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--izishop-succes)' }}
                            onClick={(e) => { e.stopPropagation(); marquerLue(notif.id); }}
                            title="Marquer comme lu"
                          >
                            <i className="bi bi-check" style={{ fontSize: '0.85rem' }}></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--izishop-erreur)' }}
                          onClick={(e) => { e.stopPropagation(); supprimerNotif(notif.id); }}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-3 pt-3 border-top">
                  <button
                    className="btn btn-sm"
                    style={{ borderRadius: R, fontSize: '0.78rem' }}
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <i className="bi bi-chevron-left"></i> Précédent
                  </button>
                  <span className="btn btn-sm disabled" style={{ borderRadius: R, fontSize: '0.78rem' }}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-sm"
                    style={{ borderRadius: R, fontSize: '0.78rem' }}
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Suivant <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* === LIGNE : PRÉFÉRENCES + DEVICES + TEST === */}
        <div className="row g-3">
          {/* PRÉFÉRENCES */}
          <div className="col-lg-6">
            <div className="carte-izishop p-3 h-100" style={{ borderRadius: R }}>
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <i className="bi bi-sliders" style={{ color: 'var(--izishop-primaire)' }}></i>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                  Préférences de notifications
                </h5>
              </div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.72rem' }}>
                Choisissez quelles notifications vous souhaitez recevoir.
              </p>

              <div className="d-flex flex-column gap-2">
                {[
                  { cle: 'commandes', label: 'Commandes', desc: 'Nouvelles commandes, mises à jour de statut', icon: 'bi-bag-check-fill', color: '#2563EB' },
                  { cle: 'paiements', label: 'Paiements', desc: 'Paiements reçus, échecs, remboursements', icon: 'bi-credit-card-fill', color: '#047857' },
                  { cle: 'alertesExpiration', label: 'Expiration abonnement', desc: 'Alertes avant expiration de votre abonnement', icon: 'bi-exclamation-triangle-fill', color: '#B45309' },
                  { cle: 'kyc', label: 'Vérification KYC', desc: 'Approbation ou rejet de votre vérification', icon: 'bi-shield-check', color: '#7C3AED' },
                  { cle: 'parrainage', label: 'Parrainage', desc: 'Nouveaux filleuls, bonus gagnés', icon: 'bi-people-fill', color: '#0891B2' },
                  { cle: 'systeme', label: 'Système', desc: 'Mises à jour, maintenances', icon: 'bi-gear-fill', color: '#475569' },
                  { cle: 'marketing', label: 'Marketing', desc: 'Offres spéciales, nouveautés', icon: 'bi-megaphone-fill', color: '#DB2777' },
                ].map(pref => (
                  <div
                    key={pref.cle}
                    className="d-flex align-items-center gap-3 p-2"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.02)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      borderRadius: R,
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: `${pref.color}15`,
                      }}
                    >
                      <i className={`bi ${pref.icon}`} style={{ color: pref.color, fontSize: '0.9rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.82rem' }}>
                        {pref.label}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                        {pref.desc}
                      </small>
                    </div>
                    <div className="form-check form-switch flex-shrink-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={prefs[pref.cle] ?? true}
                        onChange={(e) => modifierPreference(pref.cle, e.target.checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Canaux de livraison */}
              <div className="mt-3 pt-3 border-top">
                <h6 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.82rem' }}>
                  <i className="bi bi-send-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                  Canaux de livraison
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex align-items-center justify-content-between p-2" style={{ backgroundColor: 'rgba(30, 41, 59, 0.02)', borderRadius: R }}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-envelope-fill" style={{ color: '#EA4335', fontSize: '0.85rem' }}></i>
                        <span className="small fw-medium" style={{ fontSize: '0.75rem' }}>Email</span>
                      </div>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={prefs.emailActif ?? true}
                        onChange={(e) => modifierPreference('emailActif', e.target.checked)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center justify-content-between p-2" style={{ backgroundColor: 'rgba(30, 41, 59, 0.02)', borderRadius: R }}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-phone-fill" style={{ color: '#25D366', fontSize: '0.85rem' }}></i>
                        <span className="small fw-medium" style={{ fontSize: '0.75rem' }}>Push</span>
                      </div>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={prefs.pushActif ?? true}
                        onChange={(e) => modifierPreference('pushActif', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEVICES + TEST PUSH */}
          <div className="col-lg-6">
            <div className="d-flex flex-column gap-3 h-100">
              {/* Test push */}
              <div className="carte-izishop p-3" style={{ borderRadius: R, border: '2px solid var(--izishop-primaire)' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-broadcast" style={{ color: 'var(--izishop-primaire)' }}></i>
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                    Tester les notifications push
                  </h5>
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: '0.72rem' }}>
                  Envoyez un push de test pour vérifier que vos appareils reçoivent bien les notifications.
                </p>
                <button
                  className="bouton-principal w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: R, fontSize: '0.82rem' }}
                  onClick={envoyerTestPush}
                  disabled={testPushEnCours || devices.length === 0 || !fcmDisponible}
                >
                  {testPushEnCours ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      <span>{devices.length === 0 ? 'Aucun appareil enregistré' : 'Envoyer un push de test'}</span>
                    </>
                  )}
                </button>
                {devices.length === 0 && (
                  <small className="text-muted d-block mt-2 text-center" style={{ fontSize: '0.68rem' }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Ouvrez l'application mobile pour enregistrer votre appareil.
                  </small>
                )}
              </div>

              {/* Devices enregistrés */}
              <div className="carte-izishop p-3 flex-grow-1" style={{ borderRadius: R }}>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                    <i className="bi bi-phone-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                    Appareils connectés
                  </h5>
                  {devices.length > 0 && (
                    <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.7rem' }}>
                      {devices.length}
                    </span>
                  )}
                </div>

                {devices.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(100, 116, 139, 0.1)' }}>
                      <i className="bi bi-phone fs-3" style={{ color: '#64748b' }}></i>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.82rem' }}>
                      Aucun appareil enregistré
                    </h6>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                      Installez l'app mobile et connectez-vous pour recevoir les push.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {devices.map((device, idx) => {
                      const platformIcon = {
                        'ANDROID': 'bi-android2',
                        'IOS': 'bi-apple',
                        'WEB': 'bi-globe',
                      }[device.platform?.toUpperCase()] || 'bi-phone';
                      const platformColor = {
                        'ANDROID': '#3DDC84',
                        'IOS': '#000000',
                        'WEB': '#2563EB',
                      }[device.platform?.toUpperCase()] || '#64748b';

                      return (
                        <div
                          key={device.id || idx}
                          className="d-flex align-items-center gap-3 p-2"
                          style={{
                            backgroundColor: 'rgba(30, 41, 59, 0.02)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: R,
                          }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: `${platformColor}15`,
                            }}
                          >
                            <i className={`bi ${platformIcon}`} style={{ color: platformColor, fontSize: '1.1rem' }}></i>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.82rem' }}>
                                {device.deviceInfo?.modele || device.platform || 'Appareil inconnu'}
                              </span>
                              {device.isActive && (
                                <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#047857', fontSize: '0.6rem', borderRadius: R }}>
                                  Actif
                                </span>
                              )}
                            </div>
                            <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.68rem' }}>
                              {device.deviceInfo?.osVersion && <span>OS {device.deviceInfo.osVersion}</span>}
                              {device.deviceInfo?.appVersion && <span>v{device.deviceInfo.appVersion}</span>}
                              <span className="text-truncate" style={{ fontFamily: 'monospace' }}>
                                {device.tokenApercu}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <small className="text-muted text-center mt-2" style={{ fontSize: '0.68rem' }}>
                      <i className="bi bi-info-circle me-1"></i>
                      La gestion des appareils (retrait) se fait directement depuis votre application mobile.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

// ==========================================
// EXPORT AVEC ERROR BOUNDARY
// ==========================================
const Notifications = () => (
  <ErrorBoundary>
    <NotificationsContent />
  </ErrorBoundary>
);

export default Notifications;