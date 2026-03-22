import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastProvider, useToast } from './components/Toast';
import Marketplace from './Marketplace';
import TokenHub from './components/TokenHub';
import MyAssets from './components/MyAssets';
import './index.css';

function AppContent() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('MARKETPLACE');

  const toast = useToast();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const _provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await _provider.getSigner();
            const address = await signer.getAddress();
            setProvider(_provider);
            setAccount(address);
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Auto-connect failed", err);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
      } else {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await _provider.getSigner();
        const address = await signer.getAddress();
        setProvider(_provider);
        setAccount(address);
        setIsConnected(true);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

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
        toast.success("Wallet Connected", `Address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      } catch (err) {
        console.error("Failed to connect wallet", err);
        toast.error("Connection Failed", "Could not connect to wallet.");
      }
    } else {
      toast.error("Wallet Not Found", "Please install MetaMask.");
    }
  };

  const switchAccount = async () => {
    try {
      await window.ethereum.request({ 
        method: "wallet_requestPermissions", 
        params: [{ eth_accounts: {} }] 
      });
      connectWallet();
    } catch (err) {
      console.error("Account switch cancelled or failed", err);
    }
  };

  const renderContent = () => {
    if (activeTab === 'MARKETPLACE') {
      return (
        <Marketplace 
          provider={provider} 
          account={account} 
          isConnected={isConnected} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      );
    }

    if (activeTab === 'MY_ASSETS') {
      return (
        <MyAssets 
          provider={provider} 
          account={account} 
          isConnected={isConnected} 
        />
      );
    }

    if (activeTab === 'TOKEN_HUB') {
      return (
        <TokenHub 
          provider={provider} 
          account={account} 
          isConnected={isConnected} 
        />
      );
    }

    // render static placeholder routes
    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">{activeTab.replace('_', ' ')} <span className="highlight">PROTOCOL</span></h1>
          <p className="page-subtitle">This section is currently locked or under development. Check back later for protocol updates.</p>
        </div>
        
        <div className="empty-state">
          <div className="icon">🔒</div>
          <h3>PROTOCOL RESTRICTED</h3>
          <p>You need specific governance permissions or this feature is still deploying to the mainnet.</p>
          <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('MARKETPLACE')}>
            RETURN TO MARKETPLACE
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            ETHER-RAW
          </div>
          <div className="user-profile">
            <div className={`user-avatar ${!isConnected ? 'unconnected' : ''}`}>
               {isConnected ? 'S' : '?'}
            </div>
            <div className="user-info">
              {isConnected ? (
                <>
                  <span className="user-address">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                  <span className="user-role" style={{ color: 'var(--accent-neon)' }}>VERIFIED SOVEREIGN</span>
                </>
              ) : (
                <>
                  <span className="user-address">UNCONNECTED</span>
                  <span className="user-role" style={{ color: 'var(--text-muted)' }}>GUEST ENTITY</span>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'MARKETPLACE' ? 'active' : ''}`}
            onClick={() => setActiveTab('MARKETPLACE')}
          >
            <span className="nav-icon">▤</span>
            MARKETPLACE
          </div>
          <div 
            className={`nav-item ${activeTab === 'MY_ASSETS' ? 'active' : ''}`}
            onClick={() => setActiveTab('MY_ASSETS')}
          >
            <span className="nav-icon">▣</span>
            MY ASSETS
          </div>
          <div 
            className={`nav-item ${activeTab === 'TOKEN_HUB' ? 'active' : ''}`}
            onClick={() => setActiveTab('TOKEN_HUB')}
          >
            <span className="nav-icon">⎔</span>
            TOKEN HUB
          </div>
          <div 
            className={`nav-item ${activeTab === 'SETTINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            <span className="nav-icon">⚙</span>
            SETTINGS
          </div>
        </nav>

        <div className="sidebar-footer">
          {isConnected && (
            <button className="btn-magenta" onClick={() => {
              setActiveTab('MARKETPLACE');
              // emit event to toggle listing modal
              window.dispatchEvent(new CustomEvent('open-list-modal'));
            }}>
              MINT NEW ASSET
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <header className="topbar">
          <nav className="topbar-nav">
            <div 
              className={`topbar-link ${activeTab === 'MARKETPLACE' || activeTab === 'MY_ASSETS' ? 'active' : ''}`}
              onClick={() => setActiveTab('MARKETPLACE')}
            >
              MARKETPLACE
            </div>
            <div 
              className={`topbar-link ${activeTab === 'VAULTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('VAULTS')}
            >
              VAULTS
            </div>
            <div 
              className={`topbar-link ${activeTab === 'ACTIVITY' ? 'active' : ''}`}
              onClick={() => setActiveTab('ACTIVITY')}
            >
              ACTIVITY
            </div>
            <div 
              className={`topbar-link ${activeTab === 'GOVERNANCE' ? 'active' : ''}`}
              onClick={() => setActiveTab('GOVERNANCE')}
            >
              GOVERNANCE
            </div>
          </nav>
          
          <div className="topbar-actions">
            {isConnected && (
              <div style={{ border: '2px solid var(--border-light)', padding: '0.4rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-neon)' }}>
                NETWORK: ACTIVE
              </div>
            )}
            {!isConnected ? (
              <button className="connect-btn" onClick={connectWallet}>
                CONNECT WALLET
              </button>
            ) : (
               <button className="btn-outline" onClick={switchAccount}>
                 SWITCH ACCOUNT
               </button>
            )}
            <button className="btn-ghost" style={{ padding: '0.4rem', border: '1px solid var(--border-light)' }}>
              ⍚
            </button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
