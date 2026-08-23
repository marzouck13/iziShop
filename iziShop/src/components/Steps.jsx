// Fichier: frontend/src/components/Steps.jsx
import React from 'react';

const Steps = () => {
  const etapes = [
    {
      numero: '01',
      titre: 'Créez votre compte',
      description:
        'Inscrivez-vous en moins de 3 minutes avec votre email et votre numéro de téléphone. Aucun document complexe n\'est requis. Suite à votre inscription, une boutique vous sera automatiquement créée, vous la personnaliserez en suivant nos consignes.'
    },
    {
      numero: '02',
      titre: 'Ajoutez vos produits',
      description:
        'Prenez vos articles en photo directement avec votre téléphone, fixez vos prix et créez vos catégories en un clin\'œil. Que vous vendiez de la mode, de l\'électronique ou des services, l\'organisation de votre boutique est aussi simple que de poster un statut sur vos réseaux préférés.'
    },
    {
      numero: '03',
      titre: 'Partagez et vendez',
      description:
        'Obtenez votre lien personnalisé et partagez-le partout où vous voulez, même sur les réseaux. Recevez vos commandes directement dans votre espace et gérez vos stocks comme un professionnel. C\'est simple, rapide et efficace.'
    }
  ];

  return (
    <section id="steps" className="steps-section py-5 fond-clair">
      <div className="container py-lg-4">
        <div className="text-center mb-4">
          <h2 className="titre-section fw-bold">Votre boutique en 3 étapes</h2>
          <div className="barre-accent mx-auto mt-3"></div>
        </div>

        <div className="row g-3 mt-1">
          {etapes.map((etape, index) => (
            <div className="col-lg-4" key={index}>
              <div className="carte-etape h-100">
                <span className="numero-bg">{etape.numero}</span>
                <div className="contenu-etape">
                  <h3 className="h4 fw-bold mb-3">{etape.titre}</h3>
                  <p className="text-muted">{etape.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;