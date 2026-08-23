// Fichier: frontend/src/components/Features.jsx
import React from 'react';
import { FaWhmcs } from 'react-icons/fa6';
import { TfiLayersAlt } from 'react-icons/tfi';
import { FaEarthAfrica } from 'react-icons/fa6';

const Features = () => {
  return (
    <section id="features" className="features-section py-5">
      <div className="container py-lg-5">
        <div className="text-center mb-5">
          <h2 className="titre-section fw-bold mb-3">Pourquoi choisir iziShop ?</h2>
          <p className="texte-description mx-auto" style={{ maxWidth: '700px' }}>
            Nous avons conçu une plateforme qui s'adapte à votre quotidien, pour vous
            permettre de vous concentrer sur ce qui compte : votre croissance.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="carte-feature text-center p-4 h-100">
              <div className="icone-feature mb-3 texte-primaire">
                <FaWhmcs />
              </div>
              <h3 className="h5 fw-bold mb-3">100% autonome</h3>
              <p className="small text-muted">
                Ne dépensez plus des fortunes. Créez, modifiez et gérez votre boutique
                vous-même en quelques clics, sans aucune connaissance technique. Notre
                équipe se charge de tout le reste.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="carte-feature text-center p-4 h-100">
              <div className="icone-feature mb-3 texte-primaire">
                <TfiLayersAlt />
              </div>
              <h3 className="h5 fw-bold mb-3">Catalogue clair et organisé</h3>
              <p className="small text-muted">
                Fini les prix perdus dans les messages. Vos clients accèdent à une boutique
                structurée où chaque produit est mis en valeur avec son prix réel.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="carte-feature text-center p-4 h-100">
              <div className="icone-feature mb-3 texte-primaire">
                <FaEarthAfrica />
              </div>
              <h3 className="h5 fw-bold mb-3">Adapté aux réalités locales</h3>
              <p className="small text-muted">
                Une interface légère qui consomme peu de données et des solutions
                d'abonnement pensées pour vos moyens de paiement habituels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;