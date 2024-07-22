import { Address, Cell, beginCell } from "@ton/core";
import { basechainStateinitToAddress, packStateinit } from "../utils";

export const USDT_WALLET_CODE = Cell.fromBase64(
  "te6cckEBAQEAIwAIQgKPRS16Tf10BmtoI2UXclntBXNENb52tf1L1divK3w9aCBrv3Y="
);

export const USDT_MAINNET_ADDR = Address.parse("EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs");

export function calculateUsdtJettonWalletStateinit(
  ownerAddress: Address,
  jettonWalletCode = USDT_WALLET_CODE,
  jettonMasterAddress = USDT_MAINNET_ADDR
): Cell {
  const data = beginCell()
    .storeUint(0, 4 + 4) // status + balance
    .storeAddress(ownerAddress)
    .storeAddress(jettonMasterAddress)
    .endCell();

  return packStateinit(jettonWalletCode, data);
}

export function calculateUsdtJettonWalletAddress(
  ownerAddress: Address,
  jettonWalletCode = USDT_WALLET_CODE,
  jettonMasterAddress = USDT_MAINNET_ADDR
): Address {
  return basechainStateinitToAddress(
    calculateUsdtJettonWalletStateinit(ownerAddress, jettonWalletCode, jettonMasterAddress)
  );
}
