// Fichier: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import DashboardVendeur from './pages/DashboardVendeur';
import DashboardAdmin from './pages/DashboardAdmin';
import AjouterProduit from './pages/AjouterProduit';
import Produits from './pages/Produits';
import ParametresBoutique from './pages/ParametresBoutique';
import Abonnement from './pages/Abonnement';
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
    location.pathname === '/verifier-email';

  return (
    <div className="app-container">
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verifier-email" element={<VerifierEmail />} />
        <Route path="/boutique/:sousDomaine" element={<BoutiquePublique />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardVendeur /></ProtectedRoute>} />
        <Route path="/dashboard/ajouter-produit" element={<ProtectedRoute><AjouterProduit /></ProtectedRoute>} />
        <Route path="/dashboard/produits" element={<ProtectedRoute><Produits /></ProtectedRoute>} />
        <Route path="/dashboard/parametres" element={<ProtectedRoute><ParametresBoutique /></ProtectedRoute>} />
        <Route path="/dashboard/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><DashboardAdmin /></ProtectedRoute>} />
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