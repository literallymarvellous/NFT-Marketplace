import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();

    const marketAddress = market.address

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    const nftAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()
    console.log(listingPrice)

    const salePrice = ethers.utils.parseUnits('10', 'ether')
    
    let tx1 = await nft.createToken("https://marvel.com")
    await nft.createToken("https://marvel2.com");

    let tx = await tx1.wait()
    console.log(tx)

    await market.listItem(nftAddress, 1, salePrice, {value: listingPrice})
    await market.listItem(nftAddress, 2, salePrice, { value: listingPrice });

    const [_, buyerAddress] = await ethers.getSigners();

    await market.connect(buyerAddress).saleItem(nftAddress, 1, {value: salePrice})

    const items = await market.fetchMarketItems()
    const itemsCreated = await market.fetchItemsCreated()

    console.log('items created: ', itemsCreated)

    console.log('items: ', items)
  });
});
