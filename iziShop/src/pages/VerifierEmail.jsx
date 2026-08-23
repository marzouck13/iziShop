/* eslint-disable react-hooks/set-state-in-effect */
// Fichier: frontend/src/pages/VerifierEmail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifierEmail } from '../lib/api';

const VerifierEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [etat, setEtat] = useState('chargement'); // chargement, succes, erreur
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setEtat('erreur');
      setMessage('Lien de verification invalide ou expire.');
      return;
    }
    const verifier = async () => {
      try {
        const response = await verifierEmail(token);
        if (response.donnees?.dejaVerifie) {
          setEtat('succes');
          setMessage('Votre email etait deja verifie. Vous pouvez vous connecter.');
        } else {
          setEtat('succes');
          setMessage(response.message || 'Email verifie avec succes !');
        }
      } catch (err) {
        setEtat('erreur');
        setMessage(err.message || 'Une erreur est survenue lors de la verification.');
      }
    };
    verifier();
  }, [searchParams]);

  const allerVersConnexion = () => {
    navigate('/auth', {
      state: {
        mode: 'login',
        message: etat === 'succes' ? 'Email verifie ! Connectez-vous maintenant.' : '',
      },
    });
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'var(--izishop-fond)' }}
    >
      <div className="text-center p-5 bg-white rounded-4 shadow-lg" style={{ maxWidth: '500px' }}>
        {etat === 'chargement' && (
          <>
            <div
              className="spinner-border mb-4"
              style={{ color: 'var(--izishop-primaire)', width: '3rem', height: '3rem' }}
            >
              <span className="visually-hidden">Chargement...</span>
            </div>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
              Verification en cours...
            </h2>
            <p className="text-muted">Veuillez patienter pendant que nous validons votre email.</p>
          </>
        )}
        {etat === 'succes' && (
          <>
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
              }}
            >
              <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem', color: 'var(--izishop-succes)' }}></i>
            </div>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
              Email verifie !
            </h2>
            <p className="text-muted mb-4">{message}</p>
            <p className="small text-muted mb-4">
              Votre compte est maintenant actif. Connectez-vous pour acceder a votre tableau de bord.
            </p>
            <button className="btn btn-warning fw-bold py-3 px-5" onClick={allerVersConnexion}>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Se connecter maintenant
            </button>
          </>
        )}
        {etat === 'erreur' && (
          <>
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
              }}
            >
              <i className="bi bi-x-circle-fill" style={{ fontSize: '4rem', color: 'var(--izishop-erreur)' }}></i>
            </div>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
              Verification echouee
            </h2>
            <p className="text-muted mb-4">{message}</p>
            <div className="d-grid gap-2">
              <button
                className="btn btn-warning fw-bold py-2"
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
              >
                Retour a la connexion
              </button>
              <a href="/" className="btn btn-link text-muted">
                Retour a l'accueil
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifierEmail;