import React, { useState } from 'react';
import { uploadImageToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';
import { useToast } from './Toast';

export default function ListProductModal({ isOpen, onClose, onSubmit, tokenSymbol }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const toast = useToast();

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('MEDIA REQUIRED', 'Asset image missing.');
      return;
    }

    setLoading(true);
    try {
      setUploadStatus('UPLOADING MEDIA...');
      const imageCID = await uploadImageToIPFS(image);
      
      setUploadStatus(`MEDIA SECURED [${imageCID.substring(0,6)}...] UPLOADING METADATA...`);
      const metadataCID = await uploadMetadataToIPFS(name, description, imageCID);
      
      setUploadStatus(`AWAITING SIGNATURE...`);
      await onSubmit(name, price, metadataCID);
      
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setImagePreview(null);
      setUploadStatus('');
      onClose();
    } catch (err) {
      // swallow error; parent handles ui feedback
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
          <h3><span className="icon">◈</span> DEPLOY ASSET</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label htmlFor="product-name">ASSET DESIGNATION</label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. NEURAL_INTERFACE_V2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="product-desc">DATA PAYLOAD</label>
              <textarea
                id="product-desc"
                placeholder="Enter asset specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="product-price">VALUATION ({tokenSymbol || 'MTK'})</label>
              <input
                id="product-price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>RAW MEDIA</label>
              <div 
                className={`file-upload-box ${image ? 'active' : ''}`}
                style={{ padding: image ? '1rem' : '2rem' }}
                onClick={() => !loading && document.getElementById('product-image-upload').click()}
              >
                {!imagePreview ? (
                  <>
                    <div className="file-upload-icon">+</div>
                    <div className="file-upload-text">SELECT TERMINAL FILE [IMAGE/*]</div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid var(--border-light)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{image.name}</span>
                      <span style={{ color: 'var(--accent-neon)', fontWeight: 800 }}>[ CLICK TO CHANGE ]</span>
                    </div>
                  </div>
                )}
                
                <input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </div>
            </div>
            
            {uploadStatus && (
               <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-neon)', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                 &gt; {uploadStatus}
                 <span className="cursor-blink">_</span>
               </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              ABORT
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'PROCESSING...' : 'INITIALIZE DEPLOYMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
