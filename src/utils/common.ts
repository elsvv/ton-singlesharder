import { Address, beginCell, storeStateInit, type Cell } from "@ton/core";

export function stateinitToBasechainAddress(stateinit: Cell): Address {
  return new Address(0, stateinit.hash());
}

export function packStateinit(code: Cell, data: Cell) {
  return beginCell().store(storeStateInit({ code, data })).endCell();
}
