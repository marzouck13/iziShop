// Fichier: frontend/src/pages/DashboardVendeur.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenirMaBoutique, basculerVisibiliteBoutique } from '../lib/api';

const DashboardVendeur = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const [lienCopie, setLienCopie] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const reponse = await obtenirMaBoutique();
        setBoutique(reponse.donnees);
      } catch (err) {
        setErreur('Impossible de charger les données de votre boutique. Vérifiez votre connexion.');
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    chargerDonnees();
  }, []);

  const gererVisibilite = async () => {
    try {
      setActionEnCours(true);
      const reponse = await basculerVisibiliteBoutique();
      setBoutique((prev) => ({ ...prev, estVisible: reponse.donnees.estVisible }));
    } catch (err) {
      alert(err.message || 'Une erreur est survenue lors du changement de visibilité.');
    } finally {
      setActionEnCours(false);
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  const copierLienBoutique = () => {
    const lien = `${window.location.origin}/boutique/${boutique?.sousDomaine || 'ma-boutique'}`;
    navigator.clipboard.writeText(lien).then(() => {
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    });
  };

  const produits = boutique?.produits || [];
  const nombreProduits = produits.length;
  const produitsActifs = produits.filter((p) => p.estDisponible && !p.estArchive).length;
  const totalVues = produits.reduce((acc, prod) => acc + (prod.nombreDeVues || 0), 0);
  const totalClicsWhatsApp = produits.reduce((acc, prod) => acc + (prod.nombreDeClicsWhatsApp || 0), 0);
  const devise = boutique?.devise || 'FCFA';

  const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix);
  const formatNombre = (nb) => new Intl.NumberFormat('fr-FR').format(nb);
  
  const dateExpiration = boutique?.dateExpirationAbonnement ? new Date(boutique.dateExpirationAbonnement) : null;
  const aujourdHui = new Date();
  let joursRestants = 0;
  const estEnEssai = boutique?.planAbonnement === 'GRATUIT';

  if (boutique?.estAbonnementActif && dateExpiration) {
    const dateExpSansHeure = new Date(dateExpiration.getFullYear(), dateExpiration.getMonth(), dateExpiration.getDate());
    const aujourdhuiSansHeure = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
    const diffTime = dateExpSansHeure.getTime() - aujourdhuiSansHeure.getTime();
    joursRestants = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else {
    joursRestants = 0;
  }

  if (chargement) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--izishop-primaire)' }}></div>
          <p className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="container py-5">
        <div className="carte-izishop p-5 text-center mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-exclamation-triangle-fill display-4 mb-3" style={{ color: 'var(--izishop-erreur)' }}></i>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)' }}>Erreur d'accès</h5>
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
          <div className="d-flex gap-2">
            <Link to="/dashboard/produits" className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-box-seam"></i>
            </Link>
            <Link to="/dashboard/parametres" className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-gear"></i>
            </Link>
          </div>
        </div>

        <div className="p-3 p-md-4 p-lg-5 flex-grow-1">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                Ravi de vous revoir, {utilisateur?.nomComplet?.split(' ')[0]} 
              </h1>
              <p className="text-muted small mb-0">Aperçu analytique et gestion en temps réel de votre activité.</p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <a href={`/boutique/${boutique?.sousDomaine || 'ma-boutique'}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light d-flex align-items-center gap-1 text-decoration-none">
                <i className="bi bi-box-arrow-up-right"></i> <span className="d-none d-sm-inline">Visiter</span>
              </a>
              <button className="btn btn-sm btn-light d-flex align-items-center gap-1 text-decoration-none" style={{ color: 'var(--izishop-secondaire)', border: '1px solid rgba(30, 41, 59, 0.1)' }} onClick={copierLienBoutique}>
                <i className={`bi ${lienCopie ? 'bi-check-circle-fill text-success' : 'bi-link-45deg'}`}></i> 
                <span className="d-none d-sm-inline">{lienCopie ? 'Copié !' : 'Copier'}</span>
              </button>
              <button className="btn btn-sm btn-light d-flex align-items-center gap-1 text-decoration-none" style={{ color: 'var(--izishop-secondaire)', border: '1px solid rgba(30, 41, 59, 0.1)' }} onClick={gererVisibilite} disabled={actionEnCours}>
                {actionEnCours ? <span className="spinner-border spinner-border-sm"></span> : <i className={`bi ${boutique?.estVisible ? 'bi-eye-slash' : 'bi-eye'}`}></i>}
                <span className="d-none d-sm-inline">{boutique?.estVisible ? 'Masquer' : 'Publier'}</span>
              </button>
              <button className="bouton-principal btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/dashboard/ajouter-produit')}>
                <i className="bi bi-plus-lg"></i> <span className="d-none d-sm-inline">Nouveau produit</span>
              </button>
            </div>
          </div>

          {!boutique?.estAbonnementActif && (
            <div className="carte-izishop p-3 p-md-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-octagon-fill fs-4 me-3" style={{ color: 'var(--izishop-erreur)' }}></i>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Votre abonnement a expiré</h6>
                  <small className="text-muted">Renouvelez-le pour que vos clients puissent de nouveau voir votre boutique.</small>
                </div>
              </div>
              <button className="btn btn-sm text-white fw-bold px-4 py-2 rounded-2 align-self-end align-self-md-center" style={{ backgroundColor: 'var(--izishop-erreur)' }} onClick={() => navigate('/dashboard/abonnement')}>
                Réabonner maintenant
              </button>
            </div>
          )}

          {!boutique?.estVisible && boutique?.estAbonnementActif && (
            <div className="carte-izishop p-3 p-md-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-eye-slash-fill fs-4 me-3" style={{ color: 'var(--izishop-primaire)' }}></i>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Votre boutique est actuellement masquée</h6>
                  <small className="text-muted">Elle n'est pas accessible par vos acheteurs potentiels.</small>
                </div>
              </div>
              <button className="bouton-principal btn-sm px-4 py-2 align-self-end align-self-md-center" onClick={gererVisibilite}>
                Mettre en ligne
              </button>
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="carte-izishop p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="icone-feature d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontSize: '1.1rem', margin: 0, borderRadius: '10px' }}>
                    <i className="bi bi-box-seam" style={{ color: 'var(--izishop-secondaire)' }}></i>
                  </div>
                  <span className="badge-activite" style={{ fontSize: '0.75rem' }}>Catalogue</span>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.6rem' }}>{nombreProduits}</h2>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small" style={{ fontSize: '0.8rem' }}>Articles enregistrés</span>
                  <span className="badge rounded-pill fw-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--izishop-succes)', fontSize: '0.7rem' }}>
                    {produitsActifs} actifs
                  </span>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="carte-izishop p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="icone-feature d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontSize: '1.1rem', margin: 0, borderRadius: '10px' }}>
                    <i className="bi bi-eye" style={{ color: 'var(--izishop-secondaire)' }}></i>
                  </div>
                  <span className="badge-activite" style={{ fontSize: '0.75rem' }}>Visibilité</span>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.6rem' }}>{formatNombre(totalVues)}</h2>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Vues totales de vos produits</p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="carte-izishop p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="icone-feature d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontSize: '1.1rem', margin: 0, borderRadius: '10px' }}>
                    <i className="bi bi-whatsapp" style={{ color: '#25D366' }}></i>
                  </div>
                  <span className="badge-activite" style={{ fontSize: '0.75rem' }}>Conversion</span>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.6rem' }}>{formatNombre(totalClicsWhatsApp)}</h2>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Clics vers votre WhatsApp</p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className={`carte-izishop p-3 h-100 d-flex flex-column justify-content-between ${joursRestants <= 7 && boutique?.estAbonnementActif ? 'border-warning border-2' : ''}`}>
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="icone-feature d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontSize: '1.1rem', margin: 0, borderRadius: '10px' }}>
                      <i className={`bi ${boutique?.estAbonnementActif ? 'bi-shield-check' : 'bi-shield-x'}`} style={{ color: boutique?.estAbonnementActif ? 'var(--izishop-succes)' : 'var(--izishop-erreur)' }}></i>
                    </div>
                    <span className="badge-activite" style={{ fontSize: '0.75rem' }}>{estEnEssai ? 'Essai' : 'Abonnement'}</span>
                  </div>
                  <div className="text-center my-2">
                    <span className="fw-bold fs-3" style={{ color: joursRestants <= 7 ? 'var(--izishop-erreur)' : 'var(--izishop-secondaire)' }}>
                      J-{joursRestants}
                    </span>
                    <p className="text-muted small mb-0 mt-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                      {boutique?.estAbonnementActif ? (estEnEssai ? "avant fin d'essai" : "avant renouvellement") : "Abonnement expiré"}
                    </p>
                  </div>
                  <p className="text-muted small text-center mb-1" style={{ fontSize: '0.75rem' }}>
                    {dateExpiration ? `Expire le ${dateExpiration.toLocaleDateString('fr-FR')}` : 'Date non définie'}
                  </p>
                </div>
                {boutique?.estAbonnementActif && joursRestants <= 7 && (
                  <button className="bouton-principal w-100 py-1 btn-sm mt-1" onClick={() => navigate('/dashboard/abonnement')}>
                    <i className="bi bi-lightning-charge-fill me-1"></i>Renouveler
                  </button>
                )}
                {!boutique?.estAbonnementActif && (
                  <button className="btn btn-danger btn-sm w-100 py-1 mt-1 fw-bold" onClick={() => navigate('/dashboard/abonnement')}>
                    <i className="bi bi-arrow-repeat me-1"></i>Réactiver
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="carte-izishop p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Mes produits récents</h4>
                    <small className="text-muted">Aperçu direct de vos derniers articles et de leur performance.</small>
                  </div>
                  <button className="btn btn-sm btn-link text-decoration-none fw-bold" style={{ color: 'var(--izishop-secondaire)' }} onClick={() => navigate('/dashboard/produits')}>
                    Voir tout <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
                {nombreProduits === 0 ? (
                  <div className="text-center py-5 rounded-3" style={{ border: '2px dashed rgba(30, 41, 59, 0.1)', backgroundColor: 'rgba(243, 244, 246, 0.5)' }}>
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--izishop-primaire)' }}></i>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>Aucun produit dans votre boutique</h6>
                    <p className="text-muted small mb-4">Commencez par ajouter votre premier article pour remplir votre vitrine.</p>
                    <button className="bouton-principal px-4 py-2" onClick={() => navigate('/dashboard/ajouter-produit')}>
                      <i className="bi bi-plus-lg me-2"></i>Ajouter mon premier produit
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="text-muted small" style={{ backgroundColor: 'var(--izishop-fond)' }}>
                        <tr>
                          <th className="border-0 ps-3 py-3">Produit</th>
                          <th className="border-0 py-3">Prix</th>
                          <th className="border-0 py-3 d-none d-sm-table-cell">Stock</th>
                          <th className="border-0 py-3">Performance</th>
                          <th className="border-0 py-3">Statut</th>
                          <th className="border-0 text-end pe-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produits.slice(0, 5).map((produit) => (
                          <tr key={produit.id}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center">
                                <div className="rounded-3 border d-flex align-items-center justify-content-center me-3 overflow-hidden" style={{ width: '48px', height: '48px', backgroundColor: 'var(--izishop-fond)', flexShrink: 0 }}>
                                  {produit.urlImagePrincipale ? (
                                    <img src={produit.urlImagePrincipale} alt={produit.nomProduit} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                  ) : (
                                    <i className="bi bi-image text-muted" style={{ fontSize: '1.2rem' }}></i>
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <span className="fw-bold small d-block text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '150px' }} title={produit.nomProduit}>
                                    {produit.nomProduit}
                                  </span>
                                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>{produit.categorie || 'Divers'}</small>
                                </div>
                              </div>
                            </td>
                            <td className="fw-bold small" style={{ color: 'var(--izishop-secondaire)' }}>
                              {formatPrix(produit.prix)} <span className="text-muted fw-normal">{devise}</span>
                            </td>
                            <td className="d-none d-sm-table-cell">
                              <span className={`small fw-bold ${produit.quantiteEnStock <= 2 ? 'text-danger' : 'text-muted'}`}>
                                {produit.quantiteEnStock}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center gap-1 small text-muted">
                                  <i className="bi bi-eye" style={{ fontSize: '0.75rem' }}></i> {produit.nombreDeVues || 0}
                                </div>
                                <div className="d-flex align-items-center gap-1 small" style={{ color: '#25D366', fontWeight: '600' }}>
                                  <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i> {produit.nombreDeClicsWhatsApp || 0}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge rounded-pill fw-bold" style={{ backgroundColor: produit.estDisponible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.1)', color: produit.estDisponible ? 'var(--izishop-succes)' : 'var(--izishop-secondaire)', fontSize: '0.75rem', padding: '0.35em 0.65em' }}>
                                {produit.estDisponible ? 'Disponible' : 'Indisponible'}
                              </span>
                            </td>
                            <td className="text-end pe-3">
                              <button className="btn btn-sm rounded-circle border-0" style={{ backgroundColor: 'var(--izishop-fond)', color: 'var(--izishop-secondaire)', width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate(`/dashboard/produits?edit=${produit.id}`)} title="Modifier">
                                <i className="bi bi-pencil small"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-xl-4">
              <div className="carte-izishop p-4 mb-4">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>Partagez votre boutique</h5>
                <p className="text-muted small mb-3">Envoyez ce lien à vos clients sur WhatsApp, Facebook ou Instagram.</p>
                <div className="input-group mb-3">
                  <input type="text" className="form-control bg-light border-0 small text-truncate" value={`${window.location.origin}/boutique/${boutique?.sousDomaine || '...'}`} readOnly />
                  <button className="btn btn-warning fw-bold" type="button" onClick={copierLienBoutique}>
                    {lienCopie ? <i className="bi bi-check-lg"></i> : <i className="bi bi-clipboard"></i>}
                  </button>
                </div>
                <a href={`https://wa.me/?text=Découvrez%20ma%20boutique%20:%20${encodeURIComponent(window.location.origin + '/boutique/' + (boutique?.sousDomaine || ''))}`} target="_blank" rel="noopener noreferrer" className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-whatsapp fs-5"></i> Partager sur WhatsApp
                </a>
              </div>
              <div className="carte-izishop p-4" style={{ backgroundColor: 'rgba(251, 190, 36, 0.05)', border: '1px solid rgba(251, 190, 36, 0.2)' }}>
                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-lightbulb-fill" style={{ color: 'var(--izishop-primaire)' }}></i> Conseil du jour
                </h6>
                <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>
                  Les boutiques avec des photos claires et des descriptions détaillées vendent jusqu'à <strong>3 fois plus</strong>. Pensez à mettre à jour vos images !
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardVendeur;