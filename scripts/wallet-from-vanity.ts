import { Address, beginCell, Cell, loadStateInit, toNano } from "@ton/core";
import { WalletContractV3R2 } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import type { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  const redirectAddress = provider.sender().address;
  if (!redirectAddress) {
    throw new Error("tcProvider sender address not provided");
  }

  const mnemonic = await mnemonicNew();
  console.log("wallet mnemonic:");
  console.log(mnemonic);

  const keypair = await mnemonicToPrivateKey(mnemonic);

  const walletV3R2 = WalletContractV3R2.create({ workchain: 0, publicKey: keypair.publicKey });

  const body = beginCell()
    .storeUint(0x29c102d1, 32)
    .storeAddress(redirectAddress)
    .storeRef(walletV3R2.init.code)
    .storeRef(walletV3R2.init.data)
    .endCell();

  const stateinitBase64 = "";
  const stateinitCell = Cell.fromBase64(stateinitBase64);

  const address = new Address(0, stateinitCell.hash());

  await provider.sender().send({
    to: address,
    value: toNano("0.1"),
    init: loadStateInit(stateinitCell.asSlice()),
    body,
  });

  process.exit(0);
}
