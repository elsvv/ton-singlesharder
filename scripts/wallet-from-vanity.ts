import { Address, Cell, loadStateInit, toNano } from "@ton/core";
import { WalletContractV3R2 } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import type { NetworkProvider } from "@ton/blueprint";

import { initVanityPayload } from "../src/contracts";

export async function run(provider: NetworkProvider) {
  const mnemonic = await mnemonicNew();
  console.log("wallet mnemonic:");
  console.log(mnemonic);

  const keypair = await mnemonicToPrivateKey(mnemonic);

  const walletV3R2 = WalletContractV3R2.create({ workchain: 0, publicKey: keypair.publicKey });

  const stateinitBase64 = "";
  const stateinitCell = Cell.fromBase64(stateinitBase64);

  const address = new Address(0, stateinitCell.hash());

  await provider.sender().send({
    to: address,
    value: toNano("0.1"),
    init: loadStateInit(stateinitCell.asSlice()),
    body: initVanityPayload(walletV3R2.init.code, walletV3R2.init.data),
  });
}
