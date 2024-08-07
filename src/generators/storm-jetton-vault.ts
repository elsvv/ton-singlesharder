import { beginCell } from "@ton/core";
import { mineVanitySaultForJetton } from "./common";
import { NOTCOIN_MAINNET_ADDR } from "../contracts";

async function main() {
  // Storm Vault Deployer Address (as string)
  const deployerAddress = "";

  // Storm Vault Jetton Master Address (Notcoin for example)
  const jettonMinterAddress = NOTCOIN_MAINNET_ADDR;

  const additionalDataSliceBase64 = beginCell()
    .storeAddress(jettonMinterAddress)
    .endCell()
    .toBoc()
    .toString("base64");

  const result = await mineVanitySaultForJetton({
    jetton: "notcoin",
    deployerAddress,
    additionalDataSliceBase64,
  });

  console.log("result", result);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
