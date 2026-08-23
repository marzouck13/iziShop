/* eslint-disable no-unused-vars */
// Fichier: frontend/src/pages/Abonnement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenirMaBoutique } from '../lib/api';

const Abonnement = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionEnCours, setActionEnCours] = useState(false);

  // Vérifier si on revient d'une redirection FeexPay
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const reference = params.get('ref');
    const custom_id = params.get('custom_id');

    if (status === 'success' && reference && custom_id) {
      verifierAvecBackend(reference, custom_id);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;
    const chargerDonnees = async () => {
      try {
        const resBoutique = await obtenirMaBoutique();
        if (isMounted && resBoutique?.donnees) {
          setBoutique(resBoutique.donnees);
        }
      } catch (err) {
        if (isMounted) setErreur('Impossible de charger les informations de votre abonnement.');
        console.error(err);
      } finally {
        if (isMounted) setChargement(false);
      }
    };
    chargerDonnees();
    return () => { isMounted = false; };
  }, []);

  const verifierAvecBackend = async (reference, custom_id) => {
    setActionEnCours(true);
    setMessage({ type: 'info', text: 'Vérification du paiement en cours...' });
    
    try {
      const token = localStorage.getItem('izishop_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/paiement/verifier/${reference}?custom_id=${custom_id}`, {
        method: 'GET',
        headers: { 'Authorization': token }
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'SUCCESSFUL') {
        setMessage({ type: 'success', text: 'Paiement confirmé ! Votre abonnement est maintenant actif.' });
        // Recharger les données de la boutique
        const resBoutique = await obtenirMaBoutique();
        if (resBoutique?.donnees) setBoutique(resBoutique.donnees);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Échec de la vérification du paiement.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erreur de communication avec le serveur.' });
    } finally {
      setActionEnCours(false);
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const lancerPaiementFeexPay = async (dureeJours) => {
    if (!window.confirm(`Confirmer le renouvellement pour ${dureeJours} jours (5 000 FCFA) ?`)) return;

    setActionEnCours(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('izishop_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // 1. Demander au backend de générer un custom_id
      const initRes = await fetch(`${apiUrl}/paiement/initier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ dureeJours })
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.message);

      const { amount, custom_id, description, shop_id } = initData.donnees;
      const callbackUrl = `${window.location.origin}/dashboard/abonnement?status=success&ref=PLACEHOLDER&custom_id=${custom_id}`;

      // 2. Initialiser le SDK FeexPay
      if (window.FeexPayButton) {
        window.FeexPayButton.init("feexpay-render", {
          id: shop_id,
          amount: amount,
          token: import.meta.env.VITE_FEEXPAY_API_KEY || 'fp_M6tuzYgsYl39d6kJvdaLmYGQcEAWvLRivVhbeK4UCwbDiyMlj9UPMO', // Clé SANDBOX
          custom_id: custom_id,
          description: description,
          mode: "SANDBOX", // Passer à "LIVE" en production
          callback_url: callbackUrl,
          error_callback_url: `${window.location.origin}/dashboard/abonnement?status=failed`,
          callback: (response) => {
            // Fallback si la redirection automatique échoue
            if (response.status === 'SUCCESSFUL') {
              window.location.href = `${window.location.origin}/dashboard/abonnement?status=success&ref=${response.reference}&custom_id=${custom_id}`;
            }
          }
        });
      } else {
        throw new Error('Le SDK FeexPay n\'est pas chargé. Veuillez rafraîchir la page.');
      }
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors du lancement du paiement.');
      setActionEnCours(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const estEnEssai = boutique?.planAbonnement === 'GRATUIT';
  const dateExpiration = boutique?.dateExpirationAbonnement ? new Date(boutique.dateExpirationAbonnement) : null;
  const aujourdHui = new Date();
  let joursRestants = 0;

  if (boutique?.estAbonnementActif && dateExpiration) {
    const dateExpSansHeure = new Date(dateExpiration.getFullYear(), dateExpiration.getMonth(), dateExpiration.getDate());
    const aujourdhuiSansHeure = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
    const diffTime = dateExpSansHeure.getTime() - aujourdhuiSansHeure.getTime();
    joursRestants = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const dateExpirationFormatee = dateExpiration
    ? dateExpiration.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Non définie';

  if (chargement) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--izishop-primaire)' }}></div>
          <p className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Chargement de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="container py-5">
        <div className="carte-izishop p-5 text-center mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-exclamation-triangle-fill display-4 mb-3" style={{ color: 'var(--izishop-erreur)' }}></i>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)' }}>Erreur de chargement</h5>
          <p className="text-muted small mb-4">{erreur}</p>
          <button className="bouton-principal px-4 py-2" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-2"></i>Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
      <aside className="d-none d-lg-flex flex-column flex-shrink-0 p-3 bg-white border-end" style={{ width: '260px', borderColor: 'rgba(30, 41, 59, 0.08)' }}>
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li className="nav-item">
            <Link to="/dashboard" className={`nav-link rounded-3 d-flex align-items-center text-decoration-none ${isActive('/dashboard') ? 'fw-bold' : ''}`} style={isActive('/dashboard') ? { backgroundColor: 'rgba(251, 190, 36, 0.15)', color: 'var(--izishop-secondaire)' } : { color: 'var(--izishop-secondaire)' }}>
              <i className={`bi bi-grid-1x2-fill me-2 ${isActive('/dashboard') ? '' : 'text-muted'}`}></i> Vue d'ensemble
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard/produits" className={`nav-link rounded-3 d-flex align-items-center text-decoration-none ${isActive('/dashboard/produits') || isActive('/dashboard/ajouter-produit') ? 'fw-bold' : ''}`} style={isActive('/dashboard/produits') || isActive('/dashboard/ajouter-produit') ? { backgroundColor: 'rgba(251, 190, 36, 0.15)', color: 'var(--izishop-secondaire)' } : { color: 'var(--izishop-secondaire)' }}>
              <i className={`bi bi-box-seam me-2 ${isActive('/dashboard/produits') || isActive('/dashboard/ajouter-produit') ? '' : 'text-muted'}`}></i> Produits
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard/abonnement" className={`nav-link rounded-3 d-flex align-items-center text-decoration-none ${isActive('/dashboard/abonnement') ? 'fw-bold' : ''}`} style={isActive('/dashboard/abonnement') ? { backgroundColor: 'rgba(251, 190, 36, 0.15)', color: 'var(--izishop-secondaire)' } : { color: 'var(--izishop-secondaire)' }}>
              <i className={`bi bi-credit-card me-2 ${isActive('/dashboard/abonnement') ? '' : 'text-muted'}`}></i> Abonnement
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard/parametres" className={`nav-link rounded-3 d-flex align-items-center text-decoration-none ${isActive('/dashboard/parametres') ? 'fw-bold' : ''}`} style={isActive('/dashboard/parametres') ? { backgroundColor: 'rgba(251, 190, 36, 0.15)', color: 'var(--izishop-secondaire)' } : { color: 'var(--izishop-secondaire)' }}>
              <i className={`bi bi-gear me-2 ${isActive('/dashboard/parametres') ? '' : 'text-muted'}`}></i> Paramètres
            </Link>
          </li>
        </ul>
        <hr className="my-3" style={{ opacity: 0.1 }} />
        <div className="px-2">
          <div className="d-flex align-items-center mb-3 p-2 rounded-3 bg-light">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: 'var(--izishop-secondaire)', color: 'var(--izishop-blanc)', fontSize: '1.1rem' }}>
              {utilisateur?.nomComplet?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="overflow-hidden">
              <p className="mb-0 fw-bold text-truncate small" style={{ color: 'var(--izishop-secondaire)' }}>{utilisateur?.nomComplet}</p>
              <span className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>{boutique?.nomBoutique || 'Ma boutique'}</span>
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm w-100 rounded-3 border-0 d-flex align-items-center justify-content-center py-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--izishop-erreur)' }} onClick={handleDeconnexion}>
            <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 d-flex flex-column overflow-auto">
        <div className="d-lg-none bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top shadow-sm" style={{ zIndex: 1000 }}>
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', backgroundColor: 'var(--izishop-secondaire)', color: 'var(--izishop-blanc)', fontSize: '0.9rem' }}>
              {utilisateur?.nomComplet?.charAt(0).toUpperCase() || 'V'}
            </div>
            <span className="fw-bold small text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '120px' }}>{boutique?.nomBoutique || 'iziShop'}</span>
          </div>
          <button className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-erreur)' }} onClick={handleDeconnexion}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>

        <div className="p-3 p-md-4 p-lg-5 flex-grow-1">
          {message.text && (
            <div className={`alert alert-${message.type} border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3`} role="alert" style={{ animation: 'fadeIn 0.3s ease' }}>
              <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'info' ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <span className="small fw-medium">{message.text}</span>
              <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })} aria-label="Close"></button>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                <i className="bi bi-credit-card me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                Gestion de l'Abonnement
              </h1>
              <p className="text-muted small mb-0">Suivez votre période d'essai ou gérez votre plan payant.</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-arrow-left"></i> Retour au tableau de bord
            </button>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <div className="carte-izishop p-4 p-md-5 mb-4">
                <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-shield-check me-2 text-muted"></i>État de votre compte
                </h5>
                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: estEnEssai ? 'rgba(251, 190, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${estEnEssai ? 'rgba(251, 190, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
                      <small className="fw-bold text-uppercase" style={{ fontSize: '0.7rem', color: estEnEssai ? '#d97706' : 'var(--izishop-succes)' }}>Plan Actuel</small>
                      <h3 className="fw-bold mb-1 mt-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.8rem' }}>
                        {estEnEssai ? 'Essai Gratuit' : 'Plan PRO'}
                      </h3>
                      <p className="small text-muted mb-0">
                        {estEnEssai ? "45 jours d'essai offerts" : '5 000 FCFA / mois'}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: boutique?.estAbonnementActif ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                      <small className="fw-bold text-uppercase" style={{ fontSize: '0.7rem', color: boutique?.estAbonnementActif ? 'var(--izishop-succes)' : 'var(--izishop-erreur)' }}>Statut</small>
                      <h3 className="fw-bold mb-1 mt-1" style={{ color: boutique?.estAbonnementActif ? 'var(--izishop-succes)' : 'var(--izishop-erreur)', fontSize: '1.8rem' }}>
                        {boutique?.estAbonnementActif ? 'Actif' : 'Expiré'}
                      </h3>
                      <p className="small text-muted mb-0">
                        {boutique?.estAbonnementActif ? 'Votre boutique est en ligne' : 'Action requise'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--izishop-fond)' }}>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                    {estEnEssai ? "Fin de l'essai gratuit dans" : "Prochain renouvellement dans"}
                  </small>
                  <div className="my-2">
                    <span className="fw-bold" style={{ color: joursRestants <= 7 ? 'var(--izishop-erreur)' : 'var(--izishop-secondaire)', fontSize: '3rem' }}>
                      {joursRestants} <span style={{ fontSize: '1.5rem' }}>jours</span>
                    </span>
                  </div>
                  <p className="text-muted small mb-0">
                    <i className="bi bi-calendar-event me-1"></i>
                    Expire le {dateExpirationFormatee}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="carte-izishop p-4 p-md-5 mb-4" style={{ border: '2px solid var(--izishop-primaire)', position: 'relative', overflow: 'hidden' }}>
                {estEnEssai && (
                  <div className="position-absolute top-0 end-0 bg-warning text-dark fw-bold px-3 py-1 small" style={{ borderBottomLeftRadius: '8px' }}>
                    RECOMMANDÉ
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                    {estEnEssai ? 'Passer au plan PRO' : 'Renouveler mon abonnement'}
                  </h3>
                  <p className="text-muted small mb-0">Paiement sécurisé via Mobile Money</p>
                </div>
                <div className="text-center my-4 p-3 rounded-3" style={{ backgroundColor: 'var(--izishop-fond)' }}>
                  <span className="fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '3rem', lineHeight: '1' }}>5 000</span>
                  <span className="text-muted fw-bold ms-1">FCFA / mois</span>
                </div>
                
                {/* Conteneur invisible requis par le SDK FeexPay */}
                <div id="feexpay-render" style={{ display: 'none' }}></div>

                <div className="d-grid gap-3 mb-4">
                  <button 
                    className="bouton-principal py-3 d-flex align-items-center justify-content-center gap-2 fw-bold" 
                    onClick={() => lancerPaiementFeexPay(30)} 
                    disabled={actionEnCours}
                  >
                    {actionEnCours ? (
                      <><span className="spinner-border spinner-border-sm"></span><span>Traitement en cours...</span></>
                    ) : (
                      <>
                        <i className="bi bi-phone"></i>
                        <span>Payer avec Mobile Money</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-3 bg-light border d-flex align-items-start gap-2" style={{ borderStyle: 'dashed', borderColor: 'rgba(251, 190, 36, 0.3)' }}>
                  <i className="bi bi-shield-lock-fill text-warning flex-shrink-0 mt-1" style={{ fontSize: '0.85rem' }}></i>
                  <p className="text-muted mb-0 small" style={{ lineHeight: '1.4' }}>
                    Vos données sont protégées. Le paiement est traité de manière sécurisée par FeexPay (MTN, Moov, Wave, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Abonnement;