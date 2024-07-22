import { Address, beginCell, Builder, Cell } from "@ton/core";
import { packStateinit } from "../utils";

export const VANITY_CODE = Cell.fromBase64(
  "te6cckEBAwEAcQABFP8A9KQT9LzyyAsBAZbTbCIgxwDyQAHQ0wMBcbDyQPpAMAHTHwGCECnBAtG6jqTtRND6QDASxwXy4pr6QNTUMAH7BO1UggiYloBw+wJwAYMG2zzgW4QP8vACAChwgBDIywVQA88WUAP6AstqyQH7AG5tMOM="
);

export function calculateVanityStateinit(
  deployerAddress: Address,
  sault: bigint,
  additionalData?: Builder,
  code = VANITY_CODE
): Cell {
  let data = beginCell().storeAddress(deployerAddress).storeUint(sault, 256);
  if (additionalData) {
    const freeBits = 1023 - data.bits;
    if (additionalData.bits > freeBits) {
      throw new Error(
        `Can not write additional data to a VanityStateinit, additionalDataBits: ${additionalData.bits}, freeBits: ${freeBits}`
      );
    }
    data = data.storeBuilder(additionalData);
  }

  return packStateinit(code, data.endCell());
}
