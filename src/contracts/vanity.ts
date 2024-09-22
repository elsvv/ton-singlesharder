import { Address, beginCell, Builder, Cell } from "@ton/core";
import { packStateinit } from "../utils";

/*
  ;; As https://github.com/ton-community/vanity-contract but with init op-code and without padding and 'end_parse' check

  () recv_internal(cell in_msg_full, slice in_msg_body) impure {
    throw_if(0, in_msg_body.slice_empty?()); ;; ignore all empty messages

    slice cs = in_msg_full.begin_parse();

    slice sender_addr = cs~load_msg_addr();

    throw_unless(0xffff, in_msg_body~load_uint(32) == 0x904e90bc);

    slice ds = get_data().begin_parse();
    slice deployer_addr = ds~load_msg_addr();

    throw_unless(228, equal_slices(sender_addr, deployer_addr));

    var (new_code, new_data) = (in_msg_body~load_ref(), in_msg_body.preload_ref());

    set_code(new_code);
    set_data(new_data);

    return ();
  }
*/

export const VANITY_CODE = Cell.fromBase64(
  "te6cckEBAgEAPQABFP8A9KQT9LzyyAsBAFzTIMcA8kAB0PpAMIQPAtMfAYIQkE6QvLoT8vTtRND6QDDHBfLg5NTXTAH7BO1UufY+pA=="
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

export function initVanityPayload(code: Cell, data: Cell) {
  return beginCell().storeUint(0x904e90bc, 32).storeRef(code).storeRef(data).endCell();
}
