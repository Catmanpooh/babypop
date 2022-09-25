import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { client, search, getProfile } from "../../api/profiles";
import { readTable } from "../../api/tableLand";
import { siteWallet } from "../../api/siteWallet";
import dates from "../../utils/dates.json";
import { VideoPlayer } from "@livepeer/react";

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

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_user_product = process.env.BABYPOPPRODUCTTABLE;

const videoPlayBackIds = [
  "2458o4ozd9elid3d",
  "ba6al1rok8n79s8n",
  "237bueg4xn2b5rxd",
  "a9754dye8668jmgz",
  "ecc92o2ohnfsbqbv",
  "4fa9d87dnc90dclw",
];

const UserProfile = () => {
  const signer = siteWallet();
  const router = useRouter();
  const { address } = useAccount();
  const sqlQuerySearch = router.query;
  const [userProfile, setUserProfile] = useState<ProfilesData>();
  const [userTableProfile, setUserTableProfile] = useState<ReadQueryResult>();
  const [userTableProduct, setUserTableProduct] = useState<ReadQueryResult>();
  const [userSearchTerm, setUserSearchTerm] = useState<string | undefined>();

  useEffect(() => {
    readTableUserId();
  }, []);

  const readTableUserId = async () => {
    let sql_query: string;

    switch (sqlQuerySearch?.number) {
      case "0":
        setUserSearchTerm(address);
        sql_query = `SELECT * FROM ${babypop_user_table} WHERE wallet_address = '${address}';`;
      case "1":
        let first_name = sqlQuerySearch?.first_name;
        let last_name = sqlQuerySearch?.last_name;
        console.log(first_name, last_name);
        setUserSearchTerm(`${first_name} ${last_name}`);
        sql_query = `SELECT * FROM ${babypop_user_table} WHERE first_name = '${first_name}' OR last_name = '${last_name}';`;
      default:
        sql_query = `SELECT * FROM ${babypop_user_table}`;
    }

    try {
      const userInfo = await readTable({ sql_query, signer });
      console.log(userInfo);
      if (userInfo.rows.length !== 0) {
        setUserTableProfile(userInfo);
        sql_query = `SELECT * FROM ${babypop_user_product} WHERE wallet_address = '${address}';`;
        const userProducts = await readTable({ sql_query, signer });
        console.log(userProducts);

        if (userProducts.rows.length !== 0) {
          setUserTableProduct(userProducts);
        } else {
          setUserTableProduct(undefined);
        }
      } else {
        setUserTableProfile(undefined);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const PageNotFound = () => {
    return (
      <div>
        <h1>
          User {userSearchTerm !== undefined ? "" : userSearchTerm} was not
          found!
        </h1>
      </div>
    );
  };

  const EditUserProfile = () => {
    const fullName = `${userTableProfile?.rows[0][1]} ${userTableProfile?.rows[0][2]}`;
    const arrivalDate = userTableProfile?.rows[0][7].split("-");
    const month = dates.find((date: Dates) => date.number == arrivalDate[0]);
    const imageSrc = userTableProfile?.rows[0][6];

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
          <p className="my-4 text-2xl">
            <span className="font-semibold">{fullName.toUpperCase()}'s</span>
            Baby Registry
          </p>
          <p className="my-2 text-md">
            Arrival Date
            <span className=" mx-2 font-semibold underline decoration-1	">
              {month?.name} {arrivalDate[1]}, {arrivalDate[2]}
            </span>
          </p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <button
            className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => router.push(`/user/profile/edit/${address}`)}
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  };

  const ViewUserProfile = () => {
    const fullName = `${userTableProfile?.rows[0][1]} ${userTableProfile?.rows[0][2]}`;
    const arrivalDate = userTableProfile?.rows[0][7].split("-");
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
          <p className="my-4 text-2xl">
            <span className="font-semibold">{fullName.toUpperCase()}'s</span>
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
          <div className="flex no-scrollbar overflow-x-scroll w-3/4 my-8">
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
        <div></div>
      </div>
    );
  };

  const UserProfile = () => {
    return (
      <div className="">
        {address === userTableProfile?.rows[0][4] ? (
          <EditUserProfile />
        ) : (
          <ViewUserProfile />
        )}
      </div>
    );
  };

  return (
    <div className="container h-full w-screen flex justify-center items-center">
      {userTableProfile === null || userTableProfile === undefined ? (
        <PageNotFound />
      ) : (
        <UserProfile />
      )}
    </div>
  );
};

export default UserProfile;
