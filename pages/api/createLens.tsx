import { client, createProfile } from "../api/profiles";

export const createUserProfile = async (
  userName: string,
  imageString: string | null
) => {
  try {
    const res = await client
      .mutation(createProfile, {
        request: {
          handle: userName,
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
