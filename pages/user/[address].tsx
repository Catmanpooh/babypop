import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import {
  useAccount,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { parseEther } from "ethers/lib/utils";
import { client, search, getProfile } from "../api/profiles";
import { readTable, updateProductTableForUser } from "../api/tableLand";
import { siteWallet } from "../api/siteWallet";
import dates from "../utils/dates.json";
import { VideoPlayer } from "@livepeer/react";
import { fetchProfilesFromSite } from "../api/findProfileUsingHandle";
import { getUserPublications } from "../api/publicationsLens";

interface ProfilesData {
  profile: {
    id: string;
    name: string;
    bio: string;
    attributes: {
      displayType: string;
      traitType: string;
      key: string;
      value: string;
    }[];
    metadata: string;
  };
}

interface Search {
  items: {
    id: string;
    name: string;
    bio: string;
    attributes: {
      displayType: string;
      traitType: string;
      key: string;
      value: string;
    }[];
    metadata: string;
  }[];
}

interface ReadQueryResult<R extends Rows = Array<any>> {
  columns: Columns;
  rows: R;
}

// For context
type Columns = Array<{ name: string }>;
type Rows = Array<string | number | boolean>;

type Dates = {
  name: string;
  short: string;
  number: number;
  days: number;
};

type PurchaseItem = {
  to: string;
  value: string;
  id: number;
};

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_user_product = process.env.BABYPOPPRODUCTTABLE;

const videoPlayBackIds = [
  "2458o4ozd9elid3d",
  "ba6al1rok8n79s8n",
  "237bueg4xn2b5rxd",
  "a9754dye8668jmgz",
  "ecc92o2ohnfsbqbv",
  "4fa9d87dnc90dclw"
];

const AddressUserProfile = () => {
  const signer = siteWallet();
  const router = useRouter();
  const { address } = useAccount();
  const sqlAddress = router.query.address;
  const [userProfile, setUserProfile] = useState<ProfilesData>();
  const [userSearch, setUserSearch] = useState<Search>();
  const [userTableProfile, setUserTableProfile] = useState<ReadQueryResult>();
  const [userTableProduct, setUserTableProduct] = useState<ReadQueryResult>();
  const [userSearchTerm, setUserSearchTerm] = useState<string | undefined>();
  const [payForItem, setPayForItem] = useState<PurchaseItem>();
  const [playIds, setPlayIds] = useState<[] | undefined>();

  useEffect(() => {
    getUserProfileFromTable();
    getUserProductsFromTable();
    // fetchLivePeer();
    // const intervalId = setInterval(() => {
    //   getUserSocialProfile();
    // }, 1000 * 5); // in milliseconds
    // return () => clearInterval(intervalId);
  }, []);

//   console.log(playIds);
  const fetchLivePeer = () => {
    fetch("https://livepeer.studio/api/asset", {
      method: "get",
      headers: new Headers({
        Authorization: `Bearer ${process.env.LIVEPEERAPIKEY}`,
        "Content-Type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPlayIds(data);
      });
  };

  const getUserProfileFromTable = async () => {
    const sql_query = `SELECT * FROM ${babypop_user_table} WHERE wallet_address = '${sqlAddress}';`;
    const userInfo = await readTable({ sql_query, signer });
    setUserTableProfile(userInfo);
  };

  const getUserProductsFromTable = async () => {
    let sql_query = `SELECT * FROM ${babypop_user_product} WHERE wallet_address = '${address}';`;
    const userProducts = await readTable({ sql_query, signer });
    setUserTableProduct(userProducts);
  };

  const getUserSocialProfile = async () => {
    // console.log(await getUserPublications("0x05"));

    if (
      userTableProfile?.rows[0][5] !== null &&
      userTableProfile?.rows[0][5] !== undefined
    ) {
      const uProfile = await fetchProfilesFromSite(
        userTableProfile?.rows[0][5]
      );
      setUserProfile(uProfile);
    }
  };

  console.log(userProfile);

  const { config } = usePrepareSendTransaction({
    request: {
      to: payForItem?.to,
      value: payForItem?.value ? parseEther(payForItem?.value) : undefined,
    },
  });
  const { data, sendTransaction } = useSendTransaction({
    ...config,
    onSuccess: async () => {
      const userProducts = await updateProductTableForUser({
        payForItem,
        signer,
        address,
      });
      console.log("onSucccess transfer", userProducts);
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const purchaseForIndividual = (
    walletAddress: string,
    price: string,
    id: number
  ) => {
    price = "0.000005";
    setPayForItem({ to: walletAddress, value: price.toString(), id: id });
    sendTransaction?.();
  };

  const ProductView = () => {
    return (
      <div className="flex">
        {userTableProduct?.rows.map((product, index) => {
          return (
            <div className="py-6" key={index}>
              <div className="flex max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
                <img className="w-1/3" src={product[2]} alt="product image" />
                <div className="w-2/3 p-4">
                  <h1 className="text-gray-900 font-bold text-2xl">
                    {product[1]}
                  </h1>
                  <p className="mt-2 text-gray-600 text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit In
                    odit exercitationem fuga id nam quia
                  </p>

                  <div className="flex item-center justify-between mt-3">
                    <h1 className="text-gray-700 font-bold text-xl">
                      Matic: {product[4]}
                    </h1>
                    {userTableProfile?.rows.length !== 0 ? (
                      <button
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-full disabled:bg-gray-500"
                        disabled={isLoading || product[5] !== 0}
                        onClick={() => {
                          purchaseForIndividual(
                            product[6],
                            product[4],
                            product[0]
                          );
                        }}
                      >
                        {product[5] !== 0 ? "Purchased Thanks" : "Purchase"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ViewUserProfile = () => {
    const fullName = `${userTableProfile?.rows[0][1]} ${userTableProfile?.rows[0][2]}`;
    const arrivalDate = userTableProfile?.rows[0][7]?.split("-");
    const month = dates.find((date: Dates) => date.number == arrivalDate[0]);
    const imageSrc = userTableProfile?.rows[0][6];
    const userName = userTableProfile?.rows[0][5];

    const x = [1, 2, 3, 4];
    return (
      <div className="flex flex-col justify-between items-center tracking-wide">
        <div className="flex flex-col justify-between items-center">
          {imageSrc !== null ? (
            <img
              className="rounded-full border border-gray-100 shadow-sm w-32 h-32 my-4"
              src={imageSrc}
              alt="User Profile Image"
            />
          ) : null}
          {address === userTableProfile?.rows[0][4] ? (
            <button
              className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={() => router.push(`/user/profile/edit/${address}`)}
            >
              Update Profile
            </button>
          ) : null}
          <p className="my-4 text-2xl">
            {" "}
            <span className="font-semibold">
              {fullName.toUpperCase()}'s
            </span>{" "}
            Baby Registry
          </p>
          <p className="my-2 text-md">
            Arrival Date
            <span className=" mx-2 font-semibold underline decoration-1	">
              {month?.name} {arrivalDate[1]}, {arrivalDate[2]}
            </span>
          </p>
        </div>
        {userName !== null ? (
          <div className="flex no-scrollbar overflow-x-scroll w-3/4 h-52 mt-8">
            {videoPlayBackIds?.map((playId, index) => {
              return (
                <div key={index} className="mx-4">
                  <VideoPlayer
                    playbackId={playId}
                    muted
                    controls
                    autoPlay={false}
                    width={350}
                    height={450}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
        {userTableProduct?.rows.length !== 0 ? <ProductView /> : null}
      </div>
    );
  };

  return (
    <div className="container h-full w-screen flex justify-center items-center">
      {userTableProfile === null || userTableProfile === undefined ? null : (
        <ViewUserProfile />
      )}
    </div>
  );
};

export default AddressUserProfile;
