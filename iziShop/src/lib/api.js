// Fichier: frontend/src/lib/api.js

const construireUrlApi = () => {
  const urlBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const urlNettoyee = urlBase.replace(/\/+$/, '');
  if (urlNettoyee.endsWith('/api')) {
    return urlNettoyee;
  }
  return urlNettoyee + '/api';
};

const API_URL = construireUrlApi();

console.log('[API] URL de base:', API_URL);

// ==========================================
// REQUETE CENTRALISEE
// ==========================================
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('izishop_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = token;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Verification du type de reponse
    const contentType = response.headers.get('content-type');
    let data = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: 'Erreur serveur inattendue (Reponse non-JSON)' };
    }

    if (!response.ok) {
      // Securite : si le token est expire ou invalide (401), on deconnecte
      if (response.status === 401) {
        localStorage.removeItem('izishop_token');
        localStorage.removeItem('izishop_user');
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/verifier-email') {
          window.location.href = '/auth';
        }
      }

      const erreur = new Error(data.message || 'Une erreur est survenue');
      erreur.status = response.status;
      erreur.data = data;
      throw erreur;
    }

    return data;
  } catch (error) {
    console.error('[API] Erreur:', error);
    throw error;
  }
};

// ==========================================
// AUTHENTIFICATION
// ==========================================
export const inscrireVendeur = async (donnees) => {
  return apiRequest('/auth/inscription', {
    method: 'POST',
    body: JSON.stringify(donnees),
  });
};

export const connecterUtilisateur = async (email, motDePasse) => {
  return apiRequest('/auth/connexion', {
    method: 'POST',
    body: JSON.stringify({ email, motDePasse }),
  });
};

export const renvoyerVerification = async (email) => {
  return apiRequest('/auth/renvoyer-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const verifierEmail = async (token) => {
  return apiRequest(`/auth/verifier-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
};

export const deconnecter = () => {
  localStorage.removeItem('izishop_token');
  localStorage.removeItem('izishop_user');
};

export const estConnecte = () => {
  return !!localStorage.getItem('izishop_token');
};

// Protection contre les donnees corrompues dans le localStorage
export const getUtilisateurConnecte = () => {
  try {
    const userStr = localStorage.getItem('izishop_user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('[API] Erreur lecture utilisateur local (JSON corrompu):', error);
    localStorage.removeItem('izishop_user');
    return null;
  }
};

// ==========================================
// GESTION DE LA BOUTIQUE
// ==========================================
export const obtenirMaBoutique = async () => {
  return apiRequest('/boutique/ma-boutique', { method: 'GET' });
};

export const mettreAJourBoutique = async (donnees) => {
  return apiRequest('/boutique/ma-boutique', {
    method: 'PUT',
    body: JSON.stringify(donnees),
  });
};

export const basculerVisibiliteBoutique = async () => {
  return apiRequest('/boutique/ma-boutique/visibilite', { method: 'PATCH' });
};

export const renouvelerAbonnement = async (dureeJours) => {
  return apiRequest('/boutique/ma-boutique/renouveler', {
    method: 'POST',
    body: JSON.stringify({ dureeJours }),
  });
};

// ==========================================
// GESTION DES PRODUITS
// ==========================================
export const creerProduit = async (donnees) => {
  return apiRequest('/produit', {
    method: 'POST',
    body: JSON.stringify(donnees),
  });
};

export const obtenirMesProduits = async () => {
  return apiRequest('/produit/ma-boutique', { method: 'GET' });
};

export const mettreAJourProduit = async (idProduit, donnees) => {
  return apiRequest(`/produit/${idProduit}`, {
    method: 'PUT',
    body: JSON.stringify(donnees),
  });
};

export const archiverProduit = async (idProduit) => {
  return apiRequest(`/produit/${idProduit}/archiver`, { method: 'PATCH' });
};

export const desarchiverProduit = async (idProduit) => {
  return apiRequest(`/produit/${idProduit}/desarchiver`, { method: 'PATCH' });
};

export const supprimerProduit = async (idProduit) => {
  return apiRequest(`/produit/${idProduit}`, { method: 'DELETE' });
};

// ==========================================
// GESTION DES IMAGES (STORAGE)
// ==========================================
export const uploaderImages = async (fichiers) => {
  const token = localStorage.getItem('izishop_token');
  const formData = new FormData();
  fichiers.forEach((fichier) => {
    formData.append('images', fichier);
  });

  const response = await fetch(`${API_URL}/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': token,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors de l'upload");
  }
  return data;
};

export const supprimerImage = async (imageUrl) => {
  return apiRequest('/upload/image', {
    method: 'DELETE',
    body: JSON.stringify({ imageUrl }),
  });
};