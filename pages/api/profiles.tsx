import { createClient } from "urql";

const production = false;

const API_URL = production
  ? "https://api.lens.dev"
  : "https://api-mumbai.lens.dev";

export const client = createClient({
  url: API_URL,
  fetchOptions: () => {
    const token = localStorage.getItem("auth_token");
    return {
      headers: { "x-access-token": token ? `Bearer ${token}` : "" },
    };
  },
});

export const createProfile = `
mutation($request: CreateProfileRequest!) { 
  createProfile(request: $request) {
    ... on RelayerResult {
      txHash
    }
    ... on RelayError {
      reason
    }
          __typename
  }
}`;

export const AUTHENTICATION = `
mutation($request: SignedAuthChallenge!) { 
  authenticate(request: $request) {
    accessToken
    refreshToken
  }
}
`;

export const GET_CHALLENGE = `
query($request: ChallengeRequest!) {
  challenge(request: $request) { text }
}
`;

export const recommendedProfiles = `
query RecommendedProfiles {
    recommendedProfiles {
          id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
          followNftAddress
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        dispatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
           type
          }
          ... on RevertFollowModuleSettings {
           type
          }
        }
    }
  }
`;

export const search = `
query($request: SearchQueryRequest!) {
  search(request: $request) {
          ... on PublicationSearchResult {
     __typename 
    items {
      __typename 
      ... on Comment {
        ...CommentFields
      }
      ... on Post {
        ...PostFields
      }
    }
    pageInfo {
      prev
      totalCount
      next
    }
  }
  ... on ProfileSearchResult {
    __typename 
    items {
      ... on Profile {
        ...ProfileFields
      }
    }
    pageInfo {
      prev
      totalCount
      next
    }
   }
  }
}

fragment MediaFields on Media {
url
mimeType
}

fragment MirrorBaseFields on Mirror {
id
profile {
  ...ProfileFields
}
stats {
  ...PublicationStatsFields
}
metadata {
  ...MetadataOutputFields
}
createdAt
collectModule {
  ...CollectModuleFields
}
referenceModule {
  ... on FollowOnlyReferenceModuleSettings {
    type
  }
}
appId
}

fragment ProfileFields on Profile {
profileId: id,
name
bio
attributes {
  displayType
  traitType
  key
  value
}
isFollowedByMe
isFollowing(who: null)
metadataUrl: metadata
isDefault
handle
picture {
  ... on NftImage {
    contractAddress
    tokenId
    uri
    verified
  }
  ... on MediaSet {
    original {
      ...MediaFields
    }
  }
}
coverPicture {
  ... on NftImage {
    contractAddress
    tokenId
    uri
    verified
  }
  ... on MediaSet {
    original {
      ...MediaFields
    }
  }
}
ownedBy
dispatcher {
  address
}
stats {
  totalFollowers
  totalFollowing
  totalPosts
  totalComments
  totalMirrors
  totalPublications
  totalCollects
}
followModule {
  ... on FeeFollowModuleSettings {
    type
    amount {
      asset {
        name
        symbol
        decimals
        address
      }
      value
    }
    recipient
  }
  ... on ProfileFollowModuleSettings {
   type
  }
  ... on RevertFollowModuleSettings {
   type
  }
}
}

fragment PublicationStatsFields on PublicationStats { 
totalAmountOfMirrors
totalAmountOfCollects
totalAmountOfComments
}

fragment MetadataOutputFields on MetadataOutput {
name
description
content
media {
  original {
    ...MediaFields
  }
}
attributes {
  displayType
  traitType
  value
}
}

fragment Erc20Fields on Erc20 {
name
symbol
decimals
address
}

fragment CollectModuleFields on CollectModule {
__typename
  ... on FreeCollectModuleSettings {
      type
  followerOnly
  contractAddress
}
... on FeeCollectModuleSettings {
  type
  amount {
    asset {
      ...Erc20Fields
    }
    value
  }
  recipient
  referralFee
}
... on LimitedFeeCollectModuleSettings {
  type
  collectLimit
  amount {
    asset {
      ...Erc20Fields
    }
    value
  }
  recipient
  referralFee
}
... on LimitedTimedFeeCollectModuleSettings {
  type
  collectLimit
  amount {
    asset {
      ...Erc20Fields
    }
    value
  }
  recipient
  referralFee
  endTimestamp
}
... on RevertCollectModuleSettings {
  type
}
... on TimedFeeCollectModuleSettings {
  type
  amount {
    asset {
      ...Erc20Fields
    }
    value
  }
  recipient
  referralFee
  endTimestamp
}
}

fragment PostFields on Post {
id
profile {
  ...ProfileFields
}
stats {
  ...PublicationStatsFields
}
metadata {
  ...MetadataOutputFields
}
createdAt
collectModule {
  ...CollectModuleFields
}
referenceModule {
  ... on FollowOnlyReferenceModuleSettings {
    type
  }
}
appId
  hidden
  reaction(request: null)
  mirrors(by: null)
hasCollectedByMe
}

fragment CommentBaseFields on Comment {
id
profile {
  ...ProfileFields
}
stats {
  ...PublicationStatsFields
}
metadata {
  ...MetadataOutputFields
}
createdAt
collectModule {
  ...CollectModuleFields
}
referenceModule {
  ... on FollowOnlyReferenceModuleSettings {
    type
  }
}
appId
hidden
reaction(request: null)
  mirrors(by: null)
hasCollectedByMe
}

fragment CommentFields on Comment {
...CommentBaseFields
mainPost {
  ... on Post {
    ...PostFields
  }
  ... on Mirror {
    ...MirrorBaseFields
    mirrorOf {
      ... on Post {
         ...PostFields          
      }
      ... on Comment {
         ...CommentMirrorOfFields        
      }
    }
  }
}
}

fragment CommentMirrorOfFields on Comment {
...CommentBaseFields
mainPost {
  ... on Post {
    ...PostFields
  }
  ... on Mirror {
     ...MirrorBaseFields
  }
}
}
`;

export const getProfile = `
  query($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        followNftAddress
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        dispatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
            type
          }
          ... on RevertFollowModuleSettings {
            type
          }
        }
    }
  }
`;
export const userProfiles = `query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        followNftAddress
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        dispatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
           type
          }
          ... on RevertFollowModuleSettings {
           type
          }
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }`;

export const exploreProfiles = `
query($request: ExploreProfileResult!) {
  exploreProfiles(request: $request) {
    items {
      id
      name
      bio
      isDefault
      attributes {
        displayType
        traitType
        key
        value
      }
      metadata
      handle
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          chainId
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
      }
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          chainId
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
      }
      ownedBy
      dispatcher {
        address
        canUseRelay
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          contractAddress
          amount {
            asset {
              name
              symbol
              decimals
              address
            }
            value
          }
          recipient
        }
        ... on ProfileFollowModuleSettings {
        type
        }
        ... on RevertFollowModuleSettings {
        type
        }
      }
    }
    pageInfo {
      prev
      next
      totalCount
    }
  }
}`;
