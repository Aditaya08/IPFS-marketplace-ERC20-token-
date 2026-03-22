# ETHER-RAW MARKETPLACE

A blazingly fast, fully decentralized peer-to-peer marketplace built with Solidity, React, and IPFS.

No glassmorphism. No bloated CSS frameworks. Pure, high-contrast, terminal-inspired brutalism.

---

## ARCHITECTURE

We care about stable architecture.
- **Custom Token Payments:** Transact via a standard ERC-20 token. We don't use volatile native ETH here.
- **Decentralized Storage:** Images and metadata are pinned off-chain to IPFS via Pinata. We store only the CID hash on-chain to keep gas costs astronomically low. Skill issue if you store base64 on-chain.
- **On-Chain Reputation:** Immutable buyer-to-seller rating system. No central server. No admin manipulation.
- **Brutalist UI:** Sharp modals, live image previews, sliding terminal alerts (`[SYS.OK]`), and responsive grid layouts. Built for developers. 

---

## DIRECTORY STRUCTURE

```text
.
├── contracts/
│   ├── DecentralizedMarketplace.sol    # Core engine (listings, purchases, ratings)
│   └── MockERC20.sol                   # In-app currency token
└── frontend/
    ├── src/
    │   ├── components/                 # React UI (Modals, Sidebar, TokenHub)
    │   ├── utils/                      # Pinata IPFS integrations
    │   ├── App.jsx                     # Application shell and router
    │   └── Marketplace.jsx             # Decentralized asset grid logic
    └── package.json
```

---

## 1. SMART CONTRACT DEPLOYMENT

Deploy the contracts via Remix IDE (or your terminal tool of choice).

1. Compile `DecentralizedMarketplace.sol` and `MockERC20.sol` using Solidity `^0.8.20`.
2. Connect your environment to Injected Provider (MetaMask).
3. **Deploy the Token:**
   - Contract: `MockERC20`
   - Args: `name` ("MockToken"), `symbol` ("MTK"), `initialSupply` (`1000000000000000000000`)
   - Copy the deployed Token Address.
4. **Deploy the Marketplace:**
   - Contract: `DecentralizedMarketplace`
   - Args: Paste the Token Address from step 3.
   - Copy the deployed Marketplace Address.

---

## 2. METAMASK CONFIG

1. Connect to the exact network you deployed to (Sepolia, Localhost, etc).
2. Import the new Token Address into MetaMask so your balance is visible in your wallet.

---

## 3. FRONTEND SETUP

Configure the ABIs and spin up the client.

1. Open `frontend/src/contract.js`.
2. Update the addresses at the top of the file:
```javascript
export const MARKETPLACE_ADDRESS = "0xYourMarketplaceAddressHere";
export const TOKEN_ADDRESS = "0xYourTokenAddressHere";
```
*(Update the ABI arrays in this file if you modified the Solidity source. Do better.)*

3. Install dependencies and run the blazingly fast Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

### IPFS CONFIGURATION (PINATA)
To handle image uploads, hook up Pinata IPFS:
1. Generate an API JWT from Pinata Cloud.
2. Create a `.env` file in the `/frontend` directory.
3. Add your JWT:
```env
VITE_PINATA_JWT=eyJhb...
```
*(Restart your dev server if it was already running. Common sense.)*

---

## 4. USAGE

- **TESTNET FAUCET:** Connect your wallet, navigate to `TOKEN HUB`, and mint 100 free mock tokens.
- **MINT ASSET:** Click `MINT NEW ASSET`, input specifications, and upload raw media. The client pins to IPFS and executes the smart contract listing.
- **ACQUIRE:** Switch to a different MetaMask account. Clicking `COLLECT ASSET` triggers two prompts: ERC-20 approval and the purchase execution.
- **RATE:** Leave an immutable rating for the seller directly on the blockchain after acquisition.
