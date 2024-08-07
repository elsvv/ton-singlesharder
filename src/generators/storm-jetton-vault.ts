import { Address, beginCell } from "@ton/core";
import { mineVanitySaultForJetton } from "./common";

async function main() {
  const deployerAddress = "0QAaeWYhjGiyDoI33P-geQ0RXE1MQGKdcn6XdCI8mXDTae-u";
  const jettonMinterAddress = Address.parse("kQAIXwAk9nelN-Iy-Z4j2wx5EcDMB_qIm-kZyHRYfU6TKk1N");

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
