// Fichier: frontend/src/pages/Produits.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenirMaBoutique, obtenirMesProduits, archiverProduit, desarchiverProduit, supprimerProduit } from '../lib/api';

const Produits = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [boutiqueNom, setBoutiqueNom] = useState('Ma boutique');
  const [sousDomaine, setSousDomaine] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [pageActuelle, setPageActuelle] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const elementsParPage = 10;

  useEffect(() => {
    let isMounted = true;
    const chargerDonnees = async () => {
      try {
        const resBoutique = await obtenirMaBoutique();
        if (isMounted && resBoutique?.donnees) {
          setBoutiqueNom(resBoutique.donnees.nomBoutique || 'Ma boutique');
          setSousDomaine(resBoutique.donnees.sousDomaine || 'ma-boutique');
          setDevise(resBoutique.donnees.devise || 'FCFA');
        }
        const resProduits = await obtenirMesProduits();
        if (isMounted) setProduits(resProduits?.donnees || []);
      } catch (err) {
        if (isMounted) setErreur('Impossible de charger votre catalogue.');
        console.error(err);
      } finally {
        if (isMounted) setChargement(false);
      }
    };
    chargerDonnees();
    return () => { isMounted = false; };
  }, []);

  const handleDeconnexion = () => { deconnexion(); navigate('/'); };
  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const gererArchive = async (idProduit, nomProduit, estActuellementArchive) => {
    const messageConfirm = estActuellementArchive
      ? `Voulez-vous vraiment désarchiver "${nomProduit}" ? Il redeviendra visible sur votre vitrine.`
      : `Voulez-vous vraiment archiver "${nomProduit}" ? Il ne sera plus visible sur votre vitrine.`;
    if (!window.confirm(messageConfirm)) return;
    try {
      if (estActuellementArchive) {
        await desarchiverProduit(idProduit);
        setProduits(prev => prev.map(p => p.id === idProduit ? { ...p, estArchive: false, estDisponible: true } : p));
        afficherMessage('success', `"${nomProduit}" a été désarchivé avec succès.`);
      } else {
        await archiverProduit(idProduit);
        setProduits(prev => prev.map(p => p.id === idProduit ? { ...p, estArchive: true, estDisponible: false } : p));
        afficherMessage('success', `"${nomProduit}" a été archivé.`);
      }
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors de l\'action.');
    }
  };

  const gererSuppression = async (idProduit, nomProduit) => {
    const confirmation1 = window.confirm(`ATTENTION - Action irréversible !\n\nVoulez-vous vraiment SUPPRIMER DÉFINITIVEMENT "${nomProduit}" ?\n\n• Le produit sera retiré de votre catalogue\n• Toutes ses images seront supprimées du stockage\n• Cette action ne peut PAS être annulée`);
    if (!confirmation1) return;
    const confirmation2 = window.confirm(`Dernière chance !\n\nÊtes-vous ABSOLUMENT certain de vouloir supprimer "${nomProduit}" ?\n\nCliquez sur OK pour confirmer.`);
    if (!confirmation2) return;
    try {
      await supprimerProduit(idProduit);
      setProduits(prev => {
        const misAJour = prev.filter(p => p.id !== idProduit);
        const maxPages = Math.ceil(misAJour.length / elementsParPage) || 1;
        if (pageActuelle > maxPages) setPageActuelle(maxPages);
        return misAJour;
      });
      afficherMessage('success', `"${nomProduit}" a été définitivement supprimé.`);
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors de la suppression.');
    }
  };

  const partagerProduit = async (produit) => {
    const lienPartage = `${window.location.origin}/boutique/${sousDomaine}/produit/${produit.id}`;
    try {
      await navigator.clipboard.writeText(lienPartage);
      afficherMessage('success', `Lien de "${produit.nomProduit}" copié !`);
    } catch (err) {
      afficherMessage('danger', 'Erreur lors de la copie du lien.');
    }
  };

  const isActive = (path) => location.pathname === path;
  const produitsFiltres = produits.filter(produit => {
    const nom = produit?.nomProduit || '';
    const correspondRecherche = nom.toLowerCase().includes(recherche.toLowerCase());
    if (filtre === 'disponibles') return correspondRecherche && produit.estDisponible && !produit.estArchive;
    if (filtre === 'archives') return correspondRecherche && produit.estArchive;
    return correspondRecherche;
  });

  const indexDernierElement = pageActuelle * elementsParPage;
  const indexPremierElement = indexDernierElement - elementsParPage;
  const produitsPagines = produitsFiltres.slice(indexPremierElement, indexDernierElement);
  const nombreTotalPages = Math.ceil(produitsFiltres.length / elementsParPage);
  const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix || 0);

  if (chargement) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--izishop-primaire)' }}></div>
          <p className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Chargement de votre catalogue...</p>
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
              <span className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>{boutiqueNom}</span>
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
            <span className="fw-bold small text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '120px' }}>{boutiqueNom}</span>
          </div>
          <button className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', color: 'var(--izishop-erreur)' }} onClick={handleDeconnexion}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>

        <div className="p-3 p-md-4 p-lg-5 flex-grow-1">
          {message.text && (
            <div className={`alert alert-${message.type} border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3`} role="alert" style={{ animation: 'fadeIn 0.3s ease' }}>
              <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <span className="small fw-medium">{message.text}</span>
              <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })} aria-label="Close"></button>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                <i className="bi bi-box-seam me-2" style={{ color: 'var(--izishop-primaire)' }}></i> Gestion du Catalogue
              </h1>
              <p className="text-muted small mb-0">Gérez, modifiez, partagez, archivez ou supprimez vos articles.</p>
            </div>
            <button className="bouton-principal btn-sm d-inline-flex align-items-center gap-2 px-3 py-2" onClick={() => navigate('/dashboard/ajouter-produit')}>
              <i className="bi bi-plus-lg"></i> Nouveau produit
            </button>
          </div>

          <div className="carte-izishop p-3 p-md-4 mb-4">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input type="text" className="form-control bg-light border-start-0" placeholder="Rechercher par nom de produit..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPageActuelle(1); }} />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex gap-2">
                  <button className={`btn btn-sm flex-grow-1 ${filtre === 'tous' ? 'bouton-principal' : 'btn-light text-secondary'}`} onClick={() => { setFiltre('tous'); setPageActuelle(1); }}>
                    Tous ({produits.length})
                  </button>
                  <button className={`btn btn-sm flex-grow-1 ${filtre === 'disponibles' ? 'bouton-principal' : 'btn-light text-secondary'}`} onClick={() => { setFiltre('disponibles'); setPageActuelle(1); }}>
                    Actifs ({produits.filter(p => p.estDisponible && !p.estArchive).length})
                  </button>
                  <button className={`btn btn-sm flex-grow-1 ${filtre === 'archives' ? 'bouton-principal' : 'btn-light text-secondary'}`} onClick={() => { setFiltre('archives'); setPageActuelle(1); }}>
                    Archivés ({produits.filter(p => p.estArchive).length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="carte-izishop p-0 overflow-hidden">
            {produitsFiltres.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--izishop-primaire)' }}></i>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>Aucun produit trouvé</h6>
                <p className="text-muted small mb-3">
                  {recherche ? 'Essayez de modifier vos termes de recherche.' : 'Commencez par ajouter votre premier produit.'}
                </p>
                {!recherche && (
                  <button className="bouton-principal px-4 py-2 btn-sm" onClick={() => navigate('/dashboard/ajouter-produit')}>
                    <i className="bi bi-plus-lg me-2"></i>Ajouter un produit
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="text-muted small" style={{ backgroundColor: 'var(--izishop-fond)' }}>
                      <tr>
                        <th className="border-0 ps-4 py-3">Produit</th>
                        <th className="border-0 py-3 d-none d-md-table-cell">Catégorie</th>
                        <th className="border-0 py-3">Prix</th>
                        <th className="border-0 py-3 d-none d-sm-table-cell">Stock</th>
                        <th className="border-0 py-3">Statut</th>
                        <th className="border-0 py-3 text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produitsPagines.map((produit) => (
                        <tr key={produit.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="rounded-3 border d-flex align-items-center justify-content-center me-3 overflow-hidden" style={{ width: '48px', height: '48px', backgroundColor: 'var(--izishop-fond)', flexShrink: 0 }}>
                                {produit.urlImagePrincipale ? (
                                  <img src={produit.urlImagePrincipale} alt={produit.nomProduit || 'Produit'} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                ) : (
                                  <i className="bi bi-image text-muted" style={{ fontSize: '1.2rem' }}></i>
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <span className="fw-bold d-block text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '180px' }} title={produit.nomProduit}>
                                  {produit.nomProduit}
                                </span>
                                <span className="d-md-none text-muted small">{produit.categorie || 'Divers'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span className="text-muted small">{produit.categorie || 'Non catégorisé'}</span>
                          </td>
                          <td className="fw-bold small" style={{ color: 'var(--izishop-secondaire)' }}>
                            {formatPrix(produit.prix)} <span className="text-muted fw-normal">{devise}</span>
                          </td>
                          <td className="d-none d-sm-table-cell">
                            <span className={`small fw-bold ${(produit.quantiteEnStock ?? 0) <= 2 ? 'text-danger' : 'text-muted'}`}>
                              {produit.quantiteEnStock ?? 0}
                            </span>
                          </td>
                          <td>
                            {produit.estArchive ? (
                              <span className="badge rounded-pill fw-bold" style={{ backgroundColor: 'rgba(30, 41, 59, 0.1)', color: 'var(--izishop-secondaire)', fontSize: '0.75rem', padding: '0.35em 0.65em' }}>Archivé</span>
                            ) : produit.estDisponible ? (
                              <span className="badge rounded-pill fw-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--izishop-succes)', fontSize: '0.75rem', padding: '0.35em 0.65em' }}>Disponible</span>
                            ) : (
                              <span className="badge rounded-pill fw-bold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--izishop-erreur)', fontSize: '0.75rem', padding: '0.35em 0.65em' }}>Rupture</span>
                            )}
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#25D366', width: '34px', height: '34px' }} onClick={() => partagerProduit(produit)} title="Copier le lien de partage">
                                <i className="bi bi-share small"></i>
                              </button>
                              <button className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--izishop-fond)', color: 'var(--izishop-secondaire)', width: '34px', height: '34px' }} onClick={() => navigate(`/dashboard/ajouter-produit?edit=${produit.id}`, { state: { produit } })} title="Modifier">
                                <i className="bi bi-pencil small"></i>
                              </button>
                              <button className={`btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center ${produit.estArchive ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ width: '34px', height: '34px' }} onClick={() => gererArchive(produit.id, produit.nomProduit, produit.estArchive)} title={produit.estArchive ? "Désarchiver" : "Archiver"}>
                                <i className={`bi bi-${produit.estArchive ? 'arrow-counterclockwise' : 'archive'} small`}></i>
                              </button>
                              <button className="btn btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--izishop-erreur)', width: '34px', height: '34px' }} onClick={() => gererSuppression(produit.id, produit.nomProduit)} title="Supprimer définitivement">
                                <i className="bi bi-trash small"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {nombreTotalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <span className="text-muted small">
                      Affichage de {indexPremierElement + 1} à {Math.min(indexDernierElement, produitsFiltres.length)} sur {produitsFiltres.length} produits
                    </span>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-light" disabled={pageActuelle === 1} onClick={() => setPageActuelle(prev => prev - 1)}>
                        <i className="bi bi-chevron-left"></i> Précédent
                      </button>
                      <button className="btn btn-sm btn-light" disabled={pageActuelle === nombreTotalPages} onClick={() => setPageActuelle(prev => prev + 1)}>
                        Suivant <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Produits;