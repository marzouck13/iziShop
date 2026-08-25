// Fichier: frontend/src/components/Hero.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePrixPublic from '../hooks/usePrixPublic';

const Hero = () => {
  const navigate = useNavigate();
  const { prixData } = usePrixPublic();
  const freeStartButtonRef = useRef(null);
  const [isFreeStartButtonVisible, setIsFreeStartButtonVisible] = useState(false);

  useEffect(() => {
    const button = freeStartButtonRef.current;

    if (!button || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsFreeStartButtonVisible(entry.isIntersecting);
    });

    observer.observe(button);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero-section d-flex align-Vendez simplement, vivez pleinement.items-center justify-content-center text-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-12 d-flex flex-column align-items-center">
            <span className="badge-promo d-inline-block">
              Vendez simplement, vivez pleinement.
            </span>
            <h1 className="titre-hero fw-bold">
              L'excellence de votre activité mérite{' '}
              <br className="d-none d-md-block" />
              une boutique en ligne d'exception.
            </h1>
            <p className="lead texte-description mb-4">
              Propulsez votre commerce au-delà des simples discussions privées avec une
              plateforme web professionnelle créée par vous-même, sans aucun code.
              Centralisez vos stocks et vos prix en un seul lieu pour offrir à vos clients
              la clarté qu'ils attendent.
              <br />
              <strong className="d-block mt-3 fw-bold">
                Commencez gratuitement pendant {prixData ? prixData.dureeEssaiJours : 35} jours
                et développez votre activité en toute sérénité.
              </strong>
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 w-100">
              <button
                ref={freeStartButtonRef}
                className={`bouton-principal bouton-hero btn-lg px-5 py-3 ${isFreeStartButtonVisible ? 'bouton-principal-vibrant' : ''}`}
                onClick={() => navigate('/auth', { state: { mode: 'register' } })}
              >
                <span>Commencer gratuitement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;