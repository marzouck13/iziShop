// Fichier: frontend/src/pages/dashboard/Dashboard.jsx
// Dashboard reconstruit — utilise le DataContext (0 requête API directe)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import LayoutDashboard from '../../components/LayoutDashboard';
import { SkeletonDashboard } from '../../components/SkeletonLoader';

const RAYON = '5px';

const getBadgeClassement = (rang) => {
  if (rang === 1) {
    return {
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#7C2D12',
      icon: 'bi-trophy-fill',
      shadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
    };
  }
  if (rang === 2) {
    return {
      bg: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
      color: '#1E293B',
      icon: 'bi-award-fill',
      shadow: '0 2px 6px rgba(192, 192, 192, 0.4)'
    };
  }
  if (rang === 3) {
    return {
      bg: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
      color: '#FFFFFF',
      icon: 'bi-award-fill',
      shadow: '0 2px 6px rgba(205, 127, 50, 0.4)'
    };
  }
  return {
    bg: 'var(--izishop-fond)',
    color: 'var(--izishop-secondaire)',
    icon: 'bi-hash',
    shadow: 'none'
  };
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ DONNÉES DEPUIS LE CONTEXT (0 requête API)
  const { boutique, stats, commandes, produits, chargement } = useData();

  const formatMontant = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const formatNombre = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

  const estExpire = boutique && boutique.dateExpirationAbonnement && new Date(boutique.dateExpirationAbonnement) < new Date();
  const joursRestants = boutique?.dateExpirationAbonnement
    ? Math.max(0, Math.ceil((new Date(boutique.dateExpirationAbonnement) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const produitsStockFaible = (produits || []).filter(p => p.quantiteEnStock <= 5 && !p.estArchive).slice(0, 5);

  const topProduits = [...(produits || [])]
    .filter(p => !p.estArchive && p.estDisponible)
    .sort((a, b) => (b.nombreDeClicsWhatsApp || 0) - (a.nombreDeClicsWhatsApp || 0))
    .slice(0, 10);

  const totalVues = boutique?.totalVues || 0;
  const totalClics = boutique?.totalClicsWhatsApp || 0;
  const tauxConversion = totalVues > 0 ? ((totalClics / totalVues) * 100).toFixed(1) : '0.0';

  const getBadgeStatut = (statut) => {
    const map = {
      NOUVELLE: { bg: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', icon: 'bi-bell-fill', label: 'Nouvelle' },
      EN_DISCUSSION: { bg: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED', icon: 'bi-chat-dots-fill', label: 'Discussion' },
      CONFIRMEE: { bg: 'rgba(251, 190, 36, 0.2)', color: '#B45309', icon: 'bi-check-circle-fill', label: 'Confirmée' },
      EN_PREPARATION: { bg: 'rgba(249, 115, 22, 0.15)', color: '#C2410C', icon: 'bi-box-seam-fill', label: 'Préparation' },
      EXPEDIEE: { bg: 'rgba(14, 165, 233, 0.15)', color: '#0369A1', icon: 'bi-truck', label: 'Expédiée' },
      LIVREE: { bg: 'rgba(16, 185, 129, 0.15)', color: '#047857', icon: 'bi-check2-all', label: 'Livrée' },
      ANNULEE: { bg: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', icon: 'bi-x-circle-fill', label: 'Annulée' },
    };
    return map[statut] || { bg: '#F3F4F6', color: '#6B7280', icon: 'bi-circle', label: statut };
  };

  if (chargement) {
    return (
      <LayoutDashboard>
        <SkeletonDashboard />
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="p-3 p-md-4">
        {/* EN-TÊTE */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
              {boutique?.nomBoutique || 'Vendeur'}
            </h1>
            <p className="text-muted small mb-0">Voici un aperçu de votre activité du jour.</p>
          </div>
          <div className="d-flex gap-2">
            <a
              href={`/boutique/${boutique?.sousDomaine || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2"
              style={{ borderRadius: RAYON }}
            >
              <i className="bi bi-box-arrow-up-right"></i>
              <span className="d-none d-sm-inline">Voir ma boutique</span>
            </a>
            <Link
              to="/dashboard/produits/ajouter"
              className="bouton-principal btn-sm px-3 text-decoration-none d-inline-flex align-items-center gap-2 fw-bold"
              style={{ borderRadius: RAYON }}
            >
              <i className="bi bi-plus-lg"></i> Ajouter un produit
            </Link>
          </div>
        </div>

        {/* ALERTES ABONNEMENT */}
        {estExpire && (
          <div
            className="alert d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid var(--izishop-erreur)', borderRadius: RAYON }}
          >
            <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--izishop-erreur)' }}></i>
            <div className="flex-grow-1">
              <strong className="small" style={{ color: 'var(--izishop-secondaire)' }}>Abonnement expiré.</strong>
              <span className="small text-muted ms-1">Renouvelez pour rendre votre boutique visible.</span>
            </div>
            <Link to="/dashboard/abonnement" className="btn btn-sm fw-bold text-white" style={{ backgroundColor: 'var(--izishop-erreur)', borderRadius: RAYON }}>
              Renouveler
            </Link>
          </div>
        )}
        {!estExpire && joursRestants <= 7 && joursRestants > 0 && (
          <div
            className="alert d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2"
            style={{ backgroundColor: 'rgba(251, 190, 36, 0.1)', borderLeft: '4px solid var(--izishop-primaire)', borderRadius: RAYON }}
          >
            <i className="bi bi-clock-history" style={{ color: '#B45309' }}></i>
            <div className="flex-grow-1">
              <strong className="small" style={{ color: 'var(--izishop-secondaire)' }}>
                Abonnement expire dans {joursRestants} jour{joursRestants > 1 ? 's' : ''}.
              </strong>
              <span className="small text-muted ms-1">Renouvelez pour éviter toute interruption.</span>
            </div>
            <Link to="/dashboard/abonnement" className="btn btn-sm fw-bold" style={{ backgroundColor: 'var(--izishop-primaire)', color: 'var(--izishop-secondaire)', borderRadius: RAYON }}>
              Renouveler
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-xl-3">
            <div className="carte-izishop p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(251, 190, 36, 0.15)', borderRadius: RAYON }}>
                  <i className="bi bi-bag-fill" style={{ color: 'var(--izishop-primaire)' }}></i>
                </div>
                <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--izishop-succes)', borderRadius: RAYON, fontSize: '0.65rem' }}>Total</span>
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.5rem' }}>
                {stats?.totalCommandes || 0}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Commandes totales</p>
              <div className="d-flex gap-2 mt-2 pt-2 border-top" style={{ fontSize: '0.7rem' }}>
                <span className="text-muted"><i className="bi bi-check-circle text-success me-1"></i>{stats?.parStatut?.LIVREE || 0} livrées</span>
                <span className="text-muted"><i className="bi bi-hourglass-split text-warning me-1"></i>{stats?.parStatut?.NOUVELLE || 0} nouvelles</span>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="carte-izishop p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: RAYON }}>
                  <i className="bi bi-cash-stack" style={{ color: 'var(--izishop-succes)' }}></i>
                </div>
                <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--izishop-succes)', borderRadius: RAYON, fontSize: '0.65rem' }}>CA</span>
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.5rem' }}>
                {formatMontant(stats?.chiffreAffaires?.totalLivrees || 0)}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{boutique?.devise || 'FCFA'} (Livrées)</p>
              <div className="d-flex gap-2 mt-2 pt-2 border-top" style={{ fontSize: '0.7rem' }}>
                <span className="text-muted"><i className="bi bi-clock-history text-info me-1"></i>{formatMontant(stats?.chiffreAffaires?.enCours || 0)} en cours</span>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="carte-izishop p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(96, 165, 250, 0.15)', borderRadius: RAYON }}>
                  <i className="bi bi-eye-fill" style={{ color: 'var(--izishop-accent)' }}></i>
                </div>
                <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)', color: 'var(--izishop-accent)', borderRadius: RAYON, fontSize: '0.65rem' }}>Visibilité</span>
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.5rem' }}>
                {formatNombre(boutique?.totalVues)}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Vues sur la boutique</p>
              <div className="d-flex gap-2 mt-2 pt-2 border-top" style={{ fontSize: '0.7rem' }}>
                <span className="text-muted"><i className="bi bi-whatsapp text-success me-1"></i>{formatNombre(boutique?.totalClicsWhatsApp)} clics</span>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="carte-izishop p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(139, 92, 246, 0.15)', borderRadius: RAYON }}>
                  <i className="bi bi-graph-up-arrow" style={{ color: '#7C3AED' }}></i>
                </div>
                <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED', borderRadius: RAYON, fontSize: '0.65rem' }}>Conversion</span>
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.5rem' }}>
                {tauxConversion}%
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Taux de conversion</p>
              <div className="d-flex gap-2 mt-2 pt-2 border-top" style={{ fontSize: '0.7rem' }}>
                <span className="text-muted"><i className="bi bi-box-seam me-1"></i>{(produits || []).filter(p => !p.estArchive).length} produits actifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* RÉPARTITION */}
        <div className="carte-izishop p-3 mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-bar-chart-fill" style={{ color: 'var(--izishop-primaire)' }}></i>
            <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>Répartition des commandes</h6>
          </div>
          <div className="row g-2">
            {['NOUVELLE', 'CONFIRMEE', 'EN_PREPARATION', 'LIVREE', 'ANNULEE'].map(statut => {
              const count = stats?.parStatut?.[statut] || 0;
              const total = stats?.totalCommandes || 1;
              const pct = ((count / total) * 100).toFixed(0);
              const badge = getBadgeStatut(statut);
              return (
                <div key={statut} className="col-6 col-md">
                  <div className="p-2" style={{ backgroundColor: badge.bg, border: '1px solid rgba(0,0,0,0.03)', borderRadius: RAYON }}>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <i className={`bi ${badge.icon}`} style={{ color: badge.color, fontSize: '0.8rem' }}></i>
                      <small className="fw-bold" style={{ color: badge.color, fontSize: '0.7rem' }}>{badge.label}</small>
                      <span className="ms-auto fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>{count}</span>
                    </div>
                    <div className="progress" style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: RAYON }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: badge.color, borderRadius: RAYON }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONE BAS */}
        <div className="row g-3">
          <div className="col-xl-8">
            <div className="carte-izishop p-3 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.95rem' }}>
                    <i className="bi bi-bag-check me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                    Commandes récentes
                  </h6>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Les 5 dernières commandes reçues</small>
                </div>
                <Link to="/dashboard/commandes" className="btn btn-sm btn-outline-dark" style={{ borderRadius: RAYON }}>
                  Tout voir <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '350px' }}>
                {(commandes || []).length === 0 ? (
                  <div className="text-center py-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(251, 190, 36, 0.1)', borderRadius: RAYON }}>
                      <i className="bi bi-inbox fs-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>Aucune commande pour le moment</h6>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>Partagez votre boutique pour recevoir vos premières commandes.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-sm align-middle mb-0">
                      <thead>
                        <tr className="text-muted border-bottom" style={{ fontSize: '0.7rem' }}>
                          <th className="ps-0 py-2">Commande</th>
                          <th className="py-2">Client</th>
                          <th className="py-2">Montant</th>
                          <th className="py-2">Statut</th>
                          <th className="text-end pe-0 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandes.map(cmd => {
                          const badge = getBadgeStatut(cmd.statut);
                          return (
                            <tr key={cmd.id}>
                              <td className="ps-0 py-2">
                                <span className="fw-bold small" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.8rem' }}>{cmd.numeroCommande}</span>
                              </td>
                              <td className="py-2">
                                <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>{cmd.nomClient}</div>
                                <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{cmd.telephoneClient}</small>
                              </td>
                              <td className="fw-bold small py-2" style={{ fontSize: '0.8rem' }}>
                                {formatMontant(cmd.montantTotal)} <small className="text-muted fw-normal">{boutique?.devise || 'FCFA'}</small>
                              </td>
                              <td className="py-2">
                                <span className="badge px-2 py-1" style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: RAYON, fontSize: '0.65rem' }}>
                                  <i className={`bi ${badge.icon} me-1`}></i>{badge.label}
                                </span>
                              </td>
                              <td className="text-end pe-0 py-2">
                                <button onClick={() => navigate(`/dashboard/commandes/${cmd.id}`)} className="btn btn-sm btn-outline-dark" style={{ borderRadius: RAYON }}>
                                  <i className="bi bi-eye"></i>
                                </button>
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
          </div>

          <div className="col-xl-4 d-flex flex-column gap-3">
            {produitsStockFaible.length > 0 && (
              <div className="carte-izishop p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--izishop-erreur)', fontSize: '0.9rem' }}></i>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>Stock faible</h6>
                </div>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  {produitsStockFaible.map(p => (
                    <div key={p.id} className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: RAYON }}>
                      <span className="small text-truncate" style={{ maxWidth: '60%', fontSize: '0.75rem' }}>{p.nomProduit}</span>
                      <span className="badge bg-danger" style={{ borderRadius: RAYON, fontSize: '0.65rem' }}>
                        {p.quantiteEnStock} restant{p.quantiteEnStock > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="carte-izishop p-3 flex-grow-1 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.95rem' }}>
                    <i className="bi bi-trophy-fill me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                    Top 10 des ventes
                  </h6>
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>Classés par clics WhatsApp</small>
                </div>
                <Link to="/dashboard/produits" className="btn btn-sm btn-outline-dark" style={{ borderRadius: RAYON }}>
                  Tout voir <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '380px' }}>
                {topProduits.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px', backgroundColor: 'rgba(251, 190, 36, 0.1)', borderRadius: RAYON }}>
                      <i className="bi bi-trophy" style={{ color: 'var(--izishop-primaire)', fontSize: '1.3rem' }}></i>
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                      Aucun produit classé.<br />Partagez votre boutique pour commencer !
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {topProduits.map((p, idx) => {
                      const rang = idx + 1;
                      const badgeStyle = getBadgeClassement(rang);
                      const isPodium = rang <= 3;
                      return (
                        <div
                          key={p.id}
                          className="d-flex align-items-center gap-2 p-2"
                          style={{
                            backgroundColor: isPodium ? 'rgba(251, 190, 36, 0.05)' : 'transparent',
                            border: isPodium ? '1px solid rgba(251, 190, 36, 0.2)' : '1px solid transparent',
                            borderRadius: RAYON,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => navigate('/dashboard/produits')}
                        >
                          <div className="position-relative" style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                            {p.urlImagePrincipale ? (
                              <img src={p.urlImagePrincipale} alt={p.nomProduit} className="w-100 h-100" style={{ objectFit: 'cover', borderRadius: RAYON, border: isPodium ? `2px solid ${rang === 1 ? '#FFD700' : rang === 2 ? '#C0C0C0' : '#CD7F32'}` : '1px solid rgba(0,0,0,0.08)' }} />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--izishop-fond)', borderRadius: RAYON, border: isPodium ? `2px solid ${rang === 1 ? '#FFD700' : rang === 2 ? '#C0C0C0' : '#CD7F32'}` : '1px solid rgba(0,0,0,0.08)' }}>
                                <i className="bi bi-box-seam text-muted"></i>
                              </div>
                            )}
                            <span
                              className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                top: '-6px', left: '-6px', width: '20px', height: '20px',
                                background: badgeStyle.bg, color: badgeStyle.color,
                                fontSize: rang <= 3 ? '0.55rem' : '0.6rem',
                                borderRadius: '50%', boxShadow: badgeStyle.shadow,
                                border: isPodium ? '2px solid white' : '1px solid rgba(0,0,0,0.1)', zIndex: 2
                              }}
                            >
                              {isPodium ? <i className={`bi ${badgeStyle.icon}`} style={{ fontSize: '0.6rem' }}></i> : rang}
                            </span>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-semibold text-truncate" style={{ fontSize: '0.8rem', color: isPodium ? 'var(--izishop-secondaire)' : '#475569' }} title={p.nomProduit}>
                              {p.nomProduit}
                            </div>
                            <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.65rem' }}>
                              <span className="d-flex align-items-center gap-1"><i className="bi bi-eye"></i>{formatNombre(p.nombreDeVues || 0)}</span>
                              <span className="d-flex align-items-center gap-1" style={{ color: '#25D366' }}><i className="bi bi-whatsapp"></i><strong>{formatNombre(p.nombreDeClicsWhatsApp || 0)}</strong></span>
                            </div>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <div className="fw-bold" style={{ color: 'var(--izishop-primaire)', fontSize: '0.8rem' }}>{formatMontant(p.prix)}</div>
                            <small className="text-muted" style={{ fontSize: '0.6rem' }}>{boutique?.devise || 'FCFA'}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {topProduits.length > 0 && (
                <div className="d-flex align-items-center justify-content-center gap-3 mt-2 pt-2 border-top" style={{ fontSize: '0.6rem' }}>
                  <span className="d-flex align-items-center gap-1"><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}></span><span className="text-muted">Or</span></span>
                  <span className="d-flex align-items-center gap-1"><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' }}></span><span className="text-muted">Argent</span></span>
                  <span className="d-flex align-items-center gap-1"><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)' }}></span><span className="text-muted">Bronze</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Dashboard;