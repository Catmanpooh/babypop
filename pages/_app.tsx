import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { NavBar } from "../components/NavBar";
import { WagmiConfig, createClient, chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { livePeerClient } from "./api/livePeer";
import { LivepeerConfig } from "@livepeer/react";

const alchemyId = process.env.ALCHEMYID;

const client = createClient(
  getDefaultClient({
    appName: "Your App Name",
    alchemyId,
    chains: [chain.polygonMumbai],
  })
);

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Baby pop</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiConfig client={client}>
        <ConnectKitProvider theme="soft">
          <NavBar />
          <LivepeerConfig client={livePeerClient}>
            <Component {...pageProps} />
          </LivepeerConfig>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
};

export default MyApp;
