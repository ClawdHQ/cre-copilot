import { runSimulation } from "../services/cliRunner";

const mockWorkflowCode = `
import { HTTPCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";

interface Config {
  OPENROUTER_API_KEY: string;
  BACKEND_URL: string;
  WORKFLOW_LOG_ADDRESS: string;
}

const onHttpTrigger = async (_runtime: Runtime<Config>, req: any) => {
  return { ok: true, input: req };
};

const initWorkflow = () => {
  const http = new HTTPCapability();
  return [handler(http.trigger({}), onHttpTrigger)];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
`.trim();

async function main() {
  process.env.CRE_SIM_MODE = process.env.CRE_SIM_MODE || "mock";

  const input = JSON.stringify({
    description: "CI dry simulation payload",
    generatorAddress: "0x0000000000000000000000000000000000000000",
  });

  const result = await runSimulation(mockWorkflowCode, input);

  if (!result.success) {
    throw new Error(`Dry simulation failed: ${result.error || "Unknown error"}`);
  }

  if (!result.output.includes("MOCK_CRE_SIMULATION_OK")) {
    throw new Error("Dry simulation did not return expected success marker");
  }

  console.log("CRE dry simulation passed");
  console.log(result.output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
