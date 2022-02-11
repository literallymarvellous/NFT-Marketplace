import { ChangeEvent, FormEvent, useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

const client = ipfsHttpClient({url: "https://ipfs.infura.io:5001/api/v0"});

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { nftAddress, nftMarketAddress } from "../config";
import { NextPage } from "next";

const ListItem: NextPage = () => {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    } 
  };

  const createItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, description, price } = formInput;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      console.log('url: ', url);
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const createSale = async(url: string) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await nftContract.createToken(url);
    let tx = await transaction.wait();
    console.log(tx);

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await marketContract.listItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="flex justify-center">
        <form className="w-1/2 flex flex-col pb-12" onSubmit={createItem}>
          <input
            placeholder="Name"
            className="mt-8 border rounded p-4"
            required
            onChange={(e) =>
              setFormInput({ ...formInput, name: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            className="mt-2 border rounded p-4"
            required
            onChange={(e) =>
              setFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder="Price in Eth"
            className="mt-2 border rounded p-4"
            required
            onChange={(e) =>
              setFormInput({ ...formInput, price: e.target.value })
            }
          />
          <input
            required
            type="file"
            name="Asset"
            className="my-4"
            onChange={handleChange}
          />
          {fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )}
          <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
            Create Digital Asset
          </button>
        </form>
    </div>
  );
}

export default ListItem