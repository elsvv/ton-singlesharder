import { Address, Cell, beginCell } from "@ton/core";
import { packStateinit } from "../utils";

export const USDT_WALLET_CODE = Cell.fromBase64(
  "te6cckEBAQEAIwAIQgKPRS16Tf10BmtoI2UXclntBXNENb52tf1L1divK3w9aCBrv3Y="
);

/**
 * Calculates only for ownerAddress as Internal address in basechain
 */
export function calculateJettonWalletWithGovernanceStateinit(
  ownerAddressHash: Buffer,
  jettonMasterAddress: Address
): Cell {
  const data = beginCell()
    .storeUint(0, 4 + 4) // status + balance
    .storeUint(2, 2) // Internal address
    .storeUint(0, 1) // No anycast
    .storeInt(0, 8) // Basechain
    .storeBuffer(ownerAddressHash)
    .storeAddress(jettonMasterAddress)
    .endCell();

  return packStateinit(USDT_WALLET_CODE, data);
}
