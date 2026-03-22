import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ToastProvider } from './components/Toast';
import Marketplace from './Marketplace';
import './index.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const signer = await _provider.getSigner();
        const address = await signer.getAddress();

        setProvider(_provider);
        setAccount(address);
        setIsConnected(true);
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <ToastProvider>
      <div className="app">
        {/* ── Navbar ── */}
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">🛒</span>
            <h2>DecentraMarket</h2>
          </div>
          <div className="nav-actions">
            {isConnected && (
              <div className="network-badge">
                <span className="network-dot"></span>
                <span>Ethereum</span>
              </div>
            )}
            {!isConnected ? (
              <button className="btn-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-badge">
                <span className="wallet-dot"></span>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </div>
            )}
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="main-content">
          {!isConnected ? (
            <div className="hero">
              {/* Floating gradient orbs */}
              <div className="hero-orb hero-orb-1" />
              <div className="hero-orb hero-orb-2" />
              <div className="hero-orb hero-orb-3" />

              <div className="hero-badge">
                <span className="badge-dot"></span>
                Powered by Ethereum
              </div>

              <h1>
                <span className="gradient-text">
                  The Future of<br />Decentralized Commerce
                </span>
              </h1>

              <p>
                Buy and sell goods securely with ERC-20 tokens.
                Trustless transactions, on-chain reputation, zero middlemen.
              </p>

              <div className="hero-cta">
                <button className="btn-large" onClick={connectWallet}>
                  ⚡ Connect Wallet & Start Trading
                </button>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="stat-value">100%</div>
                  <div className="stat-label">Decentralized</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-value">0%</div>
                  <div className="stat-label">Fees</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-value">∞</div>
                  <div className="stat-label">Possibilities</div>
                </div>
              </div>
            </div>
          ) : (
            <Marketplace provider={provider} account={account} />
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="footer">
          <p>DecentraMarket — University Lab Demonstration &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
