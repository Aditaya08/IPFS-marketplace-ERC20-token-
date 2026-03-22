import React, { useState, useEffect } from 'react';

function StarRating({ rating, size = 'sm' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className={`star filled ${size}`}>★</span>);
    } else if (i === fullStars && hasHalf) {
      stars.push(<span key={i} className={`star half-filled ${size}`}>★</span>);
    } else {
      stars.push(<span key={i} className={`star ${size}`}>☆</span>);
    }
  }

  return (
    <div className="seller-rating">
      {stars}
      <span className="rating-number">
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
}

export default function ProductCard({ product, tokenSymbol, account, onBuy, index = 0 }) {
  const isOwner = product.seller.toLowerCase() === account.toLowerCase();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!product.metadataCID) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchMetadata = async () => {
      try {
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${product.metadataCID}`);
        if (!res.ok) throw new Error('Failed to fetch metadata');
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        console.error("Failed to load IPFS metadata for product", product.id, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [product.metadataCID]);

  const getImageUrl = (ipfsUri) => {
    if (!ipfsUri) return null;
    if (ipfsUri.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUri.replace('ipfs://', '')}`;
    }
    return ipfsUri;
  };

  return (
    <div className={`product-card ${product.isSold ? 'sold' : ''} stagger-${Math.min(index + 1, 8)}`}>
      {loading ? (
         <div className="skeleton skeleton-line" style={{ height: '160px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
      ) : error || !metadata?.image ? (
         <div style={{ height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
           📦
         </div>
      ) : (
         <div style={{ height: '160px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', overflow: 'hidden' }}>
           <img 
             src={getImageUrl(metadata.image)} 
             alt={metadata?.name || product.name} 
             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             onError={(e) => { e.target.style.display = 'none'; setError(true); }}
           />
         </div>
      )}

      <div className="product-header">
        <h4 className="product-name">{metadata?.name || product.name}</h4>
        <span className="product-id">#{product.id}</span>
      </div>

      {(!loading && !error && metadata?.description) && (
        <p className="product-description" style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {metadata.description}
        </p>
      )}

      <div className="product-price">
        {product.price} <span className="token-symbol">{tokenSymbol}</span>
      </div>

      <div className="seller-info">
        <div className="seller-address">
          🔗 {product.seller.substring(0, 6)}...{product.seller.substring(product.seller.length - 4)}
        </div>
        <StarRating rating={product.sellerRating} />
      </div>

      <div className="card-actions">
        {product.isSold ? null : isOwner ? (
          <button className="btn-own" disabled>
            📦 Your Listing
          </button>
        ) : (
          <button className="btn-buy" onClick={() => onBuy(product)}>
            ⚡ Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
