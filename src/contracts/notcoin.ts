import { Address, Cell } from "@ton/core";
import { calculateJettonWalletWithGovernanceStateinit } from "./jettonWithGovernance";

export const NOTCOIN_MAINNET_ADDR = Address.parse(
  "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT"
);

export function calculateNotcoinJettonWalletStateinit(ownerAddressHash: Buffer): Cell {
  return calculateJettonWalletWithGovernanceStateinit(ownerAddressHash, NOTCOIN_MAINNET_ADDR);
}
