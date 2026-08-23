// Fichier: frontend/src/hooks/usePrixPublic.js
// Hook : recupere le prix d'abonnement selon le pays du visiteur
// Le pays est detecte automatiquement cote backend via l'IP

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

export function usePrixPublic() {
  const [prixData, setPrixData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;

    const chargerPrix = async () => {
      try {
        const reponse = await fetch(API_URL + '/prix-public');

        if (!reponse.ok) {
          throw new Error('HTTP ' + reponse.status);
        }

        const data = await reponse.json();

        if (annule) return;

        if (data.donnees) {
          setPrixData(data.donnees);
        } else {
          setErreur(data.message || 'Format de reponse invalide.');
        }
      } catch (err) {
        if (!annule) {
          console.error('[PRIX PUBLIC] Erreur:', err.message);
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