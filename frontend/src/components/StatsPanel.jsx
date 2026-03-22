import React, { useState } from 'react';

export default function StatsPanel({ account, balance, tokenSymbol, onRequestTokens, onSwitchAccount }) {
  const [copied, setCopied] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    try {
      await onRequestTokens();
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <aside className="stats-panel">
      {/* Wallet Card */}
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">👛</span>
          <h3>Wallet</h3>
        </div>
        <div className="sub-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {account ? (
            <>
              <span className="network-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-500)', boxShadow: '0 0 8px var(--emerald-500)', display: 'inline-block', flexShrink: 0 }}></span>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </>
          ) : (
            <>
              <span className="network-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', boxShadow: 'none', display: 'inline-block', flexShrink: 0 }}></span>
              Not Connected
            </>
          )}
        </div>
        {account && (
          <button className="copy-btn" onClick={copyAddress}>
            {copied ? '✅ Copied!' : '📋 Copy address'}
          </button>
        )}
      </div>

      {/* Balance Card */}
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">💰</span>
          <h3>Balance</h3>
        </div>
        <div className="accent-value">
          {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="sub-value" style={{ wordBreak: 'normal', marginBottom: '1rem' }}>
          {tokenSymbol || 'TOKEN'}
        </div>
        <button
          className="switch-account-btn"
          onClick={onSwitchAccount}
          style={{ width: '100%', marginBottom: '0.75rem', padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: '500' }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#a0aec0'; }}
        >
          🔄 Switch Account
        </button>
        <button
          className={`faucet-btn ${faucetLoading ? 'btn-loading' : ''}`}
          onClick={handleFaucet}
          disabled={faucetLoading}
        >
          {!faucetLoading && <>🚰 Get 100 {tokenSymbol}</>}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">📊</span>
          <h3>Network</h3>
        </div>
        <div className="sub-value" style={{ wordBreak: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="network-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-500)', boxShadow: '0 0 8px var(--emerald-500)', display: 'inline-block', flexShrink: 0 }}></span>
          Connected
        </div>
      </div>
    </aside>
  );
}
