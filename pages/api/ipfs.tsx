import { create } from "ipfs-http-client";

const projectId = process.env.PROJECTID;
const projectSecret = process.env.PROJECTSECRET;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

export const ipfsClient = create({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});
