// Fichier: frontend/src/components/Pricing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  { 
    name: 'Gratuit', 
    mensuel: 0, 
    annuel: 0, 
    description: 'Idéal pour bien débuter.', 
    action: 'Commencer gratuitement', 
    features: ['1 boutique en ligne', 'Jusqu\'à 20 produits', 'Commandes via WhatsApp', 'Support par email'] 
  },
  { 
    name: 'Pro', 
    mensuel: 8000, 
    annuel: 90000, 
    description: 'Pour les vendeurs qui veulent passer à la vitesse supérieure.', 
    action: 'Passer au PRO', 
    features: ['Produits illimités', 'Statistiques avancées', 'Personnalisation SEO complète', 'Support prioritaire'] 
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('mensuel');
  const startTrial = () => navigate('/auth', { state: { mode: 'register' } });

  return (
    <section id="pricing" style={{ backgroundColor: 'var(--izishop-secondaire)', borderBottom: '1px solid rgba(255,255,255,.1)', color: 'var(--izishop-blanc)', padding: '32px 0', overflow: 'hidden' }}>
      <style>{`
        .pricing-action-button {
          transition: background-color .25s ease, border-color .25s ease, box-shadow .25s ease, color .25s ease, transform .25s ease;
        }

        .pricing-action-button:hover,
        .pricing-action-button:focus-visible {
          background-color: var(--izishop-primaire) !important;
          border-color: var(--izishop-primaire) !important;
          box-shadow: 0 8px 20px rgba(251, 190, 36, .25);
          color: var(--izishop-secondaire) !important;
          transform: translateY(-3px);
        }

        .pricing-action-button:active {
          transform: translateY(-1px);
        }
      `}</style>
      <div className="container px-4">
        {/* HEADER */}
        <div style={{ marginBottom: '64px' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-4">
            <div style={{ maxWidth: '640px' }}>
              <h2 style={{ color: 'var(--izishop-blanc)', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 300, lineHeight: 1.1, margin: '16px 0' }}>Des tarifs simples, sans surprise.</h2>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '18px', fontWeight: 300, margin: 0, maxWidth: '420px' }}>Commencez petit et développez-vous au fur et à mesure. Aucun frais <strong>caché</strong>.</p>
            </div>
            <div className="d-flex align-items-center gap-1 p-1" style={{ backgroundColor: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '8px' }}>
              {['mensuel', 'annuel'].map((period) => (
                <button key={period} type="button" onClick={() => setBillingPeriod(period)} style={{ backgroundColor: billingPeriod === period ? 'var(--izishop-primaire)' : 'transparent', border: 0, borderRadius: '4px', color: billingPeriod === period ? 'var(--izishop-secondaire)' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '6px 16px' }}>
                  {period === 'mensuel' ? 'mensuel' : 'annuel'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(to right, #1e293b, #334155, transparent)', height: '1px', marginTop: '48px' }} />
        </div>

        {/* LAYOUT : PLANS + IMAGE */}
        <div className="row align-items-end g-5">
          {/* COLONNE GAUCHE : Les 2 plans */}
          <div className="col-lg-7">
            <div className="row g-4 align-items-stretch">
              {plans.map((plan) => (
                <div className="col-md-6" key={plan.name}>
                  <article className="h-100 d-flex flex-column" style={{ border: '2px solid #fbbe24', borderRadius: '8px', padding: '40px' }}>
                    <span style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.05)', border: '2px solid #fbbe24', borderRadius: '4px', color: '#cbd5e1', fontSize: '12px', padding: '4px 12px' }}>{plan.name}</span>
                    
                    {/* Bloc Prix à hauteur fixe pour éviter tout saut/changement de taille */}
                    <div className="d-flex align-items-baseline gap-1" style={{ margin: '32px 0 8px', minHeight: '60px' }}>
                      <span style={{ color: 'var(--izishop-blanc)', fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {billingPeriod === 'mensuel' ? plan.mensuel : plan.annuel} XOF
                      </span>
                      <span style={{ color: 'rgba(255,255,255,.7)', fontSize: '18px', whiteSpace: 'nowrap' }}>
                        {billingPeriod === 'mensuel' ? '/mois' : '/an'}
                      </span>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '14px', fontWeight: 300, marginBottom: '40px', minHeight: '42px' }}>{plan.description}</p>
                    
                    <div className="mt-auto">
                      <h4 style={{ color: 'var(--izishop-blanc)', fontSize: '14px', marginBottom: '24px' }}>Ce qui est inclus</h4>
                      <ul className="list-unstyled mb-0">
                        {plan.features.map((feature) => (
                          <li className="d-flex align-items-start gap-3" key={feature} style={{ color: 'rgba(255,255,255,.7)', fontSize: '14px', fontWeight: 300, marginBottom: '16px' }}>
                            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button type="button" onClick={startTrial} className="pricing-action-button w-100" style={{ backgroundColor: 'transparent', border: '2px solid #fbbe24', borderRadius: '8px', color: 'var(--izishop-blanc)', cursor: 'pointer', fontSize: '14px', marginBottom: '0px', marginTop: '24px', padding: '16px' }}>{plan.action}</button>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE : L'image (conservée à l'identique avec adaptation responsive) */}
          <div className="col-lg-5 d-none d-lg-flex align-items-end justify-content-center text-center" style={{ minHeight: '100%' }}>
            <div className="illustration-pricing-wrapper" style={{ position: 'relative', padding: '1px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/zouck/iziShop.png"
                alt="Gestion simplifiée avec iziShop"
                className="img-fluid"
                style={{ 
                  width: '395%', 
                  maxWidth: '128%', 
                  height: 'auto', 
                  transform: 'translateX(34px)',
                  borderRadius: '12px',
                  filter: 'drop-shadow(0 20px 40px rgba(6, 6, 6, 0.28))',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;