// Fichier: frontend/src/hooks/usePrixPublic.js
// Hook : récupère le prix d'abonnement selon le pays du visiteur
//  OPTIMISÉ : Cache localStorage (1h) pour éviter de saturer l'API
import { useState, useEffect } from 'react';

const construireUrlApi = () => {
  const urlBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const urlNettoyee = urlBase.replace(/\/+$/, '');
  if (urlNettoyee.endsWith('/api')) {
    return urlNettoyee;
  }
  return urlNettoyee + '/api';
};

const API_URL = construireUrlApi();

//  Configuration du Cache
const CACHE_KEY = 'izishop_prix_public_cache';
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 heures en ms (les prix changent rarement)

export function usePrixPublic() {
  const [prixData, setPrixData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;

    const chargerPrix = async () => {
      // 1️ VÉRIFICATION DU CACHE LOCAL (Instantané)
      try {
        const cacheRaw = localStorage.getItem(CACHE_KEY);
        if (cacheRaw) {
          const cacheParsed = JSON.parse(cacheRaw);
          const now = Date.now();
          
          // Si le cache existe et n'a pas expiré
          if (cacheParsed.timestamp && (now - cacheParsed.timestamp) < CACHE_TTL) {
            if (!annule) {
              setPrixData(cacheParsed.data);
              setChargement(false);
              console.log('[PRIX PUBLIC]  Données chargées depuis le cache local.');
              return; 
            }
          }
        }
      } catch (e) {
        console.warn('[PRIX PUBLIC] Erreur de lecture du cache:', e);
      }

      // 2️ APPEL API (Uniquement si pas de cache valide)
      try {
        const reponse = await fetch(API_URL + '/prix-public');
        if (!reponse.ok) {
          throw new Error('HTTP ' + reponse.status);
        }
        const data = await reponse.json();
        if (annule) return;
        
        if (data.donnees) {
          setPrixData(data.donnees);
          
          //  SAUVEGARDE DANS LE CACHE LOCAL
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: data.donnees,
              timestamp: Date.now()
            }));
            console.log('[PRIX PUBLIC]  Données mises en cache pour 24h.');
          } catch (e) {
            console.warn('[PRIX PUBLIC] Impossible de sauvegarder le cache:', e);
          }
        } else {
          setErreur(data.message || 'Format de reponse invalide.');
        }
      } catch (err) {
        if (!annule) {
          console.error('[PRIX PUBLIC] Erreur API:', err.message);
          setErreur(err.message);
        }
      } finally {
        if (!annule) {
          setChargement(false);
        }
      }
    };

    chargerPrix();

    return () => {
      annule = true;
    };
  }, []);

  return { prixData, chargement, erreur };
}

export default usePrixPublic;