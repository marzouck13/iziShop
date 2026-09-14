/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenirMesProduits, archiverProduit, supprimerProduit, desarchiverProduit } from '../../lib/api';
import LayoutDashboard from '../../components/LayoutDashboard';

// ==========================================
// SKELETON LOADERS SPÉCIFIQUES AUX PRODUITS
// ==========================================
const basePlaceholderStyle = {
  backgroundColor: '#e9ecef',
  borderRadius: '5px',
};

const SkeletonProductCard = () => (
  <div className="carte-izishop h-100 overflow-hidden placeholder-glow" style={{ borderRadius: '5px' }}>
    <div className="placeholder" style={{ ...basePlaceholderStyle, height: '220px', borderRadius: '5px 5px 0 0' }}></div>
    <div className="p-3">
      <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '40%', height: '10px' }}></div>
      <div className="placeholder mb-3" style={{ ...basePlaceholderStyle, width: '80%', height: '18px' }}></div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '35%', height: '22px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '30%', height: '14px' }}></div>
      </div>
      <div className="d-flex gap-2 border-top pt-3" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="placeholder flex-grow-1" style={{ ...basePlaceholderStyle, height: '34px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '34px', height: '34px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '34px', height: '34px' }}></div>
      </div>
    </div>
  </div>
);

const SkeletonProductRow = () => (
  <tr className="placeholder-glow">
    <td className="ps-4 py-3">
      <div className="d-flex align-items-center gap-3">
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '52px', height: '52px' }}></div>
        <div>
          <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '140px', height: '14px' }}></div>
          <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '10px' }}></div>
        </div>
      </div>
    </td>
    <td><div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '14px' }}></div></td>
    <td><div className="placeholder" style={{ ...basePlaceholderStyle, width: '45px', height: '14px' }}></div></td>
    <td><div className="placeholder" style={{ ...basePlaceholderStyle, width: '40px', height: '12px' }}></div></td>
    <td><div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '22px' }}></div></td>
    <td className="text-end pe-4">
      <div className="d-inline-flex gap-1 justify-content-end">
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '32px', height: '32px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '32px', height: '32px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '32px', height: '32px' }}></div>
      </div>
    </td>
  </tr>
);

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
const Produits = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [vue, setVue] = useState('grille');
  const [tri, setTri] = useState('recent');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionEnCours, setActionEnCours] = useState(null);

  // Style charte iziShop : border-radius strict de 5px
  const R = '5px';

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const charger = async () => {
    setChargement(true);
    try {
      const res = await obtenirMesProduits({ inclureArchives: true });
      if (res?.donnees?.produits) setProduits(res.donnees.produits);
      else if (Array.isArray(res?.donnees)) setProduits(res.donnees);
    } catch (err) {
      console.error(err);
      afficherMessage('danger', 'Impossible de charger vos produits.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleArchiver = async (id, nomProduit) => {
    if (!window.confirm(`Archiver "${nomProduit}" ?\n\nCe produit ne sera plus visible par vos clients, mais vous pourrez le restaurer à tout moment.`)) return;
    setActionEnCours(id);
    try {
      await archiverProduit(id);
      afficherMessage('success', `"${nomProduit}" a été archivé avec succès.`);
      charger();
    } catch (err) {
      afficherMessage('danger', err.message || "Erreur lors de l'archivage.");
    } finally {
      setActionEnCours(null);
    }
  };

  const handleDesarchiver = async (id, nomProduit) => {
    setActionEnCours(id);
    try {
      await desarchiverProduit(id);
      afficherMessage('success', `"${nomProduit}" est de nouveau visible sur votre boutique.`);
      charger();
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors de la restauration.');
    } finally {
      setActionEnCours(null);
    }
  };

  const handleSupprimer = async (id, nomProduit) => {
    if (!window.confirm(`SUPPRIMER DÉFINITIVEMENT "${nomProduit}" ?\n\nCette action est IRRÉVERSIBLE. Toutes les images associées seront également supprimées.`)) return;
    setActionEnCours(id);
    try {
      await supprimerProduit(id);
      afficherMessage('success', `"${nomProduit}" a été supprimé définitivement.`);
      charger();
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors de la suppression.');
    } finally {
      setActionEnCours(null);
    }
  };

  const naviguerVersEdition = (produit) => {
    navigate(`/dashboard/produits/ajouter?edit=${produit.id}`, { state: { produit } });
  };

  const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix || 0);
  const formatNombre = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

  // Filtrage et tri robustes
  const produitsFiltres = useMemo(() => {
    let liste = [...produits];

    if (recherche.trim()) {
      const r = recherche.toLowerCase();
      liste = liste.filter(p =>
        (p.nomProduit || '').toLowerCase().includes(r) ||
        (p.description || '').toLowerCase().includes(r) ||
        (p.categorie || '').toLowerCase().includes(r)
      );
    }

    if (filtreStatut === 'actifs') liste = liste.filter(p => !p.estArchive && p.estDisponible);
    else if (filtreStatut === 'archives') liste = liste.filter(p => p.estArchive);
    else if (filtreStatut === 'stock_faible') liste = liste.filter(p => !p.estArchive && p.quantiteEnStock > 0 && p.quantiteEnStock <= 5);
    else if (filtreStatut === 'epuises') liste = liste.filter(p => !p.estArchive && p.quantiteEnStock === 0);

    if (tri === 'recent') liste.sort((a, b) => new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0));
    else if (tri === 'prix_asc') liste.sort((a, b) => (a.prix || 0) - (b.prix || 0));
    else if (tri === 'prix_desc') liste.sort((a, b) => (b.prix || 0) - (a.prix || 0));
    else if (tri === 'vues') liste.sort((a, b) => (b.nombreDeVues || 0) - (a.nombreDeVues || 0));
    else if (tri === 'nom') liste.sort((a, b) => (a.nomProduit || '').localeCompare(b.nomProduit || ''));

    return liste;
  }, [produits, recherche, filtreStatut, tri]);

  const stats = useMemo(() => ({
    total: produits.filter(p => !p.estArchive).length,
    archives: produits.filter(p => p.estArchive === true).length,
    stockFaible: produits.filter(p => !p.estArchive && p.quantiteEnStock > 0 && p.quantiteEnStock <= 5).length,
    epuises: produits.filter(p => !p.estArchive && p.quantiteEnStock === 0).length,
  }), [produits]);

  const getBadgeStatut = (p) => {
    if (p.estArchive) return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6B7280', label: 'Archivé', icon: 'bi-archive-fill' };
    if (!p.estDisponible) return { bg: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', label: 'Indisponible', icon: 'bi-x-circle-fill' };
    if (p.quantiteEnStock === 0) return { bg: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', label: 'Épuisé', icon: 'bi-x-circle-fill' };
    if (p.quantiteEnStock <= 5) return { bg: 'rgba(251, 190, 36, 0.2)', color: '#B45309', label: 'Stock faible', icon: 'bi-exclamation-triangle-fill' };
    return { bg: 'rgba(16, 185, 129, 0.15)', color: '#047857', label: 'Disponible', icon: 'bi-check-circle-fill' };
  };

  const styleInput = {
    backgroundColor: '#f8f9fa',
    border: '1px solid rgba(30, 41, 59, 0.08)',
    borderRadius: R,
    fontSize: '0.9rem',
  };

  const statsItems = [
    { label: 'Actifs', value: stats.total, icon: 'bi-box-seam-fill', color: 'var(--izishop-succes)' },
    { label: 'Stock faible', value: stats.stockFaible, icon: 'bi-exclamation-triangle-fill', color: '#B45309' },
    { label: 'Épuisés', value: stats.epuises, icon: 'bi-x-circle-fill', color: 'var(--izishop-erreur)' },
    { label: 'Archivés', value: stats.archives, icon: 'bi-archive-fill', color: '#6B7280' },
  ];

  return (
    <LayoutDashboard>
      <div className="p-3 p-md-4 p-lg-5 flex-grow-1">
        {/* === EN-TÊTE === */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-box-seam me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
              Mes Produits
            </h1>
            <p className="text-muted small mb-0">Gérez votre catalogue, suivez les performances et le stock.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/produits/ajouter')}
            className="bouton-principal px-4 py-2 d-inline-flex align-items-center gap-2 fw-bold"
            style={{ borderRadius: R }}
          >
            <i className="bi bi-plus-lg"></i> Ajouter un produit
          </button>
        </div>

        {/* === MESSAGE D'ALERTE === */}
        {message.text && (
          <div
            className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-4 border-0 shadow-sm`}
            style={{ borderRadius: R, animation: 'fadeIn 0.3s ease' }}
          >
            <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        {/* === STATS RAPIDES COMPACTES === */}
        <div className="carte-izishop px-1 py-2 mb-4" style={{ borderRadius: R }}>
          <div className="row g-0 align-items-center">
            {statsItems.map((s, i) => (
              <React.Fragment key={i}>
                <div className="col">
                  <div className="d-flex align-items-center gap-2 px-2 px-md-3 py-1">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: `${s.color}15`,
                        borderRadius: R,
                      }}
                    >
                      <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1rem' }}></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div
                        className="fw-bold lh-1"
                        style={{ color: 'var(--izishop-secondaire)', fontSize: '1.15rem' }}
                      >
                        {s.value}
                      </div>
                      <small
                        className="text-muted text-truncate d-block"
                        style={{ fontSize: '0.72rem', lineHeight: '1.2' }}
                      >
                        {s.label}
                      </small>
                    </div>
                  </div>
                </div>
                {i < statsItems.length - 1 && (
                  <div
                    className="col-auto d-none d-md-block"
                    style={{
                      width: '1px',
                      height: '32px',
                      backgroundColor: 'rgba(30, 41, 59, 0.08)',
                    }}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* === BARRE DE FILTRES === */}
        <div className="carte-izishop p-3 mb-4" style={{ borderRadius: R }}>
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control ps-5"
                  style={styleInput}
                  placeholder="Rechercher un produit, une catégorie..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                style={styleInput}
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les produits ({produits.length})</option>
                <option value="actifs">Actifs ({stats.total})</option>
                <option value="stock_faible">Stock faible ({stats.stockFaible})</option>
                <option value="epuises">Épuisés ({stats.epuises})</option>
                <option value="archives">Archivés ({stats.archives})</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                style={styleInput}
                value={tri}
                onChange={(e) => setTri(e.target.value)}
              >
                <option value="recent">Plus récents</option>
                <option value="prix_asc">Prix croissant</option>
                <option value="prix_desc">Prix décroissant</option>
                <option value="vues">Plus vus</option>
                <option value="nom">Nom A-Z</option>
              </select>
            </div>
            <div className="col-md-2">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: vue === 'grille' ? 'var(--izishop-secondaire)' : '#f8f9fa',
                    color: vue === 'grille' ? 'white' : 'var(--izishop-secondaire)',
                    borderRadius: `${R} 0 0 ${R}`,
                    border: 'none',
                  }}
                  onClick={() => setVue('grille')}
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: vue === 'liste' ? 'var(--izishop-secondaire)' : '#f8f9fa',
                    color: vue === 'liste' ? 'white' : 'var(--izishop-secondaire)',
                    borderRadius: `0 ${R} ${R} 0`,
                    border: 'none',
                  }}
                  onClick={() => setVue('liste')}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === CONTENU === */}
        {chargement ? (
          vue === 'grille' ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="col">
                  <SkeletonProductCard />
                </div>
              ))}
            </div>
          ) : (
            <div className="carte-izishop overflow-hidden" style={{ borderRadius: R }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr className="text-muted small text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                      <th className="border-0 py-3 ps-4 fw-semibold">Produit</th>
                      <th className="border-0 py-3 fw-semibold">Prix</th>
                      <th className="border-0 py-3 fw-semibold">Stock</th>
                      <th className="border-0 py-3 fw-semibold">Vues</th>
                      <th className="border-0 py-3 fw-semibold">Statut</th>
                      <th className="border-0 text-end pe-4 py-3 fw-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => (
                      <SkeletonProductRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : produitsFiltres.length === 0 ? (
          <div className="carte-izishop p-5 text-center" style={{ borderRadius: R }}>
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '80px', height: '80px', backgroundColor: 'rgba(251, 190, 36, 0.1)', borderRadius: R }}
            >
              <i className="bi bi-inbox display-4" style={{ color: 'var(--izishop-primaire)' }}></i>
            </div>
            <h5 className="fw-bold" style={{ color: 'var(--izishop-secondaire)' }}>
              {recherche || filtreStatut !== 'tous' ? 'Aucun résultat trouvé' : 'Aucun produit dans votre catalogue'}
            </h5>
            <p className="text-muted small mb-4">
              {recherche || filtreStatut !== 'tous'
                ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
                : 'Commencez par ajouter votre premier produit pour le mettre en vente.'}
            </p>
            {!recherche && filtreStatut === 'tous' && (
              <button
                onClick={() => navigate('/dashboard/produits/ajouter')}
                className="bouton-principal px-4 py-2 d-inline-flex align-items-center gap-2 fw-bold"
                style={{ borderRadius: R }}
              >
                <i className="bi bi-plus-lg"></i> Ajouter mon premier produit
              </button>
            )}
          </div>
        ) : vue === 'grille' ? (
          /* ==========================================
              VUE GRILLE (CARTES ÉPURÉES)
             ========================================== */
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {produitsFiltres.map(p => {
              const badge = getBadgeStatut(p);
              return (
                <div key={p.id} className="col">
                  <div 
                    className="carte-izishop h-100 d-flex flex-column overflow-hidden position-relative" 
                    style={{ borderRadius: R, transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                  >
                    {/* Image avec Overlay Gradient */}
                    <div className="position-relative" style={{ height: '220px', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                      <img
                        src={p.urlImagePrincipale || 'https://via.placeholder.com/400x400?text=Pas+d\'image'}
                        alt={p.nomProduit}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      
                      {/* Badges intégrés sur l'image */}
                      <div 
                        className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-end"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)', pointerEvents: 'none' }}
                      >
                        <span
                          className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.95)', 
                            color: badge.color, 
                            borderRadius: R, 
                            fontSize: '0.7rem', 
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                            pointerEvents: 'auto'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color, flexShrink: 0 }}></span>
                          {badge.label}
                        </span>

                        <span
                          className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: R, fontSize: '0.7rem', fontWeight: 500, pointerEvents: 'auto' }}
                        >
                          <i className="bi bi-eye-fill" style={{ fontSize: '0.65rem' }}></i>
                          {formatNombre(p.nombreDeVues || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Contenu Texte */}
                    <div className="p-3 d-flex flex-column flex-grow-1">
                      {/* Catégorie en sur-titre */}
                      {p.categorie && (
                        <span 
                          className="text-uppercase text-muted d-block mb-1 text-truncate" 
                          style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}
                          title={p.categorie}
                        >
                          {p.categorie}
                        </span>
                      )}
                      
                      {/* Titre */}
                      <h6 
                        className="fw-bold text-truncate mb-3" 
                        style={{ color: 'var(--izishop-secondaire)', fontSize: '0.95rem', lineHeight: '1.3' }} 
                        title={p.nomProduit}
                      >
                        {p.nomProduit}
                      </h6>

                      {/* Prix et Stock (Dot Indicator) */}
                      <div className="d-flex justify-content-between align-items-baseline mb-3 mt-auto">
                        <div>
                          <span className="fw-bold" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>
                            {formatPrix(p.prix)}
                          </span>
                          <small className="text-muted ms-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>FCFA</small>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span style={{ 
                            width: '7px', 
                            height: '7px', 
                            borderRadius: '50%', 
                            backgroundColor: p.quantiteEnStock > 5 ? 'var(--izishop-succes)' : p.quantiteEnStock > 0 ? '#B45309' : 'var(--izishop-erreur)',
                            flexShrink: 0
                          }}></span>
                          <small className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                            {p.quantiteEnStock} en stock
                          </small>
                        </div>
                      </div>

                      {/* Actions (Séparées par une bordure fine) */}
                      <div className="d-flex gap-2 border-top pt-3" style={{ borderColor: 'rgba(30, 41, 59, 0.06)' }}>
                        <button
                          onClick={() => naviguerVersEdition(p)}
                          className="btn btn-sm btn-outline-dark flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                          style={{ borderRadius: R, fontSize: '0.8rem', fontWeight: 500, borderWidth: '1px' }}
                          disabled={actionEnCours === p.id}
                        >
                          <i className="bi bi-pencil-square" style={{ fontSize: '0.85rem' }}></i> Modifier
                        </button>
                        
                        <div className="d-flex gap-1">
                          {!p.estArchive ? (
                            <button
                              onClick={() => handleArchiver(p.id, p.nomProduit)}
                              className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                              style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: R, width: '34px', height: '34px', border: 'none' }}
                              title="Archiver (masquer de la boutique)"
                              disabled={actionEnCours === p.id}
                            >
                              {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-archive" style={{ fontSize: '0.9rem' }}></i>}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDesarchiver(p.id, p.nomProduit)}
                              className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--izishop-succes)', borderRadius: R, width: '34px', height: '34px', border: 'none' }}
                              title="Désarchiver (rendre visible)"
                              disabled={actionEnCours === p.id}
                            >
                              {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-arrow-counterclockwise" style={{ fontSize: '0.9rem' }}></i>}
                            </button>
                          )}
                          <button
                            onClick={() => handleSupprimer(p.id, p.nomProduit)}
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                            style={{ backgroundColor: '#f1f5f9', color: '#ef4444', borderRadius: R, width: '34px', height: '34px', border: 'none' }}
                            title="Supprimer définitivement"
                            disabled={actionEnCours === p.id}
                          >
                            {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash" style={{ fontSize: '0.9rem' }}></i>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==========================================
              VUE LISTE (TABLEAU ÉPURÉ)
             ========================================== */
          <div className="carte-izishop overflow-hidden" style={{ borderRadius: R }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr className="text-muted small text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    <th className="border-0 py-3 ps-4 fw-semibold">Produit</th>
                    <th className="border-0 py-3 fw-semibold">Prix</th>
                    <th className="border-0 py-3 fw-semibold">Stock</th>
                    <th className="border-0 py-3 fw-semibold">Vues</th>
                    <th className="border-0 py-3 fw-semibold">Statut</th>
                    <th className="border-0 text-end pe-4 py-3 fw-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produitsFiltres.map(p => {
                    const badge = getBadgeStatut(p);
                    return (
                      <tr key={p.id} style={{ transition: 'background-color 0.2s ease' }}>
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.urlImagePrincipale || 'https://via.placeholder.com/80'}
                              alt={p.nomProduit}
                              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: R, border: '1px solid rgba(0,0,0,0.04)' }}
                            />
                            <div className="overflow-hidden">
                              <div className="fw-bold small text-truncate" style={{ color: 'var(--izishop-secondaire)', maxWidth: '220px' }} title={p.nomProduit}>
                                {p.nomProduit}
                              </div>
                              {p.categorie && (
                                <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem', maxWidth: '220px' }}>
                                  {p.categorie}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="fw-bold small" style={{ color: 'var(--izishop-secondaire)' }}>
                          {formatPrix(p.prix)} <small className="text-muted fw-normal">FCFA</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: p.quantiteEnStock > 5 ? 'var(--izishop-succes)' : p.quantiteEnStock > 0 ? '#B45309' : 'var(--izishop-erreur)',
                              flexShrink: 0
                            }}></span>
                            <span className="small fw-medium" style={{ color: 'var(--izishop-secondaire)' }}>{p.quantiteEnStock}</span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted d-inline-flex align-items-center gap-1">
                            <i className="bi bi-eye" style={{ fontSize: '0.75rem' }}></i>
                            {formatNombre(p.nombreDeVues || 0)}
                          </small>
                        </td>
                        <td>
                          <span
                            className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                            style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: R, fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color, flexShrink: 0 }}></span>
                            {badge.label}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex gap-1">
                            <button
                              onClick={() => naviguerVersEdition(p)}
                              className="btn btn-sm btn-outline-dark d-inline-flex align-items-center justify-content-center"
                              style={{ borderRadius: R, width: '32px', height: '32px', borderWidth: '1px' }}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil-square" style={{ fontSize: '0.8rem' }}></i>
                            </button>
                            {!p.estArchive ? (
                              <button
                                onClick={() => handleArchiver(p.id, p.nomProduit)}
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: R, width: '32px', height: '32px', border: 'none' }}
                                title="Archiver"
                                disabled={actionEnCours === p.id}
                              >
                                {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-archive" style={{ fontSize: '0.8rem' }}></i>}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDesarchiver(p.id, p.nomProduit)}
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--izishop-succes)', borderRadius: R, width: '32px', height: '32px', border: 'none' }}
                                title="Désarchiver"
                                disabled={actionEnCours === p.id}
                              >
                                {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-arrow-counterclockwise" style={{ fontSize: '0.8rem' }}></i>}
                              </button>
                            )}
                            <button
                              onClick={() => handleSupprimer(p.id, p.nomProduit)}
                              className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                              style={{ backgroundColor: '#f1f5f9', color: '#ef4444', borderRadius: R, width: '32px', height: '32px', border: 'none' }}
                              title="Supprimer"
                              disabled={actionEnCours === p.id}
                            >
                              {actionEnCours === p.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </LayoutDashboard>
  );
};

export default Produits;