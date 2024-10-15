import { Address, beginCell, Cell } from "@ton/core";
import { packStateinit } from "../utils";

export const PTON2_MAINNET_ADDR = Address.parse("EQBnGWMCf3-FZZq1W4IWcWiGAc3PHuZ0_H-7sad2oY00o83S");

const PTON2_JETTON_WALLET_CODE = Cell.fromBase64(
  "b5ee9c7201010101002300084202cd88e6f3c2a9cf01bb003a2837ec0d92c19685ed1dbfffd94a545dcfdf0a14d9"
);

export function calculatePTon2JettonWalletStateinit(ownerAddressHash: Buffer): Cell {
  const data = beginCell()
    .storeCoins(0) // balance
    .storeUint(2, 2) // Internal address
    .storeUint(0, 1) // No anycast
    .storeInt(0, 8) // Basechain
    .storeBuffer(ownerAddressHash)
    .storeAddress(PTON2_MAINNET_ADDR);

  return packStateinit(PTON2_JETTON_WALLET_CODE, data.endCell());
}
