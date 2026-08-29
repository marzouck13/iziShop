/* eslint-disable no-unused-vars */
// Fichier: frontend/src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  inscrireVendeur,
  connecterUtilisateur,
  renvoyerVerification
} from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connecter, estConnecte, utilisateur } = useAuth();

  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailInscrit, setEmailInscrit] = useState('');

  const [emailAVerifier, setEmailAVerifier] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [emailRenvoye, setEmailRenvoye] = useState(false);

  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    motDePasse: '',
    numeroTelephone: '',
    pays: 'BJ'
  });

  const [loginData, setLoginData] = useState({
    email: '',
    motDePasse: ''
  });

  // ==========================================
  // REDIRECTION SI DEJA CONNECTE (AVEC ROLE)
  // ==========================================
  useEffect(() => {
    if (estConnecte && utilisateur) {
      if (utilisateur.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [estConnecte, utilisateur, navigate]);

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
    if (location.state?.message) {
      setStatus({ type: 'success', msg: location.state.message });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (mode === 'register') {
      setFormData({ ...formData, [name]: value });
    } else {
      setLoginData({ ...loginData, [name]: value });
    }
  };

  // ==========================================
  // INSCRIPTION
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const response = await inscrireVendeur(formData);
      setEmailInscrit(formData.email);
      setShowSuccessModal(true);
      setFormData({
        nomComplet: '',
        email: '',
        motDePasse: '',
        numeroTelephone: '',
        pays: 'BJ'
      });
    } catch (err) {
      setStatus({
        type: 'danger',
        msg: err.message || "Erreur lors de l'inscription"
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CONNEXION (CORRIGE : tokenAcces)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    setEmailRenvoye(false);
    try {
      const response = await connecterUtilisateur(loginData.email, loginData.motDePasse);

      //  CORRECTION : tokenAcces au lieu de token
      if (response.donnees?.utilisateur && response.donnees?.tokenAcces) {
        connecter(response.donnees.utilisateur, response.donnees.tokenAcces);
        setStatus({ type: 'success', msg: 'Connexion reussie ! Redirection...' });

        // La redirection est geree par le useEffect ci-dessus
        // qui detecte le changement de estConnecte + utilisateur
      }
    } catch (err) {
      if (err.status === 403 && err.data?.emailNonVerifie) {
        setEmailAVerifier(err.data.email || loginData.email);
        setStatus({
          type: 'warning',
          msg: err.message || 'Veuillez verifier votre email avant de vous connecter.'
        });
      } else {
        setStatus({
          type: 'danger',
          msg: err.message || 'Email ou mot de passe incorrect'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENVOYER EMAIL DE VERIFICATION
  // ==========================================
  const handleRenvoyerEmail = async () => {
    if (!emailAVerifier) return;
    setEnvoiEnCours(true);
    try {
      const response = await renvoyerVerification(emailAVerifier);
      setEmailRenvoye(true);
      setStatus({
        type: 'success',
        msg: response.message || 'Un nouvel email de verification a ete envoye.'
      });
    } catch (err) {
      setStatus({
        type: 'danger',
        msg: err.message || "Impossible de renvoyer l'email."
      });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const fermerModalEtConnecter = () => {
    setShowSuccessModal(false);
    setMode('login');
    setLoginData({ email: emailInscrit, motDePasse: '' });
  };

  return (
    <>
      <div className="auth-screen mt-10 container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div
          className="row w-100 shadow-lg rounded-2 overflow-hidden bg-white"
          style={{ maxWidth: '950px', minHeight: '300px' }}
        >
          <div className="col-md-6 d-none d-md-block p-0 position-relative">
            <img
              src="/zouck/zouck.png"
              alt="iziShop Ventes"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: 'linear-gradient(rgba(0, 0, 0, 0.12), rgba(30, 41, 59, 0.74))' }}
            ></div>
            <div className="position-absolute bottom-0 start-0 p-4 text-white">
              <h2 className="fw-bold text-white">Propulsez votre business</h2>
              <p>
                Vendez partout avec{' '}
                <span className="strong">
                  <span className="text-warning">izi</span>Shop.
                </span>
              </p>
            </div>
          </div>

          <div className="col-md-6 p-4 justify-content-center">
            <div className="auth-card-container">
              <div className="zouck text-center mb-3">
                <a href="/" className="text-decoration-none d-flex align-items-center justify-content-center">
                  <img src="/logo.png" alt="iziShop Logo" className="logo-image me-2" style={{ height: '40px' }} />
                  <span className="texte-primaire logo-texte fs-3 fw-bold">izi</span>
                  <span className="ZOUCK logo-texte fs-3 fw-bold text-white">Shop</span>
                </a>
              </div>
              <h2 className="text-center fw-bold">
                {mode === 'login' ? "Connexion" : "Inscription"}
              </h2>
              <p className="text-center text-muted small mb-2">
                {mode === 'login'
                  ? "Heureux de vous revoir ! Connectez-vous a votre espace."
                  : "Creez votre boutique et beneficiez de nos fonctionnalités"}
              </p>
              {status.msg && (
                <div className={`alert alert-${status.type} py-1 small text-center`} role="alert">
                  {status.msg}
                </div>
              )}
              {mode === 'login' && emailAVerifier && status.type === 'warning' && (
                <div className="text-center mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-warning fw-bold"
                    onClick={handleRenvoyerEmail}
                    disabled={envoiEnCours || emailRenvoye}
                  >
                    {envoiEnCours ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span>Envoi...</>
                    ) : emailRenvoye ? (
                      <>Email renvoye !</>
                    ) : (
                      <>Renvoyer l'email de verification</>
                    )}
                  </button>
                </div>
              )}
              {mode === 'register' ? (
                <form onSubmit={handleRegister}>
                  <div className="mb-1">
                    <label className="form-label small fw-bold">Nom complet</label>
                    <input
                      type="text"
                      name="nomComplet"
                      className="form-control form-control-lg bg-light border-1"
                      value={formData.nomComplet}
                      onChange={handleChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="mb-1">
                    <label className="form-label small fw-bold">Adresse e-mail</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg bg-light border-1"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Pays</label>
                      <select
                        name="pays"
                        className="form-control form-control-lg bg-light border-1"
                        value={formData.pays}
                        onChange={handleChange}
                        required
                        aria-label="Selectionner votre pays"
                        title="Selectionner votre pays"
                      >
                        <option value="BJ">Benin</option>
                        <option value="TG">Togo</option>
                        <option value="CI">Cote d'Ivoire</option>
                        <option value="SN">Senegal</option>
                        <option value="CM">Cameroun</option>
                        <option value="ML">Mali</option>
                        <option value="BF">Burkina Faso</option>
                        <option value="NE">Niger</option>
                        <option value="GH">Ghana</option>
                        <option value="KE">Kenya</option>
                        <option value="ZA">Afrique du Sud</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Telephone</label>
                      <input
                        type="tel"
                        name="numeroTelephone"
                        className="form-control form-control-lg bg-light border-1"
                        value={formData.numeroTelephone}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Mot de passe (Minimum 6 caracteres)</label>
                    <input
                      type="password"
                      name="motDePasse"
                      className="form-control form-control-lg bg-light border-1"
                      value={formData.motDePasse}
                      onChange={handleChange}
                      placeholder=""
                      minLength={6}
                      required
                    />
                  </div>
                  <button className="btn Zouck btn-warning w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                    {loading ? 'Creation...' : 'Creer ma boutique gratuitement'}
                  </button>
                  <div className="text-center mt-3">
                    <p className="small text-muted">
                      Vous avez deja un compte ?<br />
                      <button
                        type="button"
                        className="btn btn-link p-0 small fw-bold text-warning text-decoration-none"
                        onClick={() => { setMode('login'); setStatus({ type: '', msg: '' }); }}
                      >
                        Se connecter
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Adresse e-mail</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg bg-light border-1"
                      value={loginData.email}
                      onChange={handleChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Mot de passe</label>
                    <input
                      type="password"
                      name="motDePasse"
                      className="form-control form-control-lg bg-light border-1"
                      value={loginData.motDePasse}
                      onChange={handleChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <button className="btn Zouck btn-warning w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>
                  <div className="text-center mt-4">
                    <p className="small text-muted">
                      Vous etes nouveau ?
                      <br />
                      <button
                        type="button"
                        className="btn btn-link p-0 small fw-bold text-warning text-decoration-none"
                        onClick={() => { setMode('register'); setStatus({ type: '', msg: '' }); }}
                      >
                        Creez un compte
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={fermerModalEtConnecter}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-body text-center p-5">
                  <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '90px',
                      height: '90px',
                      backgroundColor: 'rgba(16, 185, 129, 0.14)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  >
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem', color: 'var(--izishop-succes)' }}></i>
                  </div>
                  <h3 className="fw-bold mb-3" style={{ color: 'var(--izishop-secondaire)' }}>
                    Compte cree avec succes !
                  </h3>
                  <div
                    className="p-3 rounded-3 mb-4"
                    style={{
                      backgroundColor: 'rgba(251, 190, 36, 0.1)',
                      border: '1px solid rgba(251, 190, 36, 0.3)'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <i className="bi bi-envelope-paper-fill fs-4" style={{ color: 'var(--izishop-primaire)' }}></i>
                      <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
                        Verifiez votre boite email
                      </h5>
                    </div>
                    <p className="small text-muted mb-0">
                      Nous avons envoye un lien de verification a :<br />
                      <strong className="text-dark">{emailInscrit}</strong>
                    </p>
                  </div>
                  <p className="text-muted small mb-4">
                    <strong>Cliquez sur le lien</strong> recu dans votre email pour activer votre compte.
                    <br />
                    <span className="text-danger">Sans verification, la connexion sera impossible.</span>
                  </p>
                  <div className="d-grid gap-2">
                    <button className="btn btn-warning fw-bold py-2" onClick={fermerModalEtConnecter}>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      J'ai verifie, me connecter
                    </button>
                    <button className="btn btn-link text-muted small text-decoration-none" onClick={fermerModalEtConnecter}>
                      Plus tard
                    </button>
                  </div>
                  <div className="mt-4 pt-3 border-top">
                    <p className="small text-muted mb-0">
                      <i className="bi bi-info-circle me-1"></i>
                      Vous n'avez pas recu l'email ? Verifiez vos spams ou demandez un renvoi depuis la page de connexion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default Auth;
