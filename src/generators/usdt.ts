import { mine } from "./shared";

async function main() {
  const deployerAddress = "UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii";

  const result = await mine({ jetton: "usdt", deployerAddress });

  console.log("result", result);
  process.exit(0);
}

main();
