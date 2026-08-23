// Fichier: frontend/src/components/Pricing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePrixPublic from '../hooks/usePrixPublic';

const Pricing = () => {
  const navigate = useNavigate();
  const { prixData, chargement } = usePrixPublic();

  const formatNombre = (nombre) => {
    return new Intl.NumberFormat('fr-FR').format(nombre);
  };

  return (
    <section id="pricing" className="pricing-section py-5">
      <div className="container py-lg-4">
        <div className="text-center mb-4 mt-5">
          <h2 className="titre-section fw-bold">Un tarif simple, sans surprise</h2>
          <div className="barre-accent mx-auto mt-3"></div>
          <p className="texte-description mx-auto mt-3" style={{ maxWidth: '500px' }}>
            Pas de <strong>commissions</strong> sur vos ventes. Pas de{' '}
            <strong>frais cachés</strong>. Juste le nécessaire pour faire décoller votre business.
          </p>
        </div>

        <div className="row align-items-center g-4 mb-5 justify-content-center">
          <div className="col-lg-5">
            <div className="carte-pricing populaire p-4 p-md-5 text-center">
              <span className="badge-promo d-inline-block">Offre unique</span>
              <h3 className="h4 fw-bold mb-0">Abonnement mensuel</h3>

              <div className="prix-container my-2">
                {chargement ? (
                  <span className="devise">Chargement du prix...</span>
                ) : prixData ? (
                  <>
                    <span className="montant">{formatNombre(prixData.prix)}</span>
                    <span className="devise">{prixData.symboleDevise}</span>
                    <span className="text-muted small d-block mt-1">
                      Tarif adapté à votre pays : {prixData.nomPays}
                    </span>
                  </>
                ) : (
                  <span className="devise">Prix indisponible</span>
                )}
              </div>

              <ul className="liste-avantages list-unstyled mb-4 text-start mx-auto" style={{ maxWidth: '320px' }}>
                <li><span className="check">✓</span> 1 boutique personnalisée</li>
                <li><span className="check">✓</span> Catalogue produits illimité</li>
                <li><span className="check">✓</span> Gestion des stocks en temps réel</li>
                <li><span className="check">✓</span> Notifications de commandes</li>
                <li><span className="check">✓</span> Support prioritaire par WhatsApp</li>
                <li><span className="check">✓</span> Zéro commission sur vos revenus</li>
              </ul>

              <button
                className="bouton-principal w-100 py-3 mb-3"
                onClick={() => navigate('/auth', { state: { mode: 'register' } })}
              >
                Commencer mes {prixData ? prixData.dureeEssaiJours : 35} jours gratuits
              </button>
              <p className="small text-muted fw-bold mb-0">Aucune carte bancaire n'est requise</p>
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block text-center">
            <div className="illustration-pricing-wrapper">
              <img
                src="/zouck/iziShop.png"
                alt="Gestion simplifiée avec iziShop"
                className="img-fluid illustration-pricing"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;