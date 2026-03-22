import React, { useState } from 'react';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';
import { useToast } from './Toast';

export default function ListProductModal({ isOpen, onClose, onSubmit, tokenSymbol }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Image Required', 'Please select a product image to upload.');
      return;
    }

    setLoading(true);
    try {
      setUploadStatus('Uploading image to IPFS...');
      const imageCID = await uploadImageToIPFS(image);
      
      setUploadStatus(`Pinned! Image CID: ${imageCID.substring(0,6)}... Uploading metadata...`);
      const metadataCID = await uploadMetadataToIPFS(name, description, imageCID);
      
      setUploadStatus(`Pinned! Metadata CID: ${metadataCID.substring(0,6)}... Confirm in wallet...`);
      await onSubmit(name, price, metadataCID);
      
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setUploadStatus('');
      onClose();
    } catch (err) {
      toast.error('Listing Failed', err.message || 'Error occurred during listing to IPFS.');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>📦 List New Product</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="product-name">Product Name</label>
            <input
              id="product-name"
              type="text"
              placeholder="e.g. Digital Art Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-desc">Description</label>
            <textarea
              id="product-desc"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Price ({tokenSymbol || 'TOKEN'})</label>
            <input
              id="product-price"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-image">Product Image</label>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          {price && parseFloat(price) > 0 && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              color: 'var(--emerald-400)',
            }}>
              💎 Listing for <strong>{parseFloat(price).toLocaleString()} {tokenSymbol}</strong>
            </div>
          )}

          <button
            type="submit"
            className={`btn-success ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? uploadStatus || 'Loading...' : '🚀 Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
