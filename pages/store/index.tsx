import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { connect } from "@tableland/sdk";
import { Wallet, providers } from "ethers";
import { useAccount } from "wagmi";
import { readTable } from "../api/tableLand";
import { siteWallet } from "../api/siteWallet";

type UserProp = {
  id?: number;
  first_name?: string;
  last_name?: string;
  location?: string;
  user_name?: string;
  wallet_address?: string;
  image?: string;
  arrival_date?: string;
  adventure?: string;
  social_profile?: string;
};

type Product = {
  name: string;
  image: string;
  price: number;
};

interface ReadQueryResult<R extends Rows = Array<any>> {
  columns: Columns;
  rows: R;
}

// For context
type Columns = Array<{ name: string }>;
type Rows = Array<string | number | boolean>;

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_user_product = process.env.BABYPOPPRODUCTTABLE;

const products = [
  {
    name: "Bottle",
    image:
      "https://gateway.pinata.cloud/ipfs/QmRmtk7BahPGigM8NaXZhc86va1MSdTXUx8iGLyAoAUAk7/babyBottle.jpg",
    price: 1,
  },
  {
    name: "Clothes",
    image:
      "https://gateway.pinata.cloud/ipfs/QmRmtk7BahPGigM8NaXZhc86va1MSdTXUx8iGLyAoAUAk7/babyClothes.jpg",
    price: 2,
  },
  {
    name: "Diapers",
    image:
      "https://gateway.pinata.cloud/ipfs/QmRmtk7BahPGigM8NaXZhc86va1MSdTXUx8iGLyAoAUAk7/diapers.jpg",
    price: 1,
  },
  {
    name: "Snuggie",
    image:
      "https://gateway.pinata.cloud/ipfs/QmRmtk7BahPGigM8NaXZhc86va1MSdTXUx8iGLyAoAUAk7/snuggie.jpg",
    price: 3,
  },
];

const Store = () => {
  const signer = siteWallet();
  const { address, isConnected } = useAccount();
  const [userTableProfile, setUserTableProfile] = useState<ReadQueryResult>();

  useEffect(() => {
    getUserProfileFromTable();
  }, []);

  const getUserProfileFromTable = async () => {
    const sql_query = `SELECT * FROM ${babypop_user_table} WHERE wallet_address = '${address}';`;
    const userInfo = await readTable({ sql_query, signer });
    setUserTableProfile(userInfo);
  };

  const addToRegistry = async (product: Product) => {
    const rand = Math.floor(Math.random() * 100000000000) + 1;

    try {
      const tableland = await connect({
        signer,
        network: "testnet",
        chain: "polygon-mumbai",
      });

      console.log("Writting to database.....");
      const writeProductRes = await tableland.write(
        `INSERT INTO ${babypop_user_product} (id, name, image, quantity, price, purchased, wallet_address) 
        VALUES ('${rand}', '${product.name}','${product.image}', '1', '${product.price}', '0', '${address}');`
      );
      console.log(writeProductRes);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-full w-screen flex flex-col justify-center items-center">
      <main className="container my-16 mx-auto flex flex-col justify-center items-center">
        <div className="text-center h-24">
          <h1 className="flex-wrap text-4xl">Check out the store</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => {
            return (
              <div className="py-6" key={index}>
                <div className="flex max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
                  <img
                    className="w-1/3"
                    src={product.image}
                    alt="product image"
                  />
                  <div className="w-2/3 p-4">
                    <h1 className="text-gray-900 font-bold text-2xl">
                      {product.name}
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit In
                      odit exercitationem fuga id nam quia
                    </p>
                    <div className="flex item-center mt-2">
                      <svg
                        className="w-5 h-5 fill-current text-gray-700"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                      <svg
                        className="w-5 h-5 fill-current text-gray-700"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                      <svg
                        className="w-5 h-5 fill-current text-gray-700"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                      <svg
                        className="w-5 h-5 fill-current text-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                      <svg
                        className="w-5 h-5 fill-current text-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    </div>
                    <div className="flex item-center justify-between mt-3">
                      <h1 className="text-gray-700 font-bold text-xl">
                        Matic: {product.price}
                      </h1>
                      {userTableProfile?.rows.length !== 0 ? (
                        <button
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-full"
                          onClick={() => addToRegistry(product)}
                        >
                          Add To Registry
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Store;
