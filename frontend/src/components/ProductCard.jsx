import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

export default function ProductCard({ product, tokenSymbol, account, onBuy, onRate, index = 0 }) {
  const toast = useToast();
  const isOwner = account && product.seller.toLowerCase() === account.toLowerCase();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!product.metadataCID) {
      setLoading(false);
      setError(true);
      return;
    }

    if (product.metadataCID === 'mock') {
      // assign dummy badge for mock views
      setMetadata({
        name: product.name,
        description: "A highly classified digital asset container.",
        image: null
      });
      setLoading(false);
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

  const imageSrc = metadata?.image ? getImageUrl(metadata.image) : null;

  return (
    <div className="asset-card">
      {product.isSold ? (
        <div className="asset-badge badge-sold">SOLD</div>
      ) : isOwner ? (
        <div className="asset-badge badge-owner">YOUR LISTING</div>
      ) : null}

      <div className="asset-image-container">
        {loading ? (
          <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
        ) : error || !imageSrc ? (
          <div className="asset-placeholder">{"<"}NO_MEDIA{">"}</div>
        ) : (
          <img
            src={imageSrc}
            alt={metadata?.name || product.name}
            className="asset-image"
            onError={(e) => { e.target.style.display = 'none'; setError(true); }}
          />
        )}
      </div>

      <div className="asset-info">
        <h3 className="asset-title">{metadata?.name || product.name}</h3>

        <div className="asset-meta">
          <div className="meta-item">
            <span className="meta-label">IPFS</span>
            <span className="meta-value">{product.metadataCID?.substring(0, 12)}...</span>
          </div>
          <div className="meta-item highlight">
            <span className="meta-label">{tokenSymbol || 'MTK'}</span>
            <span className="meta-value">{product.price}</span>
          </div>
        </div>

        <div className="asset-meta" style={{ marginTop: '0.5rem', paddingTop: '0' }}>
          <div className="meta-item">
            <span className="meta-label">SELLER</span>
            <span className="meta-value">{product.seller.substring(0, 8)}</span>
          </div>
          <div className="meta-item" style={{ cursor: 'pointer' }} onClick={() => onRate && onRate()}>
            <span className="meta-label">REP</span>
            <span className="meta-value">{product.sellerRating > 0 ? product.sellerRating.toFixed(1) : 'NEW'} ⍚</span>
          </div>
        </div>

        <div className="asset-actions">
          {!isOwner && !product.isSold && (
            <button className="btn-primary" onClick={() => onBuy(product)}>
              COLLECT ASSET
            </button>
          )}
          {isOwner && !product.isSold && (
            <>
              <button
                className="btn-outline"
                style={{ fontSize: '0.7rem' }}
                onClick={() => toast.error('PROTOCOL LOCKED', 'Asset price is immutable in this contract version.')}
              >
                EDIT PRICE
              </button>
              <button
                className="btn-outline-magenta"
                style={{ fontSize: '0.7rem' }}
                onClick={() => toast.error('PROTOCOL LOCKED', 'Delisting is not supported by the current ledger contract.')}
              >
                DELIST
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
