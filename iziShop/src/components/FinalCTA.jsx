// Fichier: frontend/src/components/FinalCTA.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePrixPublic from '../hooks/usePrixPublic';

const FinalCTA = () => {
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
    <section className="final-cta-section py-5">
      <div className="container">
        <div className="cta-box p-4 text-center shadow-lg">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="titre-cta mb-4 text-white">
                Prêt à professionnaliser votre commerce aujourd'hui ?
              </h2>
              <p className="texte-cta mb-5">
                Rejoignez des centaines de vendeurs qui ont choisi la simplicité.
                Créez votre boutique en 3 minutes et profitez de{' '}
                <strong>{prixData ? prixData.dureeEssaiJours : 35} jours d'essai gratuit</strong>.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 w-100">
                <button
                  ref={freeStartButtonRef}
                  className={`bouton-principal bouton-hero btn-lg px-5 py-3 ${isFreeStartButtonVisible ? 'bouton-principal-vibrant' : ''}`}
                  onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                >
                  <span>Créer ma boutique maintenant</span>
                </button>
              </div>
              <p className="mt-4 small text-white-50">
                Sans carte bancaire • Installation instantanée • Support 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;