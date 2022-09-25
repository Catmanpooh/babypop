import { client, GET_CHALLENGE, AUTHENTICATION } from "../api/profiles";

export const generateChallenge = async (address: string) => {
  return await client
    .query(GET_CHALLENGE, {
      request: {
        address,
      },
    })
    .toPromise();
};

export const authenticate = async (address: string, signature: string) => {
  return await client
    .mutation(AUTHENTICATION, {
      request: {
        address,
        signature,
      },
    })
    .toPromise();
};
