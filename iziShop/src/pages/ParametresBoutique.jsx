// Fichier: frontend/src/pages/ParametresBoutique.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenirMaBoutique, mettreAJourBoutique, uploaderImages, supprimerImage } from '../lib/api';

const ParametresBoutique = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  const [formData, setFormData] = useState({ nomBoutique: '', description: '', lienWhatsApp: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoOriginalUrl, setLogoOriginalUrl] = useState('');
  const [lienCopie, setLienCopie] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const chargerDonnees = async () => {
      try {
        const resBoutique = await obtenirMaBoutique();
        if (isMounted && resBoutique?.donnees) {
          const b = resBoutique.donnees;
          setBoutique(b);
          setFormData({ nomBoutique: b.nomBoutique || '', description: b.description || '', lienWhatsApp: b.lienWhatsApp || '' });
          setLogoOriginalUrl(b.logoUrl || '');
          setLogoPreview(b.logoUrl || '');
        }
      } catch (err) {
        if (isMounted) setErreur('Impossible de charger les paramètres de votre boutique.');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        afficherMessage('danger', 'Le logo ne doit pas dépasser 5 Mo.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        afficherMessage('danger', 'Veuillez sélectionner une image valide.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      // Si on choisit un nouveau fichier après avoir cliqué sur supprimer, on annule l'état "supprimé"
      if (logoOriginalUrl === 'DELETED') {
        setLogoOriginalUrl('');
      }
    }
  };

  const supprimerLogoVisuel = () => {
    setLogoFile(null);
    setLogoPreview('');
    setLogoOriginalUrl('DELETED');
  };

  const copierSousDomaine = async () => {
    const lien = `${window.location.origin}/boutique/${boutique?.sousDomaine || ''}`;
    try {
      await navigator.clipboard.writeText(lien);
      setLienCopie(true);
      afficherMessage('success', 'Lien de votre boutique copié !');
      setTimeout(() => setLienCopie(false), 2000);
    } catch (err) {
      afficherMessage('danger', 'Erreur lors de la copie.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSauvegardeEnCours(true);
    setMessage({ type: '', text: '' });
    try {
      let finalLogoUrl = null;
      
      // Cas 1 : L'utilisateur a explicitement demandé la suppression du logo
      if (logoOriginalUrl === 'DELETED') {
        if (boutique?.logoUrl) {
          // Suppression définitive de l'ancien logo du stockage
          await supprimerImage(boutique.logoUrl).catch(err => console.error("Erreur suppression ancien logo:", err));
        }
        finalLogoUrl = null;
      } 
      // Cas 2 : L'utilisateur a sélectionné un nouveau fichier logo
      else if (logoFile) {
        // 1. Suppression DÉFINITIVE de l'ancien logo du stockage AVANT d'uploader le nouveau
        if (boutique?.logoUrl) {
          await supprimerImage(boutique.logoUrl).catch(err => console.error("Erreur suppression ancien logo:", err));
        }
        // 2. Upload du nouveau logo
        const uploadRes = await uploaderImages([logoFile]);
        finalLogoUrl = uploadRes.donnees.urls[0];
      }
      // Cas 3 : Aucun changement sur le logo, on garde l'URL existante
      else {
        finalLogoUrl = boutique?.logoUrl || null;
      }
      
      const donneesMiseAJour = { ...formData, logoUrl: finalLogoUrl };
      await mettreAJourBoutique(donneesMiseAJour);
      
      setBoutique(prev => ({ ...prev, ...donneesMiseAJour }));
      setLogoFile(null);
      setLogoOriginalUrl(finalLogoUrl || '');
      setLogoPreview(finalLogoUrl || '');
      
      afficherMessage('success', 'Paramètres de la boutique mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur mise à jour boutique:', err);
      afficherMessage('danger', err.message || 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSauvegardeEnCours(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (chargement) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--izishop-primaire)' }}></div>
          <p className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Chargement des paramètres...</p>
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
              <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <span className="small fw-medium">{message.text}</span>
              <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })} aria-label="Close"></button>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                <i className="bi bi-gear me-2" style={{ color: 'var(--izishop-primaire)' }}></i> Paramètres de la Boutique
              </h1>
              <p className="text-muted small mb-0">Personnalisez les informations de votre vitrine.</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-arrow-left"></i> Retour au tableau de bord
            </button>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <form onSubmit={handleSubmit}>
                <div className="carte-izishop p-4 p-md-5 mb-4">
                  <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--izishop-secondaire)' }}>
                    <i className="bi bi-shop me-2 text-muted"></i>Informations générales
                  </h5>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Nom de la boutique <span className="text-danger">*</span></label>
                    <input type="text" name="nomBoutique" className="form-control form-control-lg bg-light border-0 rounded-3" value={formData.nomBoutique} onChange={handleInputChange} placeholder="Ex: Boutique de Jean Kouassi" required />
                    <small className="text-muted">Ce nom apparaîtra sur votre vitrine publique.</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Description</label>
                    <textarea name="description" className="form-control bg-light border-0 rounded-3" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Décrivez votre boutique en quelques lignes pour attirer vos clients..."></textarea>
                    <small className="text-muted">Une bonne description aide vos clients à comprendre ce que vous vendez.</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Lien WhatsApp <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-success">
                        <i className="bi bi-whatsapp"></i>
                      </span>
                      <input type="tel" name="lienWhatsApp" className="form-control form-control-lg bg-light border-start-0 rounded-3" value={formData.lienWhatsApp} onChange={handleInputChange} placeholder="+229 90 00 00 00" required />
                    </div>
                    <small className="text-muted">Numéro sur lequel vos clients pourront vous contacter pour commander.</small>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3">
                  <button type="button" className="btn btn-light px-4 py-2 fw-semibold rounded-3" style={{ color: 'var(--izishop-secondaire)' }} onClick={() => navigate('/dashboard')} disabled={sauvegardeEnCours}>
                    Annuler
                  </button>
                  <button type="submit" className="bouton-principal px-4 py-2 d-inline-flex align-items-center gap-2 rounded-3 fw-bold" disabled={sauvegardeEnCours}>
                    {sauvegardeEnCours ? (
                      <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span>Sauvegarde en cours...</span></>
                    ) : (
                      <><i className="bi bi-check2-circle fs-5"></i><span>Enregistrer les modifications</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="col-12 col-xl-4">
              <div className="carte-izishop p-4 mb-4">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-image me-2 text-muted"></i>Logo de la boutique
                </h5>
                <div className="text-center mb-3">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-light border border-2 border-dashed position-relative" style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-shop fs-1 text-muted"></i>
                    )}
                  </div>
                </div>
                
                {/* ✅ DEUX BOUTONS DISTINCTS PLACÉS CÔTE À CÔTE */}
                <div className="d-flex gap-2 mb-3">
                  <label className="btn zack btn-sm rounded-3 flex-grow-1 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', borderWidth: '1.5px',borderColor:'#1E293B' }}>
                    <i className={`bi ${logoPreview ? 'bi-pencil-square' : 'bi-cloud-upload'} me-2`}></i>
                    {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
                    <input type="file" accept="image/*" className="d-none" onChange={handleLogoChange} />
                  </label>
                  
                  {logoPreview && (
                    <button 
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-3 flex-grow-1 d-flex align-items-center justify-content-center"
                      onClick={supprimerLogoVisuel}
                      style={{ borderWidth: '1.5px' }}
                    >
                      <i className="bi bi-trash me-2"></i>Supprimer
                    </button>
                  )}
                </div>
                
                <small className="text-muted d-block text-center">
                  Formats : JPG, PNG, WebP. Max 5 Mo. Le logo sera compressé automatiquement.
                </small>
              </div>

              <div className="carte-izishop p-4">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-link-45deg me-2 text-muted"></i>Lien de votre boutique
                </h5>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Sous-domaine unique</label>
                  <div className="input-group">
                    <input type="text" className="form-control bg-light border-0 small text-truncate" value={`${window.location.origin}/boutique/${boutique?.sousDomaine || '...'}`} readOnly />
                    <button className="btn btn-warning fw-bold" type="button" onClick={copierSousDomaine}>
                      {lienCopie ? <i className="bi bi-check-lg"></i> : <i className="bi bi-clipboard"></i>}
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded-3 bg-light border d-flex align-items-start gap-2" style={{ borderStyle: 'dashed', borderColor: 'rgba(251, 190, 36, 0.3)' }}>
                  <i className="bi bi-lightbulb-fill text-warning flex-shrink-0 mt-1" style={{ fontSize: '0.85rem' }}></i>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                    Partagez ce lien avec vos clients pour qu'ils accèdent directement à votre vitrine.
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

export default ParametresBoutique;