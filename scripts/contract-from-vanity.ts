import { Address, beginCell, Cell, loadStateInit, toNano } from "@ton/core";
import type { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  const redirectAddress = provider.sender().address;
  if (!redirectAddress) {
    throw new Error("tcProvider sender address not provided");
  }

  const code = Cell.fromBase64("");
  const data = Cell.fromBase64("");

  const body = beginCell()
    .storeUint(0x29c102d1, 32)
    .storeAddress(redirectAddress)
    .storeRef(code)
    .storeRef(data)
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
