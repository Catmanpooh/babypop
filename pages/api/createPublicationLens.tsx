import { client } from "../api/profiles";

export const createUserPublications = async (
  profileId: string,
  conentUri: string
) => {
  try {
    const res = await client
      .mutation(CREATE_PUBLICATION, {
        request: {
          profileId: profileId,
          contentURI: conentUri,
          collectModule: {
            freeCollectModule: true,
          },
          referenceModule: {
            followerOnlyReferenceModule: false,
          },
        },
      })
      .toPromise();
    return res.data;
  } catch (err) {
    console.log({ err });
  }
};

const CREATE_PUBLICATION = `mutation ($request: CreatePublicPostRequest!) {
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    }
  }`;
