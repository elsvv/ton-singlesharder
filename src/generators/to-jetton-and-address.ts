import { mineVanitySaultForAddressAndJetton } from "./common";

function main() {
  const deployerAddress = "UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii";

  const targetAddress = "EQD_kMQkK-A9-CQu3CdOnQUDZ2_8bY8Zrh1PvtE3hZpxvdRH";

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
