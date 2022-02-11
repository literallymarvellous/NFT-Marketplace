//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemSold;

  address payable owner;
  uint256 private listingPrice = 0.005 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    ERC721 nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) public idToMarketItem;

  event NewMarketItem(MarketItem markteitem);

  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  function listItem(ERC721 nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
    require(price > 0, "Price ust be at least 1 wei");
    require(msg.value == listingPrice, "Not equal to listing price");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    MarketItem memory listing = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );
    idToMarketItem[itemId] = listing;

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit NewMarketItem(idToMarketItem[itemId]);
  }

  function saleItem(ERC721 nftcontract, uint256 itemid) public payable nonReentrant {

    uint price = idToMarketItem[itemid].price;
    uint tokenId = idToMarketItem[itemid].tokenId;
    require(msg.value == price, "Not equal to asking price");
    idToMarketItem[itemid].seller.transfer(msg.value);
    IERC721(nftcontract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemid].owner = payable(msg.sender);
    idToMarketItem[itemid].sold = true;
    _itemSold.increment();
    payable(owner).transfer(listingPrice);
  }

  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);

    for (uint i = 0; i < itemCount; i++) {
      MarketItem memory listing = idToMarketItem[i + 1];
      if (listing.owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for(uint i =0; i < totalItemCount; i++) {
      if(idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }
    MarketItem[] memory items = new MarketItem[](itemCount);

    for (uint i = 0; i < itemCount; i++) {
      MarketItem memory listing = idToMarketItem[i + 1];
      if (listing.owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;

  }

  function fetchItemsCreated() public view returns(MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for(uint i =0; i < totalItemCount; i++) {
      if(idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }
    MarketItem[] memory items = new MarketItem[](itemCount);

    for (uint i = 0; i < itemCount; i++) {
      MarketItem memory listing = idToMarketItem[i + 1];
      if (listing.seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}