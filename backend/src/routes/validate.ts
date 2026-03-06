import { Router, Request, Response, NextFunction } from "express";
import { validateCREWorkflow } from "../services/validator";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }
    const result = await validateCREWorkflow(code);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
