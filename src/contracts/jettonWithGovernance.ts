import { Address, Cell, beginCell } from "@ton/core";
import { packStateinit } from "../utils";

export const USDT_WALLET_CODE = Cell.fromBase64(
  "te6cckEBAQEAIwAIQgKPRS16Tf10BmtoI2UXclntBXNENb52tf1L1divK3w9aCBrv3Y="
);

export function calculateJettonWalletWithGovernanceStateinit(
  ownerAddress: Address,
  jettonMasterAddress: Address
): Cell {
  const data = beginCell()
    .storeUint(0, 4 + 4) // status + balance
    .storeAddress(ownerAddress)
    .storeAddress(jettonMasterAddress)
    .endCell();

  return packStateinit(USDT_WALLET_CODE, data);
}
