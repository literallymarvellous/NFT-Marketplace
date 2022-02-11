import hre from "hardhat"
import fs from 'fs'

async function main() {
  
  const Market = await hre.ethers.getContractFactory("NFTMarket");
  const market = await Market.deploy();
  await market.deployed();
  const marketAddress = market.address;
  console.log('marketAddress: ', marketAddress)

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(marketAddress);
  await nft.deployed();
  const nftAddress = nft.address;
  console.log('nft address: ', nftAddress)

  let config = `
  export const nftMarketAddress = "${market.address}"
  export const nftAddress = "${nft.address}"
  `;

  let data = JSON.stringify(config);
  fs.writeFileSync("config.ts", JSON.parse(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
