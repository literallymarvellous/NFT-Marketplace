import { NextPage } from "next";
import { useEffect, useState } from "react";

import { ethers } from 'ethers'
import Web3Modal from "web3modal"

import { nftAddress, nftMarketAddress } from "../config";
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

import { meta } from './index';

const CreatorDashboard: NextPage = () => {
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadNFTs = async() => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
      
    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const data = await marketContract.fetchItemsCreated()

    console.log(data);

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const res = await fetch(tokenUri);
      const meta: meta = await res.json();
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
      }
      return item
    }))

    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setIsLoading(false) 
  }

  useEffect(() => {
    loadNFTs()
  }, [])


  if (!isLoading && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No assets owned</h1>;

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Matic
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {sold.length > 0 ? (
          <div>
            <h2 className="text-2xl py-2">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="rounded" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null }
      </div>
    </div>
  );
}

export default CreatorDashboard