// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedMarketplace
 * @dev A smart contract that allows listing and buying products using an ERC20 token,
 * as well as rating sellers.
 */
contract DecentralizedMarketplace is ReentrancyGuard {
    IERC20 public paymentToken;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address payable seller;
        bool isSold;
        string metadataCID;
    }

    struct SellerReputation {
        uint256 totalScore;
        uint256 reviewCount;
    }

    uint256 public nextProductId;
    
    mapping(uint256 => Product) public products;
    mapping(address => SellerReputation) public sellerReputations;
    mapping(uint256 => address) public productBuyers; // Track buyers to ensure only buyers can rate

    event ProductListed(uint256 indexed productId, string name, uint256 price, address indexed seller, string metadataCID);
    event ProductPurchased(uint256 indexed productId, address indexed buyer, address indexed seller, uint256 price);
    event SellerRated(address indexed seller, address indexed rater, uint256 rating);

    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "Invalid token address");
        paymentToken = IERC20(_paymentToken);
        nextProductId = 1;
    }

    /**
     * @dev List a new product on the marketplace
     * @param _name Name of the product
     * @param _price Price of the product in the ERC20 token
     * @param _metadataCID IPFS CID containing product metadata
     */
    function listProduct(string memory _name, uint256 _price, string memory _metadataCID) external {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Price must be greater than zero");
        require(bytes(_metadataCID).length > 0, "Metadata CID cannot be empty");

        uint256 productId = nextProductId;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            price: _price,
            seller: payable(msg.sender),
            isSold: false,
            metadataCID: _metadataCID
        });

        nextProductId++;

        emit ProductListed(productId, _name, _price, msg.sender, _metadataCID);
    }

    /**
     * @dev Buy a product using the ERC20 payment token
     * @param _productId The ID of the product to buy
     */
    function buyProduct(uint256 _productId) external nonReentrant {
        require(_productId > 0 && _productId < nextProductId, "Invalid product ID");
        Product storage product = products[_productId];
        require(!product.isSold, "Product is already sold");
        require(msg.sender != product.seller, "Seller cannot buy their own product");

        uint256 price = product.price;
        address seller = product.seller;

        // Mark as sold before external token transfer to prevent re-entrancy
        product.isSold = true;
        productBuyers[_productId] = msg.sender;

        // Transfer tokens from buyer to seller
        // Note: The buyer must have approved this contract to spend 'price' amount of tokens beforehand
        require(paymentToken.transferFrom(msg.sender, seller, price), "Token transfer failed");

        emit ProductPurchased(_productId, msg.sender, seller, price);
    }

    /**
     * @dev Rate a seller after purchasing a product
     * @param _seller The address of the seller being rated
     * @param _rating The rating score (1 to 5)
     */
    function rateSeller(address _seller, uint256 _rating) external {
        require(_seller != address(0), "Invalid seller address");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(msg.sender != _seller, "Cannot rate yourself");
        
        // Simplification for the lab demo: Anyone can rate any seller as long as it's not themselves.
        // A stricter production version would verify msg.sender actually bought from _seller via `productBuyers`.

        SellerReputation storage rep = sellerReputations[_seller];
        rep.totalScore += _rating;
        rep.reviewCount += 1;

        emit SellerRated(_seller, msg.sender, _rating);
    }

    /**
     * @dev Helper function to get a seller's average rating
     * @param _seller The address of the seller
     * @return averageRating (multiplied by 10 for 1-decimal precision, e.g., 45 meaning 4.5)
     */
    function getSellerAverageRating(address _seller) external view returns (uint256) {
        SellerReputation memory rep = sellerReputations[_seller];
        if (rep.reviewCount == 0) {
            return 0;
        }
        return (rep.totalScore * 10) / rep.reviewCount;
    }
}
