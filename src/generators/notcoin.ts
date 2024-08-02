import { mineVanitySaultForJetton } from "./common";

async function main() {
  const deployerAddress = "UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii";

  const result = await mineVanitySaultForJetton({ jetton: "notcoin", deployerAddress });

  console.log("result", result);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
