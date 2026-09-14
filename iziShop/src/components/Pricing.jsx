// Fichier: frontend/src/components/Pricing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePrixPublic from '../hooks/usePrixPublic';

const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '...';
  return new Intl.NumberFormat('fr-FR').format(montant);
};

const Pricing = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('mensuel');
  const { prixData } = usePrixPublic();
  
  const startTrial = () => navigate('/auth', { state: { mode: 'register' } });
  const symboleDevise = prixData?.symboleDevise || 'FCFA';
  const prixMensuel = prixData?.prixMensuel ?? 8000;
  const prixAnnuel = prixData?.prixAnnuel ?? 90000;
  const pourcentageEconomie = prixData?.pourcentageEconomie;

  const plans = [
    { 
      name: 'Gratuit', 
      mensuel: 0, 
      annuel: 0, 
      description: 'Idéal pour bien débuter et tester la plateforme.', 
      action: 'Commencer gratuitement', 
      features: ['1 boutique en ligne', 'Jusqu\'à 20 produits', 'Commandes via WhatsApp', 'Support par email'],
      isPro: false
    },
    { 
      name: 'Pro', 
      mensuel: prixMensuel, 
      annuel: prixAnnuel, 
      description: 'Pour les vendeurs qui veulent passer à la vitesse supérieure.', 
      action: 'Passer au PRO', 
      features: ['Produits illimités', 'Statistiques avancées', 'Personnalisation SEO complète', 'Support prioritaire', 'Reçus PDF automatiques'],
      isPro: true,
      economie: pourcentageEconomie
    },
  ];

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
                <button 
                  key={period} 
                  type="button" 
                  onClick={() => setBillingPeriod(period)} 
                  style={{ 
                    backgroundColor: billingPeriod === period ? 'var(--izishop-primaire)' : 'transparent', 
                    border: 0, 
                    borderRadius: '4px', 
                    color: billingPeriod === period ? 'var(--izishop-secondaire)' : '#94a3b8', 
                    cursor: 'pointer', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    padding: '6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {period === 'mensuel' ? 'Mensuel' : 'Annuel'}
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
                  <article 
                    className="h-100 d-flex flex-column" 
                    style={{ 
                      border: plan.isPro ? '2px solid #fbbe24' : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px', 
                      padding: '40px',
                      backgroundColor: plan.isPro ? 'rgba(251, 190, 36, 0.03)' : 'rgba(255,255,255,0.01)',
                      position: 'relative'
                    }}
                  >
                    {plan.isPro && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '-12px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        backgroundColor: '#fbbe24',
                        color: 'var(--izishop-secondaire)',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Le plus populaire
                      </span>
                    )}

                    <span style={{ 
                      alignSelf: 'flex-start', 
                      backgroundColor: 'rgba(255,255,255,.05)', 
                      border: plan.isPro ? '1px solid rgba(251, 190, 36, 0.3)' : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '4px', 
                      color: '#cbd5e1', 
                      fontSize: '12px', 
                      padding: '4px 12px',
                      fontWeight: 600
                    }}>
                      {plan.name}
                    </span>
                    
                 
                    <div className="d-flex align-items-baseline gap-2 flex-wrap" style={{ margin: '24px 0 8px', minHeight: '60px' }}>
                      {plan.mensuel === 0 && plan.annuel === 0 ? (
                        <span style={{ color: 'var(--izishop-blanc)', fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          Gratuit
                        </span>
                      ) : (
                        <>
                          <span style={{ color: 'var(--izishop-blanc)', fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {formatMontant(billingPeriod === 'mensuel' ? plan.mensuel : plan.annuel)}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: '16px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {symboleDevise} <span style={{ fontWeight: 300, fontSize: '14px' }}>/ {billingPeriod === 'mensuel' ? 'mois' : 'an'}</span>
                          </span>
                          
                      
                          {plan.isPro && billingPeriod === 'annuel' && pourcentageEconomie && (
                            <span style={{ 
                              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                              color: '#067651', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '15px',
                              fontWeight: 900,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginLeft: '4px'
                            }}>                             
                              Vous économisez : {pourcentageEconomie}%                                
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '14px', fontWeight: 300, marginBottom: '40px', minHeight: '42px' }}>{plan.description}</p>
                    
                    <div className="mt-auto">
                      <h4 style={{ color: 'var(--izishop-blanc)', fontSize: '13px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>Ce qui est inclus</h4>
                      <ul className="list-unstyled mb-0">
                        {plan.features.map((feature) => (
                          <li className="d-flex align-items-start gap-3" key={feature} style={{ color: 'rgba(255,255,255,.8)', fontSize: '14px', fontWeight: 300, marginBottom: '14px' }}>
                            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px', color: plan.isPro ? '#fbbe24' : '#10b981' }}>
                              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={startTrial} 
                      className="pricing-action-button w-100" 
                      style={{ 
                        backgroundColor: plan.isPro ? '#fbbe24' : 'transparent', 
                        border: plan.isPro ? '2px solid #fbbe24' : '2px solid rgba(255,255,255,0.2)', 
                        borderRadius: '8px', 
                        color: plan.isPro ? 'var(--izishop-secondaire)' : 'var(--izishop-blanc)', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        fontWeight: plan.isPro ? '700' : '500',
                        marginBottom: '0px', 
                        marginTop: '32px', 
                        padding: '14px' 
                      }}
                    >
                      {plan.action}
                    </button>
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