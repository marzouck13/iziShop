// Fichier: frontend/src/pages/BoutiquePublique.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BoutiquePublique = () => {
  const { sousDomaine } = useParams();
  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // États pour le panier et l'interface
  const [panier, setPanier] = useState([]);
  const [estPanierOuvert, setEstPanierOuvert] = useState(false);
  const [produitSelectionne, setProduitSelectionne] = useState(null);
  const [estDetailOuvert, setEstDetailOuvert] = useState(false);
  const [imageActive, setImageActive] = useState(0);
  const [quantiteDetail, setQuantiteDetail] = useState(1);

  // Chargement des données de la boutique
  useEffect(() => {
    const chargerBoutique = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/boutique/publique/${sousDomaine}`);
        const data = await response.json();
        
        if (response.ok) {
          setBoutique(data.donnees);
        } else {
          setErreur(data.message || 'Cette boutique est introuvable ou n\'est pas visible.');
        }
      } catch (err) {
        setErreur('Impossible de charger la boutique. Vérifiez votre connexion.');
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    chargerBoutique();
  }, [sousDomaine]);

  // --- LOGIQUE DU PANIER ---
  const ajouterAuPanier = (produit, qte = 1) => {
    setPanier(prev => {
      const existant = prev.find(p => p.id === produit.id);
      if (existant) {
        return prev.map(p => p.id === produit.id ? { ...p, quantite: p.quantite + qte } : p);
      }
      return [...prev, { ...produit, quantite: qte }];
    });
    setEstPanierOuvert(true);
  };

  const modifierQuantitePanier = (id, delta) => {
    setPanier(prev => prev.map(p => {
      if (p.id === id) {
        const nouvelleQte = Math.max(1, p.quantite + delta);
        return { ...p, quantite: nouvelleQte };
      }
      return p;
    }));
  };

  const retirerDuPanier = (id) => {
    setPanier(prev => prev.filter(p => p.id !== id));
  };

  const totalPanier = panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0);
  const nbArticlesPanier = panier.reduce((acc, item) => acc + item.quantite, 0);

  // --- LOGIQUE DE COMMANDE WHATSAPP ---
  const passerCommande = () => {
    if (!boutique?.lienWhatsApp || panier.length === 0) return;

    let message = `*Bonjour, je souhaite passer une commande sur votre boutique en ligne :*\n\n`;
    panier.forEach((item, index) => {
      message += `${index + 1}. *${item.nomProduit}* (x${item.quantite}) - ${formatPrix(item.prix * item.quantite)} FCFA\n`;
    });
    message += `\n*TOTAL DE LA COMMANDE : ${formatPrix(totalPanier)} FCFA*\n\n`;
    message += `Merci de me confirmer la disponibilité et les modalités de livraison.`;

    const numeroPropre = boutique.lienWhatsApp.replace(/\D/g, '');
    const url = `https://wa.me/${numeroPropre}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- LOGIQUE MODAL DÉTAIL ---
  const ouvrirDetail = (produit) => {
    setProduitSelectionne(produit);
    setImageActive(0);
    setQuantiteDetail(1);
    setEstDetailOuvert(true);
  };

  const fermerDetail = () => {
    setEstDetailOuvert(false);
    setProduitSelectionne(null);
  };

  // Utilitaires
  const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix);
  const obtenirToutesLesImages = (produit) => {
    const images = [produit.urlImagePrincipale];
    if (produit.urlImagesGalerie && Array.isArray(produit.urlImagesGalerie)) {
      images.push(...produit.urlImagesGalerie);
    }
    return images.filter(img => img); // Retirer les valeurs nulles
  };

  if (chargement) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--izishop-fond)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--izishop-primaire)' }}></div>
          <p className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-shop display-1 text-muted mb-3"></i>
        <h2 className="fw-bold" style={{ color: 'var(--izishop-secondaire)' }}>Oups !</h2>
        <p className="text-muted mb-4">{erreur}</p>
        <a href="/" className="bouton-principal px-4 py-2 text-decoration-none">Retour à l'accueil iziShop</a>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* ==========================================
          BARRE DE NAVIGATION (Responsive)
      ========================================== */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#" style={{ color: 'var(--izishop-secondaire)' }}>
            {boutique.logoUrl ? (
              <img src={boutique.logoUrl} alt="Logo" style={{ height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <i className="bi bi-shop fs-3" style={{ color: 'var(--izishop-primaire)' }}></i>
            )}
            <span>{boutique.nomBoutique}</span>
          </a>
          
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <button 
              className="btn btn-outline-secondary position-relative d-flex align-items-center gap-2"
              onClick={() => setEstPanierOuvert(true)}
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span className="d-none d-sm-inline">Panier</span>
              {nbArticlesPanier > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                  {nbArticlesPanier}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ==========================================
          EN-TÊTE DE LA BOUTIQUE (Hero)
      ========================================== */}
      <header className="bg-white border-bottom py-5 mb-4">
        <div className="container text-center">
          {boutique.logoUrl && (
            <img src={boutique.logoUrl} alt="Logo" className="mb-3 rounded-circle shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          )}
          <h1 className="h2 fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)' }}>{boutique.nomBoutique}</h1>
          <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
            {boutique.description || 'Bienvenue dans notre boutique en ligne. Découvrez nos meilleurs produits !'}
          </p>
        </div>
      </header>

      {/* ==========================================
          GRILLE DES PRODUITS
      ========================================== */}
      <main className="container flex-grow-1 pb-5">
        {boutique.produits.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <p className="text-muted">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {boutique.produits.map((produit) => (
              <div key={produit.id} className="col">
                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div 
                    className="position-relative bg-light" 
                    style={{ paddingTop: '100%', cursor: 'pointer' }}
                    onClick={() => ouvrirDetail(produit)}
                  >
                    <img 
                      src={produit.urlImagePrincipale || 'https://via.placeholder.com/400x400?text=Pas+d\'image'} 
                      alt={produit.nomProduit} 
                      className="position-absolute top-0 start-0 w-100 h-100" 
                      style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                  <div className="card-body d-flex flex-column p-3">
                    <h5 className="card-title fw-bold mb-1 text-truncate" style={{ color: 'var(--izishop-secondaire)' }} title={produit.nomProduit}>
                      {produit.nomProduit}
                    </h5>
                    <p className="card-text text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                      {produit.description || 'Aucune description disponible.'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-bold fs-5" style={{ color: 'var(--izishop-primaire)' }}>
                        {formatPrix(produit.prix)} <small className="text-muted fs-6 fw-normal">FCFA</small>
                      </span>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => ouvrirDetail(produit)} title="Voir en détail">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm text-white rounded-circle" style={{ backgroundColor: 'var(--izishop-secondaire)' }} onClick={() => ajouterAuPanier(produit)} title="Ajouter au panier">
                          <i className="bi bi-cart-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="bg-white border-top py-4 mt-auto">
        <div className="container text-center">
          <p className="text-muted small mb-0">
            Propulsé par <span className="fw-bold" style={{ color: 'var(--izishop-primaire)' }}>iziShop</span>
          </p>
        </div>
      </footer>

      {/* ==========================================
          MODAL : DÉTAIL DU PRODUIT (Galerie 15 photos)
      ========================================== */}
      {estDetailOuvert && produitSelectionne && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" onClick={fermerDetail}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--izishop-secondaire)' }}>{produitSelectionne.nomProduit}</h5>
                <button type="button" className="btn-close" onClick={fermerDetail}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Colonne Images */}
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 mb-3 overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      <img 
                        src={obtenirToutesLesImages(produitSelectionne)[imageActive] || 'https://via.placeholder.com/400x400'} 
                        alt="Vue principale" 
                        className="w-100 h-100" 
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                    {/* Miniatures (si plus d'une image) */}
                    {obtenirToutesLesImages(produitSelectionne).length > 1 && (
                      <div className="d-flex gap-2 overflow-auto pb-2">
                        {obtenirToutesLesImages(produitSelectionne).map((img, idx) => (
                          <img 
                            key={idx}
                            src={img} 
                            alt={`Miniature ${idx}`}
                            className="rounded-2 border"
                            style={{ 
                              width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer',
                              borderColor: imageActive === idx ? 'var(--izishop-primaire)' : 'transparent',
                              borderWidth: '2px'
                            }}
                            onClick={() => setImageActive(idx)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Colonne Infos */}
                  <div className="col-md-6 d-flex flex-column">
                    <h3 className="fw-bold mb-3" style={{ color: 'var(--izishop-primaire)' }}>
                      {formatPrix(produitSelectionne.prix)} FCFA
                    </h3>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Description :</h6>
                      <p className="text-muted" style={{ lineHeight: '1.6' }}>
                        {produitSelectionne.description || 'Aucune description fournie pour ce produit.'}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <label className="form-label fw-bold small">Quantité :</label>
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantiteDetail(Math.max(1, quantiteDetail - 1))}>-</button>
                        <span className="fw-bold" style={{ minWidth: '30px', textAlign: 'center' }}>{quantiteDetail}</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantiteDetail(quantiteDetail + 1)}>+</button>
                      </div>
                      <button 
                        className="btn w-100 py-2 fw-bold text-white" 
                        style={{ backgroundColor: 'var(--izishop-secondaire)', borderRadius: '8px' }}
                        onClick={() => {
                          ajouterAuPanier(produitSelectionne, quantiteDetail);
                          fermerDetail();
                        }}
                      >
                        <i className="bi bi-cart-plus me-2"></i>Ajouter au panier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          OFFCANVAS : PANIER D'ACHAT
      ========================================== */}
      <div className={`offcanvas offcanvas-end ${estPanierOuvert ? 'show' : ''}`} tabIndex="-1" style={{ width: '400px' }}>
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold" style={{ color: 'var(--izishop-secondaire)' }}>
            <i className="bi bi-cart3 me-2"></i>Mon Panier ({nbArticlesPanier})
          </h5>
          <button type="button" className="btn-close" onClick={() => setEstPanierOuvert(false)}></button>
        </div>
        <div className="offcanvas-body d-flex flex-column p-0">
          {panier.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
              <p className="text-muted">Votre panier est vide.</p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setEstPanierOuvert(false)}>Continuer mes achats</button>
            </div>
          ) : (
            <>
              <div className="flex-grow-1 overflow-auto p-3">
                {panier.map(item => (
                  <div key={item.id} className="d-flex gap-3 mb-3 p-2 bg-light rounded-3">
                    <img src={item.urlImagePrincipale || 'https://via.placeholder.com/80'} alt={item.nomProduit} className="rounded-2" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>{item.nomProduit}</h6>
                      <p className="text-muted small mb-2">{formatPrix(item.prix)} FCFA / unité</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2 bg-white rounded-2 border px-2 py-1">
                          <button className="btn btn-sm p-0 text-muted" onClick={() => modifierQuantitePanier(item.id, -1)}>-</button>
                          <span className="small fw-bold">{item.quantite}</span>
                          <button className="btn btn-sm p-0 text-muted" onClick={() => modifierQuantitePanier(item.id, 1)}>+</button>
                        </div>
                        <button className="btn btn-sm text-danger p-0" onClick={() => retirerDuPanier(item.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-top p-3 bg-white">
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Total :</span>
                  <span className="fw-bold fs-5" style={{ color: 'var(--izishop-primaire)' }}>{formatPrix(totalPanier)} FCFA</span>
                </div>
                <button 
                  className="btn w-100 py-2 fw-bold text-white" 
                  style={{ backgroundColor: '#25D366', borderRadius: '8px' }}
                  onClick={passerCommande}
                >
                  <i className="bi bi-whatsapp me-2"></i>Commander sur WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {estPanierOuvert && <div className="modal-backdrop fade show" onClick={() => setEstPanierOuvert(false)}></div>}

    </div>
  );
};

export default BoutiquePublique;



