/* eslint-disable react-hooks/exhaustive-deps */
// Fichier: frontend/src/pages/dashboard/Abonnement.jsx
import React, { useState, useEffect } from 'react';
import {
  initierPaiement,
  validerNumeroMobileMoney,
  appliquerCodePromo,
} from '../../lib/api';
import { useData } from '../../context/DataContext';
import LayoutDashboard from '../../components/LayoutDashboard';

const R = '5px';
const basePlaceholderStyle = { backgroundColor: '#e9ecef', borderRadius: R };

const SkeletonHeader = () => (
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2 placeholder-glow">
    <div>
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '180px', height: '22px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '280px', height: '12px' }}></div>
    </div>
    <div className="d-flex gap-2"><div className="placeholder" style={{ ...basePlaceholderStyle, width: '160px', height: '30px', borderRadius: R }}></div></div>
  </div>
);

const SkeletonAbonnement = () => (
  <LayoutDashboard>
    <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
      <SkeletonHeader />
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="carte-izishop p-3 h-100 placeholder-glow" style={{ borderRadius: R }}>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '120px', height: '16px' }}></div>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '100%', height: '200px' }}></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="carte-izishop p-3 h-100 position-relative placeholder-glow" style={{ borderRadius: R, border: '2px solid var(--izishop-primaire)' }}>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '200px', height: '16px' }}></div>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '100%', height: '200px' }}></div>
          </div>
        </div>
      </div>
    </div>
  </LayoutDashboard>
);

const Abonnement = () => {
  // ✅ Données depuis le DataContext
  const { boutique, abonnement, chargement: chargementData, rafraichir } = useData();
  const providers = abonnement?.providers;
  const historique = abonnement?.historique || [];

  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [periode, setPeriode] = useState('MENSUEL');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [providerSelectionne, setProviderSelectionne] = useState(null);
  const [codePromo, setCodePromo] = useState('');
  const [remiseCodePromo, setRemiseCodePromo] = useState(null);
  const [applicationCodeEnCours, setApplicationCodeEnCours] = useState(false);

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // ❌ ANCIEN useEffect supprimé (chargeait boutique, providers, historique)

  // Sélectionner le premier provider automatiquement
  useEffect(() => {
    if (providers?.providers?.length > 0 && !providerSelectionne) {
      setProviderSelectionne(providers.providers[0]);
    }
  }, [providers]);

  useEffect(() => {
    setRemiseCodePromo(null);
    setCodePromo('');
  }, [periode]);

  const handleAppliquerCodePromo = async () => {
    if (!codePromo.trim()) return afficherMessage('warning', 'Veuillez saisir un code promo.');
    setApplicationCodeEnCours(true);
    try {
      const res = await appliquerCodePromo({ codePromo: codePromo.trim(), periode });
      if (res?.donnees) {
        setRemiseCodePromo(res.donnees);
        afficherMessage('success', `Code promo "${res.donnees.code}" appliqué avec succès !`);
      }
    } catch (err) {
      setRemiseCodePromo(null);
      afficherMessage('danger', err.message || 'Code promo invalide ou expiré.');
    } finally {
      setApplicationCodeEnCours(false);
    }
  };

  const retirerCodePromo = () => {
    setCodePromo('');
    setRemiseCodePromo(null);
  };

  const handlePayer = async (e) => {
    e.preventDefault();
    if (!telephone.trim()) return afficherMessage('danger', 'Numéro de téléphone requis.');
    if (!providerSelectionne) return afficherMessage('danger', 'Sélectionnez un provider.');

    setPaiementEnCours(true);
    try {
      const validation = await validerNumeroMobileMoney(telephone);
      if (!validation?.donnees?.valide) {
        afficherMessage('danger', 'Numéro invalide pour ce provider.');
        setPaiementEnCours(false);
        return;
      }
      const payload = {
        provider: providerSelectionne.code,
        telephone: validation.donnees.telephoneNormalise,
        periode,
      };
      if (remiseCodePromo?.code) payload.codePromo = remiseCodePromo.code;

      await initierPaiement(payload);
      afficherMessage('success', prixFinal === 0 ? 'Abonnement activé gratuitement !' : 'Paiement initié ! Confirmez sur votre téléphone.');
      setTelephone('');
      setCodePromo('');
      setRemiseCodePromo(null);

      // ✅ Rafraîchir depuis le context (au lieu de window.location.reload)
      setTimeout(async () => {
        await rafraichir(['boutique', 'abonnement']);
      }, 1500);
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors du paiement.');
    } finally {
      setPaiementEnCours(false);
    }
  };

  const formatMontant = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (chargementData) return <SkeletonAbonnement />;

  const estActif = boutique?.estAbonnementActif && new Date(boutique.dateExpirationAbonnement) > new Date();
  const joursRestants = boutique?.dateExpirationAbonnement
    ? Math.max(0, Math.ceil((new Date(boutique.dateExpirationAbonnement) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;
  const prixMensuel = providers?.abonnement?.prixMensuel || 8000;
  const prixAnnuel = providers?.abonnement?.prixAnnuel || 90000;
  const devise = providers?.abonnement?.devise || 'XOF';
  const prixAffiche = periode === 'ANNUEL' ? prixAnnuel : prixMensuel;
  const economie = periode === 'ANNUEL' && prixMensuel && prixAnnuel
    ? Math.round(((prixMensuel * 12 - prixAnnuel) / (prixMensuel * 12)) * 100)
    : 0;

  let montantRemise = 0;
  if (remiseCodePromo) {
    if (remiseCodePromo.typeRemise === 'POURCENTAGE') {
      montantRemise = Math.round((prixAffiche * remiseCodePromo.valeur) / 100);
    } else if (remiseCodePromo.typeRemise === 'MONTANT_FIXE') {
      montantRemise = Math.min(remiseCodePromo.valeur, prixAffiche);
    } else if (remiseCodePromo.typeRemise === 'GRATUIT') {
      montantRemise = prixAffiche;
    }
  }
  const prixFinal = Math.max(0, prixAffiche - montantRemise);

  const getBadgeStatut = (statut) => {
    const map = {
      'REUSSI': { bg: 'rgba(16, 185, 129, 0.15)', color: '#047857', label: 'Réussi' },
      'EN_ATTENTE': { bg: 'rgba(251, 190, 36, 0.2)', color: '#B45309', label: 'En attente' },
      'ECHEC': { bg: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', label: 'Échec' },
    };
    return map[statut] || { bg: '#F3F4F6', color: '#6B7280', label: statut };
  };

  return (
    <LayoutDashboard>
      <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-credit-card me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
              Mon Abonnement
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>Gérez votre abonnement et consultez votre historique de paiements.</p>
          </div>
          <button className="btn btn-sm d-flex align-items-center gap-1" onClick={() => (window.location.href = '/dashboard')} style={{ borderRadius: R, borderWidth: '1px', borderColor: 'var(--izishop-secondaire)', color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>
            <i className="bi bi-arrow-left"></i> Retour au tableau de bord
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2`} style={{ borderRadius: R, animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'}`} style={{ fontSize: '0.9rem' }}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="carte-izishop p-3 h-100" style={{ borderRadius: R }}>
              <h5 className="fw-bold mb-2 pb-1 border-bottom" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                <i className="bi bi-shield-check me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                Statut actuel
              </h5>
              <div className="p-3 text-center mb-2" style={{ borderRadius: R, backgroundColor: estActif ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${estActif ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: estActif ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                  <i className={`bi ${estActif ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-5`} style={{ color: estActif ? 'var(--izishop-succes)' : 'var(--izishop-erreur)' }}></i>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.15rem' }}>{estActif ? 'Actif' : 'Expiré / Inactif'}</h4>
                <div className="d-flex justify-content-center gap-2 mb-1">
                  <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.7rem', fontWeight: 600 }}>
                    {boutique?.planAbonnement || 'GRATUIT'}
                  </span>
                </div>
                {estActif ? (
                  <div className="mt-2">
                    <small className="text-muted d-block mb-0" style={{ fontSize: '0.7rem' }}>Expire dans</small>
                    <div className="fw-bold" style={{ fontSize: '1.5rem', color: joursRestants <= 7 ? 'var(--izishop-erreur)' : 'var(--izishop-secondaire)', lineHeight: '1.1' }}>
                      {joursRestants} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>jour{joursRestants > 1 ? 's' : ''}</span>
                    </div>
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}><i className="bi bi-calendar-event me-1"></i>{formatDate(boutique.dateExpirationAbonnement)}</small>
                  </div>
                ) : (
                  <p className="small text-danger mb-0 mt-1" style={{ fontSize: '0.72rem' }}><i className="bi bi-exclamation-circle me-1"></i>Votre boutique n'est plus visible par vos clients.</p>
                )}
              </div>
              {estActif && (
                <div>
                  <h6 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>
                    <i className="bi bi-star-fill me-1" style={{ color: 'var(--izishop-primaire)', fontSize: '0.7rem' }}></i>
                    Avantages PRO actifs
                  </h6>
                  <div className="d-flex flex-column gap-1">
                    {[
                      { icon: 'bi-infinity', label: 'Produits illimités' },
                      { icon: 'bi-graph-up-arrow', label: 'Statistiques avancées' },
                      { icon: 'bi-file-earmark-pdf', label: 'Reçus PDF automatiques' },
                      { icon: 'bi-headset', label: 'Support prioritaire' },
                      { icon: 'bi-search', label: 'SEO complet' },
                    ].map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 p-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: R, border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                        <i className={`bi ${item.icon}`} style={{ color: 'var(--izishop-succes)', fontSize: '0.8rem' }}></i>
                        <span className="fw-medium" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.75rem' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="carte-izishop p-3 h-100 position-relative" style={{ borderRadius: R, border: '2px solid var(--izishop-primaire)' }}>
              {!estActif && (
                <div className="position-absolute top-0 end-0 fw-bold px-2 py-1" style={{ backgroundColor: 'var(--izishop-primaire)', color: 'var(--izishop-secondaire)', fontSize: '0.6rem', borderRadius: `0 ${R} 0 ${R}`, letterSpacing: '0.5px' }}>RECOMMANDÉ</div>
              )}
              <h5 className="fw-bold mb-2 pb-1 border-bottom" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                <i className="bi bi-lightning-charge-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                {estActif ? 'Renouveler' : 'Activer'} l'abonnement PRO
              </h5>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <button type="button" className="w-100 p-2 d-flex flex-column align-items-start gap-0 transition-all" style={{ backgroundColor: periode === 'MENSUEL' ? 'var(--izishop-secondaire)' : 'rgba(30, 41, 59, 0.04)', color: periode === 'MENSUEL' ? 'white' : 'var(--izishop-secondaire)', border: periode === 'MENSUEL' ? '2px solid var(--izishop-secondaire)' : '2px solid transparent', borderRadius: R, cursor: 'pointer' }} onClick={() => setPeriode('MENSUEL')}>
                    <span className="fw-bold" style={{ fontSize: '0.78rem' }}>Mensuel</span>
                    <span style={{ fontSize: '0.7rem' }} className={periode === 'MENSUEL' ? 'text-white-50' : 'text-muted'}>{formatMontant(prixMensuel)} {devise}/mois</span>
                  </button>
                </div>
                <div className="col-6 position-relative">
                  <button type="button" className="w-100 p-2 d-flex flex-column align-items-start gap-0 transition-all" style={{ backgroundColor: periode === 'ANNUEL' ? 'var(--izishop-secondaire)' : 'rgba(30, 41, 59, 0.04)', color: periode === 'ANNUEL' ? 'white' : 'var(--izishop-secondaire)', border: periode === 'ANNUEL' ? '2px solid var(--izishop-secondaire)' : '2px solid transparent', borderRadius: R, cursor: 'pointer' }} onClick={() => setPeriode('ANNUEL')}>
                    <div className="d-flex align-items-center gap-1 w-100">
                      <span className="fw-bold" style={{ fontSize: '0.78rem' }}>Annuel</span>
                      <span className="badge" style={{ backgroundColor: 'rgba(251, 190, 36, 0.2)', color: '#B45309', borderRadius: R, fontSize: '0.55rem', fontWeight: 700 }}>POPULAIRE</span>
                    </div>
                    <span style={{ fontSize: '0.7rem' }} className={periode === 'ANNUEL' ? 'text-white-50' : 'text-muted'}>{formatMontant(prixAnnuel)} {devise}/an</span>
                  </button>
                  {economie > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge" style={{ backgroundColor: 'var(--izishop-succes)', color: 'white', borderRadius: R, fontSize: '0.6rem', fontWeight: 700, padding: '3px 6px' }}>-{economie}%</span>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem', color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-tag-fill me-1" style={{ color: 'var(--izishop-primaire)', fontSize: '0.7rem' }}></i>Code promo<span className="text-muted fw-normal ms-1">(optionnel)</span>
                </label>
                {!remiseCodePromo ? (
                  <div className="d-flex gap-2">
                    <input type="text" className="form-control form-control-sm bg-light border-1" style={{ borderRadius: R, fontSize: '0.8rem', textTransform: 'uppercase' }} value={codePromo} onChange={(e) => setCodePromo(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAppliquerCodePromo(); } }} disabled={applicationCodeEnCours} />
                    <button type="button" className="btn btn-sm fw-bold px-2 d-flex align-items-center gap-1" style={{ backgroundColor: 'var(--izishop-secondaire)', color: 'white', borderRadius: R, fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={handleAppliquerCodePromo} disabled={applicationCodeEnCours || !codePromo.trim()}>
                      {applicationCodeEnCours ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check2"></i><span>Appliquer</span></>}
                    </button>
                  </div>
                ) : (
                  <div className="p-1 px-2 d-flex align-items-center justify-content-between gap-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: R }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', flexShrink: 0 }}>
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--izishop-succes)', fontSize: '0.75rem' }}></i>
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: 'var(--izishop-succes)', fontSize: '0.78rem' }}>{remiseCodePromo.code}</div>
                        <small className="text-muted" style={{ fontSize: '0.62rem' }}>{remiseCodePromo.description || `-${formatMontant(montantRemise)} ${devise}`}</small>
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--izishop-erreur)', border: 'none', flexShrink: 0 }} onClick={retirerCodePromo} title="Retirer le code">
                      <i className="bi bi-x" style={{ fontSize: '0.7rem' }}></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2 mb-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(251, 190, 36, 0.08)', border: '1px dashed rgba(251, 190, 36, 0.4)', borderRadius: R }}>
                <div>
                  <small className="text-muted fw-bold d-block" style={{ fontSize: '0.62rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Montant total</small>
                  <small className="text-muted" style={{ fontSize: '0.68rem' }}>Durée : {periode === 'ANNUEL' ? '365 jours' : '30 jours'}</small>
                  {montantRemise > 0 && <small className="d-block mt-0" style={{ fontSize: '0.62rem', color: 'var(--izishop-succes)', fontWeight: 600 }}><i className="bi bi-tag-fill me-1"></i>Remise : -{formatMontant(montantRemise)} {devise}</small>}
                </div>
                <div className="text-end">
                  {montantRemise > 0 && <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.72rem', lineHeight: '1' }}>{formatMontant(prixAffiche)}</div>}
                  <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--izishop-primaire)', lineHeight: '1' }}>{formatMontant(prixFinal)}</div>
                  <small className="text-muted fw-medium" style={{ fontSize: '0.68rem' }}>{devise}</small>
                </div>
              </div>

              <form onSubmit={handlePayer}>
                <div className="mb-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem', color: 'var(--izishop-secondaire)' }}>
                    <i className="bi bi-phone me-1" style={{ color: 'var(--izishop-primaire)', fontSize: '0.7rem' }}></i>Provider Mobile Money
                  </label>
                  <div className="d-flex flex-wrap justify-content-center gap-2 p-2" style={{ backgroundColor: 'rgba(30, 41, 59, 0.03)', borderRadius: R }}>
                    {providers?.providers?.map(p => {
                      const estSelectionne = providerSelectionne?.code === p.code;
                      return (
                        <button key={p.code} type="button" className="d-flex flex-column align-items-center gap-1 p-0 border-0 bg-transparent" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setProviderSelectionne(p)} title={p.nom}>
                          <div className="d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: estSelectionne ? 'var(--izishop-primaire)' : 'white', border: estSelectionne ? '3px solid var(--izishop-secondaire)' : '2px solid rgba(79, 82, 43, 0.15)', boxShadow: estSelectionne ? '0 3px 10px rgba(251, 190, 36, 0.4)' : '0 2px 4px rgba(79, 79, 73, 0.08)', transition: 'all 0.2s ease', overflow: 'hidden' }}>
                            {p.logo ? (
                              <img src={p.logo} alt={p.nom} style={{ width: '32px', height: '32px', objectFit: 'contain', filter: estSelectionne ? 'none' : 'grayscale(20%)' }} />
                            ) : (
                              <i className="bi bi-phone-fill" style={{ color: estSelectionne ? 'var(--izishop-secondaire)' : '#94a3b8', fontSize: '1rem' }}></i>
                            )}
                          </div>
                          <span className="fw-bold text-center" style={{ fontSize: '0.65rem', color: estSelectionne ? 'var(--izishop-secondaire)' : '#64748b', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
                          {estSelectionne && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--izishop-primaire)' }}></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem', color: 'var(--izishop-secondaire)' }}>
                    <i className="bi bi-telephone me-1" style={{ color: 'var(--izishop-primaire)', fontSize: '0.7rem' }}></i>Numéro Mobile Money
                  </label>
                  <input type="tel" className="form-control form-control-sm bg-light border-1" style={{ borderRadius: R, fontSize: '0.85rem' }} value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.62rem' }}><i className="bi bi-info-circle me-1"></i>Vous recevrez une demande de confirmation sur ce numéro.</small>
                </div>

                <button type="submit" className="bouton-principal w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: R, fontSize: '0.82rem' }} disabled={paiementEnCours || !providerSelectionne}>
                  {paiementEnCours ? <><span className="spinner-border spinner-border-sm"></span><span>Initiation en cours...</span></> : <><i className="bi bi-credit-card-fill"></i><span>{prixFinal === 0 ? 'Confirmer (gratuit)' : `Payer ${formatMontant(prixFinal)} ${devise}`}</span></>}
                </button>

                <div className="mt-2 p-1 d-flex align-items-center justify-content-center gap-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.04)', borderRadius: R, border: '1px solid rgba(30, 41, 59, 0.08)' }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: '#64748b', fontSize: '0.65rem' }}></i>
                  <small className="text-muted fw-medium" style={{ fontSize: '0.62rem' }}>Paiement 100% sécurisé</small>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="carte-izishop p-3 mt-3" style={{ borderRadius: R }}>
          <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
              <i className="bi bi-clock-history me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
              Historique des paiements
            </h5>
            {historique.length > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.65rem' }}>
                {historique.length} transaction{historique.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {historique.length === 0 ? (
            <div className="text-center py-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.1)' }}>
                <i className="bi bi-inbox fs-4" style={{ color: 'var(--izishop-primaire)' }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.82rem' }}>Aucun paiement enregistré</h6>
              <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>Vos transactions apparaîtront ici.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                    <th className="border-0 py-2 fw-semibold">Date</th>
                    <th className="border-0 py-2 fw-semibold">Montant</th>
                    <th className="border-0 py-2 fw-semibold">Période</th>
                    <th className="border-0 py-2 fw-semibold">Provider</th>
                    <th className="border-0 py-2 fw-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map(p => {
                    const badge = getBadgeStatut(p.statut);
                    return (
                      <tr key={p.id} style={{ transition: 'background-color 0.2s ease' }}>
                        <td className="py-2"><div className="fw-medium" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.72rem' }}>{formatDate(p.dateCreation)}</div></td>
                        <td className="py-2">
                          <span className="fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.75rem' }}>{formatMontant(p.montant)}</span>
                          <small className="text-muted ms-1" style={{ fontSize: '0.62rem' }}>{p.devise}</small>
                        </td>
                        <td className="py-2">
                          <span className="badge px-1 py-0" style={{ backgroundColor: 'rgba(30, 41, 59, 0.06)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.62rem', fontWeight: 600 }}>
                            {p.periodeFacturation === 'ANNUEL' ? 'Annuel' : 'Mensuel'}
                          </span>
                        </td>
                        <td className="py-2"><small className="text-muted fw-medium" style={{ fontSize: '0.68rem' }}>{p.providerPawapay || '-'}</small></td>
                        <td className="py-2">
                          <span className="badge d-inline-flex align-items-center gap-1 px-1 py-0" style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: R, fontSize: '0.62rem', fontWeight: 600 }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: badge.color }}></span>{badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Abonnement;