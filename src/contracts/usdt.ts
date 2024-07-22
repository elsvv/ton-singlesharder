import { Address, Cell } from "@ton/core";
import { calculateJettonWalletWithGovernanceStateinit } from "./jettonWithGovernance";

export const USDT_MAINNET_ADDR = Address.parse("EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs");

export function calculateUsdtJettonWalletStateinit(ownerAddressHash: Buffer): Cell {
  return calculateJettonWalletWithGovernanceStateinit(ownerAddressHash, USDT_MAINNET_ADDR);
}
