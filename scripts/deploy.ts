import { ethers } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // 1. Deploy WorkflowLog
  const WorkflowLog = await ethers.getContractFactory("WorkflowLog");
  const log = await WorkflowLog.deploy();
  await log.waitForDeployment();
  const logAddress = await log.getAddress();
  console.log("WorkflowLog:", logAddress);

  // 2. Set authorized logger
  const tx = await log.setAuthorizedLogger(deployer.address);
  await tx.wait();
  console.log("Authorized logger set to deployer (update to backend wallet in production)");

  // 3. Save deployments.json
  const deployments = {
    logAddress,
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
  console.log("Saved to deployments.json — add logAddress to .env as WORKFLOW_LOG_ADDRESS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
