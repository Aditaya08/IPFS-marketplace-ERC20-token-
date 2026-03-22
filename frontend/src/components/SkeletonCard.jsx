import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="asset-card" style={{ borderColor: 'var(--border-light)' }}>
      <div className="asset-image-container skeleton">
      </div>
      <div className="asset-info" style={{ gap: '1rem' }}>
        <div className="skeleton" style={{ height: '1.5rem', width: '80%' }}></div>
        
        <div className="asset-meta" style={{ marginTop: 'auto', borderTopColor: 'transparent' }}>
          <div className="skeleton" style={{ height: '1rem', width: '40%' }}></div>
          <div className="skeleton" style={{ height: '1rem', width: '30%' }}></div>
        </div>

        <div className="asset-actions">
           <div className="skeleton" style={{ height: '2.5rem', width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
