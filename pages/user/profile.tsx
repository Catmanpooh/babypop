import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { client, search, getProfile } from "../api/profiles";
import { readTable } from "../api/tableLand";
import { siteWallet } from "../api/siteWallet";
import dates from "../utils/dates.json";

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

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_user_product = process.env.BABYPOPPRODUCTTABLE;

const UserProfile = () => {
  const signer = siteWallet();
  const router = useRouter();
  const { address } = useAccount();
  const sqlQuerySearch = router.query;
  const [userProfile, setUserProfile] = useState<ProfilesData>();
  const [userSearch, setUserSearch] = useState<Search>();
  const [userTableProfile, setUserTableProfile] = useState<ReadQueryResult>();
  const [userTableProduct, setUserTableProduct] = useState<ReadQueryResult>();
  const [userSearchTerm, setUserSearchTerm] = useState<string | undefined>();

  useEffect(() => {
    readTableUserId();
  }, []);

  const readTableUserId = async () => {
    let sql_query: string;
    let term = sqlQuerySearch?.term as string;

    switch (sqlQuerySearch.number?.toString()) {
      case "0":
        setUserSearchTerm(term);
        sql_query = `SELECT * FROM ${babypop_user_table} WHERE wallet_address = '${term}';`;
        break;
      case "1":
        let fullName = term.split(" ");
        let first_name = fullName[0];
        let last_name = fullName[1];
        setUserSearchTerm(`${first_name} ${last_name}`);
        sql_query = `SELECT * FROM ${babypop_user_table} WHERE first_name = '${first_name}' OR last_name = '${last_name}';`;
        break;
      default:
        sql_query = `SELECT * FROM ${babypop_user_table}`;
    }

    try {
      const userInfo = await readTable({ sql_query, signer });
      if (userInfo.rows.length !== 0) {
        setUserTableProfile(userInfo);
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
        sql_query = `SELECT * FROM ${babypop_user_table}`;
        const userInfoEveryProfile = await readTable({ sql_query, signer });
        setUserTableProfile(userInfoEveryProfile);
      }
    } catch (err) {
      console.log(err);
    }
  };

  

  // const fetchProfilesFromSite = async () => {
  //   try {
  //     const res = await client
  //       .query(getProfile, {
  //         request: {
  //           profileId: Profile,
  //         },
  //       })
  //       .toPromise();
  //     console.log(res.data);
  //     setUserProfile(res.data);
  //   } catch (err) {
  //     console.log({ err });
  //   }
  // };
  // const fetchSearch = async () => {
  //   try {
  //     const res = await client
  //       .query(search, {
  //         request: {
  //           query: Profile,
  //           type: "PROFILE",
  //           limit: 10,
  //         },
  //       })
  //       .toPromise();
  //     console.log(res.data);
  //     setUserSearch(res.data);
  //   } catch (err) {
  //     console.log({ err });
  //   }
  // };

  // if (typeof Profile === "string" && Profile.substr(0, 2) === "0x") {
  //   fetchProfilesFromSite();
  // } else {
  //   fetchSearch();
  // }

  const PageNotFound = () => {
    return (
      <div className="h-24 my-8 text-center">
        <h1 className="text-xl font-normal">
          User {userSearchTerm === undefined ? "" : userSearchTerm} was not
          found!
        </h1>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => router.back()}
        >
          Search Again
        </button>
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
          <div className="flex no-scrollbar overflow-x-scroll w-3/4 my-8">
            {x.map((element) => {
              return (
                <div className="w-32 h-40 mx-4 rounded shadow-lg">
                  <p className="">{element}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const ViewUserTable = () => {
    return (
      <div className="flex flex-col mt-8">
        <table className="table-auto w-full">
          <thead className="bg-white border-b">
            <tr>
              <th
                scope="col"
                className="text-md font-medium text-gray-900 px-6 py-4 text-left"
              >
                Name
              </th>
              <th
                scope="col"
                className="text-md font-medium text-gray-900 px-6 py-4 text-left"
              >
                Location
              </th>
              <th
                scope="col"
                className="text-md font-medium text-gray-900 px-6 py-4 text-left"
              >
                Arrival Date
              </th>
            </tr>
          </thead>
          <tbody>
            {userTableProfile?.rows.map((row, index) => {
              return (
                <tr
                  key={index}
                  className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
                  onClick={() => router.push(`/user/${row[4]}`)}
                >
                  <td className=" flex items-center text-md text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    <img
                      className="w-12 h-12 mr-2 rounded-full"
                      src={row[6]}
                      alt="user image"
                    />
                    {row[1]} {row[2]}
                  </td>
                  <td className="text-md text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {row[3]}
                  </td>
                  <td className="text-md text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {row[7]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const UserProfile = () => {
    return (
      <div className="w-3/4">
        {userTableProfile?.rows.length !== undefined &&
        userTableProfile?.rows.length > 0 ? (
          <ViewUserTable />
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
