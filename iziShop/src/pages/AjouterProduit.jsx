// Fichier: frontend/src/pages/AjouterProduit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenirMaBoutique, obtenirMesProduits, creerProduit, mettreAJourProduit, uploaderImages, supprimerImage } from '../lib/api';

const AjouterProduit = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const produitExistant = location.state?.produit;

  const isActive = (path) => location.pathname === path;

  const [formData, setFormData] = useState({ nomProduit: '', description: '', prix: '', categorie: '', quantiteEnStock: '' });
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [originalMainImageUrl, setOriginalMainImageUrl] = useState('');
  const [originalGalleryUrls, setOriginalGalleryUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [boutiqueNom, setBoutiqueNom] = useState('Ma boutique');

  useEffect(() => {
    let isMounted = true;
    const chargerDonnees = async () => {
      try {
        const resBoutique = await obtenirMaBoutique();
        if (isMounted && resBoutique.donnees?.nomBoutique) setBoutiqueNom(resBoutique.donnees.nomBoutique);

        if (isEditMode && editId && produitExistant) {
          setFormData({
            nomProduit: produitExistant.nomProduit || '',
            description: produitExistant.description || '',
            prix: produitExistant.prix?.toString() || '',
            categorie: produitExistant.categorie || '',
            quantiteEnStock: produitExistant.quantiteEnStock?.toString() || ''
          });
          setOriginalMainImageUrl(produitExistant.urlImagePrincipale || '');
          setOriginalGalleryUrls(produitExistant.urlImagesGalerie || []);
          setMainImageUrl(produitExistant.urlImagePrincipale || '');
          setGalleryItems((produitExistant.urlImagesGalerie || []).map(url => ({ url, file: null })));
        } else if (isEditMode && editId && !produitExistant) {
          const resProduits = await obtenirMesProduits();
          const produitAEditer = resProduits.donnees?.find(p => p.id === editId);
          if (produitAEditer && isMounted) {
            setFormData({
              nomProduit: produitAEditer.nomProduit || '',
              description: produitAEditer.description || '',
              prix: produitAEditer.prix?.toString() || '',
              categorie: produitAEditer.categorie || '',
              quantiteEnStock: produitAEditer.quantiteEnStock?.toString() || ''
            });
            setOriginalMainImageUrl(produitAEditer.urlImagePrincipale || '');
            setOriginalGalleryUrls(produitAEditer.urlImagesGalerie || []);
            setMainImageUrl(produitAEditer.urlImagePrincipale || '');
            setGalleryItems((produitAEditer.urlImagesGalerie || []).map(url => ({ url, file: null })));
          } else if (isMounted) {
            setMessage({ type: 'danger', text: 'Produit introuvable.' });
          }
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    };
    chargerDonnees();
    return () => { isMounted = false; };
  }, [editId, isEditMode, produitExistant]);

  useEffect(() => {
    return () => {
      if (mainImageUrl && !mainImageUrl.startsWith('http')) URL.revokeObjectURL(mainImageUrl);
      galleryItems.forEach(item => { if (!item.url.startsWith('http')) URL.revokeObjectURL(item.url); });
    };
  }, [mainImageUrl, galleryItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'danger', text: 'L\'image principale ne doit pas dépasser 5 Mo.' });
        return;
      }
      if (mainImageUrl && !mainImageUrl.startsWith('http')) URL.revokeObjectURL(mainImageUrl);
      setMainImageFile(file);
      setMainImageUrl(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const removeMainImage = () => {
    if (mainImageUrl && !mainImageUrl.startsWith('http')) URL.revokeObjectURL(mainImageUrl);
    setMainImageFile(null);
    setMainImageUrl('');
  };

  const handleGalleryImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (galleryItems.length + newFiles.length > 15) {
      setMessage({ type: 'danger', text: 'Vous ne pouvez pas ajouter plus de 15 images au total.' });
      return;
    }
    const validItems = [];
    newFiles.forEach(file => {
      if (file.size <= 5 * 1024 * 1024) validItems.push({ url: URL.createObjectURL(file), file });
    });
    if (validItems.length < newFiles.length) setMessage({ type: 'warning', text: 'Certaines images ont été ignorées car elles dépassent 5 Mo.' });
    setGalleryItems(prev => [...prev, ...validItems]);
  };

  const removeGalleryImage = (index) => {
    const itemToRemove = galleryItems[index];
    if (!itemToRemove.url.startsWith('http')) URL.revokeObjectURL(itemToRemove.url);
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.nomProduit || !formData.prix || !formData.quantiteEnStock) {
      setMessage({ type: 'danger', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    if (!isEditMode && !mainImageUrl) {
      setMessage({ type: 'danger', text: 'Veuillez ajouter une image principale.' });
      return;
    }

    setIsLoading(true);
    try {
      let finalMainImageUrl = mainImageUrl;
      let finalGalleryUrls = galleryItems.map(item => item.url);

      if (mainImageFile) {
        const uploadRes = await uploaderImages([mainImageFile]);
        finalMainImageUrl = uploadRes.donnees.urls[0];
      }

      const filesToUpload = galleryItems.filter(item => item.file !== null).map(item => item.file);
      if (filesToUpload.length > 0) {
        const galleryRes = await uploaderImages(filesToUpload);
        const newHttpUrls = galleryRes.donnees.urls;
        let urlIndex = 0;
        finalGalleryUrls = finalGalleryUrls.map(url => (!url.startsWith('http') ? newHttpUrls[urlIndex++] : url));
      }

      const imagesToDelete = [];
      if (originalMainImageUrl && originalMainImageUrl !== finalMainImageUrl) imagesToDelete.push(originalMainImageUrl);
      originalGalleryUrls.forEach(oldUrl => { if (!finalGalleryUrls.includes(oldUrl)) imagesToDelete.push(oldUrl); });

      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map(url => supprimerImage(url).catch(err => console.error('Erreur suppression image:', err))));
      }

      const productData = {
        ...formData,
        prix: parseInt(formData.prix, 10),
        quantiteEnStock: parseInt(formData.quantiteEnStock, 10),
        urlImagePrincipale: finalMainImageUrl,
        urlImagesGalerie: finalGalleryUrls
      };

      if (isEditMode && editId) {
        await mettreAJourProduit(editId, productData);
        setMessage({ type: 'success', text: 'Produit mis à jour avec succès !' });
      } else {
        await creerProduit(productData);
        setMessage({ type: 'success', text: 'Produit ajouté avec succès !' });
      }
      setTimeout(() => navigate('/dashboard/produits'), 1500);
    } catch (err) {
      console.error('Erreur sauvegarde produit:', err);
      setMessage({ type: 'danger', text: err.message || 'Une erreur est survenue.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeconnexion = () => { deconnexion(); navigate('/'); };

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>
                <i className={`bi bi-${isEditMode ? 'pencil-square' : 'plus-circle'} me-2`} style={{ color: 'var(--izishop-primaire)' }}></i>
                {isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}
              </h1>
              <p className="text-muted small mb-0">
                {isEditMode ? 'Mettez à jour les informations de votre article.' : 'Remplissez les informations ci-dessous pour mettre en vente votre article.'}
              </p>
            </div>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => navigate('/dashboard/produits')}>
              <i className="bi bi-arrow-left"></i> Retour aux produits
            </button>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type} border-0 shadow-sm d-flex align-items-center gap-2 mb-4 rounded-3`} role="alert">
              <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <span className="small fw-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="carte-izishop p-4 p-md-5 rounded-4 bg-white">
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-info-circle me-2 text-muted"></i>Informations générales
                </h5>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Nom du produit <span className="text-danger">*</span></label>
                  <input type="text" name="nomProduit" className="form-control form-control-lg bg-light border-0 rounded-3" value={formData.nomProduit} onChange={handleInputChange} placeholder="Ex: Chemise Wax Premium" required />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small">Prix (FCFA) <span className="text-danger">*</span></label>
                    <input type="number" name="prix" className="form-control form-control-lg bg-light border-0 rounded-3" value={formData.prix} onChange={handleInputChange} placeholder="Ex: 15000" min="1" required />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small">Quantité en stock <span className="text-danger">*</span></label>
                    <input type="number" name="quantiteEnStock" className="form-control form-control-lg bg-light border-0 rounded-3" value={formData.quantiteEnStock} onChange={handleInputChange} placeholder="Ex: 10" min="1" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Catégorie</label>
                  <input type="text" name="categorie" className="form-control form-control-lg bg-light border-0 rounded-3" value={formData.categorie} onChange={handleInputChange} placeholder="Ex: Vêtements, Électronique..." />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Description</label>
                  <textarea name="description" className="form-control bg-light border-0 rounded-3" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Présentez les qualités et caractéristiques essentielles..."></textarea>
                </div>
              </div>
              <div className="col-12 col-lg-5">
                <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--izishop-secondaire)' }}>
                  <i className="bi bi-images me-2 text-muted"></i>Visuels du produit
                </h5>
                <div className="mb-4">
                  <label className="form-label fw-bold small d-flex justify-content-between">
                    <span>Image principale <span className="text-danger">*</span></span>
                    <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>Couverture</span>
                  </label>
                  <div className="border border-2 rounded-4 p-3 text-center bg-light position-relative transition-all" style={{ borderStyle: 'dashed', borderColor: 'var(--izishop-primaire)' }}>
                    {mainImageUrl ? (
                      <div className="position-relative overflow-hidden rounded-3">
                        <img src={mainImageUrl} alt="Aperçu principal" className="img-fluid rounded-3 w-100" style={{ maxHeight: '220px', objectFit: 'cover' }} />
                        <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', padding: 0 }} onClick={removeMainImage} title="Supprimer l'image">
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ) : (
                      <label className="d-flex flex-column align-items-center justify-content-center w-100 py-4" style={{ minHeight: '160px', cursor: 'pointer' }}>
                        <i className="bi bi-cloud-arrow-up fs-1 mb-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                        <span className="small text-secondary fw-bold">Sélectionner l'image principale</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Formats acceptés: JPG, PNG, WebP (Max 5 Mo)</span>
                        <input type="file" accept="image/*" className="d-none" onChange={handleMainImageChange} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold small mb-0">Galerie complémentaire</label>
                    <span className="badge bg-light text-secondary border fw-normal">{galleryItems.length} / 15</span>
                  </div>
                  <div className="row g-2 mb-3">
                    {galleryItems.map((item, index) => (
                      <div className="col-4 position-relative" key={index}>
                        <div className="ratio ratio-1x1 rounded-3 overflow-hidden border bg-light">
                          <img src={item.url} alt={`Galerie ${index + 1}`} style={{ objectFit: 'cover' }} />
                        </div>
                        <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', padding: 0, fontSize: '0.65rem' }} onClick={() => removeGalleryImage(index)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                    {galleryItems.length < 15 && (
                      <div className="col-4">
                        <label className="d-flex flex-column align-items-center justify-content-center w-100 h-100 border border-2 rounded-3 bg-light transition-all" style={{ minHeight: '85px', borderStyle: 'dashed', borderColor: 'var(--izishop-primaire)', cursor: 'pointer' }}>
                          <i className="bi bi-plus-lg fs-4" style={{ color: 'var(--izishop-primaire)' }}></i>
                          <span className="text-muted" style={{ fontSize: '0.65rem' }}>Ajouter</span>
                          <input type="file" accept="image/*" multiple className="d-none" onChange={handleGalleryImagesChange} />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="p-2 rounded-3 bg-light border d-flex align-items-start gap-2" style={{ borderStyle: 'dashed', borderColor: 'rgba(251, 190, 36, 0.3)' }}>
                    <i className="bi bi-lightning-charge-fill text-warning flex-shrink-0 mt-1" style={{ fontSize: '0.85rem' }}></i>
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                      {isEditMode ? 'Supprimer une image la retirera définitivement du stockage. ' : ''}
                      Vos visuels seront automatiquement optimisés à 85% sans perte visible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top">
              <button type="button" className="btn btn-light px-4 py-2 fw-semibold rounded-3" style={{ color: 'var(--izishop-secondaire)' }} onClick={() => navigate('/dashboard/produits')} disabled={isLoading}>
                Annuler
              </button>
              <button type="submit" className="bouton-principal px-4 py-2 d-inline-flex align-items-center gap-2 rounded-3 fw-bold" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span>Traitement en cours...</span></>
                ) : (
                  <><i className="bi bi-check2-circle fs-5"></i><span>{isEditMode ? 'Mettre à jour le produit' : 'Enregistrer le produit'}</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AjouterProduit;