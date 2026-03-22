import React, { useState } from 'react';

export default function StatsPanel({ account, balance, tokenSymbol, onRequestTokens }) {
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
        <div className="sub-value">
          {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </div>
        <button className="copy-btn" onClick={copyAddress}>
          {copied ? '✅ Copied!' : '📋 Copy address'}
        </button>
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
        <div className="sub-value" style={{ wordBreak: 'normal' }}>
          {tokenSymbol || 'TOKEN'}
        </div>
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
