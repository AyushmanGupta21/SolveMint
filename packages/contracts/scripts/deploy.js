const hre = require("hardhat");

async function main() {
  console.log("Deploying SolveMint to network:", hre.network.name);

  const SolveMint = await hre.ethers.getContractFactory("SolveMint");
  const solveMint = await SolveMint.deploy();
  await solveMint.waitForDeployment();

  const address = await solveMint.getAddress();
  console.log("SolveMint deployed to:", address);
  console.log("\nUpdate your .env:");
  console.log(`NEXT_PUBLIC_SOLVEMINT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
