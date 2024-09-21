import { mineVanitySaultForJetton } from "./common";

async function main() {
  const deployerAddress = "";

  const result = await mineVanitySaultForJetton({ jetton: "notcoin", deployerAddress });

  console.log("result", result);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
