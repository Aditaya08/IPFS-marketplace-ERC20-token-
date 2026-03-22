import { ethers } from "ethers";

const MARKETPLACE_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";
const TOKEN_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const MARKETPLACE_ABI = [
  "function products(uint256) external view returns (uint256 id, string name, uint256 price, address seller, bool isSold)",
  "function nextProductId() external view returns (uint256)"
];

const TOKEN_ABI = [
  "function symbol() external view returns (string)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function main() {
  console.log("Connecting to standard local Ethereum RPC at http://127.0.0.1:8545");
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  try {
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  } catch (e) {
    console.log("Could not connect to http://127.0.0.1:8545. Are you running a local node?");
    return;
  }

  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

  try {
    const symbol = await token.symbol();
    console.log("Token Symbol:", symbol);
  } catch (e) {
    console.log("Error reading token symbol. Is the token address correct on this network?");
  }

  try {
    const nextId = await marketplace.nextProductId();
    console.log("Marketplace nextProductId:", nextId.toString());

    for (let i = 1; i < Number(nextId); i++) {
       const p = await marketplace.products(i);
       console.log(`Product ${i}:`, p);
    }
  } catch (e) {
    console.log("Error reading marketplace data. Is the marketplace address correct on this network?");
  }
}

main().catch(console.error);
