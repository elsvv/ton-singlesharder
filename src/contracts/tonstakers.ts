import { Address, beginCell, Cell } from "@ton/core";
import { packStateinit } from "../utils";

export const TONSTAKERS_MAINNET_ADDR = Address.parse(
  "EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav"
);

const TONSTAKERS_JETTON_WALLET_CODE = Cell.fromBase64(
  "te6cckEBAQEAIwAIQgISvrsNyOICt+Jvch4lR+FrueuuyTT2V9GfIudtYr7IeG61aNQ="
);

export function calculateTonstakersJettonWalletStateinit(ownerAddressHash: Buffer): Cell {
  const data = beginCell()
    .storeCoins(0)
    .storeUint(2, 2) // Internal address
    .storeUint(0, 1) // No anycast
    .storeInt(0, 8) // Basechain
    .storeBuffer(ownerAddressHash)
    .storeAddress(TONSTAKERS_MAINNET_ADDR)
    .storeRef(TONSTAKERS_JETTON_WALLET_CODE)
    .storeCoins(0)
    .storeUint(0, 48);

  return packStateinit(TONSTAKERS_JETTON_WALLET_CODE, data.endCell());
}
