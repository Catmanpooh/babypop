import { useState, useEffect, ChangeEvent } from "react";
import { connect } from "@tableland/sdk";
import { Wallet, providers } from "ethers";
import { useAccount, useSignMessage } from "wagmi";
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { client, createProfile, getProfile } from "../api/profiles";

const privateKey = process.env.PRIVATE_KEY!;
const wallet = new Wallet(privateKey);

const projectId = process.env.PROJECTID;
const projectSecret = process.env.PROJECTSECRET;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

const alchemyId = process.env.ALCHEMYID;

const provider = new providers.AlchemyProvider("maticmum", alchemyId);

const signer = wallet.connect(provider);

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_product_table = process.env.BABYPOPPRODUCTTABLE;

let ipfs: IPFSHTTPClient | undefined;
try {
  ipfs = create({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });
} catch (error) {
  console.error("IPFS error ", error);
  ipfs = undefined;
}

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

type DateOfArrival = {
  month?: string;
  day?: string;
  year?: string;
};

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
const product_obj = {
  id: 0,
  name: "",
  image: "",
  quantiy: 0,
  price: 0,
  purchased: 0,
  wallet_address: "",
};

const User = () => {
  const [user, setUser] = useState<UserProp | null>();
  const [babyDate, setBabyDate] = useState<DateOfArrival | null>();
  const [imageFile, setImageFile] = useState<FileList | null | undefined>();
  const [userWantsSocialProfile, setUserWantsSocialProfile] = useState(false);
  const [challenge, setChallenge] = useState<string>();

  const { address } = useAccount();

  const authenticateLensUser = async () => {
    const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
  `;

    const generateChallenge = async () => {
      return await client
        .query(GET_CHALLENGE, {
          request: {
            address,
          },
        })
        .toPromise();
    };

    const challengeResponse = await generateChallenge();
    // console.log(challengeResponse.data?.challenge.text);
    setChallenge(challengeResponse.data?.challenge.text);

    console.log(challenge);

    // signMessage();
  };

  const { signMessage } = useSignMessage({
    message: challenge,
    onSuccess: async (signature) => {
      let token = await authenticate(address!, signature);
      localStorage.setItem("auth_token", token.data.authenticate.accessToken);
      localStorage.setItem(
        "refresh_token",
        token.data.authenticate.refreshToken
      );
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const AUTHENTICATION = `
    mutation($request: SignedAuthChallenge!) { 
      authenticate(request: $request) {
        accessToken
        refreshToken
      }
   }
  `;

  const authenticate = async (address: string, signature: string) => {
    return await client
      .mutation(AUTHENTICATION, {
        request: {
          address,
          signature,
        },
      })
      .toPromise();
  };

  const writeUserTable = async () => {
    const rand = Math.floor(Math.random() * 100000000000) + 1;
    const bDate = `${babyDate?.month}-${babyDate?.day}-${babyDate?.year}`;

    setUser({
      ...user,
      id: rand,
      arrival_date: bDate,
      // image: `https://babypop.infura-ipfs.io/ipfs/${result.cid}`,
      wallet_address: address,
    });

    console.log(user);

    const tableland = await connect({
      signer,
      network: "testnet",
      chain: "polygon-mumbai",
    });

    const writeUserRes = await tableland.write(
      `INSERT INTO ${babypop_user_table} (id, first_name, last_name, location, wallet_address, arrival_date, adventure ) 
      VALUES ('${user?.id}' ,'${user?.first_name}', '${user?.last_name}', '${user?.location}', '${user?.wallet_address}' , '${user?.arrival_date}', '${user?.adventure}');`
    );

    // const writeProductRes = await tableland.create(
    //   `INSERT INTO ${babypop_user_table} (id, name, image, quantity, price, purchased, wallet_address) VALUES ();`
    // );

    console.log(writeUserRes);
  };

  const createUserProfile = async (imageString: string | null) => {
    try {
      const res = await client
        .mutation(createProfile, {
          request: {
            handle: user?.user_name,
            profilePictureUri: imageString,
          },
        })
        .toPromise();
      console.log(res);
      return res.data;
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchProfilesFromSite = async () => {
    try {
      const res = await client
        .query(getProfile, {
          request: {
            handle: `${user?.user_name}.test`,
          },
        })
        .toPromise();
      console.log(res.data.profile);
      return res.data;
    } catch (err) {
      console.log({ err });
    }
  };

  const updateUserTableForUserProfile = async () => {
    console.log(`Storing files...`);
    const result = await (ipfs as IPFSHTTPClient).add(imageFile![0]);

    console.log(`Stored files...`);
    console.log(`CID: ${result.cid}`);
    console.log(`Done`);

    const imageString = `https://babypop.infura-ipfs.io/ipfs/${result.cid}`;

    const txHash = await createUserProfile(imageString);

    console.log(txHash);

    const userProfile = await fetchProfilesFromSite();

    const socialProfileId = userProfile.profile.id;

    const tableland = await connect({
      signer,
      network: "testnet",
      chain: "polygon-mumbai",
    });

    const updateUserRes = await tableland.write(
      `UPDATE ${babypop_user_table}
      SET user_name = '${user?.user_name}', image = '${imageString}', social_profile = '${socialProfileId}'
      WHERE wallet_address='${address}';`
    );

    console.log(updateUserRes);
  };

  const readTable = async () => {
    const tableland = await connect({
      // signer,
      network: "testnet",
      chain: "polygon-mumbai",
    });

    await tableland.siwe();

    const readRes = await tableland.read(
      `SELECT * FROM ${babypop_user_table};`
    );
    const readRes1 = await tableland.read(
      `SELECT * FROM ${babypop_product_table};`
    );

    console.log(readRes, readRes1);
  };

  console.log(user);
  console.log(babyDate);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <main className="container flex flex-col justify-center items-center">
        <input
          className="form-select form-select-lg mb-3
          appearance-none
          block
          w-1/2
          px-4
          py-2
          text-xl
          font-normal
          text-gray-700
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="text"
          value={user?.first_name}
          placeholder="First Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setUser({ ...user, first_name: e.target.value });
          }}
        />

        <input
          className="form-select form-select-lg mb-3
          appearance-none
          block
          w-1/2
          px-4
          py-2
          text-xl
          font-normal
          text-gray-700
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="text"
          value={user?.last_name}
          placeholder="Last Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setUser({ ...user, last_name: e.target.value });
          }}
        />

        <div className="flex w-1/2">
        <select
            className="form-select form-select-lg mb-3
        appearance-none
        block
        w-2/6
        px-4
        py-2
        text-xl
        font-normal
        text-gray-700
        bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setBabyDate({ ...babyDate, month: e.target.value });
        }}
          >
            <option defaultValue="" selected disabled>
              Month
            </option>
            <option value="01">Janaury</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          <select
            className="form-select form-select-lg mb-3
        appearance-none
        block
        w-2/6
        px-4
        py-2
        text-xl
        font-normal
        text-gray-700
        bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setBabyDate({ ...babyDate, day: e.target.value });
            }}
          >
            <option defaultValue="" selected disabled>
              Day
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
            <option value="25">25</option>
            <option value="26">26</option>
            <option value="27">27</option>
            <option value="28">28</option>
            <option value="29">29</option>
            <option value="30">30</option>
            <option value="31">31</option>
          </select>

          <select
            className="form-select form-select-lg mb-3
        appearance-none
        block
        w-2/6
        px-4
        py-2
        text-xl
        font-normal
        text-gray-700
        bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setBabyDate({ ...babyDate, year: e.target.value });
            }}
          >
            <option defaultValue="" selected disabled>
              Year
            </option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <select
          className="form-select form-select-lg mb-3
        appearance-none
        block
        w-1/2
        px-4
        py-2
        text-xl
        font-normal
        text-gray-700
        bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUser({ ...user, location: e.target.value });
          }}
        >
          <option defaultValue="" selected disabled>
            Choose a State
          </option>

          <option value="AL">AL</option>
          <option value="AK">AK</option>
          <option value="AR">AR</option>
          <option value="AZ">AZ</option>
          <option value="CA">CA</option>
          <option value="CO">CO</option>
          <option value="CT">CT</option>
          <option value="DC">DC</option>
          <option value="DE">DE</option>
          <option value="FL">FL</option>
          <option value="GA">GA</option>
          <option value="HI">HI</option>
          <option value="IA">IA</option>
          <option value="ID">ID</option>
          <option value="IL">IL</option>
          <option value="IN">IN</option>
          <option value="KS">KS</option>
          <option value="KY">KY</option>
          <option value="LA">LA</option>
          <option value="MA">MA</option>
          <option value="MD">MD</option>
          <option value="ME">ME</option>
          <option value="MI">MI</option>
          <option value="MN">MN</option>
          <option value="MO">MO</option>
          <option value="MS">MS</option>
          <option value="MT">MT</option>
          <option value="NC">NC</option>
          <option value="NE">NE</option>
          <option value="NH">NH</option>
          <option value="NJ">NJ</option>
          <option value="NM">NM</option>
          <option value="NV">NV</option>
          <option value="NY">NY</option>
          <option value="ND">ND</option>
          <option value="OH">OH</option>
          <option value="OK">OK</option>
          <option value="OR">OR</option>
          <option value="PA">PA</option>
          <option value="RI">RI</option>
          <option value="SC">SC</option>
          <option value="SD">SD</option>
          <option value="TN">TN</option>
          <option value="TX">TX</option>
          <option value="UT">UT</option>
          <option value="VT">VT</option>
          <option value="VA">VA</option>
          <option value="WA">WA</option>
          <option value="WI">WI</option>
          <option value="WV">WV</option>
          <option value="WY">WY</option>
        </select>

        <select
          className="form-select form-select-lg mb-3
        appearance-none
        block
        w-1/2
        px-4
        py-2
        text-xl
        font-normal
        text-gray-700
        bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUser({ ...user, adventure: e.target.value });
          }}
        >
          <option defaultValue="" selected disabled>
            Choose You adventure
          </option>
          <option value="preganacy">Preganacy</option>
          <option value="adoption">Adoption</option>
          <option value="surrogacy">Surrogacy</option>
        </select>

        <div className="flex flex-col items-center w-1/2 justify-around">
          <p
            className="px-4
          py-2
          text-xl
          font-normal
          text-gray-700"
          >
            Would you like a social profile?
          </p>
          <button
            className=" w-1/2 px-4
          py-2
          text-xl
          font-normal
          text-gray-700  border border-solid border-gray-300
          rounded"
            onClick={() => setUserWantsSocialProfile(!userWantsSocialProfile)}
          >
            {userWantsSocialProfile ? "No" : "Yes"}
          </button>
        </div>

        <input
          type="file"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setImageFile(e.target.files);
          }}
          accept="image/*"
        />

        {userWantsSocialProfile ? (
          <input
            className="form-select form-select-lg mb-3
          appearance-none
          block
          w-1/2
          px-4
          py-2
          text-xl
          font-normal
          text-gray-700
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            type="text"
            value={user?.user_name}
            placeholder="User Name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setUser({ ...user, user_name: e.target.value });
            }}
          />
        ) : null}

        <button onClick={writeUserTable}>Write</button>
        <button onClick={readTable}>Read</button>
        <button onClick={updateUserTableForUserProfile}>Update</button>

        <button onClick={authenticateLensUser}>AuthToken</button>
        <button onClick={() => signMessage()}>Auth</button>
        <button onClick={() => fetchProfilesFromSite()}>Fetch</button>
      </main>
    </div>
  );
};

export default User;
