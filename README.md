<div align="center">
  <img src="https://raw.githubusercontent.com/ajay-dhangar/ajay-dhangar/main/assets/icons/web3.gif" width="100" />
  <h1>🚀 Web3 Decentralized Marketplace</h1>
  <p>A premium, full-stack Web3 application demonstrating a decentralized e-commerce platform built with Solidity, React, and Pinata IPFS.</p>
</div>

---

## 🌟 Features

- 💎 **Custom ERC-20 Payments**: Transact seamlessly using a standard ERC-20 token instead of volatile native ETH.
- 📦 **IPFS Metadata Integration**: Product images and descriptions are securely pinned off-chain via **Pinata**, drastically reducing Ethereum gas costs.
- ⭐️ **On-Chain Reputation System**: Users can rate and review sellers transparently directly on the blockchain.
- 🎨 **Premium Aesthetic Frontend**: A highly responsive, glassmorphism-inspired UI featuring dynamic toast notifications, skeleton loaders, and interactive micro-animations.

---

## 🏗️ Architecture

```text
📦 Marketplace Repository
 ┣ 📂 contracts
 ┃ ┣ 📜 DecentralizedMarketplace.sol (Core Logic)
 ┃ ┗ 📜 MockERC20.sol                  (In-App Currency)
 ┗ 📂 frontend
   ┣ 📂 src
   ┃ ┣ 📂 components                   (React UI Components)
   ┃ ┣ 📂 utils                        (IPFS / Axio Helpers)
   ┃ ┗ 📜 Marketplace.jsx              (Global State / Web3 Engine)
   ┗ 📜 package.json
```

---

## ⚙️ 1. Smart Contract Deployment (Remix IDE)

This project requires deploying the contracts manually via [Remix IDE](https://remix.ethereum.org/).

1. Upload `DecentralizedMarketplace.sol` and `MockERC20.sol` into Remix.
2. Under the **Solidity Compiler** tab, compile both using version **`0.8.20`**.
3. Under the **Deploy & Run Transactions** tab, set the Environment to **Injected Provider - MetaMask**.
4. **Deploy the Token First:**
   - Select `MockERC20`.
   - Feed the constructor arguments: `name` ("MockToken"), `symbol` ("BCK"), and `initialSupply` (`1000000000000000000000` for 1,000 tokens).
   - Click Deploy. Copy the resulting **Token Address**.
5. **Deploy the Marketplace:**
   - Select `DecentralizedMarketplace`.
   - Pass the Token Address from Step 4 as the constructor argument.
   - Click Deploy. Copy the resulting **Marketplace Address**.

---

## 🦊 2. MetaMask Configuration

1. Connect MetaMask to the same network you deployed to (e.g., Sepolia or Localhost).
2. Import the newly created `MockERC20` token using the copied Token Address so you can see your custom balance inside your wallet!

---

## 💻 3. Frontend Setup

1. Open `frontend/src/contract.js`.
2. Overwrite the top two lines with your freshly deployed addresses:
   ```javascript
   export const MARKETPLACE_ADDRESS = "0xYourMarketplaceAddressHere";
   export const TOKEN_ADDRESS = "0xYourTokenAddressHere";
   ```
3. Update the ABI configurations in that exact same file (`MARKETPLACE_ABI` and `TOKEN_ABI`) if they have changed.
4. Open a terminal inside the frontend folder, install dependencies, and start Vite:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### ☁️ Configure Pinata IPFS
In order to upload images and descriptions:
1. Obtain an API JWT from [Pinata Cloud](https://app.pinata.cloud/).
2. Create a `.env` file in the `/frontend` directory.
3. Add the JWT token:
   ```env
   VITE_PINATA_JWT=eyJhb...
   ```
*(Restart your `npm run dev` server if it was running while you made this file!)*

---

## 🛍️ 4. How to Use the DApp

- 🚰 **Faucet:** Click `Connect Wallet`, then click the Faucet button in the sidebar to mint 100 free mock tokens to yourself!
- 📤 **List a Product:** Click `List Product`, provide a name, price, description, and upload an image. The UI will pin it to IPFS and execute the smart contract.
- 🛒 **Buy:** Switch to a different MetaMask account. Approving the spend and purchasing the product will automatically trigger 2 MetaMask interactions.
- ⭐ **Rate:** Instantly rate the seller after your purchase via the `Rate Seller` action!
