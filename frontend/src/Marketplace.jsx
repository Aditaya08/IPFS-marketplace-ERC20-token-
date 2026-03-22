import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './contract';
import { useToast } from './components/Toast';
import ProductCard from './components/ProductCard';
import StatsPanel from './components/StatsPanel';
import ListProductModal from './components/ListProductModal';
import RateSellerModal from './components/RateSellerModal';
import SkeletonCard from './components/SkeletonCard';

export default function Marketplace({ provider, account }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [balance, setBalance] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [listModalOpen, setListModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (provider && account) {
      loadMarketplaceData();
      loadTokenData();
    }
  }, [provider, account]);

  const getMarketplaceContract = async () => {
    const signer = await provider.getSigner();
    return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  };

  const getTokenContract = async () => {
    const signer = await provider.getSigner();
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
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
      toast.error('Connection Error', 'Failed to load token balance. Are you on the right network?');
    }
  };

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const contract = await getMarketplaceContract();
      const nextIdBigInt = await contract.nextProductId();
      const nextId = Number(nextIdBigInt);
      let loadedProducts = [];

      for (let i = 1; i < nextId; i++) {
        const product = await contract.products(i);
        // Ensure seller rating call doesn't crash if it reverts
        let sellerRating = 0;
        try {
          const sellerRatingRaw = await contract.getSellerAverageRating(product.seller);
          sellerRating = Number(sellerRatingRaw) / 10;
        } catch (e) {
          console.warn("Could not fetch seller rating", e);
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
      toast.error('Connection Error', 'Failed to load products from blockchain.');
    } finally {
      setLoading(false);
    }
  };

  const listProduct = async (name, price, metadataCID) => {
    const contract = await getMarketplaceContract();
    const priceWei = ethers.parseUnits(price.toString(), 18);
    const loadingId = toast.loading('Listing Product', 'Waiting for transaction confirmation...');
    try {
      const tx = await contract.listProduct(name, priceWei, metadataCID);
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('Product Listed! 🎉', `"${name}" is now live on the marketplace.`);
      loadMarketplaceData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Listing Failed', err.reason || 'Transaction was rejected.');
      throw err;
    }
  };

  const buyProduct = async (product) => {
    const token = await getTokenContract();
    const marketplace = await getMarketplaceContract();

    const loadingId = toast.loading('Purchasing', 'Step 1/2: Approving token spend...');
    try {
      const approveTx = await token.approve(MARKETPLACE_ADDRESS, product.priceRaw);
      await approveTx.wait();

      toast.dismiss(loadingId);
      const loadingId2 = toast.loading('Purchasing', 'Step 2/2: Completing purchase...');

      const buyTx = await marketplace.buyProduct(product.id);
      await buyTx.wait();

      toast.dismiss(loadingId2);
      toast.success('Purchase Complete! 🛍️', `You bought "${product.name}" for ${product.price} ${tokenSymbol}.`);
      loadMarketplaceData();
      loadTokenData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Purchase Failed', err.reason || 'Transaction was rejected.');
    }
  };

  const rateSeller = async (address, score) => {
    const marketplace = await getMarketplaceContract();
    const loadingId = toast.loading('Rating Seller', 'Submitting your review...');
    try {
      const tx = await marketplace.rateSeller(address, score);
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('Review Submitted! ⭐', `You rated the seller ${score}/5.`);
      loadMarketplaceData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Rating Failed', err.reason || 'Transaction was rejected.');
      throw err;
    }
  };

  const requestTokens = async () => {
    const token = await getTokenContract();
    const loadingId = toast.loading('Requesting Tokens', 'Minting from faucet...');
    try {
      const tx = await token.faucet(ethers.parseUnits("100", 18));
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('Tokens Received! 💰', `100 ${tokenSymbol} added to your wallet.`);
      loadTokenData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Faucet Error', 'Make sure this is a MockERC20 contract.');
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.seller.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <StatsPanel
        account={account}
        balance={balance}
        tokenSymbol={tokenSymbol}
        onRequestTokens={requestTokens}
      />

      {/* ── Main Area ── */}
      <div className="marketplace-main">
        <div className="marketplace-toolbar">
          <h2>
            🏪 Marketplace
            <span className="product-count">{products.length} items</span>
          </h2>
          <div className="toolbar-actions">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-ghost" onClick={() => setRateModalOpen(true)}>
              ⭐ Rate Seller
            </button>
            <button className="btn-primary" onClick={() => setListModalOpen(true)}>
              + List Product
            </button>
          </div>
        </div>

        <div className="product-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
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
                index={idx}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchQuery ? 'No matches found' : 'No products yet'}</h3>
              <p>
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Be the first to list a product on the marketplace!'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ListProductModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSubmit={listProduct}
        tokenSymbol={tokenSymbol}
      />
      <RateSellerModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onSubmit={rateSeller}
      />
    </div>
  );
}
