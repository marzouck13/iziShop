/**
 * ==========================================
 *  API CLIENT - iziShop Frontend (JavaScript)
 * ==========================================
 * 
 * Fichier : frontend/src/services/apiClient.js
 * 
 * Client HTTP avec :
 * - Gestion automatique des tokens JWT
 * - Rafraîchissement automatique du token
 * - Support JSON + FormData + Blob (PDF)
 * - Gestion erreurs centralisée
 * 
 * Usage :
 *   import api from './services/apiClient';
 *   const { data } = await api.get('/api/boutique/ma-boutique');
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    /** @type {string|null} */
    this.accessToken = null;
    /** @type {string|null} */
    this.refreshToken = null;
    /** @type {Function|null} Callback 401 */
    this.onUnauthorized = null;
  }

  // ========================================
  // GESTION TOKENS
  // ========================================
  
  /**
   * Sauvegarder les tokens
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /** Charger tokens depuis localStorage */
  loadTokens() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  /** Effacer tokens (déconnexion) */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // ========================================
  // REQUÊTE HTTP CENTRALISÉE
  // ========================================
  
  /**
   * Faire une requête HTTP
   * @param {string} endpoint - Chemin (ex: '/api/auth/profil')
   * @param {Object} [options]
   * @param {string} [options.method='GET']
   * @param {any} [options.body]
   * @param {Object} [options.headers]
   * @param {boolean} [options.isFormData]
   * @returns {Promise<{ok: boolean, status: number, data?: any, blob?: Blob, text?: string}>}
   */
  async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, isFormData = false } = options;

    const config = {
      method,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
        ...headers
      }
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const contentType = response.headers.get('content-type') || '';

      // PDF / Fichier binaire
      if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
        const blob = await response.blob();
        return { ok: response.ok, status: response.status, blob };
      }
      
      // XML / Texte brut
      if (contentType.includes('application/xml') || contentType.includes('text/plain')) {
        const text = await response.text();
        return { ok: response.ok, status: response.status, text };
      }

      // JSON standard
      const data = await response.json().catch(() => null);

      // Token expiré → refresh automatique
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request(endpoint, options);
        }
      }

      if (!response.ok) {
        const error = new Error(data?.message || 'Erreur serveur');
        error.status = response.status;
        error.data = data;
        if (response.status === 401 && this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw error;
      }

      return { ok: true, status: response.status, data };
    } catch (error) {
      if (!error.status) {
        error.message = 'Impossible de contacter le serveur';
      }
      throw error;
    }
  }

  /**
   * Rafraîchir le token d'accès
   * @returns {Promise<boolean>}
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/rafraichir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenRafraichissement: this.refreshToken })
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.donnees.tokenAcces, data.donnees.tokenRafraichissement);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // ========================================
  // MÉTHODES HTTP
  // ========================================
  
  /**
   * @param {string} endpoint
   * @param {Object} [queryParams]
   */
  get(endpoint, queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  /**
   * @param {string} endpoint
   * @param {Object} body
   */
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  /**
   * @param {string} endpoint
   * @param {Object} body
   */
  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  /**
   * @param {string} endpoint
   * @param {Object} body
   */
  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  /**
   * @param {string} endpoint
   * @param {Object} [body]
   */
  delete(endpoint, body = null) {
    return this.request(endpoint, { method: 'DELETE', body });
  }

  /**
   * Upload de fichiers (multipart/form-data)
   * @param {string} endpoint
   * @param {FormData} formData
   */
  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }

  /**
   * Télécharger un fichier (PDF, image...)
   * @param {string} endpoint
   * @param {string} [filename]
   */
  async download(endpoint, filename = 'download') {
    const response = await this.request(endpoint);
    if (response.blob) {
      const url = window.URL.createObjectURL(response.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    return response;
  }
}

// Instance singleton
export const api = new ApiClient();
export default api;
