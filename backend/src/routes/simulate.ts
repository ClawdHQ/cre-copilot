import { Router, Request, Response, NextFunction } from "express";
import { runSimulation } from "../services/cliRunner";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, inputJson } = req.body;
    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }
    const input = inputJson || "{}";
    const result = await runSimulation(code, input);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
