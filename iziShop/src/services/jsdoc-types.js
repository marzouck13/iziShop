/**
 * ==========================================
 * JSDoc TYPEDEFS — API iziShop v7.1
 * ==========================================
 * 
 * Ce fichier fournit l'autocomplétion pour les IDE
 * (VSCode, WebStorm) SANS avoir besoin de TypeScript.
 * 
 * Utilisation : importez ces typedefs dans vos fichiers .js
 * avec la syntaxe JSDoc : @type {import('./jsdoc-types').Utilisateur}
 * 
 * Généré automatiquement le 21/08/2026 22:47:19
 */

// ==========================================
// TYPES DE BASE
// ==========================================

/**
 * Format d'erreur standard renvoyé par l'API
 * @typedef {Object} ApiError
 * @property {string} erreur - Code erreur technique
 * @property {string} message - Message lisible pour l'utilisateur
 * @property {any} [details] - Détails optionnels (erreurs validation, etc.)
 */

/**
 * Format de réponse standard
 * @template T
 * @typedef {Object} ApiResponse
 * @property {string} message - Message de succès
 * @property {T} donnees - Données retournées
 */

/**
 * Pagination standard
 * @typedef {Object} Pagination
 * @property {number} page - Page actuelle
 * @property {number} limite - Nombre d'éléments par page
 * @property {number} total - Total d'éléments
 * @property {number} totalPages - Nombre total de pages
 */

// ==========================================
// MODÈLES MÉTIER
// ==========================================

/**
 * Utilisateur (vendeur ou admin)
 * @typedef {Object} Utilisateur
 * @property {string} id - UUID
 * @property {string} nomComplet - Nom complet
 * @property {string} email - Email (unique)
 * @property {'VENDEUR'|'ADMIN'} role - Rôle utilisateur
 * @property {string} pays - Code pays ISO 2 (BJ, CI, TG...)
 * @property {string} [numeroTelephone] - Numéro de téléphone
 * @property {boolean} estEmailVerifie - Email vérifié ?
 * @property {boolean} estSuspendu - Compte suspendu ?
 * @property {string} [motifSuspension] - Raison de suspension
 * @property {string} [codeParrain] - Code de parrainage unique (IZI-XXXXXX)
 * @property {number} nbFilleulsActifs - Nombre de filleuls actifs
 * @property {number} joursBonusCumules - Jours bonus accumulés
 * @property {string} dateCreation - Date ISO
 */

/**
 * Boutique d'un vendeur
 * @typedef {Object} Boutique
 * @property {string} id - UUID
 * @property {string} nomBoutique - Nom affiché
 * @property {string} [description] - Description (max 500)
 * @property {string} [logoUrl] - URL du logo
 * @property {string} sousDomaine - Sous-domaine unique (ex: ma-boutique)
 * @property {string} lienWhatsApp - Numéro WhatsApp (avec indicatif)
 * @property {'ACTIVE'|'MASQUEE'|'SUSPENDUE'|'EXPIREE'|'BROUILLON'} statut
 * @property {'GRATUIT'|'PRO'} planAbonnement
 * @property {string} dateExpirationAbonnement - Date ISO
 * @property {boolean} estAbonnementActif
 * @property {boolean} estVisible
 * @property {string} devise - XOF, XAF, EUR...
 * @property {string} [pays]
 * @property {string} [ville]
 * @property {number} totalVues
 * @property {number} totalClicsWhatsApp
 * @property {number} fraisLivraisonDefaut
 * @property {string} [metaTitre] - SEO title (max 70)
 * @property {string} [metaDescription] - SEO description (max 160)
 * @property {string} [ogImageUrl] - Image OG
 * @property {string[]} [motsClesSEO]
 * @property {string} [facebookPageUrl]
 * @property {string} [instagramHandle]
 * @property {string} [tiktokUrl]
 */

/**
 * Produit d'une boutique
 * @typedef {Object} Produit
 * @property {string} id - UUID
 * @property {string} nomProduit - Nom (2-100 caractères)
 * @property {string} [description] - Description (max 2000)
 * @property {number} prix - Prix (>= 0)
 * @property {string} [categorie] - Catégorie (max 50)
 * @property {string} urlImagePrincipale - URL image principale
 * @property {string[]} [urlImagesGalerie] - Max 12 images
 * @property {number} quantiteEnStock - Stock (>= 0)
 * @property {boolean} estDisponible
 * @property {boolean} estArchive - Soft-delete
 * @property {number} nombreDeVues
 * @property {number} nombreDeClicsWhatsApp
 * @property {string} dateCreation
 * @property {string} dateMiseAJour
 */

/**
 * Commande WhatsApp
 * @typedef {Object} Commande
 * @property {string} id - UUID
 * @property {string} idBoutique
 * @property {string} nomClient
 * @property {string} telephoneClient
 * @property {string} [emailClient]
 * @property {string} [adresseClient]
 * @property {'EN_ATTENTE'|'CONFIRMEE'|'LIVREE'|'ANNULEE'|'ABANDONNEE'} statut
 * @property {number} montantTotal
 * @property {string} [messageWhatsApp] - Message formaté pour WhatsApp
 * @property {string} dateCreation
 */

/**
 * Paiement d'abonnement
 * @typedef {Object} Paiement
 * @property {string} id - UUID
 * @property {string} idBoutique
 * @property {number} montant
 * @property {string} devise
 * @property {'EN_ATTENTE'|'REUSSI'|'ECHEC'|'REMBOURSE'} statut
 * @property {string} methodePaiement
 * @property {string} referenceExterne - depositId PawaPay
 * @property {string} [motifEchec]
 * @property {string} dateCreation
 */

/**
 * Notification in-app
 * @typedef {Object} Notification
 * @property {string} id - UUID
 * @property {string} titre
 * @property {string} message
 * @property {string} type
 * @property {string} canal - 'in-app', 'email', 'push'
 * @property {boolean} estLue
 * @property {string} [lienAction]
 * @property {string} dateCreation
 */

/**
 * Device FCM (push mobile)
 * @typedef {Object} Device
 * @property {string} id
 * @property {'ANDROID'|'IOS'|'WEB'} platform
 * @property {boolean} isActive
 * @property {string} tokenApercu - Token masqué
 * @property {string} dateCreation
 */

// ==========================================
// SEO (Sprint 2)
// ==========================================

/**
 * Meta tags SEO d'une boutique
 * @typedef {Object} SeoMetaBoutique
 * @property {string} title - Title tag (max 70)
 * @property {string} description - Meta description (max 160)
 * @property {string} keywords - Mots-clés
 * @property {string} canonical - URL canonique
 * @property {Object} og - Open Graph
 * @property {string} og.title
 * @property {string} og.description
 * @property {string} og.image
 * @property {string} og.url
 * @property {'website'} og.type
 * @property {'iziShop'} og.site_name
 * @property {Object} twitter - Twitter Card
 * @property {'summary_large_image'} twitter.card
 * @property {string} twitter.title
 * @property {string} twitter.description
 * @property {string} twitter.image
 * @property {Object} jsonLd - Schema.org Store
 * @property {Object} stats - Stats boutique
 * @property {number} stats.totalProduits
 * @property {number} stats.prixMinimum
 * @property {string} stats.devise
 */

/**
 * Meta tags SEO d'un produit
 * @typedef {Object} SeoMetaProduit
 * @property {string} title
 * @property {string} description
 * @property {string} canonical
 * @property {Object} og
 * @property {'product'} og.type
 * @property {Object} twitter
 * @property {Object} jsonLd - Schema.org Product
 * @property {Object} jsonLd.offers
 * @property {number} jsonLd.offers.price
 * @property {string} jsonLd.offers.priceCurrency
 * @property {string} jsonLd.offers.availability
 * @property {Object} stats
 * @property {number} stats.prix
 * @property {number} stats.stock
 * @property {boolean} stats.disponible
 */

// ==========================================
// RÉPONSES AUTH
// ==========================================

/**
 * Réponse connexion réussie
 * @typedef {Object} AuthResponse
 * @property {Utilisateur} utilisateur
 * @property {string} tokenAcces - JWT (expire 15min)
 * @property {string} tokenRafraichissement - Refresh token (expire 7j)
 */

/**
 * Réponse inscription
 * @typedef {Object} InscriptionResponse
 * @property {Utilisateur} utilisateur
 * @property {Boutique} boutique
 * @property {boolean} verificationRequise
 * @property {string} messageVerification
 */

/**
 * Body pour POST /api/auth/inscription
 * @typedef {Object} schemaInscription
 * @property{string} nomComplet
 * @property{string} email
 * @property{string} motDePasse
 * @property{ [string]} numeroTelephone
 * @property{string} pays
 * @property{ [string]} codeParrain
 */

/**
 * Body pour POST /api/auth/inscription
 * @typedef {Object} schemaConnexion
 * @property{string} email
 * @property{string} motDePasse
 */

/**
 * Body pour POST /api/auth/inscription
 * @typedef {Object} schemaRenvoyerVerification
 * @property{string} email
 */

/**
 * Body pour POST /api/auth/connexion
 * @typedef {Object} schemaConnexion
 * @property{string} email
 * @property{string} motDePasse
 */

/**
 * Body pour POST /api/auth/renvoyer-verification
 * @typedef {Object} schemaConnexion
 * @property{string} email
 * @property{string} motDePasse
 */

/**
 * Body pour POST /api/auth/renvoyer-verification
 * @typedef {Object} schemaRenvoyerVerification
 * @property{string} email
 */

/**
 * Body pour PUT /api/boutique/ma-boutique
 * @typedef {Object} schemaMiseAJourBoutique
 * @property{ [string]} nomBoutique
 * @property{ [string]} description
 * @property{ [string]} logoUrl
 * @property{ [string]} lienWhatsApp
 * @property{ [string]} metaTitre
 * @property{ [string]} metaDescription
 * @property{ [string]} ogImageUrl
 * @property{ [any[]]} motsClesSEO
 * @property{ [string]} facebookPageUrl
 * @property{ [string]} instagramHandle
 * @property{ [string]} whatsappBusinessId
 * @property{ [string]} tiktokUrl
 * @property{number} fraisLivraisonDefaut
 */

/**
 * Body pour POST /api/produit
 * @typedef {Object} schemaCreationProduit
 * @property{string} nomProduit
 * @property{ [string]} description
 * @property{number} prix
 * @property{ [string]} categorie
 * @property{number} quantiteEnStock
 * @property{string} urlImagePrincipale
 * @property{any[]} urlImagesGalerie
 * @property{ [boolean]} estDisponible
 */

/**
 * Body pour POST /api/produit
 * @typedef {Object} schemaMiseAJourProduit
 * @property{ [string]} nomProduit
 * @property{ [string]} description
 * @property{ [number]} prix
 * @property{ [string]} categorie
 * @property{ [number]} quantiteEnStock
 * @property{ [string]} urlImagePrincipale
 * @property{ [any[]]} urlImagesGalerie
 * @property{ [boolean]} estDisponible
 */

/**
 * Body pour PUT /api/produit/:idProduit
 * @typedef {Object} schemaMiseAJourProduit
 * @property{ [string]} nomProduit
 * @property{ [string]} description
 * @property{ [number]} prix
 * @property{ [string]} categorie
 * @property{ [number]} quantiteEnStock
 * @property{ [string]} urlImagePrincipale
 * @property{ [any[]]} urlImagesGalerie
 * @property{ [boolean]} estDisponible
 */

/**
 * Body pour POST /api/commandes/boutique/:sousDomaine
 * @typedef {Object} schemaCreationCommande
 * @property{string} nomClient
 * @property{string} telephoneClient
 * @property{ [string]} emailClient
 * @property{ [string]} adresseClient
 * @property{ [string]} notes
 * @property{any} produits
 * @property{string} idProduit
 * @property{number} quantite
 */

/**
 * Body pour POST /api/commandes/boutique/:sousDomaine
 * @typedef {Object} schemaChangementStatut
 * @property{any} statut
 */

/**
 * Body pour POST /api/commandes/boutique/:sousDomaine
 * @typedef {Object} schemaAjoutNotes
 * @property{string} notes
 */

/**
 * Body pour PATCH /api/commandes/:idCommande/statut
 * @typedef {Object} schemaChangementStatut
 * @property{any} statut
 */

/**
 * Body pour PATCH /api/commandes/:idCommande/statut
 * @typedef {Object} schemaAjoutNotes
 * @property{string} notes
 */

/**
 * Body pour PATCH /api/commandes/:idCommande/notes
 * @typedef {Object} schemaAjoutNotes
 * @property{string} notes
 */

/**
 * Body pour POST /api/paiement/valider-numero
 * @typedef {Object} schemaValidationNumero
 * @property{string} telephone
 */

/**
 * Body pour POST /api/paiement/valider-numero
 * @typedef {Object} schemaApplicationCodePromo
 * @property{string} codePromo
 */

/**
 * Body pour POST /api/paiement/valider-numero
 * @typedef {Object} schemaInitiationPaiement
 * @property{string} provider
 * @property{string} telephone
 * @property{ [number]} dureeJours
 * @property{ [string]} codePromo
 */

/**
 * Body pour POST /api/paiement/appliquer-code-promo
 * @typedef {Object} schemaApplicationCodePromo
 * @property{string} codePromo
 */

/**
 * Body pour POST /api/paiement/appliquer-code-promo
 * @typedef {Object} schemaInitiationPaiement
 * @property{string} provider
 * @property{string} telephone
 * @property{ [number]} dureeJours
 * @property{ [string]} codePromo
 */

/**
 * Body pour POST /api/paiement/initier
 * @typedef {Object} schemaInitiationPaiement
 * @property{string} provider
 * @property{string} telephone
 * @property{ [number]} dureeJours
 * @property{ [string]} codePromo
 */

/**
 * Body pour POST /api/parrainage/utiliser-bonus
 * @typedef {Object} schemaUtiliserBonus
 * @property{number} joursAAppliquer
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaSuspension
 * @property{string} motif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaAjustementAbonnement
 * @property{number} joursAAjouter
 * @property{string} motif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaRejetKyc
 * @property{string} motifRejet
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/suspendre
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaAjustementAbonnement
 * @property{number} joursAAjouter
 * @property{string} motif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaRejetKyc
 * @property{string} motifRejet
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour PATCH /api/admin/vendeurs/:idVendeur/desuspendre
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaAjustementAbonnement
 * @property{number} joursAAjouter
 * @property{string} motif
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaRejetKyc
 * @property{string} motifRejet
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour POST /api/admin/vendeurs/:idVendeur/ajuster-abonnement
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaRejetKyc
 * @property{string} motifRejet
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/approuver
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaRejetKyc
 * @property{string} motifRejet
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour POST /api/admin/kyc/:idDemande/rejeter
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/admin/codes-promo
 * @typedef {Object} schemaCreationCodePromo
 * @property{any} typeRemise
 */

/**
 * Body pour POST /api/admin/codes-promo
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/codes-promo
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour POST /api/admin/codes-promo
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour POST /api/admin/codes-promo
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour PUT /api/admin/codes-promo/:idCode
 * @typedef {Object} schemaMiseAJourCodePromo
 * @property{any} typeRemise
 * @property{ [number]} valeur
 * @property{ [number]} utilisationsMax
 * @property{ [string]} dateExpiration
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PUT /api/admin/codes-promo/:idCode
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PUT /api/admin/codes-promo/:idCode
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour PUT /api/admin/codes-promo/:idCode
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour PUT /api/admin/configs/abonnements/:nomPlan
 * @typedef {Object} schemaMiseAJourConfigAbonnement
 * @property{number} prixMensuelFCFA
 * @property{number} dureeEssaiGratuitJours
 * @property{number} dureeAbonnementPayeJours
 * @property{ [boolean]} estActif
 */

/**
 * Body pour PUT /api/admin/configs/abonnements/:nomPlan
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour PUT /api/admin/configs/abonnements/:nomPlan
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour PUT /api/admin/configs/paiements/:idConfig
 * @typedef {Object} schemaMiseAJourConfigPaiement
 * @property{ [string]} clePublique
 * @property{ [string]} cleSecrete
 * @property{ [string]} cleSecretWebhook
 * @property{ [any[]]} paysCibles
 * @property{ [boolean]} estActif
 * @property{ [boolean]} estPrincipal
 */

/**
 * Body pour PUT /api/admin/configs/paiements/:idConfig
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/admin/prix-pays
 * @typedef {Object} schemaUpsertPrixParPays
 * @property{any} nomPlan
 */

/**
 * Body pour POST /api/notifications/device-token
 * @typedef {Object} schemaEnregistrerDevice
 * @property{string} token
 * @property{any} platform
 * @property{any} deviceInfo
 * @property{ [string]} modele
 * @property{ [string]} osVersion
 * @property{ [string]} appVersion
 * @property{ [string]} deviceId
 */

/**
 * Body pour POST /api/notifications/device-token
 * @typedef {Object} schemaDesenregistrerDevice
 * @property{string} token
 */

/**
 * Body pour POST /api/notifications/device-token
 * @typedef {Object} schemaMarquerLue
 * @property{ [any[]]} ids
 * @property{ [boolean]} toutes
 */

/**
 * Body pour POST /api/notifications/device-token
 * @typedef {Object} schemaTestPush
 * @property{ [string]} titre
 * @property{ [string]} message
 */

/**
 * Body pour POST /api/notifications/device-token
 * @typedef {Object} schemaPreferences
 * @property{ [boolean]} alertesExpiration
 * @property{ [boolean]} paiements
 * @property{ [boolean]} kyc
 * @property{ [boolean]} parrainage
 * @property{ [boolean]} systeme
 * @property{ [boolean]} marketing
 * @property{ [boolean]} commandes
 * @property{ [boolean]} emailActif
 * @property{ [boolean]} pushActif
 * @property{any} langue
 */

/**
 * Body pour PATCH /api/notifications/lues
 * @typedef {Object} schemaMarquerLue
 * @property{ [any[]]} ids
 * @property{ [boolean]} toutes
 */

/**
 * Body pour PATCH /api/notifications/lues
 * @typedef {Object} schemaTestPush
 * @property{ [string]} titre
 * @property{ [string]} message
 */

/**
 * Body pour PATCH /api/notifications/lues
 * @typedef {Object} schemaPreferences
 * @property{ [boolean]} alertesExpiration
 * @property{ [boolean]} paiements
 * @property{ [boolean]} kyc
 * @property{ [boolean]} parrainage
 * @property{ [boolean]} systeme
 * @property{ [boolean]} marketing
 * @property{ [boolean]} commandes
 * @property{ [boolean]} emailActif
 * @property{ [boolean]} pushActif
 * @property{any} langue
 */

/**
 * Body pour PATCH /api/notifications/preferences
 * @typedef {Object} schemaPreferences
 * @property{ [boolean]} alertesExpiration
 * @property{ [boolean]} paiements
 * @property{ [boolean]} kyc
 * @property{ [boolean]} parrainage
 * @property{ [boolean]} systeme
 * @property{ [boolean]} marketing
 * @property{ [boolean]} commandes
 * @property{ [boolean]} emailActif
 * @property{ [boolean]} pushActif
 * @property{any} langue
 */

/**
 * Body pour POST /api/notifications/test-push
 * @typedef {Object} schemaTestPush
 * @property{ [string]} titre
 * @property{ [string]} message
 */

/**
 * Body pour POST /api/notifications/test-push
 * @typedef {Object} schemaPreferences
 * @property{ [boolean]} alertesExpiration
 * @property{ [boolean]} paiements
 * @property{ [boolean]} kyc
 * @property{ [boolean]} parrainage
 * @property{ [boolean]} systeme
 * @property{ [boolean]} marketing
 * @property{ [boolean]} commandes
 * @property{ [boolean]} emailActif
 * @property{ [boolean]} pushActif
 * @property{any} langue
 */
