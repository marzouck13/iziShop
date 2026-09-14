/* eslint-disable no-unused-vars */
/**
 * ==========================================
 *  CLIENT API CENTRALISÉ - iziShop v8.0
 * ==========================================
 * Fichier : frontend/src/lib/api.js
 * Aligné avec le backend (Routes & Contrôleurs)
 * Gère : JSON, FormData (Upload), Blobs (PDF), Refresh Token auto.
 */

// ==========================================
// CONFIGURATION & HELPERS
// ==========================================
const construireUrlApi = () => {
  const urlBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const urlNettoyee = urlBase.replace(/\/+$/, '');
  return urlNettoyee.endsWith('/api') ? urlNettoyee : urlNettoyee + '/api';
};

const API_URL = construireUrlApi();

const getToken = () => localStorage.getItem('izishop_token') || localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('izishop_refresh_token') || localStorage.getItem('refreshToken');

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('izishop_token', accessToken);
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('izishop_refresh_token', refreshToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem('izishop_token');
  localStorage.removeItem('izishop_user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('izishop_refresh_token');
};

// ==========================================
// RAFRAÎCHISSEMENT AUTOMATIQUE DU TOKEN
// ==========================================
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/rafraichir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenRafraichissement: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      window.location.href = '/auth';
      return null;
    }

    const data = await response.json();
    if (data.donnees?.tokenAcces) {
      setTokens(data.donnees.tokenAcces, data.donnees.tokenRafraichissement);
      return data.donnees.tokenAcces;
    }
    return null;
  } catch (_) {
    clearTokens();
    window.location.href = '/auth';
    return null;
  }
};

// ==========================================
// REQUÊTE CENTRALISÉE (Avec Retry sur 401)
// ==========================================
export const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    // 1. Gestion des fichiers binaires (PDF, etc.)
    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('octet-stream'))) {
      if (!response.ok) throw new Error('Erreur téléchargement fichier');
      return response.blob();
    }

    // 2. Gestion XML / Texte brut (Sitemap, Robots.txt)
    if (contentType && (contentType.includes('application/xml') || contentType.includes('text/plain'))) {
      return await response.text();
    }

    // 3. Gestion JSON standard
    let data = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (response.ok) {
      return { message: 'Succès', donnees: {} };
    } else {
      data = { message: 'Erreur serveur inattendue (Réponse non-JSON)' };
    }

    // 4. Gestion des erreurs et du Token Expiré (401)
    if (!response.ok) {
      if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
        // Tenter de rafraîchir le token
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Relancer la requête avec le nouveau token
          return apiRequest(endpoint, options, true);
        }
      }

      const erreur = new Error(data.message || data.erreur || 'Une erreur est survenue');
      erreur.status = response.status;
      erreur.data = data;
      throw erreur;
    }

    // 5. Sauvegarde automatique des tokens si c'est une réponse de connexion
    if (data.donnees?.tokenAcces) {
      setTokens(data.donnees.tokenAcces, data.donnees.tokenRafraichissement);
    }

    return data;
  } catch (error) {
    console.error(`[API] Erreur ${endpoint}:`, error);
    throw error;
  }
};

// ==========================================
//  AUTHENTIFICATION (7 routes)
// ==========================================
export const inscrireVendeur = (donnees) => apiRequest('/auth/inscription', { method: 'POST', body: JSON.stringify(donnees) });
export const connecterUtilisateur = (email, motDePasse) => apiRequest('/auth/connexion', { method: 'POST', body: JSON.stringify({ email, motDePasse }) });
export const renvoyerVerification = (email) => apiRequest('/auth/renvoyer-verification', { method: 'POST', body: JSON.stringify({ email }) });
export const verifierEmail = (token) => apiRequest(`/auth/verifier-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
export const obtenirProfil = () => apiRequest('/auth/profil', { method: 'GET' });
export const rafraichirToken = () => refreshAccessToken();

export const deconnecter = async () => {
  try { 
    await apiRequest('/auth/deconnexion', { method: 'POST' }); 
  } catch (_) { 
    /* Déconnexion silencieuse - on nettoie toujours les tokens */
  }
  clearTokens();
  window.location.href = '/auth';
};

export const estConnecte = () => !!getToken();
export const getUtilisateurConnecte = () => {
  try {
    const userStr = localStorage.getItem('izishop_user');
    return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (_) { 
    return null; 
  }
};

// ==========================================
//  BOUTIQUE (6 routes)
// ==========================================
export const obtenirMaBoutique = () => apiRequest('/boutique/ma-boutique', { method: 'GET' });
export const obtenirBoutiquePublique = (sousDomaine) => apiRequest(`/boutique/publique/${sousDomaine}`, { method: 'GET' });
export const mettreAJourBoutique = (donnees) => apiRequest('/boutique/ma-boutique', { method: 'PUT', body: JSON.stringify(donnees) });
export const basculerVisibiliteBoutique = () => apiRequest('/boutique/ma-boutique/visibilite', { method: 'PATCH' });
export const incrementerVueProduit = (idProduit) => apiRequest(`/boutique/produit/${idProduit}/vue`, { method: 'POST' });
export const incrementerClicWhatsApp = (idProduit) => apiRequest(`/boutique/produit/${idProduit}/clic-whatsapp`, { method: 'POST' });

// ==========================================
//  CATALOGUE (PRODUITS) (9 routes)
// ==========================================
export const creerProduit = (donnees) => apiRequest('/produit', { method: 'POST', body: JSON.stringify(donnees) });
export const obtenirMesProduits = () => apiRequest('/produit/ma-boutique', { method: 'GET' });
export const obtenirProduitParId = (idProduit) => apiRequest(`/produit/${idProduit}`, { method: 'GET' });
export const obtenirProduitPublic = (idProduit) => apiRequest(`/produit/public/${idProduit}`, { method: 'GET' });
export const mettreAJourProduit = (idProduit, donnees) => apiRequest(`/produit/${idProduit}`, { method: 'PUT', body: JSON.stringify(donnees) });
export const archiverProduit = (idProduit) => apiRequest(`/produit/${idProduit}/archiver`, { method: 'PATCH' });
export const desarchiverProduit = (idProduit) => apiRequest(`/produit/${idProduit}/desarchiver`, { method: 'PATCH' });
export const supprimerProduit = (idProduit) => apiRequest(`/produit/${idProduit}`, { method: 'DELETE' });

// ==========================================
//  COMMANDES (WHATSAPP) (8 routes)
// ==========================================
export const creerCommande = (sousDomaine, donnees) => apiRequest(`/commandes/boutique/${sousDomaine}`, { method: 'POST', body: JSON.stringify(donnees) });
export const obtenirMesCommandes = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/commandes?${params}` : '/commandes', { method: 'GET' });
};
export const obtenirDetailsCommande = (idCommande) => apiRequest(`/commandes/${idCommande}`, { method: 'GET' });
export const consulterCommande = (idCommande, idProduit = null) => {
  const query = idProduit ? `?idProduit=${idProduit}` : '';
  return apiRequest(`/commandes/consulter/${idCommande}${query}`, { method: 'GET' });
};
export const obtenirStatistiquesCommandes = () => apiRequest('/commandes/statistiques', { method: 'GET' });
export const changerStatutCommande = (idCommande, statut) => apiRequest(`/commandes/${idCommande}/statut`, { method: 'PATCH', body: JSON.stringify({ statut }) });
export const ajouterNotesCommande = (idCommande, notes) => apiRequest(`/commandes/${idCommande}/notes`, { method: 'PATCH', body: JSON.stringify({ notes }) });
export const annulerCommande = (idCommande) => apiRequest(`/commandes/${idCommande}/annuler`, { method: 'POST' });

// ==========================================
//  REÇUS PDF (5 routes)
// ==========================================
export const genererRecu = (idCommande) => apiRequest(`/recu/${idCommande}/generer`, { method: 'POST' });
export const obtenirRecus = (idCommande) => apiRequest(`/recu/${idCommande}/recus`, { method: 'GET' });
export const telechargerRecu = (idCommande, page = 1) => apiRequest(`/recu/${idCommande}/telecharger/${page}`, { method: 'GET' });
export const telechargerRecuPage1 = (idCommande) => apiRequest(`/recu/${idCommande}/telecharger`, { method: 'GET' });
export const envoyerRecuEmail = (idCommande) => apiRequest(`/recu/${idCommande}/email`, { method: 'POST' });

// ==========================================
//  PAIEMENTS (ABONNEMENT PRO) (7 routes)
// ==========================================
export const obtenirProvidersPaiement = () => apiRequest('/paiement/providers', { method: 'GET' });
export const validerNumeroMobileMoney = (telephone) => apiRequest('/paiement/valider-numero', { method: 'POST', body: JSON.stringify({ telephone }) });
export const appliquerCodePromo = (codePromo, periode) => apiRequest('/paiement/appliquer-code-promo', { method: 'POST', body: JSON.stringify({ codePromo, periode }) });
export const initierPaiement = (donnees) => apiRequest('/paiement/initier', { method: 'POST', body: JSON.stringify(donnees) });
export const obtenirHistoriquePaiements = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/paiement/historique?${params}` : '/paiement/historique', { method: 'GET' });
};
export const verifierStatutPaiement = (idPaiement) => apiRequest(`/paiement/${idPaiement}`, { method: 'GET' });
// Note : webhook PawaPay (POST /api/paiement/webhook/pawapay) est appelé par PawaPay, pas par le frontend

// ==========================================
//  PARRAINAGE (4 routes) — ✅ CORRIGÉ
// ==========================================
export const obtenirMonCodeParrain = () => apiRequest('/parrainage/mon-code', { method: 'GET' });
export const obtenirMesFilleuls = (filtre = '') => apiRequest(filtre ? `/parrainage/mes-filleuls?filtre=${filtre}` : '/parrainage/mes-filleuls', { method: 'GET' });
export const obtenirMesBonus = () => apiRequest('/parrainage/mes-bonus', { method: 'GET' });

// ✅ CORRIGÉ : Prend un objet `donnees` et l'envoie directement (cohérent avec creerProduit, initierPaiement, etc.)
// Avant (BUGGY) : body: JSON.stringify({ joursAAppliquer }) → envoyait { joursAAppliquer: { joursAAppliquer: 5 } }
// Après (FIXED) : body: JSON.stringify(donnees) → envoie { joursAAppliquer: 5 }
export const utiliserBonus = (donnees) => apiRequest('/parrainage/utiliser-bonus', { method: 'POST', body: JSON.stringify(donnees) });

// ==========================================
//  MÉDIAS (STORAGE SUPABASE) (2 routes)
// ==========================================
export const uploaderImages = async (fichiers) => {
  const formData = new FormData();
  fichiers.forEach((fichier) => formData.append('images', fichier));
  return apiRequest('/upload/images', { method: 'POST', body: formData });
};
export const supprimerImage = (imageUrl) => apiRequest('/upload/image', { method: 'DELETE', body: JSON.stringify({ imageUrl }) });

// ==========================================
//  RECHERCHE & FILTRES (Public) (6 routes)
// ==========================================
export const rechercherProduits = (query, filtres = {}) => {
  const params = new URLSearchParams({ q: query, ...filtres }).toString();
  return apiRequest(`/recherche/produits?${params}`, { method: 'GET' });
};
export const rechercherBoutiques = (query) => apiRequest(`/recherche/boutiques?q=${encodeURIComponent(query)}`, { method: 'GET' });
export const obtenirSuggestions = (query) => apiRequest(`/recherche/suggestions?q=${encodeURIComponent(query)}`, { method: 'GET' });
export const obtenirCategories = () => apiRequest('/recherche/categories', { method: 'GET' });
export const obtenirProduitsCategorie = (slug, queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/recherche/categories/${slug}/produits?${params}` : `/recherche/categories/${slug}/produits`, { method: 'GET' });
};
export const obtenirTendances = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/recherche/tendances?${params}` : '/recherche/tendances', { method: 'GET' });
};

// ==========================================
//  SEO (META TAGS) (7 routes)
// ==========================================
export const obtenirMetaBoutique = (sousDomaine) => apiRequest(`/seo/boutique/${sousDomaine}`, { method: 'GET' });
export const obtenirMetaProduit = (idProduit) => apiRequest(`/seo/produit/${idProduit}`, { method: 'GET' });
export const obtenirSitemapXml = () => apiRequest('/seo/sitemap.xml', { method: 'GET' });
export const obtenirRobotsTxt = () => apiRequest('/seo/robots.txt', { method: 'GET' });
export const obtenirStatsSeoAdmin = () => apiRequest('/seo/admin/stats', { method: 'GET' });

// ==========================================
//  NOTIFICATIONS (FCM & IN-APP) (9 routes)
// ==========================================
export const enregistrerDevice = (donnees) => apiRequest('/notifications/device-token', { method: 'POST', body: JSON.stringify(donnees) });
export const desenregistrerDevice = (token) => apiRequest('/notifications/device-token', { method: 'DELETE', body: JSON.stringify({ token }) });
export const listerMesDevices = () => apiRequest('/notifications/devices', { method: 'GET' });
export const listerNotifications = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/notifications?${params}` : '/notifications', { method: 'GET' });
};
export const marquerNotificationsLues = (donnees) => apiRequest('/notifications/lues', { method: 'PATCH', body: JSON.stringify(donnees) });
export const supprimerNotification = (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' });
export const obtenirPreferencesNotifications = () => apiRequest('/notifications/preferences', { method: 'GET' });
export const mettreAJourPreferencesNotifications = (donnees) => apiRequest('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(donnees) });
export const testerPushNotification = (donnees = {}) => apiRequest('/notifications/test-push', { method: 'POST', body: JSON.stringify(donnees) });

// ==========================================
//  PRIX PUBLIC (1 route)
// ==========================================
export const obtenirPrixPublic = () => apiRequest('/prix-public', { method: 'GET' });

// ==========================================
//  SYSTÈME (2 routes)
// ==========================================
export const verifierSanteApi = () => apiRequest('/sante', { method: 'GET' });
export const accueilApi = () => apiRequest('/', { method: 'GET' });

// ==========================================
//  ADMINISTRATION (27 routes)
// ==========================================

// --- Stats & Journal ---
export const obtenirStatsAdmin = () => apiRequest('/admin/stats', { method: 'GET' });
export const obtenirJournalAdmin = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/admin/journal?${params}` : '/admin/journal', { method: 'GET' });
};
export const obtenirListeAdmins = () => apiRequest('/admin/admins', { method: 'GET' });

// --- Vendeurs (6 routes) ---
export const obtenirListeVendeurs = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/admin/vendeurs?${params}` : '/admin/vendeurs', { method: 'GET' });
};
export const obtenirDetailsVendeur = (idVendeur) => apiRequest(`/admin/vendeurs/${idVendeur}`, { method: 'GET' });
export const suspendreVendeur = (idVendeur, motif) => apiRequest(`/admin/vendeurs/${idVendeur}/suspendre`, { method: 'PATCH', body: JSON.stringify({ motif }) });
export const desuspendreVendeur = (idVendeur, donnees = {}) => apiRequest(`/admin/vendeurs/${idVendeur}/desuspendre`, { method: 'PATCH', body: JSON.stringify(donnees) });
export const ajusterAbonnementVendeur = (idVendeur, donnees) => apiRequest(`/admin/vendeurs/${idVendeur}/ajuster-abonnement`, { method: 'POST', body: JSON.stringify(donnees) });

// --- KYC (4 routes) ---
export const obtenirListeKyc = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/admin/kyc?${params}` : '/admin/kyc', { method: 'GET' });
};
export const obtenirDetailsKyc = (idDemande) => apiRequest(`/admin/kyc/${idDemande}`, { method: 'GET' });
export const approuverDemandeKyc = (idDemande, donnees = {}) => apiRequest(`/admin/kyc/${idDemande}/approuver`, { method: 'POST', body: JSON.stringify(donnees) });
export const rejeterDemandeKyc = (idDemande, motifRejet) => apiRequest(`/admin/kyc/${idDemande}/rejeter`, { method: 'POST', body: JSON.stringify({ motifRejet }) });

// --- Codes Promo (5 routes) ---
export const obtenirListeCodesPromo = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/admin/codes-promo?${params}` : '/admin/codes-promo', { method: 'GET' });
};
export const creerCodePromo = (donnees) => apiRequest('/admin/codes-promo', { method: 'POST', body: JSON.stringify(donnees) });
export const mettreAJourCodePromo = (idCode, donnees) => apiRequest(`/admin/codes-promo/${idCode}`, { method: 'PUT', body: JSON.stringify(donnees) });
export const supprimerCodePromo = (idCode) => apiRequest(`/admin/codes-promo/${idCode}`, { method: 'DELETE' });
export const obtenirUtilisationsCodePromo = (idCode) => apiRequest(`/admin/codes-promo/${idCode}/utilisations`, { method: 'GET' });

// --- Configs Abonnements (2 routes) ---
export const obtenirConfigurationsAbonnement = () => apiRequest('/admin/configs/abonnements', { method: 'GET' });
export const mettreAJourConfigurationAbonnement = (nomPlan, donnees) => apiRequest(`/admin/configs/abonnements/${nomPlan}`, { method: 'PUT', body: JSON.stringify(donnees) });

// --- Configs Paiements (2 routes) ---
export const obtenirConfigurationsPaiement = () => apiRequest('/admin/configs/paiements', { method: 'GET' });
export const mettreAJourConfigurationPaiement = (idConfig, donnees) => apiRequest(`/admin/configs/paiements/${idConfig}`, { method: 'PUT', body: JSON.stringify(donnees) });

// --- Prix par Pays (4 routes) ---
export const obtenirPrixParPays = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return apiRequest(params ? `/admin/prix-pays?${params}` : '/admin/prix-pays', { method: 'GET' });
};
export const upsertPrixParPays = (donnees) => apiRequest('/admin/prix-pays', { method: 'POST', body: JSON.stringify(donnees) });
export const supprimerPrixParPays = (idPrix) => apiRequest(`/admin/prix-pays/${idPrix}`, { method: 'DELETE' });
export const basculerPaysActif = (idPrix, estActif) => apiRequest(`/admin/prix-pays/${idPrix}/activer`, { method: 'PATCH', body: JSON.stringify({ estActif }) });

// --- Taux de Change (2 routes) ---
export const obtenirTauxChange = () => apiRequest('/admin/taux-change', { method: 'GET' });
export const forcerMiseAJourTaux = () => apiRequest('/admin/taux-change/forcer-maj', { method: 'POST' });

// ==========================================
//  EXPORT PAR DÉFAUT (pour import global)
// ==========================================
export default {
  // Config
  API_URL,
  getToken,
  setTokens,
  clearTokens,
  estConnecte,
  getUtilisateurConnecte,

  // Auth
  inscrireVendeur, connecterUtilisateur, renvoyerVerification, verifierEmail,
  obtenirProfil, rafraichirToken, deconnecter,

  // Boutique
  obtenirMaBoutique, obtenirBoutiquePublique, mettreAJourBoutique,
  basculerVisibiliteBoutique, incrementerVueProduit, incrementerClicWhatsApp,

  // Catalogue
  creerProduit, obtenirMesProduits, obtenirProduitParId, obtenirProduitPublic,
  mettreAJourProduit, archiverProduit, desarchiverProduit, supprimerProduit,

  // Commandes
  creerCommande, obtenirMesCommandes, obtenirDetailsCommande, consulterCommande,
  obtenirStatistiquesCommandes, changerStatutCommande, ajouterNotesCommande, annulerCommande,

  // Reçus
  genererRecu, obtenirRecus, telechargerRecu, telechargerRecuPage1, envoyerRecuEmail,

  // Paiements
  obtenirProvidersPaiement, validerNumeroMobileMoney, appliquerCodePromo,
  initierPaiement, obtenirHistoriquePaiements, verifierStatutPaiement,

  // Parrainage
  obtenirMonCodeParrain, obtenirMesFilleuls, obtenirMesBonus, utiliserBonus,

  // Médias
  uploaderImages, supprimerImage,

  // Recherche
  rechercherProduits, rechercherBoutiques, obtenirSuggestions,
  obtenirCategories, obtenirProduitsCategorie, obtenirTendances,

  // SEO
  obtenirMetaBoutique, obtenirMetaProduit, obtenirSitemapXml,
  obtenirRobotsTxt, obtenirStatsSeoAdmin,

  // Notifications
  enregistrerDevice, desenregistrerDevice, listerMesDevices,
  listerNotifications, marquerNotificationsLues, supprimerNotification,
  obtenirPreferencesNotifications, mettreAJourPreferencesNotifications, testerPushNotification,

  // Prix public
  obtenirPrixPublic,

  // Système
  verifierSanteApi, accueilApi,

  // Admin
  obtenirStatsAdmin, obtenirJournalAdmin, obtenirListeAdmins,
  obtenirListeVendeurs, obtenirDetailsVendeur, suspendreVendeur,
  desuspendreVendeur, ajusterAbonnementVendeur,
  obtenirListeKyc, obtenirDetailsKyc, approuverDemandeKyc, rejeterDemandeKyc,
  obtenirListeCodesPromo, creerCodePromo, mettreAJourCodePromo,
  supprimerCodePromo, obtenirUtilisationsCodePromo,
  obtenirConfigurationsAbonnement, mettreAJourConfigurationAbonnement,
  obtenirConfigurationsPaiement, mettreAJourConfigurationPaiement,
  obtenirPrixParPays, upsertPrixParPays, supprimerPrixParPays, basculerPaysActif,
  obtenirTauxChange, forcerMiseAJourTaux,
};