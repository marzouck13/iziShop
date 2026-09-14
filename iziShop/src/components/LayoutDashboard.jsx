import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiClient';
import { obtenirMaBoutique, basculerVisibiliteBoutique } from '../lib/api';

const LayoutDashboard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { utilisateur, deconnexion } = useAuth();
  const [boutique, setBoutique] = useState(null);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [chargementBoutique, setChargementBoutique] = useState(true);
  const [nbNonLues, setNbNonLues] = useState(0);
  const isActive = (path) => location.pathname === path;

  // Chargement des données de la boutique au montage
  useEffect(() => {
    const chargerBoutique = async () => {
      setChargementBoutique(true);
      try {
        const res = await obtenirMaBoutique();
        if (res?.donnees) setBoutique(res.donnees);
      } catch (err) {
        console.error("Erreur chargement boutique:", err);
      } finally {
        setChargementBoutique(false);
      }
    };
    chargerBoutique();
  }, []);

  // Compteur de notifications non lues (polling toutes les 30s)
  useEffect(() => {
    const chargerCompteur = async () => {
      try {
        const res = await api.get('/api/notifications', { nonLues: true, limite: 1 });
        if (res?.data?.donnees?.total !== undefined) {
          setNbNonLues(res.data.donnees.total);
        } else if (Array.isArray(res?.data?.donnees?.notifications)) {
          setNbNonLues(res.data.donnees.notifications.length);
        }
      } catch (err) {
        console.error('Erreur compteur notifs:', err);
      }
    };

    chargerCompteur();
    const interval = setInterval(chargerCompteur, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  const gererVisibilite = async () => {
    setActionEnCours(true);
    try {
      const reponse = await basculerVisibiliteBoutique();
      setBoutique((prev) => ({ ...prev, estVisible: reponse.donnees.estVisible, statut: reponse.donnees.statut }));
    } catch (err) {
      if (err.status === 403) {
        window.alert((err.message || "Vous ne pouvez pas publier votre boutique car votre abonnement a expiré."));
      } else {
        window.alert(err.message || "Une erreur est survenue.");
      }
    } finally {
      setActionEnCours(false);
    }
  };

  const estExpire = boutique && (!boutique.estAbonnementActif || new Date(boutique.dateExpirationAbonnement) < new Date());

  const liens = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: "Vue d'ensemble" },
    { path: '/dashboard/produits', icon: 'bi-box-seam', label: 'Produits' },
    { path: '/dashboard/commandes', icon: 'bi-bag-check', label: 'Commandes' },
    { path: '/dashboard/notifications', icon: 'bi-bell-fill', label: 'Notifications', badge: nbNonLues },
    { path: '/dashboard/parrainage', icon: 'bi-people-fill', label: 'Parrainage' },
    { path: '/dashboard/abonnement', icon: 'bi-credit-card', label: 'Abonnement' },
    { path: '/dashboard/parametres', icon: 'bi-gear', label: 'Paramètres' }
  ];

  const styleLien = (actif) => ({
    backgroundColor: actif ? 'rgba(251, 190, 36, 0.15)' : 'transparent',
    color: 'var(--izishop-secondaire)'
  });

  const skel = { backgroundColor: '#e9ecef', borderRadius: '5px' };

  return (
    <div className="d-flex" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--izishop-fond)' }}>
      {/* SIDEBAR DESKTOP */}
      <aside className="d-none d-lg-flex flex-column flex-shrink-0 p-3 bg-white border-end"
        style={{ width: '260px', borderColor: 'rgba(30, 41, 59, 0.08)', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          {liens.map((lien) => (
            <li className="nav-item" key={lien.path}>
              <Link to={lien.path}
                className={`nav-link rounded-3 d-flex align-items-center text-decoration-none position-relative ${isActive(lien.path) ? 'fw-bold' : ''}`}
                style={styleLien(isActive(lien.path))}>
                <i className={`bi ${lien.icon} me-2 ${isActive(lien.path) ? '' : 'text-muted'}`}></i>
                {lien.label}
                {lien.badge > 0 && (
                  <span className="badge ms-auto" style={{
                    backgroundColor: 'var(--izishop-primaire)',
                    color: 'white',
                    fontSize: '0.65rem',
                    minWidth: '20px',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    {lien.badge > 99 ? '99+' : lien.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <hr className="my-3" style={{ opacity: 0.1 }} />
        <div className="px-2 flex-shrink-0">
          {chargementBoutique ? (
            <>
              <div className="placeholder-glow mb-2">
                <div className="placeholder w-100" style={{ ...skel, height: '38px' }}></div>
              </div>
              <div className="d-flex align-items-center mb-3 p-2 rounded-3 bg-light placeholder-glow">
                <div className="placeholder rounded-circle me-2 flex-shrink-0" style={{ ...skel, width: '40px', height: '40px', borderRadius: '50%' }}></div>
                <div className="overflow-hidden flex-grow-1">
                  <div className="placeholder mb-1 w-75" style={{ ...skel, height: '14px' }}></div>
                  <div className="placeholder w-100" style={{ ...skel, height: '10px' }}></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                className={`btn btn-sm w-100 mb-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0 py-2 ${estExpire ? 'disabled' : ''}`}
                style={{
                  backgroundColor: estExpire ? 'rgba(239, 68, 68, 0.08)' : (boutique?.estVisible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 190, 36, 0.1)'),
                  color: estExpire ? 'var(--izishop-erreur)' : (boutique?.estVisible ? 'var(--izishop-succes)' : '#B45309'),
                  border: `1px solid ${estExpire ? 'rgba(239, 68, 68, 0.2)' : (boutique?.estVisible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 190, 36, 0.3)')}`,
                  opacity: estExpire ? 0.7 : 1,
                  cursor: estExpire ? 'not-allowed' : 'pointer'
                }}
                onClick={gererVisibilite}
                disabled={actionEnCours || estExpire}
                title={estExpire ? "Abonnement expiré" : (boutique?.estVisible ? "Masquer" : "Publier")}>
                {actionEnCours ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className={`bi ${estExpire ? 'bi-exclamation-triangle-fill' : (boutique?.estVisible ? 'bi-eye-slash-fill' : 'bi-eye-fill')}`}></i>
                )}
                <span className="fw-bold small">
                  {estExpire ? 'Abonnement expiré' : (boutique?.estVisible ? 'Boutique en ligne' : 'Boutique masquée')}
                </span>
              </button>
              <div className="d-flex align-items-center mb-3 p-2 rounded-3 bg-light">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: 'var(--izishop-secondaire)', color: 'var(--izishop-blanc)', fontSize: '1.1rem' }}>
                  {utilisateur?.nomComplet?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="overflow-hidden">
                  <p className="mb-0 fw-bold text-truncate small" style={{ color: 'var(--izishop-secondaire)' }}>{utilisateur?.nomComplet}</p>
                  <span className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>{utilisateur?.email}</span>
                </div>
              </div>
            </>
          )}
          <button className="btn btn-outline-danger btn-sm w-100 rounded-3 border-0 d-flex align-items-center justify-content-center py-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--izishop-erreur)' }} onClick={handleDeconnexion}>
            <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        {/* TOPBAR MOBILE */}
        <div className="d-lg-none bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top shadow-sm flex-shrink-0" style={{ zIndex: 1000 }}>
          {chargementBoutique ? (
            <div className="d-flex align-items-center gap-2 placeholder-glow">
              <div className="placeholder rounded-circle" style={{ ...skel, width: '32px', height: '32px', borderRadius: '50%' }}></div>
              <div className="placeholder" style={{ ...skel, width: '80px', height: '16px' }}></div>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', backgroundColor: 'var(--izishop-secondaire)', color: 'var(--izishop-blanc)', fontSize: '0.9rem' }}>
                {utilisateur?.nomComplet?.charAt(0).toUpperCase() || 'V'}
              </div>
              <span className="fw-bold small text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '120px' }}>iziShop</span>
            </div>
          )}
          <div className="d-flex gap-2">
            <Link to="/dashboard/produits" className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-box-seam"></i>
            </Link>
            <Link to="/dashboard/commandes" className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-bag-check"></i>
            </Link>
            {/* ✅ Bouton Notifications Mobile avec badge */}
            <Link to="/dashboard/notifications" className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center position-relative" style={{ width: '38px', height: '38px', color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-bell-fill"></i>
              {nbNonLues > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{
                  backgroundColor: 'var(--izishop-primaire)',
                  color: 'white',
                  fontSize: '0.6rem',
                  padding: '2px 5px',
                  minWidth: '16px'
                }}>
                  {nbNonLues > 9 ? '9+' : nbNonLues}
                </span>
              )}
            </Link>
            {chargementBoutique ? (
              <div className="placeholder placeholder-glow rounded-circle" style={{ ...skel, width: '38px', height: '38px', borderRadius: '50%' }}></div>
            ) : (
              <button
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '38px', height: '38px',
                  backgroundColor: estExpire ? 'rgba(239, 68, 68, 0.1)' : (boutique?.estVisible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 190, 36, 0.1)'),
                  color: estExpire ? 'var(--izishop-erreur)' : (boutique?.estVisible ? 'var(--izishop-succes)' : '#B45309'),
                  border: 'none'
                }}
                onClick={gererVisibilite}
                disabled={actionEnCours || estExpire}>
                {actionEnCours ? <span className="spinner-border spinner-border-sm"></span> : <i className={`bi ${estExpire ? 'bi-exclamation-triangle-fill' : (boutique?.estVisible ? 'bi-eye-slash-fill' : 'bi-eye-fill')}`}></i>}
              </button>
            )}
            <button className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-erreur)' }} onClick={handleDeconnexion}>
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutDashboard;