import { Router, Request, Response, NextFunction } from "express";
import { ethers } from "ethers";

const router = Router();

const WORKFLOW_LOG_ABI = [
  "function logGeneration(bytes32, address, string, uint8) external",
  "function totalRecords() view returns (uint256)",
  "function getRecord(uint256) view returns (tuple(bytes32 contentHash, address generator, string description, uint256 timestamp, uint8 validationScore))",
];

function getContract(withSigner = false) {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  if (withSigner) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
    return new ethers.Contract(
      process.env.WORKFLOW_LOG_ADDRESS || "",
      WORKFLOW_LOG_ABI,
      wallet
    );
  }
  return new ethers.Contract(
    process.env.WORKFLOW_LOG_ADDRESS || "",
    WORKFLOW_LOG_ABI,
    provider
  );
}

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, generatorAddress, description, validationScore } = req.body;
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(code));
    const truncatedDesc = (description || "").slice(0, 256);
    const contract = getContract(true);
    const tx = await contract.logGeneration(
      contentHash,
      generatorAddress,
      truncatedDesc,
      validationScore
    );
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash, contentHash });
  } catch (e) {
    next(e);
  }
});

router.get("/recent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(String(req.query.limit || "20"), 10);
    const contract = getContract(false);
    const total = await contract.totalRecords();
    const start = Math.max(0, Number(total) - limit);
    const indices = Array.from(
      { length: Number(total) - start },
      (_, i) => start + i
    );
    const records = await Promise.all(
      indices.map((i) => contract.getRecord(i))
    );
    const mapped = records.map((r) => ({
      contentHash: r.contentHash,
      generator: r.generator,
      description: r.description,
      timestamp: Number(r.timestamp),
      validationScore: Number(r.validationScore),
    }));
    res.json(mapped.reverse());
  } catch (e) {
    next(e);
  }
});

export default router;
