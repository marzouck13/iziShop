// Fichier: frontend/src/components/Testimonials.jsx
import React from 'react';

const Testimonials = () => {
  const avis = [
    {
      nom: 'Afi',
      activite: 'Prêt-à-porter',
      message:
        'Avant iziShop, je passais mes journées à répéter les prix sur WhatsApp. Aujourd\'hui, j\'envoie juste mon lien et je reçois directement les commandes.'
    },
    {
      nom: 'Koffi',
      activite: 'Artisan d\'art',
      message:
        'Ma boutique iziShop est devenue ma vitrine officielle. Mes clients apprécient de voir mes créations bien organisées avec des prix clairs.'
    },
    {
      nom: 'Mariam',
      activite: 'Gérante de cosmétique',
      message:
        'Je n\'y connais rien en informatique, mais j\'ai créé ma boutique toute seule. C\'est aussi simple que de poster une photo sur les réseaux.'
    },
    {
      nom: 'Samuel',
      activite: 'Vente de gadgets',
      message:
        'Le fait de pouvoir gérer mes stocks et mes variantes de produits au même endroit a changé ma façon de travailler.'
    },
    {
      nom: 'Yasmine',
      activite: 'Pâtissière',
      message:
        'Mes clients passent commande en pleine nuit via mon lien. Le matin, je n\'ai plus qu\'à valider et livrer. Mon chiffre d\'affaires a grimpé.'
    },
    {
      nom: 'Arnaud',
      activite: 'Services informatiques',
      message:
        'Même pour des services, iziShop fonctionne à merveille. La clarté de l\'interface donne confiance immédiatement aux nouveaux clients.'
    },
    {
      nom: 'Chantal',
      activite: 'Épicerie fine',
      message:
        'L\'abonnement est vraiment adapté à nos réalités. C\'est un investissement que je ne regrette absolument pas pour mon commerce.'
    },
    {
      nom: 'Issa',
      activite: 'Vente de chaussures',
      message:
        'Plus besoin d\'envoyer 50 photos par client. Ils parcourent le catalogue, choisissent leur pointure et commandent. Efficacité totale.'
    },
    {
      nom: 'Bernice',
      activite: 'Accessoires de mode',
      message:
        'Le support client est réactif et la plateforme est très légère, elle ne consomme pas beaucoup de connexion, c\'est un grand avantage.'
    },
    {
      nom: 'Fadel',
      activite: 'Vente de téléphones',
      message:
        'Professionnaliser mon activité était ma priorité cette année. iziShop m\'a permis de le faire sans me ruiner. Merci à l\'équipe iziShop'
    }
  ];

  return (
    <section id="testimonials" className="testimonials-section py-5 overflow-hidden">
      <div className="container py-lg-5 text-center">
        <h2 className="titre-section mb-2 fw-bold">Ils font grandir leur activité avec iziShop</h2>
        <div className="barre-accent mx-auto mb-3"></div>
      </div>

      <div className="scroll-infini-container">
        <div className="scroll-track">
          {[...avis, ...avis].map((temoignage, index) => (
            <div className="carte-avis-scroll" key={index}>
              <div className="p-3 h-100 d-flex flex-column align-items-center">
                <p className="message-avis mb-2">{temoignage.message}</p>
                <div className="mt-auto d-flex flex-column align-items-center w-100">
                  <h4 className="h6 fw-bold mb-1 text-center">{temoignage.nom}</h4>
                  <span className="badge-activite text-center">{temoignage.activite}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;