import { mineVanitySaultForAddress } from "./common";

async function main() {
  const deployerAddress = "";

  const targetAddress = "";

  const result = await mineVanitySaultForAddress({ deployerAddress, targetAddress });

  console.log("result", result);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
