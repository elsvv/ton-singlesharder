import { Address, Cell, beginCell } from "@ton/core";
import { calculateJettonWalletWithGovernanceStateinit } from "./jettonWithGovernance";

export const USDT_MAINNET_ADDR = Address.parse("EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs");

export function calculateUsdtJettonWalletStateinit(ownerAddress: Address): Cell {
  return calculateJettonWalletWithGovernanceStateinit(ownerAddress, USDT_MAINNET_ADDR);
}
