import React, { useState } from 'react';

export default function RateSellerModal({ isOpen, onClose, onSubmit }) {
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(address, rating);
      setAddress('');
      setRating(0);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>⭐ Rate a Seller</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="seller-address">Seller Address</label>
            <input
              id="seller-address"
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= displayRating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {star <= displayRating ? '★' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😐 Fair'}
                {rating === 3 && '🙂 Good'}
                {rating === 4 && '😊 Great'}
                {rating === 5 && '🤩 Excellent!'}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
            disabled={loading || rating === 0}
          >
            {!loading && '📝 Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}
