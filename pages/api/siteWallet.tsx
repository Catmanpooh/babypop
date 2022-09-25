import { Wallet, providers } from "ethers";

export const siteWallet = () => {
  const privateKey = process.env.PRIVATE_KEY!;
  const wallet = new Wallet(privateKey);

  const alchemyId = process.env.ALCHEMYID;
  const provider = new providers.AlchemyProvider("maticmum", alchemyId);

  const signer = wallet.connect(provider);

  return signer;
};
