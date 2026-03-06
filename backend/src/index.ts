import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import validateRoutes from "./routes/validate";
import simulateRoutes from "./routes/simulate";
import logRoutes from "./routes/log";
import generateDirectRoutes from "./routes/generateDirect";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/api/validate", validateRoutes);
app.use("/api/simulate", simulateRoutes);
app.use("/api/log", logRoutes);
app.use("/api/generate-direct", generateDirectRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] CRE Copilot backend on :${PORT}`);
});

export default app;
