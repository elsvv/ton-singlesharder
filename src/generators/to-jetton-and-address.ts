import { mineVanitySaultForAddressAndJetton } from "./common";

function main() {
  const deployerAddress = "";

  const targetAddress = "";

  const jetton = "usdt";

  return mineVanitySaultForAddressAndJetton({
    deployerAddress,
    targetAddress,
    jetton,
  }).then((result) => {
    console.log("result", result);
    process.exit(0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
