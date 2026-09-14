/* eslint-disable react-refresh/only-export-components */
// Fichier: frontend/src/context/DataContext.jsx
// DataContext — Source unique de vérité pour tout le Dashboard
// Élimine 90% des requêtes redondantes vers le backend
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  obtenirMaBoutique,
  obtenirMesProduits,
  obtenirStatistiquesCommandes,
  obtenirMesCommandes,
  obtenirMonCodeParrain,
  obtenirMesBonus,
  obtenirProvidersPaiement,
  obtenirHistoriquePaiements,
  obtenirCategories,
} from '../lib/api';

const DataContext = createContext(null);

/**
 * Hook pour consommer les données depuis n'importe quel composant
 * @returns {{
 *   boutique: Object|null,
 *   produits: Array,
 *   stats: Object|null,
 *   commandes: Array,
 *   parrainage: { code: Object|null, bonus: Object|null },
 *   abonnement: { providers: Object|null, historique: Array },
 *   categories: Array,
 *   chargement: boolean,
 *   rafraichir: (cibles?: string[]) => Promise<void>,
 *   erreur: string|null
 * }}
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé à l\'intérieur de <DataProvider>');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // ==========================================
  // ÉTATS CENTRALISÉS
  // ==========================================
  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [codeParrain, setCodeParrain] = useState(null);
  const [bonusParrainage, setBonusParrainage] = useState(null);
  const [providers, setProviders] = useState(null);
  const [historiquePaiements, setHistoriquePaiements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [chargementPartiel, setChargementPartiel] = useState({});
  const [erreur, setErreur] = useState(null);

  // Anti-double-appel StrictMode
  const initialChargeRef = useRef(false);

  // ==========================================
  // CHARGEMENT INITIAL — TOUT EN PARALLÈLE (1 SEUL PASSAGE)
  // ==========================================
  const chargerTout = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const [
        resBoutique,
        resProduits,
        resStats,
        resCommandes,
        resCodeParrain,
        resBonus,
        resProviders,
        resHistorique,
        resCategories,
      ] = await Promise.all([
        obtenirMaBoutique().catch(() => null),
        obtenirMesProduits().catch(() => null),
        obtenirStatistiquesCommandes().catch(() => null),
        obtenirMesCommandes({ limite: 5 }).catch(() => null),
        obtenirMonCodeParrain().catch(() => null),
        obtenirMesBonus().catch(() => null),
        obtenirProvidersPaiement().catch(() => null),
        obtenirHistoriquePaiements({ limite: 10 }).catch(() => null),
        obtenirCategories().catch(() => null),
      ]);

      if (resBoutique?.donnees) setBoutique(resBoutique.donnees);
      if (resProduits?.donnees?.produits) setProduits(resProduits.donnees.produits);
      if (resStats?.donnees) setStats(resStats.donnees);
      if (resCommandes?.donnees?.commandes) setCommandes(resCommandes.donnees.commandes);
      if (resCodeParrain?.donnees) setCodeParrain(resCodeParrain.donnees);
      if (resBonus?.donnees) setBonusParrainage(resBonus.donnees);
      if (resProviders?.donnees) setProviders(resProviders.donnees);
      if (resHistorique?.donnees?.paiements) setHistoriquePaiements(resHistorique.donnees.paiements);
      if (resCategories?.donnees?.categories) setCategories(resCategories.donnees.categories);

    } catch (err) {
      console.error('[DataContext] Erreur chargement initial:', err);
      setErreur('Impossible de charger les données du tableau de bord.');
    } finally {
      setChargement(false);
    }
  }, []);

  // ==========================================
  // RAFRAÎCHISSEMENT SÉLECTIF (par cible)
  // ==========================================
  const rafraichir = useCallback(async (cibles = []) => {
    // Si aucune cible précisée, on rafraîchit tout
    const tout = cibles.length === 0;

    if (tout || cibles.includes('tout')) {
      return chargerTout();
    }

    const taches = [];
    const setters = {};

    if (cibles.includes('boutique')) {
      taches.push(obtenirMaBoutique());
      setters.boutique = (res) => res?.donnees && setBoutique(res.donnees);
    }
    if (cibles.includes('produits')) {
      taches.push(obtenirMesProduits());
      setters.produits = (res) => res?.donnees?.produits && setProduits(res.donnees.produits);
    }
    if (cibles.includes('stats')) {
      taches.push(obtenirStatistiquesCommandes());
      setters.stats = (res) => res?.donnees && setStats(res.donnees);
    }
    if (cibles.includes('commandes')) {
      taches.push(obtenirMesCommandes({ limite: 5 }));
      setters.commandes = (res) => res?.donnees?.commandes && setCommandes(res.donnees.commandes);
    }
    if (cibles.includes('parrainage')) {
      taches.push(Promise.all([obtenirMonCodeParrain(), obtenirMesBonus()]));
      setters.parrainage = (res) => {
        const [resCode, resBonus] = res;
        if (resCode?.donnees) setCodeParrain(resCode.donnees);
        if (resBonus?.donnees) setBonusParrainage(resBonus.donnees);
      };
    }
    if (cibles.includes('abonnement')) {
      taches.push(Promise.all([obtenirProvidersPaiement(), obtenirHistoriquePaiements({ limite: 10 })]));
      setters.abonnement = (res) => {
        const [resProviders, resHistorique] = res;
        if (resProviders?.donnees) setProviders(resProviders.donnees);
        if (resHistorique?.donnees?.paiements) setHistoriquePaiements(resHistorique.donnees.paiements);
      };
    }

    if (taches.length === 0) return;

    // Marquer le chargement partiel
    const cles = Object.keys(setters);
    const nouveauChargement = {};
    cles.forEach(c => { nouveauChargement[c] = true; });
    setChargementPartiel(prev => ({ ...prev, ...nouveauChargement }));

    try {
      const resultats = await Promise.all(taches.map(t => t.catch(() => null)));
      cles.forEach((cle, idx) => {
        if (setters[cle]) setters[cle](resultats[idx]);
      });
    } finally {
      const nouveauChargementFini = {};
      cles.forEach(c => { nouveauChargementFini[c] = false; });
      setChargementPartiel(prev => ({ ...prev, ...nouveauChargementFini }));
    }
  }, [chargerTout]);

  // ==========================================
  // CHARGEMENT AU MONTAGE (UNE SEULE FOIS)
  // ==========================================
  useEffect(() => {
    // Garde anti-StrictMode : on ne charge qu'une fois
    if (initialChargeRef.current) return;
    initialChargeRef.current = true;
    chargerTout();
  }, [chargerTout]);

  // ==========================================
  // VALEUR DU CONTEXT
  // ==========================================
  const valeur = {
    // Données
    boutique,
    produits,
    stats,
    commandes,
    parrainage: {
      code: codeParrain,
      bonus: bonusParrainage,
    },
    abonnement: {
      providers,
      historique: historiquePaiements,
    },
    categories,

    // États
    chargement,
    chargementPartiel,
    erreur,

    // Actions
    rafraichir,
  };

  return (
    <DataContext.Provider value={valeur}>
      {children}
    </DataContext.Provider>
  );
};