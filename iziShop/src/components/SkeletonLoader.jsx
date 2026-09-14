// Fichier: frontend/src/components/SkeletonLoader.jsx
// Composants skeleton réutilisables pour tout le système frontend iziShop
import React from 'react';

const R = '5px';

const basePlaceholderStyle = {
  backgroundColor: '#e9ecef',
  borderRadius: R,
};

// ==========================================
// SKELETON KPI (Carte statistique)
// ==========================================
export const SkeletonKPI = () => (
  <div className="carte-izishop p-3 h-100 placeholder-glow">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '38px', height: '38px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '50px', height: '18px' }}></div>
    </div>
    <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '70%', height: '28px' }}></div>
    <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '50%', height: '14px' }}></div>
    <div className="d-flex gap-2 mt-2 pt-2 border-top">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40%', height: '12px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40%', height: '12px' }}></div>
    </div>
  </div>
);

// ==========================================
// SKELETON BARRE DE RÉPARTITION
// ==========================================
export const SkeletonRepartition = () => (
  <div className="carte-izishop p-3 placeholder-glow">
    <div className="d-flex align-items-center gap-2 mb-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '18px', height: '18px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '200px', height: '18px' }}></div>
    </div>
    <div className="row g-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="col-6 col-md">
          <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: R }}>
            <div className="d-flex align-items-center gap-1 mb-1">
              <div className="placeholder" style={{ ...basePlaceholderStyle, width: '12px', height: '12px', borderRadius: '50%' }}></div>
              <div className="placeholder" style={{ ...basePlaceholderStyle, width: '60px', height: '10px' }}></div>
              <div className="placeholder ms-auto" style={{ ...basePlaceholderStyle, width: '20px', height: '14px' }}></div>
            </div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '100%', height: '3px' }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// SKELETON LIGNE DE TABLEAU (Commande)
// ==========================================
export const SkeletonTableRow = () => (
  <tr className="placeholder-glow">
    <td className="ps-0 py-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '14px' }}></div>
    </td>
    <td className="py-2">
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '100px', height: '12px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '70px', height: '10px' }}></div>
    </td>
    <td className="py-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '70px', height: '14px' }}></div>
    </td>
    <td className="py-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '20px', borderRadius: '10px' }}></div>
    </td>
    <td className="text-end pe-0 py-2">
      <div className="placeholder ms-auto" style={{ ...basePlaceholderStyle, width: '32px', height: '32px', borderRadius: '50%' }}></div>
    </td>
  </tr>
);

// ==========================================
// SKELETON ITEM TOP PRODUITS
// ==========================================
export const SkeletonTopProduit = () => (
  <div className="d-flex align-items-center gap-2 p-2 placeholder-glow">
    <div className="placeholder position-relative" style={{ ...basePlaceholderStyle, width: '44px', height: '44px', flexShrink: 0 }}>
      <div className="placeholder position-absolute" style={{ ...basePlaceholderStyle, top: '-6px', left: '-6px', width: '20px', height: '20px', borderRadius: '50%', zIndex: 2 }}></div>
    </div>
    <div className="flex-grow-1">
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '80%', height: '12px' }}></div>
      <div className="d-flex gap-3">
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40px', height: '10px' }}></div>
        <div className="placeholder" style={{ ...basePlaceholderStyle, width: '40px', height: '10px' }}></div>
      </div>
    </div>
    <div className="text-end flex-shrink-0">
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '60px', height: '14px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '30px', height: '10px' }}></div>
    </div>
  </div>
);

// ==========================================
// SKELETON ITEM STOCK FAIBLE
// ==========================================
export const SkeletonStockFaible = () => (
  <div className="d-flex justify-content-between align-items-center p-2 placeholder-glow" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: R }}>
    <div className="placeholder" style={{ ...basePlaceholderStyle, width: '60%', height: '12px' }}></div>
    <div className="placeholder" style={{ ...basePlaceholderStyle, width: '60px', height: '20px', borderRadius: '10px' }}></div>
  </div>
);

// ==========================================
// SKELETON ALERTE
// ==========================================
export const SkeletonAlerte = () => (
  <div className="d-flex align-items-center gap-2 mb-3 border-0 shadow-sm py-2 px-3 placeholder-glow" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #e9ecef', borderRadius: R }}>
    <div className="placeholder" style={{ ...basePlaceholderStyle, width: '20px', height: '20px', borderRadius: '50%' }}></div>
    <div className="flex-grow-1">
      <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '200px', height: '14px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '300px', height: '12px' }}></div>
    </div>
    <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '32px', borderRadius: R }}></div>
  </div>
);

// ==========================================
// SKELETON EN-TÊTE
// ==========================================
export const SkeletonHeader = () => (
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 placeholder-glow">
    <div>
      <div className="placeholder mb-2" style={{ ...basePlaceholderStyle, width: '200px', height: '28px' }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '300px', height: '14px' }}></div>
    </div>
    <div className="d-flex gap-2">
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '120px', height: '36px', borderRadius: R }}></div>
      <div className="placeholder" style={{ ...basePlaceholderStyle, width: '150px', height: '36px', borderRadius: R }}></div>
    </div>
  </div>
);

// ==========================================
// SKELETON COMPLET DASHBOARD
// ==========================================
export const SkeletonDashboard = () => (
  <div className="p-3 p-md-4">
    <SkeletonHeader />
    <SkeletonAlerte />
    <div className="row g-2 mb-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="col-6 col-xl-3">
          <SkeletonKPI />
        </div>
      ))}
    </div>
    <div className="mb-3">
      <SkeletonRepartition />
    </div>
    <div className="row g-3">
      <div className="col-xl-8">
        <div className="carte-izishop p-3 placeholder-glow" style={{ minHeight: '300px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '150px', height: '18px' }}></div>
              <div className="placeholder" style={{ ...basePlaceholderStyle, width: '200px', height: '12px' }}></div>
            </div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '100px', height: '32px', borderRadius: R }}></div>
          </div>
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                {[1, 2, 3, 4, 5].map(i => (
                  <th key={i}><div className="placeholder" style={{ ...basePlaceholderStyle, width: '60px', height: '12px' }}></div></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col-xl-4 d-flex flex-column gap-3">
        <div className="carte-izishop p-3 placeholder-glow">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '16px', height: '16px', borderRadius: '50%' }}></div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '100px', height: '16px' }}></div>
          </div>
          <div className="d-flex flex-column gap-2">
            {[1, 2, 3].map(i => <SkeletonStockFaible key={i} />)}
          </div>
        </div>
        <div className="carte-izishop p-3 placeholder-glow flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="placeholder mb-1" style={{ ...basePlaceholderStyle, width: '150px', height: '18px' }}></div>
              <div className="placeholder" style={{ ...basePlaceholderStyle, width: '180px', height: '12px' }}></div>
            </div>
            <div className="placeholder" style={{ ...basePlaceholderStyle, width: '80px', height: '32px', borderRadius: R }}></div>
          </div>
          <div className="d-flex flex-column gap-2">
            {[1, 2, 3, 4, 5].map(i => <SkeletonTopProduit key={i} />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonDashboard;




