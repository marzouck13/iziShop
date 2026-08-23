// Fichier: frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const anneeActuelle = new Date().getFullYear();

  return (
    <footer className="footer-section pt-5 pb-3">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand d-flex align-items-center mb-3">
              <img src="/logo.png" alt="iziShop Logo" className="footer-logo me-2" />
              <span className="texte-primaire h4 mb-0 fw-bold">izi</span>
              <span className="text-white h4 mb-0 fw-bold">Shop</span>
            </div>
            <p className="text-white-50">
              La solution de boutique en ligne la plus simple pour les entrepreneurs africains.
              Vendez comme un professionnel, vendez simplement, vivez pleinement.
            </p>
            <div className="social-links d-flex gap-3 mt-4">
              <a href="#" className="social-icon" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 offset-lg-1">
            <h5 className="text-white mb-4 fw-bold">Navigation</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="#features">Fonctionnalités</a></li>
              <li><a href="#steps">Comment ça marche</a></li>
              <li><a href="#testimonials">Témoignages</a></li>
              <li><a href="#pricing">Tarifs</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="text-white mb-4 fw-bold">Aide</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="#faq">Centre d'aide</a></li>
              <li><a href="#">Conditions d'utilisation</a></li>
              <li><a href="#">Confidentialité</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h5 className="text-white mb-4 fw-bold">Communauté</h5>
            <p className="text-white-50 mb-2">Rejoignez-nous sur WhatsApp :</p>
            <a
              href="https://wa.me/229140410161"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-warning w-100 py-2"
              style={{ borderRadius: '8px' }}
            >
              <i className="bi bi-whatsapp me-2"></i>
              <strong>iziShop WhatsApp</strong>
            </a>
          </div>
        </div>

        <hr className="border-white-10 my-4" />

        <div className="row">
          <div className="col-md-12 text-center text-white-50 small">
            <p className="mb-0">Copyright © {anneeActuelle} iziShop. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;