// Fichier: frontend/src/pages/DashboardAdmin.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center p-5">
              <h1 className="h3 fw-bold mb-3 text-warning">
                👑 Tableau de Bord Administrateur
              </h1>
              <p className="text-muted mb-4">
                Bienvenue {utilisateur?.nomComplet}, vous avez le contrôle total de la plateforme.
              </p>
              <div className="alert alert-warning">
                <strong>Email :</strong> {utilisateur?.email}<br />
                <strong>Rôle :</strong> {utilisateur?.role}
              </div>
              <button 
                className="btn btn-outline-danger mt-3"
                onClick={handleDeconnexion}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;