// Fichier: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Features from './components/Features';
import Steps from './components/Steps';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import FinalCTA from './components/FinalCTA';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/dashboard/Dashboard';
import Commandes from './pages/dashboard/Commandes';
import Produits from './pages/dashboard/Produits';
import FormulaireProduit from './pages/dashboard/FormulaireProduit';
import Abonnement from './pages/dashboard/Abonnement';
import Parrainage from './pages/dashboard/Parrainage';
import Notifications from './pages/dashboard/Notifications';
import DashboardAdmin from './pages/DashboardAdmin';
import ParametresBoutique from './pages/ParametresBoutique';
import BoutiquePublique from './pages/BoutiquePublique';
import VerifierEmail from './pages/VerifierEmail';

const Home = () => (
  <>
    <Hero />
    <Features />
    <Steps />
    <Testimonials />
    <Pricing />
    <Faq />
    <FinalCTA />
  </>
);

const AppContent = () => {
  const location = useLocation();
  const hideLayout =
    location.pathname === '/auth' ||
    location.pathname.startsWith('/boutique/') ||
    location.pathname === '/verifier-email' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verifier-email" element={<VerifierEmail />} />
        <Route path="/boutique/:sousDomaine" element={<BoutiquePublique />} />

        
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DataProvider>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="produits" element={<Produits />} />
                  <Route path="produits/ajouter" element={<FormulaireProduit />} />
                  <Route path="produits/:idProduit" element={<FormulaireProduit />} />
                  <Route path="commandes" element={<Commandes />} />
                  <Route path="abonnement" element={<Abonnement />} />
                  <Route path="parrainage" element={<Parrainage />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="parametres" element={<ParametresBoutique />} />
                </Routes>
              </DataProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;