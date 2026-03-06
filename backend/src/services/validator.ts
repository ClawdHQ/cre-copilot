export async function validateCREWorkflow(
  code: string
): Promise<{ valid: boolean; errors: string[]; score: number }> {
  const errors: string[] = [];

  // 1. Import check
  if (!code.includes('from "@chainlink/cre-sdk"')) {
    errors.push('Missing @chainlink/cre-sdk import');
  }

  // 2. Capabilities check
  const hasCapability = code.includes('new HTTPCapability(') || code.includes('new CronCapability(') || code.includes('EVMClient') || code.includes('HTTPClient');
  if (!hasCapability) {
    errors.push("No CRE capabilities used — workflow does nothing");
  }

  // 3. Main function check
  if (!code.includes("export async function main()") && !code.includes("export async function main {")) {
    errors.push("Missing exported main() function");
  }

  // 4. Runner check
  if (!code.includes("Runner.newRunner")) {
    errors.push("Missing Runner.newRunner() initialization");
  }

  // 5. Forbidden APIs check
  const forbidden = [
    "require(",
    "fs.",
    "path.",
    "process.exit",
    "child_process",
    "__dirname",
    "import.meta",
  ];
  for (const api of forbidden) {
    if (code.includes(api)) {
      errors.push(`Forbidden Node.js API used: ${api}`);
    }
  }

  // 6. Top-level await check
  const lines = code.split("\\n");
  const mainIndex = lines.findIndex((l) => l.includes("function main"));
  if (mainIndex > 0) {
    const beforeExecute = lines.slice(0, mainIndex);
    for (const line of beforeExecute) {
      if (line.trimStart().startsWith("await ")) {
        errors.push(
          "Top-level await detected — all async calls must be inside handler callbacks or main()"
        );
        break;
      }
    }
  }

  const score = Math.max(0, 100 - errors.length * 15);
  return { valid: errors.length === 0, errors, score };
}
