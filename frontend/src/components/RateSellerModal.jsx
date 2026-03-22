import React, { useState } from 'react';

export default function RateSellerModal({ isOpen, onClose, onSubmit }) {
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(rating);
      setAddress('');
      setRating(0);
      onClose();
    } catch {
      // error caught by parent
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3><span className="icon">⍚</span> ENTITY RATING</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Submit performance metrics for the asset provider. This transaction will be recorded on-chain.
            </p>

            <div className="input-group">
              <label>SCORE [1-5]</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`btn-outline ${rating >= star ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '0.5rem' }}
                    onClick={() => setRating(star)}
                    disabled={loading}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              CANCEL
            </button>
            <button type="submit" className="btn-primary" disabled={loading || rating === 0}>
              {loading ? 'CONFIRMING...' : 'WRITE TO LEDGER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
