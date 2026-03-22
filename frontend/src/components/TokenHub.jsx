import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TOKEN_ADDRESS, TOKEN_ABI } from '../contract';
import { useToast } from './Toast';

export default function TokenHub({ provider, account, isConnected }) {
  const [balance, setBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (provider && account) {
      loadTokenData();
    }
  }, [provider, account]);

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
    }
  };

  const requestTokens = async () => {
    if (!isConnected) {
      toast.error('CONNECTION REQUIRED', 'Must connect wallet to request deployment funds.');
      return;
    }
    
    setLoading(true);
    const loadingId = toast.loading('INJECTING LIQUIDITY', 'Minting tokens from testnet faucet...');
    try {
      const token = await getTokenContract();
      const tx = await token.faucet(ethers.parseUnits("100", 18));
      await tx.wait();
      toast.dismiss(loadingId);
      toast.success('FUNDS DEPLOYED', `100 ${tokenSymbol} added to wallet.`);
      loadTokenData();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('FAUCET REJECTED', err.reason || 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{tokenSymbol || 'MTK'} <span className="highlight">GOVERNANCE</span></h1>
        <div style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', display: 'inline-block', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem' }}>
          PROVISIONING AUTHORITY HUB: MANAGE LIQUIDITY & PERMISSIONS
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Faucet Card */}
        <div className="faucet-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem', color: 'var(--accent-magenta)' }}>💧</span>
            <span style={{ padding: '0.2rem 0.5rem', background: '#fff', color: '#000', fontSize: '0.65rem', fontWeight: 800 }}>ACTIVE FAUCET</span>
          </div>
          <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginBottom: '1rem' }}>TESTNET<br/>FAUCET</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 'auto' }}>
            Claim 100 {tokenSymbol || 'MTK'} tokens to participate in active protocol operations and marketplace acquisition.
          </p>
          <button 
            className="btn-magenta" 
            style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }}
            onClick={requestTokens}
            disabled={loading || !isConnected}
          >
            {loading ? 'PROCESSING...' : `MINT 100 ${tokenSymbol || 'MTK'}`}
          </button>
        </div>

        {/* Token Config Placeholder */}
        <div className="asset-card" style={{ padding: '2rem', border: '2px solid var(--accent-magenta)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--accent-neon)' }}>⣿</span> TOKEN ISSUANCE CONFIG
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>MINT CAP (DAILY)</label>
              <input type="text" value="50,000" disabled style={{ borderColor: '#fff' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>GOVERNANCE WEIGHT</label>
              <input type="text" value="1.25x" disabled style={{ borderColor: '#fff' }} />
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
             <label>CONTRACT ACCESS LIST (ENS)</label>
             <input type="text" value="vitalik.eth, sovereign.eth" disabled style={{ borderColor: '#fff' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn-outline">DISCARD</button>
            <button className="btn-primary">APPLY CONFIG</button>
          </div>
        </div>
      </div>

      {/* Elite Holders */}
      <div className="data-table-container" style={{ borderColor: 'var(--accent-magenta)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--accent-magenta)' }}>★</span> ELITE HOLDERS (TOP 1%)
          </h3>
          <span style={{ background: 'var(--accent-neon)', color: '#000', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>LIVE FEED</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>HOLDER ADDRESS</th>
              <th>BALANCE</th>
              <th>VOTING POWER</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#01</td>
              <td className="address-cell">0x892...e491</td>
              <td style={{ color: 'var(--accent-neon)', fontWeight: 800 }}>4,200,000</td>
              <td>42.0%</td>
              <td><span className="status-badge status-active">VALIDATOR</span></td>
            </tr>
            <tr>
              <td>#02</td>
              <td className="address-cell">0x312...a882</td>
              <td style={{ color: 'var(--accent-neon)', fontWeight: 800 }}>1,850,000</td>
              <td>18.5%</td>
              <td><span className="status-badge" style={{ borderColor: '#fff' }}>ACTIVE</span></td>
            </tr>
            {isConnected && (
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <td>#XX</td>
                <td className="address-cell">{account.substring(0, 6)}...{account.substring(account.length-4)}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{parseFloat(balance).toLocaleString()}</td>
                <td>--</td>
                <td><span className="status-badge status-active">YOU</span></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
