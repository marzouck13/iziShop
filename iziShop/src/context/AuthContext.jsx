// Fichier: frontend/src/context/AuthContext.jsx
// Désactivation de l'avertissement Fast Refresh car on exporte aussi le hook useAuth
  
import React, { createContext, useState, useContext } from 'react';
import { getUtilisateurConnecte, deconnecter } from '../lib/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(() => getUtilisateurConnecte());
  const chargement = false;

  const connecter = (userData, token) => {
    localStorage.setItem('izishop_token', token);
    localStorage.setItem('izishop_user', JSON.stringify(userData));
    setUtilisateur(userData);
  };

  const deconnexion = () => {
    deconnecter();
    setUtilisateur(null);
  };

  const valeur = {
    utilisateur,
    chargement,
    connecter,
    deconnexion,
    estConnecte: !!utilisateur,
    estAdmin: utilisateur?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={valeur}>
      {children}
    </AuthContext.Provider>
  );
};