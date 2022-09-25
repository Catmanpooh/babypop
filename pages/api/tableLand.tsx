import { connect } from "@tableland/sdk";
import { Wallet } from "ethers";
import { IPFSHTTPClient } from "ipfs-http-client";
import { createUserProfile } from "../api/createLens";

const babypop_user_table = process.env.BABYPOPUSERTABLE;
const babypop_user_product = process.env.BABYPOPPRODUCTTABLE;

type ReadTable = {
  sql_query: string;
  signer: Wallet;
};

type UpdateTable = {
  ipfsClient: IPFSHTTPClient;
  imageFile: FileList | null | undefined;
  imageStringIn?: string | null;
  signer: Wallet;
  address: string | undefined;
  userName?: string;
};

type UpdateProductTable = {
  payForItem: PurchaseItem | undefined;
  signer: Wallet;
  address: string | undefined;
};

type PurchaseItem = {
  to: string;
  value: string;
  id: number;
};

export const readTable = async ({ sql_query, signer }: ReadTable) => {
  const tableland = await connect({
    signer,
    network: "testnet",
    chain: "polygon-mumbai",
  });

  await tableland.siwe();

  const readRes = await tableland.read(sql_query);

  return readRes;
};

export const updateUserTableForUserImage = async ({
  ipfsClient,
  imageFile,
  signer,
  address,
}: UpdateTable) => {
  console.log(`Storing files...`);
  const result = await ipfsClient.add(imageFile![0]);

  console.log(`Stored files...`);
  console.log(`CID: ${result.cid}`);
  console.log(`Done`);

  const imageString = `https://babypop.infura-ipfs.io/ipfs/${result.cid}`;

  const tableland = await connect({
    signer,
    network: "testnet",
    chain: "polygon-mumbai",
  });

  console.log(`Storing to db...`);

  const updateUserRes = await tableland.write(
    `UPDATE ${babypop_user_table}
    SET image = '${imageString}'
    WHERE wallet_address='${address}';`
  );
  console.log(`Done`);

  return updateUserRes;
};

export const updateUserTableForUserProfile = async ({
  ipfsClient,
  imageFile,
  imageStringIn,
  signer,
  address,
  userName,
}: UpdateTable) => {
  let imageString: string;

  if (
    imageFile?.length === 0 ||
    imageFile === null ||
    imageFile === undefined ||
    imageStringIn === null
  ) {
    console.log("imageString is being set");
    imageString = imageStringIn!;
  } else {
    console.log(`Storing files...`);
    const result = await ipfsClient.add(imageFile![0]);

    console.log(`Stored files...`);
    console.log(`CID: ${result.cid}`);
    console.log(`Done`);

    imageString = `https://babypop.infura-ipfs.io/ipfs/${result.cid}`;
  }
  console.log(`Creating profile...`);

  const txHash = await createUserProfile(userName!, imageString);

  console.log(txHash);

  console.log(`Fetching profile id...`);

  // Having a issue retriving the profile id not showing on localhost
  // Need to add line back to sql_query social_profile = '${socialProfileId}'
  // const userProfile = await fetchProfilesFromSite(userName!);

  // console.log(`User profile:`, userProfile);

  // const socialProfileId = userProfile.profile.id;

  const tableland = await connect({
    signer,
    network: "testnet",
    chain: "polygon-mumbai",
  });

  console.log(`Storing to db...`);

  const updateUserRes = await tableland.write(
    `UPDATE ${babypop_user_table}
    SET user_name = '${userName}', image = '${imageString}'
    WHERE wallet_address='${address}';`
  );

  console.log("Done");

  return updateUserRes;
};

export const updateProductTableForUser = async ({
  payForItem,
  signer,
  address,
}: UpdateProductTable) => {
  const tableland = await connect({
    signer,
    network: "testnet",
    chain: "polygon-mumbai",
  });

  console.log(`Storing to db...`);

  const updateProductRes = await tableland.write(
    `UPDATE ${babypop_user_product}
    SET purchased = '1'
    WHERE wallet_address='${address}' AND id='${payForItem?.id}';`
  );
  console.log(`Done`);

  return updateProductRes;
};
