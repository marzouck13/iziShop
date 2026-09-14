/* eslint-disable react-hooks/set-state-in-effect */
// Fichier: frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const user = getUtilisateurConnecte();
    setUtilisateur(user);
    setChargement(false);
  }, []);

  const connecter = (userData, token) => {
    localStorage.setItem('izishop_token', token);
    localStorage.setItem('izishop_user', JSON.stringify(userData));
    setUtilisateur(userData);
  };

  const deconnexion = async () => {
    await deconnecter();
    localStorage.removeItem('izishop_token');
    localStorage.removeItem('izishop_user');
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