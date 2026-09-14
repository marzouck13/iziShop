// Fichier: frontend/src/pages/dashboard/Commandes.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  changerStatutCommande,
  annulerCommande,
  genererRecu,
  envoyerRecuEmail,
  obtenirMesCommandes,
} from '../../lib/api';
import { useData } from '../../context/DataContext';
import LayoutDashboard from '../../components/LayoutDashboard';
import { SkeletonHeader, SkeletonTableRow } from '../../components/SkeletonLoader';

const RAYON = '5px';

const Commandes = () => {
  const navigate = useNavigate();

  // ✅ Données initiales depuis DataContext
  const { commandes: commandesInitiales, rafraichir } = useData();

  // État local pour les filtres (car on peut vouloir charger avec un statut spécifique)
  const [commandes, setCommandes] = useState(commandesInitiales || []);
  const [chargement, setChargement] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [actionEnCours, setActionEnCours] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Synchroniser avec le context au montage
  useEffect(() => {
    setCommandes(commandesInitiales || []);
  }, [commandesInitiales]);

  // Charger avec filtre spécifique (différent du context global)
  const chargerAvecFiltre = async (statut) => {
    if (statut === 'tous') {
      setCommandes(commandesInitiales || []);
      return;
    }
    setChargement(true);
    try {
      const res = await obtenirMesCommandes({ statut });
      if (res?.donnees?.commandes) setCommandes(res.donnees.commandes);
    } catch (err) {
      console.error(err);
      afficherMessage('danger', err.message || 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerAvecFiltre(filtreStatut);
  }, [filtreStatut]);

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const commandesFiltrees = useMemo(() => {
    if (!recherche.trim()) return commandes;
    const r = recherche.toLowerCase();
    return commandes.filter(c =>
      c.numeroCommande.toLowerCase().includes(r) ||
      c.nomClient.toLowerCase().includes(r) ||
      c.telephoneClient.includes(r)
    );
  }, [commandes, recherche]);

  const stats = useMemo(() => {
    const s = {
      total: commandes.length,
      NOUVELLE: 0, EN_DISCUSSION: 0, CONFIRMEE: 0,
      EN_PREPARATION: 0, EXPEDIEE: 0, LIVREE: 0, ANNULEE: 0,
    };
    commandes.forEach(c => { if (s[c.statut] !== undefined) s[c.statut]++; });
    return s;
  }, [commandes]);

  const handleStatut = async (id, nouveauStatut, numero) => {
    if (!window.confirm(`Changer le statut de ${numero} vers "${nouveauStatut.replace('_', ' ')}" ?`)) return;
    setActionEnCours(id);
    try {
      await changerStatutCommande(id, nouveauStatut);
      afficherMessage('success', `Statut mis à jour avec succès.`);
      await rafraichir(['commandes', 'stats']);
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors du changement de statut.');
    } finally {
      setActionEnCours(null);
    }
  };

  const handleAnnuler = async (id, numero) => {
    if (!window.confirm(`ANNULER la commande ${numero} ? Le stock sera restauré.`)) return;
    setActionEnCours(id);
    try {
      await annulerCommande(id);
      afficherMessage('success', `Commande ${numero} annulée.`);
      await rafraichir(['commandes', 'stats', 'produits']);
    } catch (err) {
      afficherMessage('danger', err.message || "Erreur lors de l'annulation.");
    } finally {
      setActionEnCours(null);
    }
  };

  const handleGenererRecu = async (id, numero) => {
    setActionEnCours(id);
    try {
      const res = await genererRecu(id);
      if (res?.donnees?.recusUrls?.[0]) {
        window.open(res.donnees.recusUrls[0], '_blank');
        afficherMessage('success', `Reçu PDF généré pour ${numero}.`);
      } else {
        afficherMessage('warning', 'Aucun reçu disponible pour cette commande.');
      }
    } catch (err) {
      afficherMessage('danger', err.message || 'Erreur lors de la génération du reçu.');
    } finally {
      setActionEnCours(null);
    }
  };

  const handleEnvoyerEmail = async (id, numero) => {
    if (!window.confirm(`Envoyer le reçu par email pour ${numero} ?`)) return;
    setActionEnCours(id);
    try {
      await envoyerRecuEmail(id);
      afficherMessage('success', `Email envoyé avec succès.`);
    } catch (err) {
      afficherMessage('danger', err.message || "Erreur lors de l'envoi.");
    } finally {
      setActionEnCours(null);
    }
  };

  const getBadgeStatut = (statut) => {
    const map = {
      NOUVELLE: { bg: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', icon: 'bi-bell-fill', label: 'Nouvelle' },
      EN_DISCUSSION: { bg: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED', icon: 'bi-chat-dots-fill', label: 'Discussion' },
      CONFIRMEE: { bg: 'rgba(251, 190, 36, 0.2)', color: '#B45309', icon: 'bi-check-circle-fill', label: 'Confirmée' },
      EN_PREPARATION: { bg: 'rgba(249, 115, 22, 0.15)', color: '#C2410C', icon: 'bi-box-seam-fill', label: 'Préparation' },
      EXPEDIEE: { bg: 'rgba(14, 165, 233, 0.15)', color: '#0369A1', icon: 'bi-truck', label: 'Expédiée' },
      LIVREE: { bg: 'rgba(16, 185, 129, 0.15)', color: '#047857', icon: 'bi-check2-all', label: 'Livrée' },
      ANNULEE: { bg: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', icon: 'bi-x-circle-fill', label: 'Annulée' },
    };
    return map[statut] || { bg: '#F3F4F6', color: '#6B7280', icon: 'bi-circle', label: statut };
  };

  const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const onglets = [
    { id: 'tous', label: 'Toutes', count: stats.total, icon: 'bi-inbox', color: 'var(--izishop-secondaire)' },
    { id: 'NOUVELLE', label: 'Nouvelles', count: stats.NOUVELLE, icon: 'bi-bell-fill', color: '#2563EB' },
    { id: 'CONFIRMEE', label: 'Confirmées', count: stats.CONFIRMEE, icon: 'bi-check-circle-fill', color: '#B45309' },
    { id: 'LIVREE', label: 'Livrées', count: stats.LIVREE, icon: 'bi-check2-all', color: '#047857' },
    { id: 'ANNULEE', label: 'Annulées', count: stats.ANNULEE, icon: 'bi-x-circle-fill', color: '#B91C1C' },
  ];

  return (
    <LayoutDashboard>
      <div className="dashboard-fit p-3 p-md-4">
        {chargement ? (
          <SkeletonHeader />
        ) : (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--izishop-secondaire)' }}>
                <i className="bi bi-bag-check me-2" style={{ color: 'var(--izishop-primaire)' }}></i>
                Mes Commandes
              </h1>
              <p className="text-muted small mb-0">
                {stats.total} commande{stats.total > 1 ? 's' : ''} • {stats.NOUVELLE} en attente
              </p>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2 px-3`} style={{ borderRadius: RAYON, animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi fs-5 ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="small fw-medium">{message.text}</span>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        <div className="d-flex gap-2 mb-3 overflow-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {onglets.map(ong => {
            const actif = filtreStatut === ong.id;
            return (
              <button
                key={ong.id}
                onClick={() => setFiltreStatut(ong.id)}
                className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold small border-0 flex-shrink-0"
                style={{
                  borderRadius: RAYON,
                  backgroundColor: actif ? ong.color : 'white',
                  color: actif ? 'white' : 'var(--izishop-secondaire)',
                  boxShadow: actif ? `0 2px 6px ${ong.color}40` : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className={`bi ${ong.icon}`}></i>
                <span>{ong.label}</span>
                {ong.count > 0 && (
                  <span className="badge fw-bold" style={{ backgroundColor: actif ? 'rgba(255,255,255,0.25)' : `${ong.color}20`, color: actif ? 'white' : ong.color, borderRadius: RAYON, fontSize: '0.7rem' }}>
                    {ong.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="carte-izishop p-3 mb-3">
          <div className="position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input type="text" className="form-control bg-light border-0 ps-5 py-2" style={{ borderRadius: RAYON, fontSize: '0.9rem' }} placeholder="Rechercher par N° commande, client, téléphone..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            {recherche && (
              <button type="button" className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted" onClick={() => setRecherche('')} title="Effacer">
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        <div className="carte-izishop overflow-hidden" style={{ borderRadius: RAYON }}>
          {chargement ? (
            <div className="p-3">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted border-bottom" style={{ fontSize: '0.7rem' }}>
                    <th className="ps-3 py-2">Commande</th>
                    <th className="py-2">Client</th>
                    <th className="py-2">Montant</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Statut</th>
                    <th className="text-end pe-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5, 6].map(i => (<SkeletonTableRow key={i} />))}</tbody>
              </table>
            </div>
          ) : commandesFiltrees.length === 0 ? (
            <div className="text-center py-5">
              <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(251, 190, 36, 0.1)', borderRadius: RAYON }}>
                <i className="bi bi-inbox fs-1" style={{ color: 'var(--izishop-primaire)' }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--izishop-secondaire)' }}>Aucune commande trouvée</h6>
              <p className="text-muted small mb-0" style={{ maxWidth: '400px', margin: '0 auto' }}>
                {recherche ? 'Aucun résultat pour cette recherche.' : 'Les commandes de vos clients apparaîtront ici.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted border-bottom" style={{ fontSize: '0.7rem', backgroundColor: 'var(--izishop-fond)' }}>
                    <th className="ps-3 py-2">Commande</th>
                    <th className="py-2">Client</th>
                    <th className="py-2">Montant</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Statut</th>
                    <th className="text-end pe-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commandesFiltrees.map(c => {
                    const badge = getBadgeStatut(c.statut);
                    const enAction = actionEnCours === c.id;
                    return (
                      <tr key={c.id}>
                        <td className="ps-3 py-2">
                          <div className="fw-bold small" style={{ color: 'var(--izishop-secondaire)', fontSize: '0.85rem' }}>{c.numeroCommande}</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>{c.produits?.length || 0} article{(c.produits?.length || 0) > 1 ? 's' : ''}</small>
                        </td>
                        <td className="py-2">
                          <div className="fw-semibold small" style={{ fontSize: '0.85rem' }}>{c.nomClient}</div>
                          <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-whatsapp text-success"></i>{c.telephoneClient}
                          </small>
                        </td>
                        <td className="py-2">
                          <span className="fw-bold small" style={{ fontSize: '0.85rem' }}>{formatPrix(c.montantTotal)}</span>
                          <small className="text-muted fw-normal ms-1" style={{ fontSize: '0.7rem' }}>FCFA</small>
                        </td>
                        <td className="py-2"><small className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(c.dateCreation)}</small></td>
                        <td className="py-2">
                          <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1" style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: RAYON, fontSize: '0.7rem', fontWeight: 600 }}>
                            <i className={`bi ${badge.icon}`}></i>{badge.label}
                          </span>
                        </td>
                        <td className="text-end pe-3 py-2">
                          <div className="d-inline-flex gap-1 flex-wrap justify-content-end">
                            <button onClick={() => navigate(`/dashboard/commandes/${c.id}`)} className="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0 }} title="Voir détails" disabled={enAction}>
                              <i className="bi bi-eye" style={{ fontSize: '0.85rem' }}></i>
                            </button>
                            {c.statut === 'NOUVELLE' && (
                              <button onClick={() => handleStatut(c.id, 'CONFIRMEE', c.numeroCommande)} className="btn btn-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#047857', border: 'none' }} title="Confirmer" disabled={enAction}>
                                <i className="bi bi-check-lg" style={{ fontSize: '0.9rem' }}></i>
                              </button>
                            )}
                            {c.statut === 'CONFIRMEE' && (
                              <button onClick={() => handleStatut(c.id, 'LIVREE', c.numeroCommande)} className="btn btn-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0, backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#0369A1', border: 'none' }} title="Marquer livrée" disabled={enAction}>
                                <i className="bi bi-truck" style={{ fontSize: '0.85rem' }}></i>
                              </button>
                            )}
                            {(c.statut === 'LIVREE' || c.statut === 'CONFIRMEE') && (
                              <>
                                <button onClick={() => handleGenererRecu(c.id, c.numeroCommande)} className="btn btn-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', border: 'none' }} title="Reçu PDF" disabled={enAction}>
                                  <i className="bi bi-file-earmark-pdf" style={{ fontSize: '0.85rem' }}></i>
                                </button>
                                <button onClick={() => handleEnvoyerEmail(c.id, c.numeroCommande)} className="btn btn-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED', border: 'none' }} title="Envoyer email" disabled={enAction}>
                                  <i className="bi bi-envelope" style={{ fontSize: '0.85rem' }}></i>
                                </button>
                              </>
                            )}
                            {c.statut !== 'ANNULEE' && c.statut !== 'LIVREE' && (
                              <button onClick={() => handleAnnuler(c.id, c.numeroCommande)} className="btn btn-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: RAYON, padding: 0, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#B91C1C', border: 'none' }} title="Annuler" disabled={enAction}>
                                {enAction ? <span className="spinner-border spinner-border-sm" style={{ width: '0.8rem', height: '0.8rem' }}></span> : <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }}></i>}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!chargement && commandesFiltrees.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Les commandes annulées restaurent le stock automatiquement.</small>
            <small className="text-muted d-none d-md-block">Total filtré : <strong>{formatPrix(commandesFiltrees.reduce((s, c) => s + (c.montantTotal || 0), 0))} FCFA</strong></small>
          </div>
        )}
      </div>
      <style>{`
        .dashboard-fit { min-height: calc(100vh - 80px); display: flex; flex-direction: column; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .table-hover tbody tr:hover { background-color: rgba(251, 190, 36, 0.04) !important; }
      `}</style>
    </LayoutDashboard>
  );
};

export default Commandes;