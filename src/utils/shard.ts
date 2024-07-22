import { Address, BitReader, BitString } from "@ton/core";

const defaultShardMaxDepth = 4;

export function isAddrInShard(addr: Address, shard: bigint): boolean {
  const shardNum = BigInt.asUintN(64, BigInt(shard));

  let shifts = 0n;
  while (((shardNum >> shifts) & 1n) === 0n && shifts < 64n) {
    shifts++;
  }
  shifts++;

  const accountId = new BitReader(new BitString(addr.hash, 0, 1024)).loadUintBig(64);

  const accountBitMask = accountId >> shifts;
  const shardBitMask = shardNum >> shifts;

  return accountBitMask === shardBitMask;
}

export function isTwoAddrHashSameShard(
  addrAHash: Buffer,
  addrBHash: Buffer,
  shardMaxDepth = defaultShardMaxDepth
): boolean {
  const aShard = new BitReader(new BitString(addrAHash, 0, 1024)).loadUint(shardMaxDepth);
  const bShard = new BitReader(new BitString(addrBHash, 0, 1024)).loadUint(shardMaxDepth);

  return aShard === bShard;
}

export function isTwoAddrSameShard(
  addrA: Address,
  addrB: Address,
  shardMaxDepth = defaultShardMaxDepth
): boolean {
  return isTwoAddrHashSameShard(addrA.hash, addrB.hash, shardMaxDepth);
}
