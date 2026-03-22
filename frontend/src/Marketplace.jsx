import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './contract';
import { useToast } from './components/Toast';
import ProductCard from './components/ProductCard';
import ListProductModal from './components/ListProductModal';
import RateSellerModal from './components/RateSellerModal';
import SkeletonCard from './components/SkeletonCard';

export default function Marketplace({ provider, account, isConnected }) {
  const [signer, setSigner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [balance, setBalance] = useState('0');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // modals state
  const [listModalOpen, setListModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (provider && account) {
      provider.getSigner().then(s => setSigner(s)).catch(console.error);
      loadMarketplaceData();
      loadTokenData();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [provider, account]);

  useEffect(() => {
    const handleOpenListModal = () => setListModalOpen(true);
    window.addEventListener('open-list-modal', handleOpenListModal);
    return () => window.removeEventListener('open-list-modal', handleOpenListModal);
  }, []);

  const getMarketplaceContract = async () => {
    const activeSigner = signer || await provider.getSigner();
    return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, activeSigner);
  };

  const getTokenContract = async () => {
    const activeSigner = signer || await provider.getSigner();
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, activeSigner);
  };

  const loadTokenData = async () => {
    try {
      const token = await getTokenContract();
      const sym = await token.symbol();
      setTokenSymbol(sym);

      const bal = await token.balanceOf(account);
      const dec = await token.decimals();
      setBalance(ethers.formatUnits(bal, dec));
    } catch (err) {
      console.error("Error loading token data:", err);
    }
  };

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      if (!provider) return;

      const contract = await getMarketplaceContract();
      const nextIdBigInt = await contract.nextProductId();
      const nextId = Number(nextIdBigInt);
      let loadedProducts = [];

      for (let i = 1; i < nextId; i++) {
        const product = await contract.products(i);
        let sellerRating = 0;
        try {
          const sellerRatingRaw = await contract.getSellerAverageRating(product.seller);
          sellerRating = Number(sellerRatingRaw) / 10;
        } catch (e) {
          // ignore
        }

        loadedProducts.push({
          id: product.id ? product.id.toString() : product[0].toString(),
          name: product.name || product[1],
          price: product.price ? ethers.formatUnits(product.price, 18) : ethers.formatUnits(product[2], 18),
          priceRaw: product.price || product[2],
          seller: product.seller || product[3],
          isSold: product.isSold !== undefined ? product.isSold : product[4],
          metadataCID: product.metadataCID || product[5],
          sellerRating: sellerRating
        });
      }
      setProducts(loadedProducts);
    } catch (err) {
      console.error("Error loading products:", err);
      // stub mock data if contract read fails
      if (products.length === 0) {
        setProducts([
          { id: '1', name: 'NEURAL_VOID_#04', price: '45.00', seller: '0x123...', isSold: true, metadataCID: 'mock', sellerRating: 4.5 },
          { id: '2', name: 'GLASS_LOGIC_V2', price: '120.50', seller: '0x456...', isSold: false, metadataCID: 'mock', sellerRating: 0 },
          { id: '3', name: 'RAW_DATA_SCALAR', price: '8.99', seller: account || '0x789...', isSold: false, metadataCID: 'mock', sellerRating: 5.0 },
          { id: '4', name: 'PROTO_X', price: '200.00', seller: '0xabc...', isSold: false, metadataCID: 'mock', sellerRating: 3.2 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const listProduct = async (name, price, metadataCID) => {
    const contract = await getMarketplaceContract();
    const priceWei = ethers.parseUnits(price.toString(), 18);
    const loadingId = toast.loading('PROTOCOL SECURING', 'Broadcasting listing transaction...');
    try {
      const tx = await contract.listProduct(name, priceWei, metadataCID);
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('ASSET LISTED', `[${name}] deployed to contract.`);
      loadMarketplaceData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('LISTING FAILED', err.reason || 'Transaction rejected by user.');
      throw err;
    }
  };

  const buyProduct = async (product) => {
    const token = await getTokenContract();
    const marketplace = await getMarketplaceContract();

    let loadingId = toast.loading('AWAITING APPROVAL', 'Sign token spend request...');
    try {
      const approveTx = await token.approve(MARKETPLACE_ADDRESS, product.priceRaw);
      await approveTx.wait();

      toast.dismiss(loadingId);
      loadingId = toast.loading('EXECUTING TRANSFER', 'Confirming purchase transaction...');

      const buyTx = await marketplace.buyProduct(product.id);
      await buyTx.wait();

      toast.dismiss(loadingId);
      toast.success('ACQUISITION COMPLETE', `Asset [${product.name}] transferred.`);
      loadMarketplaceData();
      loadTokenData();
    } catch (err) {
      console.error("Buy Product Error:", err);
      toast.dismiss(loadingId);
      toast.error('ACQUISITION FAILED', err.reason || 'Transaction reverted.');
    }
  };

  const rateSeller = async (address, score) => {
    const marketplace = await getMarketplaceContract();
    const loadingId = toast.loading('RECORDING RATING', 'Writing review to chain...');
    try {
      const tx = await marketplace.rateSeller(address, score);
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('RATING SECURED', `Entity rated ${score}/5.`);
      loadMarketplaceData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('RATING FAILED', err.reason || 'Transaction rejected.');
      throw err;
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'AVAILABLE') return !p.isSold;
    if (activeFilter === 'SOLD') return p.isSold;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 className="page-title">LIVE <span className="highlight">ASSETS</span></h1>
          <p className="page-subtitle" style={{ fontSize: '0.9rem', maxWidth: '400px' }}>
            The decentralized source for raw high-fidelity digital assets. Sovereign ownership, verified on-chain.
          </p>
        </div>
        <div className="marketplace-filters" style={{ marginBottom: 0 }}>
          <button
            className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            ALL
          </button>
          <button
            className={`filter-btn ${activeFilter === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('AVAILABLE')}
          >
            AVAILABLE
          </button>
          <button
            className={`filter-btn ${activeFilter === 'SOLD' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SOLD')}
          >
            SOLD
          </button>
        </div>
      </div>

      {!isConnected ? (
        <div className="empty-state">
          <div className="icon">⚡</div>
          <h3>AWAITING CONNECTION</h3>
          <p>Connect your wallet to browse and acquire assets on the marketplace.</p>
        </div>
      ) : (
        <div className="product-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                tokenSymbol={tokenSymbol}
                account={account}
                onBuy={buyProduct}
                onRate={() => {
                  // set rating modal target
                  window.tempSellerToRate = p.seller;
                  setRateModalOpen(true);
                }}
                index={idx}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>NO ASSETS FOUND</h3>
              <p>No products match the current filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ListProductModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSubmit={listProduct}
        tokenSymbol={tokenSymbol}
      />
      <RateSellerModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onSubmit={(score) => rateSeller(window.tempSellerToRate, score)}
      />
    </div>
  );
}
