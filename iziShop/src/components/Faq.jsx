// Fichier: frontend/src/components/Faq.jsx
import React from 'react';
import usePrixPublic from '../hooks/usePrixPublic';

const Faq = () => {
  const { prixData } = usePrixPublic();

  const formatNombre = (nombre) => {
    return new Intl.NumberFormat('fr-FR').format(nombre);
  };

  const prixAffiche = prixData
    ? `${formatNombre(prixData.prix)} ${prixData.symboleDevise}`
    : 'le prix adapté à votre pays';

  const faqs = [
    {
      question: 'Comment mes clients passent-ils commande ?',
      answer:
        'Le processus est fluide : vos clients parcourent votre boutique, ajoutent leurs articles au panier et valident. Le récapitulatif complet de la commande vous est envoyé instantanément, vous permettant de finaliser la vente et effectuer la livraison afin de récupérer votre argent chez le client une fois la livraison.'
    },
    {
      question: 'Est-ce que j\'ai besoin de WhatsApp pour utiliser iziShop ?',
      answer:
        'Oui, iziShop utilise WhatsApp comme canal principal de communication. Les notifications de commandes y sont centralisées pour vous permettre de garder un contact direct et humain avec vos clients.'
    },
    {
      question: 'Dois-je payer une commission sur mes ventes ?',
      answer:
        `Absolument pas. iziShop repose sur un modèle d'abonnement fixe de ${prixAffiche} par mois et par boutique. Peu importe votre chiffre d'affaires, vous ne nous versez aucune commission.`
    },
    {
      question: 'Puis-je gérer plusieurs boutiques ?',
      answer:
        'Actuellement, chaque compte est associé à une boutique unique. Cela vous permet de vous concentrer sur une seule boutique optimisée et professionnelle.'
    },
    {
      question: 'Comment se passe l\'essai gratuit ?',
      answer:
        `Dès votre inscription, vous avez un accès total à toutes les fonctionnalités pendant ${prixData ? prixData.dureeEssaiJours : 35} jours. Aucune carte bancaire n'est demandée. À la fin de l'essai, vous choisissez simplement si vous souhaitez activer votre abonnement ou non. Si non, votre compte est définitivement supprimé 90 jours plus tard.`
    },
    {
      question: 'Mes clients doivent-ils télécharger une application ?',
      answer:
        'Non. Votre boutique iziShop est un site web ultra-léger. Vos clients cliquent sur votre lien, choisissent leurs produits et commandent directement depuis leur navigateur mobile, sans rien installer.'
    },
    {
      question: 'Puis-je modifier mes prix et mon stock à tout moment ?',
      answer:
        'Bien sûr. Depuis votre tableau de bord vendeur, vous pouvez modifier un prix et mettre à jour vos quantités en temps réel. Les changements sont instantanés sur votre boutique.'
    },
    {
      question: 'Quels sont les modes de paiement pour l\'abonnement ?',
      answer:
        'Nous privilégions la simplicité locale : vous pouvez régler votre abonnement via Mobile Money (Moov, MTN, etc.), ce qui rend le service accessible à tous les entrepreneurs, même sans compte bancaire.'
    },
    {
      question: 'Que se passe-t-il si je ne renouvelle pas mon abonnement ?',
      answer:
        'Si vous ne vous réabonnez pas, votre boutique est mise en pause et devient invisible pour vos clients. Vous disposez de 90 jours pour réactiver votre compte et retrouver toutes vos données. Passé ce délai de 3 mois sans réabonnement, le compte et ses informations sont définitivement supprimés de notre système.'
    }
  ];

  return (
    <section id="faq" className="faq-section py-5 fond-clair">
      <div className="container py-lg-4">
        <div className="text-center mb-5">
          <h2 className="titre-section fw-bold">Tout ce que vous devez savoir</h2>
          <div className="barre-accent mx-auto mt-3"></div>
          <p className="text-muted mt-3">
            Vous avez d'autres questions ? Notre support WhatsApp est là pour vous aider.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="accordion accordion-flush rounded-4 overflow-hidden" id="accordionFaq">
              {faqs.map((item, index) => (
                <div className="accordion-item" key={index}>
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed fw-bold py-4"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faq-${index}`}
                      aria-expanded="false"
                      aria-controls={`faq-${index}`}
                    >
                      {item.question}
                    </button>
                  </h3>
                  <div
                    id={`faq-${index}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionFaq"
                  >
                    <div className="accordion-body text-muted py-4 ps-5">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;