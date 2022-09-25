import { createReactClient, studioProvider } from "@livepeer/react";

const livePeerApiKey = process.env.LIVEPEERAPIKEY;

export const livePeerClient = createReactClient({
  provider: studioProvider({ apiKey: livePeerApiKey }),
});
