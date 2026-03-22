import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TOKEN_ADDRESS, TOKEN_ABI } from '../contract';
import { useToast } from './Toast';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

export default function MyAssets({ provider, account, isConnected }) {
  const [signer, setSigner] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const toast = useToast();

  useEffect(() => {
    if (provider && account) {
      provider.getSigner().then(s => setSigner(s)).catch(console.error);
      loadAssetData();
    } else {
      setAssets([]);
      setLoading(false);
    }
  }, [provider, account]);

  const getMarketplaceContract = async () => {
    const activeSigner = signer || await provider.getSigner();
    return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, activeSigner);
  };

  const getTokenContract = async () => {
    const activeSigner = signer || await provider.getSigner();
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, activeSigner);
  };

  const loadAssetData = async () => {
    try {
      setLoading(true);
      if (!provider || !account) return;

      const contract = await getMarketplaceContract();
      const nextIdBigInt = await contract.nextProductId();
      const nextId = Number(nextIdBigInt);
      let loadedAssets = [];

      for (let i = 1; i < nextId; i++) {
        const product = await contract.products(i);
        const id = product.id ? product.id.toString() : product[0].toString();
        
        const seller = (product.seller || product[3]).toLowerCase();
        const isSold = product.isSold !== undefined ? product.isSold : product[4];
        
        let buyer = null;
        if (isSold) {
          try {
            buyer = (await contract.productBuyers(i)).toLowerCase();
          } catch (e) {
            // ignore if mapping not found/failed
          }
        }

        const userAccount = account.toLowerCase();
        const isUserSeller = seller === userAccount;
        const isUserBuyer = buyer && buyer === userAccount;

        // Only keep assets the user has either listed or bought
        if (isUserSeller || isUserBuyer) {
          let sellerRating = 0;
          try {
            const sellerRatingRaw = await contract.getSellerAverageRating(seller);
            sellerRating = Number(sellerRatingRaw) / 10;
          } catch (e) {}

          loadedAssets.push({
            id,
            name: product.name || product[1],
            price: product.price ? ethers.formatUnits(product.price, 18) : ethers.formatUnits(product[2], 18),
            priceRaw: product.price || product[2],
            seller: product.seller || product[3],
            isSold,
            metadataCID: product.metadataCID || product[5],
            sellerRating: sellerRating,
            relationType: isUserBuyer ? 'PURCHASED' : 'LISTED'
          });
        }
      }

      setAssets(loadedAssets);

      try {
        const token = await getTokenContract();
        const sym = await token.symbol();
        setTokenSymbol(sym);
      } catch (err) {}

    } catch (err) {
      console.error("Error loading specific user assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(p => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PURCHASED') return p.relationType === 'PURCHASED';
    if (activeFilter === 'LISTED') return p.relationType === 'LISTED';
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 className="page-title">MY <span className="highlight">ASSETS</span></h1>
          <p className="page-subtitle" style={{ fontSize: '0.9rem', maxWidth: '400px' }}>
            A comprehensive index of your sovereign digital items and active marketplace deployments.
          </p>
        </div>
        
        {isConnected && (
          <div className="marketplace-filters" style={{ marginBottom: 0 }}>
            <button
              className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              ALL
            </button>
            <button
              className={`filter-btn ${activeFilter === 'PURCHASED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PURCHASED')}
            >
              PURCHASED
            </button>
            <button
              className={`filter-btn ${activeFilter === 'LISTED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('LISTED')}
            >
              LISTED
            </button>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="empty-state">
          <div className="icon">⚡</div>
          <h3>AWAITING CONNECTION</h3>
          <p>Connect your wallet to view your personal secured assets.</p>
        </div>
      ) : (
        <div className="product-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredAssets.length > 0 ? (
            filteredAssets.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                tokenSymbol={tokenSymbol}
                account={account}
                onBuy={() => {}} // Can't buy own assets or already purchased assets
                onRate={() => {
                  toast.error('RATING LOCKED', 'Navigate to the main marketplace to rate sellers.');
                }}
                index={idx}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>NO ASSETS FOUND</h3>
              <p>You haven't requested acquisitions or deployed assets matching this filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
