import { Address } from "@ton/ton";
import {
  calculateUsdtJettonWalletAddress,
  calculateUsdtJettonWalletStateinit,
} from "./src/contracts";

console.log("Hello via Bun!");

async function main() {
  const ownerAddr = Address.parse("UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii");

  const offchainWalletStateinit = calculateUsdtJettonWalletStateinit(ownerAddr);
  const offchainWalletAddr = calculateUsdtJettonWalletAddress(ownerAddr);

  console.log(offchainWalletStateinit.hash());
  console.log(offchainWalletAddr.hash);
}

main();
