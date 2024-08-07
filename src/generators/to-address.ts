import { mineVanitySaultForAddress } from "./common";

async function main() {
  const deployerAddress = "UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii";

  const targetAddress = "EQCf4e6j3p3N5i_uAris16_HRfuQvRFj242swf7JhC0dx8IS";

  const result = await mineVanitySaultForAddress({ deployerAddress, targetAddress });

  console.log("result", result);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
