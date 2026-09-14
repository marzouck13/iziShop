/* eslint-disable no-unused-vars */
// Fichier: frontend/src/pages/dashboard/Parrainage.jsx
import React, { useState, useEffect, Component } from 'react';
import { obtenirMesFilleuls, utiliserBonus } from '../../lib/api';
import { useData } from '../../context/DataContext';
import LayoutDashboard from '../../components/LayoutDashboard';

const R = '5px';
const basePlaceholderStyle = { backgroundColor: '#e9ecef', borderRadius: R };

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[Parrainage] Erreur React:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <LayoutDashboard>
          <div className="p-4 flex-grow-1">
            <div className="alert alert-danger" role="alert" style={{ borderRadius: R }}>
              <h5 className="alert-heading fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Une erreur est survenue</h5>
              <p className="mb-2 small">Le composant Parrainage a rencontré une erreur inattendue.</p>
              <details className="small"><summary className="text-muted" style={{ cursor: 'pointer' }}>Détails techniques</summary>
                <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '0.7rem', maxHeight: '200px', overflow: 'auto' }}>{this.state.error?.toString()}</pre>
              </details>
              <hr />
              <button className="btn btn-sm btn-danger" onClick={() => window.location.reload()} style={{ borderRadius: R }}><i className="bi bi-arrow-clockwise me-1"></i>Recharger</button>
            </div>
          </div>
        </LayoutDashboard>
      );
    }
    return this.props.children;
  }
}

const SkeletonHeader = () => (
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 placeholder-glow">
    <div>
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '200px', height: '22px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '280px', height: '12px' }}></div>
    </div>
    <div className="d-flex gap-2"><div className="placeholder" style={{ ...basePlaceholderStyle, width: '160px', height: '30px', borderRadius: R }}></div></div>
  </div>
);

const SkeletonParrainage = () => (
  <LayoutDashboard>
    <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
      <SkeletonHeader />
      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <div className="carte-izishop p-3 h-100 placeholder-glow" style={{ borderRadius: R }}>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '120px', height: '16px' }}></div>
            <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '100%', height: '48px' }}></div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80%', height: '10px' }}></div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="row g-2">{[1, 2, 3, 4].map(i => (<div key={i} className="col-6 col-md-3"><div className="carte-izishop p-2 text-center placeholder-glow" style={{ borderRadius: R }}><div className="placeholder mx-auto mb-1" style={{ ...basePlaceholderStyle, width: '36px', height: '36px', borderRadius: '50%' }}></div><div className="placeholder mx-auto mb-1" style={{ ...basePlaceholderStyle, width: '50px', height: '20px' }}></div><div className="placeholder mx-auto" style={{ ...basePlaceholderStyle, width: '70px', height: '10px' }}></div></div></div>))}</div>
        </div>
      </div>
    </div>
  </LayoutDashboard>
);

const formatDate = (d) => {
  try {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '-'; }
};

const ParrainageContent = () => {
  // ✅ Données depuis DataContext
  const { parrainage, boutique, rafraichir, chargement: chargementData } = useData();
  const codeParrain = parrainage?.code;
  const bonus = parrainage?.bonus;

  const [filleuls, setFilleuls] = useState([]);
  const [chargementFilleuls, setChargementFilleuls] = useState(false);
  const [filtreFilleuls, setFiltreFilleuls] = useState('tous');
  const [joursAAppliquer, setJoursAAppliquer] = useState('');
  const [applicationBonusEnCours, setApplicationBonusEnCours] = useState(false);
  const [codeCopie, setCodeCopie] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [canalPartageOuvert, setCanalPartageOuvert] = useState(null);

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // ❌ ANCIEN useEffect pour codeParrain et bonus SUPPRIMÉ

  // Filleuls chargés séparément (dépendent du filtre)
  useEffect(() => {
    let isMounted = true;
    const chargerFilleuls = async () => {
      setChargementFilleuls(true);
      try {
        const res = await obtenirMesFilleuls(filtreFilleuls).catch((err) => { console.error('Erreur obtenirMesFilleuls:', err); return null; });
        if (!isMounted) return;
        if (res?.donnees?.filleuls) setFilleuls(res.donnees.filleuls);
        else setFilleuls([]);
      } catch (err) {
        console.error('[Parrainage] Erreur filleuls:', err);
        if (isMounted) setFilleuls([]);
      } finally {
        if (isMounted) setChargementFilleuls(false);
      }
    };
    chargerFilleuls();
    return () => { isMounted = false; };
  }, [filtreFilleuls]);

  const copierCodeParrain = async () => {
    if (!codeParrain?.codeParrain) return;
    try {
      await navigator.clipboard.writeText(codeParrain.codeParrain);
      setCodeCopie(true);
      afficherMessage('success', 'Code parrain copié dans le presse-papiers !');
      setTimeout(() => setCodeCopie(false), 2500);
    } catch { afficherMessage('danger', 'Impossible de copier le code.'); }
  };

  const copierLien = async () => {
    if (!codeParrain?.lienParrainage) return;
    try { await navigator.clipboard.writeText(codeParrain.lienParrainage); afficherMessage('success', 'Lien de parrainage copié !'); }
    catch { afficherMessage('danger', 'Impossible de copier le lien.'); }
  };

  const copierTexteMessage = async (texte, canal) => {
    try { await navigator.clipboard.writeText(texte); afficherMessage('success', `Message ${canal} copié ! Collez-le dans votre publication.`); }
    catch { afficherMessage('danger', 'Impossible de copier le message.'); }
  };

  const partagerDirect = (url) => { window.open(url, '_blank', 'width=600,height=700'); };

  const handleUtiliserBonus = async (e) => {
    e.preventDefault();
    const jours = parseInt(joursAAppliquer, 10);
    const joursDispo = bonus?.joursDisponibles || 0;
    if (!jours || isNaN(jours) || jours < 1) return afficherMessage('warning', 'Veuillez saisir un nombre de jours valide (minimum 1).');
    if (jours > joursDispo) return afficherMessage('danger', `Vous n'avez que ${joursDispo} jour(s) disponible(s). Vous demandez ${jours}.`);

    setApplicationBonusEnCours(true);
    try {
      const res = await utiliserBonus({ joursAAppliquer: jours });
      if (res?.donnees) {
        afficherMessage('success', `${res.donnees.joursAppliques} jour(s) bonus appliqué(s) ! Nouvelle expiration : ${res.donnees.nouvelleDateExpirationFormatee || formatDate(res.donnees.nouvelleDateExpiration)}`);
        setJoursAAppliquer('');

        // ✅ Rafraîchir depuis le context (au lieu de refaire les appels directs)
        await rafraichir(['parrainage', 'boutique']);
      }
    } catch (err) {
      const msgErreur = err?.data?.message || err?.message || "Erreur lors de l'application des bonus.";
      afficherMessage('danger', msgErreur);
    } finally {
      setApplicationBonusEnCours(false);
    }
  };

  // ✅ Chargement basé sur le DataContext
  const chargement = chargementData && !codeParrain && !bonus;
  if (chargement) return <SkeletonParrainage />;

  const joursDisponibles = bonus?.joursDisponibles || codeParrain?.statistiques?.joursBonusUtilisables || 0;
  const totalFilleulsActifs = codeParrain?.nbFilleulsActifs || codeParrain?.statistiques?.filleulsActifs || bonus?.totalFilleulsActifs || 0;
  const totalJoursCumules = bonus?.totalJoursCumulesHistorique || 0;
  const totalJoursUtilises = bonus?.totalJoursUtilises || 0;
  const nombreUtilisations = bonus?.nombreUtilisations || 0;
  const historiqueBonus = Array.isArray(bonus?.historique) ? bonus.historique : [];
  const regles = Array.isArray(codeParrain?.regles) ? codeParrain.regles : [
    { etape: 1, label: 'Partagez votre code unique avec un ami' },
    { etape: 2, label: "Votre ami s'inscrit avec votre code" },
    { etape: 3, label: 'Il passe au plan PRO (paiement validé)' },
    { etape: 4, label: `Vous gagnez ${codeParrain?.recompenseJours || 7} jours gratuits !` },
  ];
  const recompense = codeParrain?.recompenseJours || codeParrain?.reglesDetaillees?.bonusParFilleul || 7;
  const safeFilleuls = Array.isArray(filleuls) ? filleuls : [];
  const messagesPartage = codeParrain?.messagesPartage || {};
  const lienParrainage = codeParrain?.lienParrainage || '';

  const canauxPrincipaux = [];
  if (messagesPartage.whatsapp) canauxPrincipaux.push({ id: 'whatsapp', label: 'WhatsApp', icon: 'bi-whatsapp', color: '#25D366', colorLight: 'rgba(37, 211, 102, 0.1)', colorBorder: 'rgba(37, 211, 102, 0.3)', supportePartageDirect: true });
  if (messagesPartage.facebook) canauxPrincipaux.push({ id: 'facebook', label: 'Facebook', icon: 'bi-facebook', color: '#1877F2', colorLight: 'rgba(24, 119, 242, 0.1)', colorBorder: 'rgba(24, 119, 242, 0.3)', supportePartageDirect: false });
  if (messagesPartage.email) canauxPrincipaux.push({ id: 'email', label: 'Email', icon: 'bi-envelope-fill', color: '#EA4335', colorLight: 'rgba(234, 67, 53, 0.1)', colorBorder: 'rgba(234, 67, 53, 0.3)', supportePartageDirect: true });

  const autresLiens = [];
  if (messagesPartage.autres?.twitter) autresLiens.push({ id: 'twitter', label: 'Twitter/X', icon: 'bi-twitter-x', color: '#1DA1F2', url: messagesPartage.autres.twitter });
  if (messagesPartage.autres?.telegram) autresLiens.push({ id: 'telegram', label: 'Telegram', icon: 'bi-telegram', color: '#0088CC', url: messagesPartage.autres.telegram });
  if (messagesPartage.autres?.linkedin) autresLiens.push({ id: 'linkedin', label: 'LinkedIn', icon: 'bi-linkedin', color: '#0A66C2', url: messagesPartage.autres.linkedin });

  const gainsPotentiels = codeParrain?.gainsPotentiels || {
    joursSi1Filleul: recompense,
    joursSi5Filleuls: recompense * 5,
    joursSi10Filleuls: recompense * 10,
    valeurEstimeeFCFA: totalJoursCumules * 267,
  };

  const canalActif = canauxPrincipaux.find(c => c.id === canalPartageOuvert);
  const messageCanalActif = canalPartageOuvert ? messagesPartage[canalPartageOuvert] : null;

  return (
    <LayoutDashboard>
      <div className="p-2 p-md-3 p-lg-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
              <i className="bi bi-people-fill me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
              Programme de Parrainage
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              Invitez des vendeurs et gagnez {recompense} jours d'abonnement gratuits par filleul actif.
            </p>
          </div>
          <button className="btn btn-sm d-flex align-items-center gap-1" onClick={() => (window.location.href = '/dashboard')} style={{ borderRadius: R, borderWidth: '1px', borderColor: 'var(--izishop-secondaire)', color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>
            <i className="bi bi-arrow-left"></i> Tableau de bord
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2`} style={{ borderRadius: R, animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'}`} style={{ fontSize: '0.9rem' }}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        <div className="row g-3 mb-3">
          <div className="col-lg-5">
            <div className="carte-izishop p-3 h-100" style={{ borderRadius: R, background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(251, 190, 36, 0.05) 100%)', border: '2px solid rgba(96, 165, 250, 0.25)' }}>
              <label className="form-label fw-bold small mb-2" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>
                <i className="bi bi-gift-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Votre code parrain unique
              </label>
              <div className="d-flex gap-2 mb-2">
                <input type="text" className="form-control form-control-lg bg-white border-0 fw-bold text-center" style={{ borderRadius: R, fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--izishop-secondaire)' }} value={codeParrain?.codeParrain || 'IZI-XXXXXX'} readOnly />
                <button type="button" className="btn px-3 d-flex align-items-center gap-1" style={{ backgroundColor: codeCopie ? 'var(--izishop-succes)' : 'var(--izishop-accent)', color: 'white', borderRadius: R, minWidth: '110px', fontSize: '0.82rem', transition: 'all 0.2s ease' }} onClick={copierCodeParrain}>
                  <i className={`bi ${codeCopie ? 'bi-check2' : 'bi-clipboard'}`}></i>
                  <span>{codeCopie ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}><i className="bi bi-info-circle me-1"></i>Partagez ce code à vos amis lors de leur inscription.</small>
              {lienParrainage && (
                <div className="mt-2 pt-2 border-top">
                  <label className="form-label fw-bold small mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.72rem' }}>
                    <i className="bi bi-link-45deg me-1" style={{ color: 'var(--izishop-accent)' }}></i>Lien de parrainage
                  </label>
                  <div className="d-flex gap-1">
                    <input type="text" className="form-control form-control-sm bg-white border-0 text-truncate" style={{ borderRadius: R, fontSize: '0.72rem', color: 'var(--izishop-accent)' }} value={lienParrainage} readOnly />
                    <button type="button" className="btn btn-sm px-2" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)', color: 'var(--izishop-accent)', borderRadius: R }} onClick={copierLien} title="Copier le lien">
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="row g-2 h-100">
              <div className="col-6 col-md-3">
                <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(96, 165, 250, 0.15)' }}>
                    <i className="bi bi-person-plus-fill" style={{ color: 'var(--izishop-accent)', fontSize: '1rem' }}></i>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>{totalFilleulsActifs}</h4>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Filleuls actifs</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                    <i className="bi bi-calendar-check-fill" style={{ color: 'var(--izishop-succes)', fontSize: '1rem' }}></i>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>{totalJoursCumules}</h4>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Jours gagnés</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R, border: '2px solid var(--izishop-primaire)' }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.2)' }}>
                    <i className="bi bi-stars" style={{ color: 'var(--izishop-primaire)', fontSize: '1rem' }}></i>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>{joursDisponibles}</h4>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Disponible</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="carte-izishop p-2 text-center h-100" style={{ borderRadius: R }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                    <i className="bi bi-clock-history" style={{ color: '#7C3AED', fontSize: '1rem' }}></i>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '1.3rem' }}>{totalJoursUtilises}</h4>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Jours utilisés</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-lg-6">
            <div className="carte-izishop p-3 h-100" style={{ borderRadius: R }}>
              <h6 className="fw-bold mb-2" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                <i className="bi bi-lightbulb-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Comment ça marche ?
              </h6>
              <div className="d-flex flex-column gap-2">
                {regles.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.15)', color: 'var(--izishop-primaire)', fontSize: '0.75rem' }}>{item.etape || idx + 1}</div>
                    <span className="small" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(251, 190, 36, 0.1)', borderRadius: R, border: '1px dashed rgba(251, 190, 36, 0.4)' }}>
                <i className="bi bi-gift-fill" style={{ color: 'var(--izishop-primaire)', fontSize: '1.1rem' }}></i>
                <div>
                  <div className="fw-bold small" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>Récompense : <span style={{ color: 'var(--izishop-primaire)' }}>+{recompense} jours gratuits</span></div>
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>Pour chaque filleul qui passe au plan PRO.</small>
                </div>
              </div>
              {totalFilleulsActifs === 0 && (
                <div className="mt-3 pt-2 border-top">
                  <small className="fw-bold d-block mb-2" style={{ fontSize: '0.72rem', color: 'var(--izishop-secondaire)' }}><i className="bi bi-graph-up-arrow me-1" style={{ color: 'var(--izishop-succes)' }}></i>Gains potentiels estimés</small>
                  <div className="row g-1">
                    <div className="col-4"><div className="p-1 text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: R }}><div className="fw-bold" style={{ color: 'var(--izishop-succes)', fontSize: '0.85rem' }}>{gainsPotentiels.joursSi1Filleul}j</div><small className="text-muted" style={{ fontSize: '0.6rem' }}>1 filleul</small></div></div>
                    <div className="col-4"><div className="p-1 text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: R }}><div className="fw-bold" style={{ color: 'var(--izishop-succes)', fontSize: '0.85rem' }}>{gainsPotentiels.joursSi5Filleuls}j</div><small className="text-muted" style={{ fontSize: '0.6rem' }}>5 filleuls</small></div></div>
                    <div className="col-4"><div className="p-1 text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.18)', borderRadius: R }}><div className="fw-bold" style={{ color: 'var(--izishop-succes)', fontSize: '0.85rem' }}>{gainsPotentiels.joursSi10Filleuls}j</div><small className="text-muted" style={{ fontSize: '0.6rem' }}>10 filleuls</small></div></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="carte-izishop p-3 h-100" style={{ borderRadius: R, backgroundColor: joursDisponibles > 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(243, 244, 246, 0.5)', border: joursDisponibles > 0 ? '2px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(0,0,0,0.05)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                  <i className="bi bi-stars me-1" style={{ color: 'var(--izishop-succes)' }}></i>Utiliser mes bonus
                </h6>
                <span className="badge px-2 py-1" style={{ backgroundColor: joursDisponibles > 0 ? 'var(--izishop-succes)' : 'rgba(107, 114, 128, 0.15)', color: joursDisponibles > 0 ? 'white' : '#6B7280', borderRadius: R, fontSize: '0.72rem', fontWeight: 700 }}>{joursDisponibles} jour{joursDisponibles > 1 ? 's' : ''}</span>
              </div>
              <small className="text-muted d-block mb-2" style={{ fontSize: '0.72rem' }}>Saisissez librement le nombre de jours à appliquer (de 1 à {joursDisponibles}).</small>
              {joursDisponibles > 0 ? (
                <form onSubmit={handleUtiliserBonus}>
                  <label className="form-label fw-bold small mb-1" style={{ fontSize: '0.72rem' }}>Combien de jours appliquer ?</label>
                  <div className="d-flex gap-2 mb-2">
                    <input type="number" className="form-control bg-white" style={{ borderRadius: R, fontSize: '1rem', fontWeight: 600, maxWidth: '150px' }} placeholder={`1 - ${joursDisponibles}`} value={joursAAppliquer} onChange={(e) => setJoursAAppliquer(e.target.value)} min="1" max={joursDisponibles} step="1" disabled={applicationBonusEnCours} required />
                    <button type="submit" className="btn fw-bold px-3 d-flex align-items-center gap-1 flex-grow-1" style={{ backgroundColor: 'var(--izishop-succes)', color: 'white', borderRadius: R, fontSize: '0.82rem' }} disabled={applicationBonusEnCours || !joursAAppliquer || parseInt(joursAAppliquer) < 1 || parseInt(joursAAppliquer) > joursDisponibles}>
                      {applicationBonusEnCours ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-circle-fill"></i><span>{joursAAppliquer && parseInt(joursAAppliquer) === joursDisponibles ? `Tout appliquer (${joursDisponibles}j)` : 'Appliquer'}</span></>}
                    </button>
                  </div>
                  {joursAAppliquer && parseInt(joursAAppliquer) > 0 && parseInt(joursAAppliquer) <= joursDisponibles && (
                    <div className="p-2 mb-2 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'rgba(251, 190, 36, 0.08)', border: '1px solid rgba(251, 190, 36, 0.3)', borderRadius: R, fontSize: '0.72rem' }}>
                      <span className="text-muted"><i className="bi bi-calculator me-1"></i>Solde après application :</span>
                      <span className="fw-bold" style={{ color: 'var(--izishop-secondaire)' }}>{joursDisponibles - parseInt(joursAAppliquer)} jour{(joursDisponibles - parseInt(joursAAppliquer)) !== 1 ? 's' : ''} restant{(joursDisponibles - parseInt(joursAAppliquer)) !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}><i className="bi bi-info-circle me-1"></i>Utilisation #{nombreUtilisations + 1}. Les jours non utilisés resteront disponibles.</small>
                </form>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-emoji-frown" style={{ fontSize: '1.8rem', color: '#94a3b8' }}></i>
                  <p className="text-muted small mb-0 mt-2" style={{ fontSize: '0.78rem' }}>Aucun jour disponible. Parrainez un vendeur pour gagner des bonus !</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {codeParrain?.messagesPartage && canauxPrincipaux.length > 0 && (
          <div className="carte-izishop p-3 mb-3" style={{ borderRadius: R, border: '2px solid rgba(96, 165, 250, 0.2)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
                  <i className="bi bi-share-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Partager votre code
                </h5>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Messages prêts à l'emploi — choisissez un canal</small>
              </div>
            </div>
            <div className="row g-2 mb-3">
              {canauxPrincipaux.map(canal => (
                <div key={canal.id} className="col-4">
                  <button type="button" className="w-100 p-3 d-flex flex-column align-items-center gap-1 transition-all" style={{ backgroundColor: canalPartageOuvert === canal.id ? canal.color : canal.colorLight, color: canalPartageOuvert === canal.id ? 'white' : canal.color, border: `2px solid ${canal.colorBorder}`, borderRadius: R, cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setCanalPartageOuvert(canalPartageOuvert === canal.id ? null : canal.id)}>
                    <i className={`bi ${canal.icon}`} style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold" style={{ fontSize: '0.78rem' }}>{canal.label}</span>
                    <small style={{ fontSize: '0.6rem', opacity: 0.8 }}>{canal.id === 'whatsapp' ? 'Partage direct' : canal.id === 'email' ? 'Ouvrir email' : 'Copier le texte'}</small>
                  </button>
                </div>
              ))}
            </div>

            {canalActif && messageCanalActif && (
              <div className="p-3 mb-3" style={{ backgroundColor: 'rgba(251, 190, 36, 0.05)', border: '1px solid rgba(251, 190, 36, 0.3)', borderRadius: R, animation: 'fadeIn 0.3s ease' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1 text-capitalize" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>
                      <i className="bi bi-chat-left-text-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Message {canalActif.label}
                    </h6>
                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>{messageCanalActif.longueur} caractères • Prêt à utiliser</small>
                  </div>
                </div>
                <div className="p-2 mb-2" style={{ backgroundColor: 'white', borderRadius: R, border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.78rem', lineHeight: '1.5', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--izishop-secondaire)' }}>
                  {messageCanalActif.texte || messageCanalActif.corpsTexte}
                </div>
                {canalPartageOuvert === 'facebook' && messageCanalActif.hashtags && (
                  <div className="mb-2">
                    <small className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}><i className="bi bi-hash me-1"></i>Hashtags à ajouter</small>
                    <div className="d-flex flex-wrap gap-1">
                      {messageCanalActif.hashtags.map((tag, i) => (
                        <span key={i} className="badge" style={{ backgroundColor: 'rgba(24, 119, 242, 0.1)', color: '#1877F2', borderRadius: R, fontSize: '0.65rem', fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  {canalActif.supportePartageDirect && messageCanalActif.lienRapide && (
                    <button type="button" className="btn fw-bold px-3 py-2 d-flex align-items-center gap-2" style={{ backgroundColor: canalActif.color, color: 'white', borderRadius: R, fontSize: '0.82rem', flex: '1 1 auto' }} onClick={() => partagerDirect(messageCanalActif.lienRapide)}>
                      <i className={`bi ${canalActif.icon}`}></i>
                      <span>{canalPartageOuvert === 'whatsapp' ? 'Ouvrir WhatsApp' : 'Ouvrir ma messagerie'}</span>
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.75rem' }}></i>
                    </button>
                  )}
                  {canalPartageOuvert === 'facebook' && (
                    <div className="w-100">
                      <div className="p-2 mb-2 d-flex align-items-start gap-2" style={{ backgroundColor: 'rgba(24, 119, 242, 0.08)', border: '1px solid rgba(24, 119, 242, 0.25)', borderRadius: R, fontSize: '0.7rem', color: '#1877F2' }}>
                        <i className="bi bi-info-circle-fill flex-shrink-0" style={{ marginTop: '1px' }}></i>
                        <div><strong>Facebook ne permet pas le pré-remplissage de texte.</strong><br />Copiez le message ci-dessus, puis collez-le manuellement.</div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn fw-bold px-3 py-2 d-flex align-items-center gap-2 flex-grow-1" style={{ backgroundColor: '#1877F2', color: 'white', borderRadius: R, fontSize: '0.82rem' }} onClick={() => copierTexteMessage(messageCanalActif.texte, 'Facebook')}>
                          <i className="bi bi-clipboard-check"></i><span>Copier le message complet</span>
                        </button>
                        {messageCanalActif.lienRapide && (
                          <button type="button" className="btn px-3 py-2 d-flex align-items-center gap-1" style={{ backgroundColor: 'rgba(24, 119, 242, 0.1)', color: '#1877F2', borderRadius: R, fontSize: '0.78rem' }} onClick={() => partagerDirect(messageCanalActif.lienRapide)} title="Ouvrir Facebook">
                            <i className="bi bi-facebook"></i><span>Ouvrir FB</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {canalActif.supportePartageDirect && canalPartageOuvert !== 'facebook' && (
                    <button type="button" className="btn px-3 py-2 d-flex align-items-center gap-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.78rem' }} onClick={() => copierTexteMessage(messageCanalActif.texte || messageCanalActif.corpsTexte, canalActif.label)} title="Copier le message">
                      <i className="bi bi-clipboard"></i><span>Copier</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {autresLiens.length > 0 && (
              <div className="pt-3 border-top">
                <small className="text-muted fw-bold d-block mb-2" style={{ fontSize: '0.72rem' }}><i className="bi bi-link-45deg me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Autres liens de partage</small>
                <div className="d-flex flex-wrap gap-2">
                  {autresLiens.map(lien => (
                    <button key={lien.id} type="button" className="btn btn-sm px-3 py-2 d-flex align-items-center gap-2" style={{ backgroundColor: `${lien.color}15`, color: lien.color, border: `1px solid ${lien.color}40`, borderRadius: R, fontSize: '0.75rem', fontWeight: 600 }} onClick={() => partagerDirect(lien.url)}>
                      <i className={`bi ${lien.icon}`}></i><span>{lien.label}</span>
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.65rem' }}></i>
                    </button>
                  ))}
                </div>
                <small className="text-muted d-block mt-2" style={{ fontSize: '0.62rem' }}><i className="bi bi-info-circle me-1"></i>Ces liens ouvrent le partage avec votre lien de parrainage.</small>
              </div>
            )}

            {!canalPartageOuvert && (
              <div className="text-center py-2">
                <small className="text-muted" style={{ fontSize: '0.72rem' }}><i className="bi bi-hand-index-thumb-fill me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Cliquez sur un canal ci-dessus pour voir le message personnalisé</small>
              </div>
            )}
          </div>
        )}

        <div className="carte-izishop p-3 mb-3" style={{ borderRadius: R }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2 pb-2 border-bottom">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
              <i className="bi bi-people-fill me-1" style={{ color: 'var(--izishop-accent)' }}></i>Mes filleuls
              {chargementFilleuls && <span className="spinner-border spinner-border-sm ms-2" role="status" style={{ width: '12px', height: '12px' }}></span>}
            </h5>
            <div className="d-flex gap-1">
              {[{ id: 'tous', label: 'Tous' }, { id: 'actifs', label: 'Actifs' }, { id: 'inactifs', label: 'Inactifs' }].map(f => (
                <button key={f.id} type="button" className="btn btn-sm px-2 py-1" style={{ borderRadius: R, fontSize: '0.72rem', fontWeight: 600, backgroundColor: filtreFilleuls === f.id ? 'var(--izishop-secondaire)' : 'rgba(30, 41, 59, 0.05)', color: filtreFilleuls === f.id ? 'white' : 'var(--izishop-secondaire)', border: 'none' }} onClick={() => setFiltreFilleuls(f.id)} disabled={chargementFilleuls}>{f.label}</button>
              ))}
            </div>
          </div>
          {safeFilleuls.length === 0 ? (
            <div className="text-center py-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(96, 165, 250, 0.1)' }}>
                <i className="bi bi-people fs-4" style={{ color: 'var(--izishop-accent)' }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>Aucun filleul {filtreFilleuls !== 'tous' ? `(${filtreFilleuls})` : ''}</h6>
              <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>Partagez votre code pour commencer à parrainer !</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    <th className="border-0 py-2">Nom</th>
                    <th className="border-0 py-2">Pays</th>
                    <th className="border-0 py-2">Inscription</th>
                    <th className="border-0 py-2">Statut</th>
                    <th className="border-0 py-2">Bonus gagné</th>
                  </tr>
                </thead>
                <tbody>
                  {safeFilleuls.map((f, idx) => (
                    <tr key={f.id || idx} style={{ transition: 'background-color 0.2s ease' }}>
                      <td className="py-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(96, 165, 250, 0.15)', color: 'var(--izishop-accent)', fontSize: '0.75rem' }}>{(f.nomComplet || 'U').charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="fw-medium" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.78rem' }}>{f.nomComplet || 'Utilisateur'}</div>
                            {f.email && <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>{f.email}</small>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2"><span className="badge bg-light text-dark" style={{ borderRadius: R, fontSize: '0.68rem' }}>{f.pays || '-'}</span></td>
                      <td className="py-2 text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(f.dateInscription)}</td>
                      <td className="py-2">
                        <span className="badge px-2 py-1" style={{ backgroundColor: f.actif ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)', color: f.actif ? '#047857' : '#6B7280', borderRadius: R, fontSize: '0.68rem', fontWeight: 600 }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: f.actif ? '#047857' : '#6B7280', display: 'inline-block', marginRight: '4px' }}></span>{f.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className="fw-bold" style={{ color: f.bonusRecu ? 'var(--izishop-succes)' : '#94a3b8', fontSize: '0.78rem' }}>{f.bonusRecu ? `+${f.joursGagnes || recompense} j` : '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="carte-izishop p-3" style={{ borderRadius: R }}>
          <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.9rem' }}>
              <i className="bi bi-clock-history me-1" style={{ color: 'var(--izishop-primaire)' }}></i>Historique des bonus
            </h5>
            {historiqueBonus.length > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.08)', color: 'var(--izishop-secondaire)', borderRadius: R, fontSize: '0.7rem' }}>{historiqueBonus.length} entrée{historiqueBonus.length > 1 ? 's' : ''}</span>
            )}
          </div>
          {historiqueBonus.length === 0 ? (
            <div className="text-center py-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(251, 190, 36, 0.1)' }}>
                <i className="bi bi-inbox fs-4" style={{ color: 'var(--izishop-primaire)' }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>Aucun historique</h6>
              <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>Vos bonus gagnés et utilisés apparaîtront ici.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    <th className="border-0 py-2">Date</th>
                    <th className="border-0 py-2">Type</th>
                    <th className="border-0 py-2">Jours</th>
                    <th className="border-0 py-2">Période</th>
                  </tr>
                </thead>
                <tbody>
                  {historiqueBonus.map((h, idx) => {
                    const estGain = h.typeAction === 'GAIN' || h.typeAction === 'GAGNE' || h.typeAction === 'BONUS_PARRAINAGE_AUTO';
                    return (
                      <tr key={h.id || idx} style={{ transition: 'background-color 0.2s ease' }}>
                        <td className="py-2 text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(h.dateUtilisation || h.dateDebut)}</td>
                        <td className="py-2">
                          <span className="badge px-2 py-1 d-inline-flex align-items-center gap-1" style={{ backgroundColor: estGain ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 190, 36, 0.15)', color: estGain ? '#047857' : '#B45309', borderRadius: R, fontSize: '0.68rem', fontWeight: 600 }}>
                            <i className={`bi ${estGain ? 'bi-plus-circle-fill' : 'bi-dash-circle-fill'}`} style={{ fontSize: '0.7rem' }}></i>{estGain ? 'Gagné' : 'Utilisé'}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="fw-bold" style={{ color: estGain ? 'var(--izishop-succes)' : 'var(--izishop-primaire)', fontSize: '0.85rem' }}>{estGain ? '+' : '-'}{h.joursAppliques || 0} j</span>
                        </td>
                        <td className="py-2 text-muted" style={{ fontSize: '0.72rem' }}>{h.dateDebut && h.dateFin ? `${formatDate(h.dateDebut)} → ${formatDate(h.dateFin)}` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
};

const Parrainage = () => (
  <ErrorBoundary>
    <ParrainageContent />
  </ErrorBoundary>
);

export default Parrainage;