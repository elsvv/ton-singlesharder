import { Address, Cell, loadStateInit, toNano } from "@ton/core";
import type { NetworkProvider } from "@ton/blueprint";

import { initVanityPayload } from "../src/contracts";

export async function run(provider: NetworkProvider) {
  const code = Cell.fromBase64("");
  const data = Cell.fromBase64("");

  const stateinitBase64 = "";
  const stateinitCell = Cell.fromBase64(stateinitBase64);

  const address = new Address(0, stateinitCell.hash());

  await provider.sender().send({
    to: address,
    value: toNano("0.1"),
    init: loadStateInit(stateinitCell.asSlice()),
    body: initVanityPayload(code, data),
  });
}
