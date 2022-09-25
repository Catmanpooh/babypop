import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { client, search, getProfile } from "../../../api/profiles";
import { authenticate, generateChallenge } from "../../../api/lensLogin";
import {
  readTable,
  updateUserTableForUserImage,
  updateUserTableForUserProfile,
} from "../../../api/tableLand";
import { ipfsClient } from "../../../api/ipfs";
import { siteWallet } from "../../../api/siteWallet";
import dates from "../../../utils/dates.json";
import { UserInput } from "../../../../components/UserInput";
import { fetchProfilesFromSite } from "../../../api/findProfileUsingHandle";
import { useAsset, useCreateAsset, useAssetMetrics } from "@livepeer/react";
import { createUserPublications } from "../../../api/createPublicationLens";
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

const videoPlayBackIds = [
  "2458o4ozd9elid3d",
  "ba6al1rok8n79s8n",
  "237bueg4xn2b5rxd",
  "a9754dye8668jmgz",
  "ecc92o2ohnfsbqbv",
  "4fa9d87dnc90dclw"
];

const EditUserProfile = () => {
  const signer = siteWallet();
  const router = useRouter();
  const sqlAddress = router.query.address;

  const { address, isConnected } = useAccount();
  const [userTableProfile, setUserTableProfile] = useState<ReadQueryResult>();
  const [userTableProduct, setUserTableProduct] = useState<ReadQueryResult>();
  const [userProfile, setUserProfile] = useState<ProfilesData>();
  const [userName, setUserName] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<FileList | null | undefined>();
  const [challenge, setChallenge] = useState<string>();
  const [video, setVideo] = useState<File | undefined>();
  const [assetOne, setAssetOne] = useState<string | undefined>();
  const { mutate: createAsset, data: asset, status, error } = useCreateAsset();

  useEffect(() => {
    getUserProfileFromTable();
    authenticateLensUser();
    getUserSocialProfile();
  }, []);

  useEffect(() => {
    setVideo(undefined);
    setAssetOne(assetOne);
    // addUserPublications();
  }, [asset]);

  const getUserProfileFromTable = async () => {
    const sql_query = `SELECT * FROM ${babypop_user_table} WHERE wallet_address = '${sqlAddress}';`;
    const userInfo = await readTable({ sql_query, signer });
    setUserTableProfile(userInfo);
  };

  const getUserSocialProfile = async () => {
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

  const addUserPublications = async () => {
    if (
      (userProfile !== null && userProfile !== undefined) ||
      (asset?.storage?.ipfs?.gatewayUrl !== undefined &&
        asset?.storage?.ipfs?.gatewayUrl !== null)
    ) {
      authenticateLensUser();
      signMessage();
      const res = await createUserPublications(
        userProfile?.profile.id!,
        asset?.storage?.ipfs?.gatewayUrl!
      );
      console.log(res);
    }
  };

  const updateUserSocialInfo = async () => {
    let x = imageFile?.length;

    if (imageFile !== undefined && imageFile !== null && x !== 0) {
      await updateUserTableForUserImage({
        ipfsClient,
        imageFile,
        signer,
        address,
      });
    }
  };

  const authenticateLensUser = async () => {
    const challengeResponse = await generateChallenge(address!);
    setChallenge(challengeResponse.data?.challenge.text);
  };

  const { signMessage } = useSignMessage({
    message: challenge,
    onSuccess: async (signature) => {
      let token = await authenticate(address!, signature);
      console.log(token);

      localStorage.setItem("auth_token", token.data.authenticate.accessToken);
      localStorage.setItem(
        "refresh_token",
        token.data.authenticate.refreshToken
      );
      if (userName !== undefined) {
        let imageStringIn: string | null;

        if (
          imageFile?.length === 0 ||
          imageFile === null ||
          imageFile === undefined
        ) {
          imageStringIn = userTableProfile?.rows[0][6];
        } else {
          imageStringIn = null;
        }

        await updateUserTableForUserProfile({
          ipfsClient,
          imageFile,
          imageStringIn,
          signer,
          address,
          userName,
        });
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const ViewHeaderConent = () => {
    const fullName = `${userTableProfile?.rows[0][1]} ${userTableProfile?.rows[0][2]}`;
    const arrivalDate = userTableProfile?.rows[0][7].split("-");
    const month = dates.find((date: Dates) => date.number == arrivalDate[0]);
    const imageSrc = userTableProfile?.rows[0][6];
    const socialAccount = userTableProfile?.rows[0][9];
    const x = [1, 2, 3, 4];

    return (
      <div className="flex flex-col justify-between items-center">
        {imageSrc !== null ? (
          <img
            className="rounded-full border border-gray-100 shadow-sm w-32 h-32 my-4"
            src={imageSrc}
            alt="User Profile Image"
          />
        ) : null}
        <p className="my-4 text-2xl">
          <span className="font-semibold">{fullName.toUpperCase()}'s</span> Baby
          Registry
        </p>
        <p className="my-2 text-md">
          Arrival Date
          {arrivalDate !== undefined ? (
            <span className=" mx-2 font-semibold underline decoration-1	">
              {month?.name} {arrivalDate[1]}, {arrivalDate[2]}
            </span>
          ) : null}
        </p>
        {socialAccount !== null ? (
          <div className="flex no-scrollbar overflow-x-scroll w-3/4 my-8">
            {videoPlayBackIds.map((playId, index) => {
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
      </div>
    );
  };

  return (
    <div className="container h-full w-screen flex justify-center items-center">
      {userTableProfile !== undefined ? (
        <div className="flex flex-col justify-between items-center tracking-wide">
          <ViewHeaderConent />

          <div className="flex flex-col my-8 justify-center items-center">
            <input
              className="text-md
              font-normal
              text-gray-700
              file:mr-5 file:py-2 file:px-4
              file:rounded-full file:border-0
               file:font-bold
              file:bg-blue-500 file:text-white file:hover:bg-blue-700"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setImageFile(e.target.files);
              }}
              accept="image/*"
            />
            <button
              className="mt-8 w-3/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={updateUserSocialInfo}
            >
              Update Profile Image
            </button>
            {userTableProfile?.rows[0][5] === null ? (
              <div className="flex flex-col h-24 my-4 justify-between">
                <p className="text-xl my-6">
                  Would you like to create a social profile?
                </p>
                <UserInput
                  title="User Name"
                  type="text"
                  placeholder="User Name"
                  styles=""
                  value={userName}
                  isRequired={true}
                  handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUserName(e.target.value)
                  }
                />
                <button
                  className="mt-8 w-3/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => signMessage()}
                >
                  Create Social Profile
                </button>
              </div>
            ) : null}
            {userTableProfile?.rows[0][5] !== null ? (
              <div className="flex flex-col my-8 justify-center items-center">
                {assetOne === undefined ? (
                  <>
                    <input
                      className="text-md
              font-normal
              text-gray-700
              file:mr-5 file:py-2 file:px-4
              file:rounded-full file:border-0
               file:font-bold
              file:bg-blue-500 file:text-white file:hover:bg-blue-700"
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setVideo(e?.target?.files?.[0]);
                      }}
                      accept="video/*"
                    />
                    <button
                      className="mt-8 w-3/4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-full"
                      disabled={!!video || status === "loading"}
                      onClick={() => {
                        if (video) {
                          createAsset({
                            name: video.name,
                            file: video,
                          });
                        }
                      }}
                    >
                      Upload Video
                    </button>{" "}
                  </>
                ) : (
                  <button
                    className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => {
                      signMessage();
                    }}
                  >
                    Publish to your social
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EditUserProfile;
