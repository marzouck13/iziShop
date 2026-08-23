// Fichier: frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const fermerMenu = () => {
    setMenuOuvert(false);
  };

  const allerVers = (ancre) => {
    fermerMenu();
    const element = document.getElementById(ancre);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg barre-navigation sticky-top shadow-sm">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img
            src="/logo.png"
            alt="iziShop Logo"
            className="logo-image"
          />
          <span className="texte-primaire logo-texte">izi</span>
          <span className="text-white logo-texte">Shop</span>
        </a>

        <button
          className="navbar-toggler d-lg-none d-flex align-items-center justify-content-center"
          type="button"
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Ouvrir le menu"
          style={{
            backgroundColor: '#334158',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '8px',
            padding: '9px'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '18px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <span
              style={{
                display: 'block',
                height: '2px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transformOrigin: 'left center',
                transform: menuOuvert ? 'rotate(45deg) translate(2px, -1px)' : 'rotate(0)'
              }}
            ></span>
            <span
              style={{
                display: 'block',
                height: '2px',
                width: menuOuvert ? '0' : '75%',
                backgroundColor: 'white',
                borderRadius: '2px',
                transition: 'all 0.2s ease',
                opacity: menuOuvert ? 0 : 1
              }}
            ></span>
            <span
              style={{
                display: 'block',
                height: '2px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transformOrigin: 'left center',
                transform: menuOuvert ? 'rotate(-45deg) translate(2px, 1px)' : 'rotate(0)'
              }}
            ></span>
          </div>
        </button>

        <div className={`collapse navbar-collapse ${menuOuvert ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <button className="nav-link text-white px-3 fw-medium bg-transparent border-0" onClick={() => allerVers('features')}>
                Fonctionnalités
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link text-white px-3 fw-medium bg-transparent border-0" onClick={() => allerVers('steps')}>
                Comment ça marche
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link text-white px-3 fw-medium bg-transparent border-0" onClick={() => allerVers('testimonials')}>
                Témoignages
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link text-white px-3 fw-medium bg-transparent border-0" onClick={() => allerVers('pricing')}>
                Tarifs
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link text-white px-3 fw-medium bg-transparent border-0" onClick={() => allerVers('faq')}>
                FAQ
              </button>
            </li>
          </ul>

          <div className="mt-lg-0 mt-3 w-lg-auto">
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
              <button
                className="bouton-secondaire btn-sm border-white-60 py-2"
                onClick={() => {
                  fermerMenu();
                  navigate('/auth', { state: { mode: 'login' } });
                }}
              >
                Se connecter
              </button>
              <button
                className="bouton-principal btn-sm py-2"
                onClick={() => {
                  fermerMenu();
                  navigate('/auth', { state: { mode: 'register' } });
                }}
              >
                Créer une boutique
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;