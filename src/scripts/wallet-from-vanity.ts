import { Address, beginCell, Cell, toNano } from "@ton/core";
import { WalletContractV3R2 } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import type { NetworkProvider } from "@ton/blueprint";
import { join } from "node:path";

import { TonConnectProvider, FSStorage } from "../utils";

export async function run(provider: NetworkProvider) {
  const tcProvider = new TonConnectProvider(
    new FSStorage(join(__dirname, "..", "tc-data", "data.json")),
    provider.ui()
  );

  await tcProvider.connect();

  const redirectAddress = tcProvider.address();
  if (redirectAddress) {
    throw new Error("tcProvider sender address not provided");
  }

  const mnemonic = await mnemonicNew();
  console.log("wallet mnemonic:");
  console.log(mnemonic);

  const keypair = await mnemonicToPrivateKey(mnemonic);

  const walletV3R2 = WalletContractV3R2.create({ workchain: 0, publicKey: keypair.publicKey });
  walletV3R2.init;

  const payload = beginCell()
    .storeUint(0x29c102d1, 32)
    .storeAddress(redirectAddress)
    .storeRef(walletV3R2.init.code)
    .storeRef(walletV3R2.init.data)
    .endCell();

  const stateinitBase64 =
    "te6cckEBBQEAugACATQBBAEU/wD0pBP0vPLICwIBltNsIiDHAPJAAdDTAwFxsPJA+kAwAdMfAYIQKcEC0bqOpO1E0PpAMBLHBfLimvpA1NQwAfsE7VSCCJiWgHD7AnABgwbbPOBbhA/y8AMAKHCAEMjLBVADzxZQA/oCy2rJAfsAAIOAFbgujDokg935oxOPqhUoCL59Iwk5bNrZp//A5jWtZ/NZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmsPbDRJiA2";
  const stateinitCell = Cell.fromBase64(stateinitBase64);

  const address = new Address(0, stateinitCell.hash());

  await tcProvider.sendTransactions([
    { address, amount: toNano("0.1"), stateInit: stateinitBase64, payload },
  ]);

  process.exit(0);
}
