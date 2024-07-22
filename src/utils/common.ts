import { Address, beginCell, type Cell } from "@ton/core";

export function stateinitToBasechainAddress(stateinit: Cell): Address {
  return new Address(0, stateinit.hash());
}

export function packStateinit(code: Cell, data: Cell) {
  return beginCell()
    .storeUint(0, 2)
    .storeMaybeRef(code)
    .storeMaybeRef(data)
    .storeUint(0, 1)
    .endCell();
}
