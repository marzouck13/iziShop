/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-empty */
/**
 * ==========================================
 *  REACT HOOKS - API iziShop v8.0 (JavaScript)
 * ==========================================
 * 
 * Fichier : frontend/src/hooks/useApi.js
 * 
 * Hooks React prêts à l'emploi pour consommer l'API.
 * Utilise JSDoc pour l'autocomplétion dans VSCode.
 * 
 * Usage :
 *   import { useAuth, useMesProduits } from './hooks/useApi';
 *   
 *   function Dashboard() {
 *     const { user, login, logout } = useAuth();
 *     const { data, loading, error } = useMesProduits();
 *   }
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/apiClient';

// ========================================
// HOOK GÉNÉRIQUE
// ========================================

/**
 * Hook générique pour appeler l'API
 * @template T
 * @param {string} endpoint
 * @param {Object} [options]
 * @param {string} [options.method='GET']
 * @param {Object} [options.body]
 * @param {Object} [options.queryParams]
 * @param {boolean} [options.autoFetch=true]
 * @param {any[]} [options.deps]
 * @returns {{
 *   data: T|null,
 *   loading: boolean,
 *   error: Error|null,
 *   execute: Function,
 *   refetch: Function
 * }}
 */
export function useApi(endpoint, options = {}) {
  const { method = 'GET', body, queryParams, autoFetch = true, deps = [] } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrideBody) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (method === 'GET') {
        response = await api.get(endpoint, queryParams);
      } else if (method === 'POST') {
        response = await api.post(endpoint, overrideBody || body);
      } else if (method === 'PUT') {
        response = await api.put(endpoint, overrideBody || body);
      } else if (method === 'PATCH') {
        response = await api.patch(endpoint, overrideBody || body);
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint, overrideBody || body);
      }
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, method, body, JSON.stringify(queryParams), ...deps]);

  useEffect(() => {
    if (autoFetch && method === 'GET') {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, method, ...deps]);

  return { data, loading, error, execute, refetch: execute };
}

// ========================================
//  AUTH
// ========================================

/**
 * @typedef {Object} UseAuthReturn
 * @property {import('../services/jsdoc-types').Utilisateur|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {(email: string, password: string) => Promise<any>} login
 * @property {(data: Object) => Promise<any>} register
 * @property {() => Promise<void>} logout
 */

/**
 * Gestion complète de l'authentification
 * @returns {UseAuthReturn}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.loadTokens();
    if (api.accessToken) {
      api.get('/api/auth/profil')
        .then(res => {
          setUser(res.data?.donnees);
          setIsAuthenticated(true);
        })
        .catch(() => {
          api.clearTokens();
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, motDePasse) => {
    const res = await api.post('/api/auth/connexion', { email, motDePasse });
    const { tokenAcces, tokenRafraichissement, utilisateur } = res.data.donnees;
    api.setTokens(tokenAcces, tokenRafraichissement);
    setUser(utilisateur);
    setIsAuthenticated(true);
    return utilisateur;
  };

  const register = async (data) => {
    const res = await api.post('/api/auth/inscription', data);
    return res.data.donnees;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/deconnexion', {
        tokenRafraichissement: api.refreshToken
      });
    } catch {}
    api.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}

// ========================================
//  BOUTIQUE
// ========================================

/** Récupérer la boutique du vendeur connecté */
export function useMaBoutique() {
  return useApi('/api/boutique/ma-boutique');
}

/**
 * Récupérer une boutique publique
 * @param {string} sousDomaine
 */
export function useBoutiquePublique(sousDomaine) {
  return useApi(`/api/boutique/publique/${sousDomaine}`, {
    deps: [sousDomaine]
  });
}

/** Mettre à jour la boutique */
export function useMettreAJourBoutique() {
  return useApi('/api/boutique/ma-boutique', {
    method: 'PUT',
    autoFetch: false
  });
}

/** Basculer visibilité boutique */
export function useBasculerVisibilite() {
  return useApi('/api/boutique/ma-boutique/visibilite', {
    method: 'PATCH',
    autoFetch: false
  });
}

// ========================================
//  PRODUITS
// ========================================

/** Lister mes produits */
export function useMesProduits() {
  return useApi('/api/produit/ma-boutique');
}

/**
 * Obtenir un produit par ID
 * @param {string} idProduit
 */
export function useProduit(idProduit) {
  return useApi(`/api/produit/${idProduit}`, {
    deps: [idProduit]
  });
}

/**
 * Obtenir un produit public (sans auth)
 * @param {string} idProduit
 */
export function useProduitPublic(idProduit) {
  return useApi(`/api/produit/public/${idProduit}`, {
    deps: [idProduit]
  });
}

/** Créer un produit */
export function useCreerProduit() {
  return useApi('/api/produit', {
    method: 'POST',
    autoFetch: false
  });
}

/**
 * Mettre à jour un produit
 * @param {string} idProduit
 */
export function useMettreAJourProduit(idProduit) {
  return useApi(`/api/produit/${idProduit}`, {
    method: 'PUT',
    autoFetch: false
  });
}

/**
 * Supprimer un produit
 * @param {string} idProduit
 */
export function useSupprimerProduit(idProduit) {
  return useApi(`/api/produit/${idProduit}`, {
    method: 'DELETE',
    autoFetch: false
  });
}

// ========================================
//  COMMANDES
// ========================================

/**
 * Lister mes commandes
 * @param {Object} [queryParams]
 * @param {number} [queryParams.page]
 * @param {number} [queryParams.limite]
 * @param {string} [queryParams.statut]
 */
export function useMesCommandes(queryParams = {}) {
  return useApi('/api/commandes', {
    queryParams,
    deps: [JSON.stringify(queryParams)]
  });
}

/** Stats commandes du vendeur */
export function useStatsCommandes() {
  return useApi('/api/commandes/statistiques');
}

/**
 * Détails d'une commande
 * @param {string} idCommande
 */
export function useDetailsCommande(idCommande) {
  return useApi(`/api/commandes/${idCommande}`, {
    deps: [idCommande]
  });
}

// ========================================
//  REÇUS PDF
// ========================================

/**
 * Générer reçu PDF
 * @param {string} idCommande
 */
export function useGenererRecu(idCommande) {
  return useApi(`/api/recu/${idCommande}/generer`, {
    method: 'POST',
    autoFetch: false
  });
}

/**
 * Obtenir URLs reçus
 * @param {string} idCommande
 */
export function useObtenirRecus(idCommande) {
  return useApi(`/api/recu/${idCommande}/recus`, {
    deps: [idCommande]
  });
}

/**
 * Envoyer reçu par email
 * @param {string} idCommande
 */
export function useEnvoyerRecuEmail(idCommande) {
  return useApi(`/api/recu/${idCommande}/email`, {
    method: 'POST',
    autoFetch: false
  });
}

// ========================================
//  PAIEMENTS
// ========================================

/** Providers de paiement disponibles */
export function useProviders() {
  return useApi('/api/paiement/providers');
}

/**
 * Historique des paiements
 * @param {Object} [queryParams]
 */
export function useHistoriquePaiements(queryParams = {}) {
  return useApi('/api/paiement/historique', {
    queryParams,
    deps: [JSON.stringify(queryParams)]
  });
}

/** Valider un numéro Mobile Money */
export function useValiderNumero() {
  return useApi('/api/paiement/valider-numero', {
    method: 'POST',
    autoFetch: false
  });
}

/** Appliquer un code promo */
export function useAppliquerCodePromo() {
  return useApi('/api/paiement/appliquer-code-promo', {
    method: 'POST',
    autoFetch: false
  });
}

/** Initier un paiement */
export function useInitierPaiement() {
  return useApi('/api/paiement/initier', {
    method: 'POST',
    autoFetch: false
  });
}

// ========================================
//  NOTIFICATIONS
// ========================================

/**
 * Lister les notifications
 * @param {Object} [queryParams]
 * @param {boolean} [queryParams.nonLues]
 */
export function useNotifications(queryParams = {}) {
  return useApi('/api/notifications', {
    queryParams,
    deps: [JSON.stringify(queryParams)]
  });
}

/** Marquer notifications comme lues */
export function useMarquerLues() {
  return useApi('/api/notifications/lues', {
    method: 'PATCH',
    autoFetch: false
  });
}

/** Préférences notifications */
export function usePreferencesNotifications() {
  return useApi('/api/notifications/preferences');
}

// ========================================
//  PARRAINAGE
// ========================================

/**
 * Hook complet parrainage
 * @returns {{code: any, filleuls: any, bonus: any}}
 */
export function useParrainage() {
  const code = useApi('/api/parrainage/mon-code');
  const filleuls = useApi('/api/parrainage/mes-filleuls');
  const bonus = useApi('/api/parrainage/mes-bonus');
  return { code, filleuls, bonus };
}

/** Utiliser des jours bonus */
export function useUtiliserBonus() {
  return useApi('/api/parrainage/utiliser-bonus', {
    method: 'POST',
    autoFetch: false
  });
}

// ========================================
//  RECHERCHE
// ========================================

/**
 * Rechercher des produits
 * @param {string} query
 * @param {Object} [filtres]
 */
export function useRechercheProduits(query, filtres = {}) {
  return useApi('/api/recherche/produits', {
    queryParams: { q: query, ...filtres },
    autoFetch: query.length > 2,
    deps: [query, JSON.stringify(filtres)]
  });
}

/**
 * Rechercher des boutiques
 * @param {string} query
 */
export function useRechercheBoutiques(query) {
  return useApi('/api/recherche/boutiques', {
    queryParams: { q: query },
    autoFetch: query.length > 2,
    deps: [query]
  });
}

/**
 * Autocomplete suggestions
 * @param {string} query
 */
export function useSuggestions(query) {
  return useApi('/api/recherche/suggestions', {
    queryParams: { q: query },
    autoFetch: query.length > 2,
    deps: [query]
  });
}

/** Liste des catégories */
export function useCategories() {
  return useApi('/api/recherche/categories');
}

/** Tendances */
export function useTendances() {
  return useApi('/api/recherche/tendances');
}

// ========================================
//  MÉDIAS
// ========================================

/**
 * Upload d'images
 * @returns {{execute: (files: File[]) => Promise<any>, loading: boolean, error: any}}
 */
export function useUploadImages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (files) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const response = await api.upload('/api/upload/images', formData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { execute, loading, error };
}

// ========================================
//  SEO
// ========================================

/**
 * Meta tags SEO boutique
 * @param {string} sousDomaine
 */
export function useSeoBoutique(sousDomaine) {
  return useApi(`/api/seo/boutique/${sousDomaine}`, {
    deps: [sousDomaine]
  });
}

/**
 * Meta tags SEO produit
 * @param {string} idProduit
 */
export function useSeoProduit(idProduit) {
  return useApi(`/api/seo/produit/${idProduit}`, {
    deps: [idProduit]
  });
}

/**
 * Hook pour injecter les meta SEO dans le document
 * @param {string} sousDomaine
 * @param {string} [idProduit]
 */
export function useSeoInjection(sousDomaine, idProduit = null) {
  const endpoint = idProduit
    ? `/api/seo/produit/${idProduit}`
    : `/api/seo/boutique/${sousDomaine}`;

  const { data, loading } = useApi(endpoint, {
    deps: [sousDomaine, idProduit]
  });

  useEffect(() => {
    if (!data?.donnees) return;
    const seo = data.donnees;

    // Title
    document.title = seo.title || 'iziShop';

    // Meta tags classiques
    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', seo.description);
    if (seo.keywords) setMeta('keywords', seo.keywords);

    // Open Graph
    if (seo.og) {
      setMeta('og:title', seo.og.title, true);
      setMeta('og:description', seo.og.description, true);
      setMeta('og:image', seo.og.image, true);
      setMeta('og:url', seo.og.url, true);
      setMeta('og:type', seo.og.type, true);
    }

    // Twitter
    if (seo.twitter) {
      setMeta('twitter:card', seo.twitter.card);
      setMeta('twitter:title', seo.twitter.title);
      setMeta('twitter:description', seo.twitter.description);
      setMeta('twitter:image', seo.twitter.image);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);

    // JSON-LD
    let jsonLd = document.getElementById('json-ld-seo');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'json-ld-seo';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(seo.jsonLd);

  }, [data]);

  return { seo: data?.donnees, loading };
}

// ========================================
//  PRIX PUBLIC
// ========================================

/** Prix d'abonnement selon pays (détection IP) */
export function usePrixPublic() {
  return useApi('/api/prix-public');
}

export default useApi;
