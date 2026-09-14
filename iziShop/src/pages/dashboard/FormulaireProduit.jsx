// Fichier: frontend/src/pages/dashboard/FormulaireProduit.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import {
  creerProduit,
  mettreAJourProduit,
  obtenirProduitParId,
  uploaderImages,
  supprimerImage,
} from '../../lib/api';
import { useData } from '../../context/DataContext';
import LayoutDashboard from '../../components/LayoutDashboard';

const MAX_IMAGES_GALERIE = 12;
const MAX_TAILLE_IMAGE = 5 * 1024 * 1024;
const R = '5px';

const SkeletonFormulaireProduit = () => (
  <LayoutDashboard>
    <style>{`
      @keyframes skeleton-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      .skel { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 800px 100%; animation: skeleton-shimmer 1.5s infinite linear; border-radius: 5px; }
    `}</style>
    <div className="p-3 p-md-4 flex-grow-1">
      <div className="mb-4">
        <div className="skel mb-2" style={{ width: '120px', height: '14px' }}></div>
        <div className="skel mb-2" style={{ width: '250px', height: '28px' }}></div>
        <div className="skel" style={{ width: '350px', height: '14px' }}></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="carte-izishop p-3 mb-3">
            <div className="skel mb-3" style={{ width: '150px', height: '20px' }}></div>
            <div className="skel mb-3" style={{ width: '100%', aspectRatio: '1/1', maxHeight: '250px' }}></div>
          </div>
          <div className="carte-izishop p-3">
            <div className="skel mb-3" style={{ width: '100px', height: '20px' }}></div>
            <div className="row g-2">{[1, 2, 3].map(i => (<div key={i} className="col-4"><div className="skel" style={{ aspectRatio: '1/1' }}></div></div>))}</div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="carte-izishop p-3">
            <div className="skel mb-4" style={{ width: '180px', height: '20px' }}></div>
            <div className="skel mb-3" style={{ width: '100%', height: '40px' }}></div>
            <div className="skel mb-3" style={{ width: '100%', height: '80px' }}></div>
            <div className="row g-3 mb-3">
              <div className="col-6"><div className="skel" style={{ width: '100%', height: '40px' }}></div></div>
              <div className="col-6"><div className="skel" style={{ width: '100%', height: '40px' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutDashboard>
);

const FormulaireProduit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idProduit: paramIdProduit } = useParams();
  const [searchParams] = useSearchParams();

  // ✅ Categories depuis le DataContext (déjà chargées)
  const { categories, rafraichir } = useData();

  const editId = searchParams.get('edit') || paramIdProduit;
  const produitDepuisState = location.state?.produit;
  const estEdition = Boolean(editId);
  const [chargement, setChargement] = useState(estEdition && !produitDepuisState);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nomProduit: '',
    description: '',
    prix: '',
    categorie: '',
    quantiteEnStock: '',
  });
  const [imagePrincipale, setImagePrincipale] = useState({ fichier: null, preview: '', url: '' });
  const [galerie, setGalerie] = useState([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const inputImagePrincipaleRef = useRef(null);
  const inputGalerieRef = useRef(null);

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ❌ ANCIEN useEffect pour charger les catégories SUPPRIMÉ
  // Les catégories viennent maintenant du DataContext

  useEffect(() => {
    if (!estEdition) return;
    if (produitDepuisState) {
      const p = produitDepuisState;
      setFormData({
        nomProduit: p.nomProduit || '',
        description: p.description || '',
        prix: p.prix?.toString() || '',
        categorie: p.categorie || '',
        quantiteEnStock: p.quantiteEnStock?.toString() || '',
      });
      if (p.urlImagePrincipale) setImagePrincipale({ fichier: null, preview: p.urlImagePrincipale, url: p.urlImagePrincipale });
      if (p.urlImagesGalerie?.length > 0) setGalerie(p.urlImagesGalerie.map(url => ({ fichier: null, preview: url, url })));
      return;
    }
    const charger = async () => {
      try {
        const res = await obtenirProduitParId(editId);
        if (res?.donnees) {
          const p = res.donnees;
          setFormData({
            nomProduit: p.nomProduit || '',
            description: p.description || '',
            prix: p.prix?.toString() || '',
            categorie: p.categorie || '',
            quantiteEnStock: p.quantiteEnStock?.toString() || '',
          });
          if (p.urlImagePrincipale) setImagePrincipale({ fichier: null, preview: p.urlImagePrincipale, url: p.urlImagePrincipale });
          if (p.urlImagesGalerie?.length > 0) setGalerie(p.urlImagesGalerie.map(url => ({ fichier: null, preview: url, url })));
        }
      } catch (error) {
        afficherMessage('danger', 'Impossible de charger le produit.');
        navigate('/dashboard/produits');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [editId, estEdition, produitDepuisState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validerImage = (file) => {
    if (!file.type.startsWith('image/')) {
      afficherMessage('danger', `"${file.name}" n'est pas une image valide.`);
      return false;
    }
    if (file.size > MAX_TAILLE_IMAGE) {
      afficherMessage('danger', `"${file.name}" dépasse 5 Mo.`);
      return false;
    }
    return true;
  };

  const handleImagePrincipale = (e) => {
    const file = e.target.files[0];
    if (!file || !validerImage(file)) return;
    setImagePrincipale({ fichier: file, preview: URL.createObjectURL(file), url: '' });
  };

  const handleGalerie = (e) => {
    const files = Array.from(e.target.files);
    const placesDisponibles = MAX_IMAGES_GALERIE - galerie.length;
    if (placesDisponibles <= 0) {
      afficherMessage('warning', `Maximum ${MAX_IMAGES_GALERIE} images en galerie.`);
      return;
    }
    const fichiersValides = files.filter(validerImage).slice(0, placesDisponibles);
    const nouvelles = fichiersValides.map(f => ({ fichier: f, preview: URL.createObjectURL(f), url: '' }));
    setGalerie(prev => [...prev, ...nouvelles]);
    if (fichiersValides.length < files.length) {
      afficherMessage('warning', `${files.length - fichiersValides.length} image(s) ignorée(s) (limite atteinte ou invalide).`);
    }
  };

  const supprimerImageGalerie = async (index) => {
    const img = galerie[index];
    if (img.url && !img.fichier) {
      await supprimerImage(img.url).catch(() => { });
    }
    setGalerie(prev => prev.filter((_, i) => i !== index));
  };

  const definirCommePrincipale = (index) => {
    const img = galerie[index];
    const anciennePrincipale = imagePrincipale;
    setImagePrincipale(img);
    const nouvelleGalerie = galerie.filter((_, i) => i !== index);
    if (anciennePrincipale.preview) nouvelleGalerie.push(anciennePrincipale);
    setGalerie(nouvelleGalerie);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nomProduit.trim()) return afficherMessage('danger', 'Le nom du produit est requis.');
    if (!formData.prix || parseFloat(formData.prix) < 0) return afficherMessage('danger', 'Prix invalide.');
    if (!formData.quantiteEnStock || parseInt(formData.quantiteEnStock) < 0) return afficherMessage('danger', 'Stock invalide.');
    if (!imagePrincipale.preview) return afficherMessage('danger', 'Image principale obligatoire.');

    setSauvegarde(true);
    setUploadEnCours(true);
    try {
      const fichiersAUploader = [];
      if (imagePrincipale.fichier) fichiersAUploader.push(imagePrincipale.fichier);
      const fichiersGalerie = galerie.filter(g => g.fichier).map(g => g.fichier);
      fichiersAUploader.push(...fichiersGalerie);

      let urlsNouvelles = [];
      if (fichiersAUploader.length > 0) {
        const resUpload = await uploaderImages(fichiersAUploader);
        urlsNouvelles = resUpload?.donnees?.urls || [];
      }

      let urlImagePrincipale = imagePrincipale.url;
      if (imagePrincipale.fichier) urlImagePrincipale = urlsNouvelles.shift();

      const urlImagesGalerie = galerie.map(g => {
        if (g.fichier) return urlsNouvelles.shift();
        return g.url;
      }).filter(Boolean);

      const payload = {
        nomProduit: formData.nomProduit.trim(),
        description: formData.description.trim() || null,
        prix: parseFloat(formData.prix),
        categorie: formData.categorie.trim() || null,
        quantiteEnStock: parseInt(formData.quantiteEnStock),
        urlImagePrincipale,
        urlImagesGalerie,
      };

      if (estEdition) {
        await mettreAJourProduit(editId, payload);
        afficherMessage('success', 'Produit mis à jour avec succès !');
      } else {
        await creerProduit(payload);
        afficherMessage('success', 'Produit créé avec succès !');
      }

      // ✅ Rafraîchir les produits dans le DataContext
      await rafraichir(['produits']);

      setTimeout(() => navigate('/dashboard/produits'), 1200);
    } catch (err) {
      console.error(err);
      afficherMessage('danger', err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setUploadEnCours(false);
      setSauvegarde(false);
    }
  };

  if (chargement) return <SkeletonFormulaireProduit />;

  return (
    <LayoutDashboard>
      <div className="p-3 p-md-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <button onClick={() => navigate('/dashboard/produits')} className="btn btn-sm btn-link text-decoration-none p-0 mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.8rem' }}>
              <i className="bi bi-arrow-left me-1"></i>Retour aux produits
            </button>
            <h1 className="h5 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
              <i className={`bi ${estEdition ? 'bi-pencil-square' : 'bi-plus-square'} me-2`} style={{ color: 'var(--izishop-primaire)' }}></i>
              {estEdition ? 'Modifier le produit' : 'Ajouter un produit'}
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
              {estEdition ? 'Modifiez les informations de votre produit.' : 'Remplissez les informations pour créer un nouveau produit.'}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-3 border-0 shadow-sm rounded py-2`} style={{ fontSize: '0.85rem' }}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'}`}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close btn-close-sm ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-lg-5">
              <div className="carte-izishop p-3 mb-3">
                <h6 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                  <i className="bi bi-image me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                  Image principale <span className="text-danger">*</span>
                </h6>
                <div className="rounded position-relative overflow-hidden mb-2" style={{ aspectRatio: '1/1', maxHeight: '220px', backgroundColor: '#f8f9fa', border: imagePrincipale.preview ? 'none' : '2px dashed rgba(30, 41, 59, 0.2)', cursor: 'pointer' }} onClick={() => inputImagePrincipaleRef.current?.click()}>
                  {imagePrincipale.preview ? (
                    <>
                      <img src={imagePrincipale.preview} alt="Principale" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      <div className="position-absolute top-0 end-0 m-1 d-flex gap-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setImagePrincipale({ fichier: null, preview: '', url: '' }); }} className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }}>
                          <i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                      <i className="bi bi-cloud-upload fs-4 mb-1"></i>
                      <small className="fw-bold" style={{ fontSize: '0.75rem' }}>Cliquez pour ajouter</small>
                      <small style={{ fontSize: '0.65rem' }}>JPG, PNG, WebP • 5 Mo max</small>
                    </div>
                  )}
                </div>
                <input ref={inputImagePrincipaleRef} type="file" accept="image/*" className="d-none" onChange={handleImagePrincipale} />
              </div>

              <div className="carte-izishop p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                    <i className="bi bi-images me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                    Galerie
                  </h6>
                  <span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>{galerie.length} / {MAX_IMAGES_GALERIE}</span>
                </div>
                <div className="row g-2 mb-2">
                  {galerie.map((img, idx) => (
                    <div key={idx} className="col-4">
                      <div className="position-relative rounded overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        <img src={img.preview} alt={`Galerie ${idx + 1}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        <div className="position-absolute top-0 end-0 m-1 d-flex gap-1">
                          <button type="button" onClick={() => definirCommePrincipale(idx)} className="btn btn-sm btn-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', padding: 0 }} title="Définir comme principale">
                            <i className="bi bi-star-fill" style={{ fontSize: '0.6rem' }}></i>
                          </button>
                          <button type="button" onClick={() => supprimerImageGalerie(idx)} className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', padding: 0 }}>
                            <i className="bi bi-x" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {galerie.length < MAX_IMAGES_GALERIE && (
                    <div className="col-4">
                      <div className="rounded d-flex align-items-center justify-content-center" style={{ aspectRatio: '1/1', border: '2px dashed rgba(30, 41, 59, 0.2)', cursor: 'pointer', backgroundColor: '#f8f9fa' }} onClick={() => inputGalerieRef.current?.click()}>
                        <div className="text-center text-muted">
                          <i className="bi bi-plus-lg" style={{ fontSize: '1rem' }}></i>
                          <small className="d-block" style={{ fontSize: '0.6rem' }}>Ajouter</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={inputGalerieRef} type="file" accept="image/*" multiple className="d-none" onChange={handleGalerie} />
              </div>
            </div>

            <div className="col-lg-7">
              <div className="carte-izishop p-3 mb-3">
                <h6 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                  <i className="bi bi-info-circle me-1" style={{ color: 'var(--izishop-primaire)' }}></i>
                  Informations du produit
                </h6>
                <div className="mb-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Nom du produit <span className="text-danger">*</span></label>
                  <input type="text" name="nomProduit" className="form-control form-control-sm bg-light border-0 rounded" value={formData.nomProduit} onChange={handleChange} placeholder="Ex: Sac à main en cuir" maxLength={100} required />
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>{formData.nomProduit.length}/100</small>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Description</label>
                  <textarea name="description" className="form-control form-control-sm bg-light border-0 rounded" rows="3" value={formData.description} onChange={handleChange} placeholder="Matière, dimensions, couleurs disponibles..." maxLength={2000} />
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>{formData.description.length}/2000</small>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Prix (FCFA) <span className="text-danger">*</span></label>
                    <div className="input-group input-group-sm">
                      <input type="number" name="prix" className="form-control form-control-sm bg-light border-0 rounded-start" value={formData.prix} onChange={handleChange} placeholder="0" min="0" step="1" required />
                      <span className="input-group-text bg-light border-0 rounded-end" style={{ fontSize: '0.75rem' }}>FCFA</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Quantité en stock <span className="text-danger">*</span></label>
                    <input type="number" name="quantiteEnStock" className="form-control form-control-sm bg-light border-0 rounded" value={formData.quantiteEnStock} onChange={handleChange} placeholder="0" min="0" max="99999" required />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Catégorie</label>
                  <select name="categorie" className="form-select form-select-sm bg-light border-0 rounded" value={formData.categorie} onChange={handleChange}>
                    {(categories || []).map(cat => (
                      <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 py-2">
                <button type="button" className="btn btn-light btn-sm px-3 py-2 fw-semibold rounded" onClick={() => navigate('/dashboard/produits')} disabled={sauvegarde} style={{ fontSize: '0.8rem' }}>Annuler</button>
                <button type="submit" className="bouton-principal btn-sm px-3 py-2 d-inline-flex align-items-center gap-2 rounded fw-bold" disabled={sauvegarde || uploadEnCours} style={{ fontSize: '0.8rem' }}>
                  {sauvegarde ? (<><span className="spinner-border spinner-border-sm"></span><span>Enregistrement...</span></>) : (<><i className="bi bi-check2-circle"></i><span>{estEdition ? 'Mettre à jour' : 'Créer le produit'}</span></>)}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </LayoutDashboard>
  );
};

export default FormulaireProduit;