# CRECopilot 🤖🔗

[![Chainlink Convergence Hackathon](https://img.shields.io/badge/Chainlink_Convergence-Hackathon_Submission-2a5eea?style=for-the-badge&logo=chainlink)](https://chain.link/hackathon)
[![Powered by Chainlink CRE](https://img.shields.io/badge/Powered_by-Chainlink_CRE_v1.1.2-blue?style=for-the-badge&logo=chainlink)](https://docs.chain.link/cre)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-First--Class-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**CRECopilot** is an AI-native developer workspace for generating, validating, simulating, and auditing **Chainlink Runtime Environment (CRE)** workflows from natural language prompts.

It combines:
- a **frontend app** for prompt-driven workflow generation,
- a **backend validation service** for safety and policy checks,
- a **CRE workflow pipeline** for deterministic simulation/execution,
- and an **on-chain logging contract** for immutable provenance.

---

## Table of Contents

- [1) What CRECopilot Solves](#1-what-crecopilot-solves)
- [2) Why Chainlink CRE](#2-why-chainlink-cre)
- [3) Core Features](#3-core-features)
- [4) High-Level Architecture](#4-high-level-architecture)
- [5) Repository Structure](#5-repository-structure)
- [6) Prerequisites](#6-prerequisites)
- [7) Quickstart](#7-quickstart)
- [8) Environment Configuration](#8-environment-configuration)
- [9) Smart Contract Deployment](#9-smart-contract-deployment)
- [10) Run the Full Local Dev Environment](#10-run-the-full-local-dev-environment)
- [11) Simulate CRE Workflow via CLI](#11-simulate-cre-workflow-via-cli)
- [12) End-to-End Operational Flow](#12-end-to-end-operational-flow)
- [13) Security Model](#13-security-model)
- [14) Troubleshooting](#14-troubleshooting)
- [15) Useful Commands](#15-useful-commands)
- [16) GitHub Actions CI](#16-github-actions-ci)
- [17) Contributing](#17-contributing)
- [18) License](#18-license)
- [19) Deployed Addresses](#19-deployed-addresses)
- [20) Chainlink Usage](#20-chainlink-usage)

---

## 1) What CRECopilot Solves

Writing production-grade Chainlink CRE workflows requires domain-specific knowledge:
- sandboxed execution constraints,
- capability-based API access,
- secure secret handling,
- and deterministic workflow composition.

CRECopilot shortens this learning curve by turning intent (plain English prompts) into workflow scaffolding and testable simulation artifacts.

Example intent:
> “Monitor ETH/USD and write daily values to my Sepolia contract.”

CRECopilot is designed to:
1. **Generate** CRE-compatible TypeScript workflow logic.
2. **Validate** generated output against safety/AST restrictions.
3. **Simulate** workflows in local CRE sandbox.
4. **Anchor metadata on-chain** for auditability.

---

## 2) Why Chainlink CRE

This project is built around CRE instead of treating CRE as a post-processing step.

Key reasons:
- **Deterministic sandboxing** for workflow execution.
- **Capability-based integrations** (e.g., confidential HTTP, EVM client).
- **Secret isolation** to reduce accidental key exposure.
- **Portable simulation/execution model** through `cre-cli`.

---

## 3) Core Features

- ✅ Prompt-to-workflow generation pipeline
- ✅ AST/safety checks for generated code
- ✅ Local simulation with `cre-cli`
- ✅ On-chain workflow hash logging (Sepolia)
- ✅ Full-stack dev loop (Frontend + Backend + CRE pipeline)
- ✅ Config-driven environment binding for local/dev targets

---

## 4) High-Level Architecture

```text
User Prompt (Web UI)
   │
   ▼
Frontend (Next.js)
   │ HTTP
   ▼
Backend Validation Engine (TypeScript/Express)
   │
   ├─ validates generated workflow code
   ├─ applies policy/AST checks
   └─ prepares simulation payload
   │
   ▼
CRE Workflow Runtime (cre-workflow + cre-cli)
   │
   ├─ secure capability execution in sandbox
   ├─ optional confidential HTTP calls for model/API usage
   └─ optional EVM write with workflow metadata hash
   │
   ▼
Sepolia Contract (WorkflowLog.sol)
```

---

## 5) Repository Structure

```text
cre-copilot/
├── .env
├── .gitignore
├── cre-cli                         # Local cre-cli binary/artifact
├── deployments.json
├── hardhat.config.ts
├── llms.txt
├── package.json
├── project.yaml
├── README.md
├── rpc.txt
├── secrets.yaml
├── tsconfig.json
├── artifacts/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── cache/
├── contracts/
│   └── WorkflowLog.sol
├── cre-workflow/
│   ├── config.json
│   ├── cre.yaml
│   ├── package.json
│   ├── prompts.ts
│   ├── secrets.yaml
│   ├── tmp.js
│   └── tsconfig.json
├── frontend/
├── scripts/
├── typechain-types/
└── ...
```

---

## 6) Prerequisites

- **Node.js** `v18+`
- **npm** (or compatible package manager)
- **Chainlink `cre-cli`** `v1.2.0+`
- Sepolia-compatible RPC provider (Alchemy/Infura/etc.)
- Wallet private key for deployment/transactions

Optional but recommended:
- A funded Sepolia account for contract interactions

---

## 7) Quickstart

### A) Install dependencies

From project root:
```bash
npm install
```

Install app-specific dependencies if needed:
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../cre-workflow && npm install
```

### B) Prepare env files

```bash
cp .env.example .env
cp cre-workflow/config.example.json cre-workflow/config.json
cp cre-workflow/secrets.example.yaml cre-workflow/secrets.yaml
```

> If `.env.example` is not present, create `.env` manually using the required variables below.

### C) Compile contracts

```bash
npx hardhat compile
```

### D) Deploy (Sepolia)

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### E) Run local services + workflow simulator

See [10) Run the Full Local Dev Environment](#10-run-the-full-local-dev-environment).

---

## 8) Environment Configuration

### Root `.env` (minimum)

```bash
OPENROUTER_API_KEY=...
PRIVATE_KEY=...
SEPOLIA_RPC_URL=...
WORKFLOW_LOG_ADDRESS=0x...
NEXT_PUBLIC_WORKFLOW_LOG_ADDRESS=0x...
BACKEND_URL=http://localhost:3001
```

### `cre-workflow/config.json` (example)

```json
{
  "OPENROUTER_API_KEY": "YOUR_OPENROUTER_API_KEY",
  "BACKEND_URL": "http://localhost:3001",
   "WORKFLOW_LOG_ADDRESS": "0xYourDeployedContractAddress",
   "CI_DRY_MODE": "false"
}
```

### Notes

- Keep private keys out of source control.
- Ensure `.gitignore` excludes local secret/config variants.
- Use distinct credentials for local dev vs production-like runs.

---

## 9) Smart Contract Deployment

Contract: `contracts/WorkflowLog.sol`

Typical deploy flow:
1. Compile with Hardhat.
2. Deploy via `scripts/deploy.ts` to Sepolia.
3. Copy deployed address into:
   - `WORKFLOW_LOG_ADDRESS`
   - `NEXT_PUBLIC_WORKFLOW_LOG_ADDRESS`
   - `cre-workflow/config.json` (if required by runtime target)

Verify ABI/artifacts generated under:
- `artifacts/`
- `typechain-types/`

---

## 10) Run the Full Local Dev Environment

### Terminal 1 — Frontend

```bash
cd frontend
npm install
npm run dev
# expected: http://localhost:3000
```

### Terminal 2 — Backend

```bash
cd backend
npm install
npm run dev
# expected: http://localhost:3001
```

### Terminal 3 — CRE Workflow Simulation

From project root:

```bash
./cre-cli workflow simulate ./cre-workflow \
  --target staging-settings \
  --http-payload '{"description":"Monitor the ETH/USD chainlink oracle and log values daily","generatorAddress":"0xYourWalletAddress"}' \
  --non-interactive \
  --trigger-index 0 \
  --broadcast \
  -e .env
```

> Keep `BACKEND_URL` and workflow config aligned with your running backend instance.

---

## 11) Simulate CRE Workflow via CLI

Baseline command pattern:

```bash
./cre-cli workflow simulate ./cre-workflow --target staging-settings -e .env
```

Common useful flags:
- `--http-payload` for request body simulation
- `--non-interactive` for scripting/CI
- `--trigger-index` to select trigger path
- `--broadcast` to push on-chain side effects (if configured)

---

## 12) End-to-End Operational Flow

1. User submits prompt in UI.
2. Frontend forwards request to backend.
3. Backend generates/validates workflow code path.
4. CRE workflow executes in sandbox simulation.
5. Validation metadata + workflow hash may be persisted on-chain.
6. Results return to UI with traceable artifacts.

---

## 13) Security Model

### Confidential secret handling
- API keys (e.g., OpenRouter) are injected via environment/config bindings.
- Avoid printing sensitive variables in logs.

### Deterministic workflow runtime
- CRE simulation path reduces host-environment variance.
- Helps make behavior more reproducible before broadcast.

### Policy-first generation validation
- AST/static checks reduce unsafe or unsupported runtime calls.
- Intended to block restricted Node capabilities in generated code.

### On-chain provenance
- Workflow hash logging creates immutable audit references.
- Helps track generated artifacts over time.

---

## 14) Troubleshooting

### `cre-cli` fails or is outdated
- Update CLI:
  ```bash
  ./cre-cli update
  ```
- Verify executable permissions on `cre-cli`.

### Sepolia transaction failures
- Check `SEPOLIA_RPC_URL`.
- Ensure account has Sepolia ETH.
- Confirm `PRIVATE_KEY` formatting and chain/network config.

### Frontend can’t reach backend
- Ensure backend is running on expected port.
- Confirm `BACKEND_URL` in env/config.
- Check CORS and proxy settings if customized.

### Workflow simulation errors
- Validate `cre-workflow/config.json` keys.
- Confirm target name exists in workflow project config.
- Re-run with verbose logging if your CLI supports it.

---

## 15) Useful Commands

### Root
```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

### Frontend
```bash
cd frontend
npm run dev
```

### Backend
```bash
cd backend
npm run dev
```

### CRE Workflow
```bash
./cre-cli workflow simulate ./cre-workflow --target staging-settings -e .env
```

---

## 16) GitHub Actions CI

This repository ships with three workflows:

- **Required**: `.github/workflows/ci.yml`
   - Root hardhat compile/test
   - Backend TypeScript build
   - Frontend production build
   - CRE workflow TypeScript build

- **Required**: `.github/workflows/cre-dry-sim.yml`
   - Runs deterministic **dry CRE simulation**
   - Uses `CRE_SIM_MODE=mock`
   - Requires no RPC keys or model keys

- **Optional (manual)**: `.github/workflows/cre-full-sim.yml`
   - Runs full `cre-cli workflow simulate` on demand (`workflow_dispatch`)
   - Intended for end-to-end networked validation

### Required checks setup (recommended)

Set branch protection required checks to:

- `CI / quality`
- `CRE Dry Simulation / dry-sim`

### Secrets for optional full simulation

Add these repo secrets before running the manual full simulation workflow:

- `OPENROUTER_API_KEY`
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `WORKFLOW_LOG_ADDRESS`

---

## 17) Contributing

1. Create a feature branch.
2. Keep changes scoped (frontend/backend/workflow/contract).
3. Add or update tests where applicable.
4. Validate local simulation before opening PR.
5. Include clear notes on env/config assumptions.

---

## 18) License

MIT (or your preferred license). Add a root `LICENSE` file before public release.

---

## 19) Deployed Addresses

- **WorkflowLog (Sepolia):** `0xCCf8B231f32ED84A53b1b29f019fcaFd514C5006`

---

## 20) Chainlink Usage

CRECopilot exclusively builds for, and relies on, the **Chainlink Runtime Environment (CRE)** to deterministically simulate and run AI-generated workflows locally and on-chain.

- **[CRE Simulation Engine (backend/src/routes/generateDirect.ts)](https://github.com/ClawdHQ/cre-copilot/blob/main/backend/src/routes/generateDirect.ts)**: The core integration point where the backend orchestrates secure calls to the `cre-cli` binary using targeted mocked payload triggers like `--http-payload` and `--evm-log-mock`.
- **[CRE Workspace Sandbox (cre-workflow/)](https://github.com/ClawdHQ/cre-copilot/tree/main/cre-workflow)**: The raw `cre.yaml`, triggers, and capabilities constraints configuration that powers the environment context.
- **[AST Validator Engine (backend/src/services/validator.ts)](https://github.com/ClawdHQ/cre-copilot/blob/main/backend/src/services/validator.ts)**: Validates exactly how the AI integrates capability calls (like `ctx.ccip` and `ctx.http`) safely for the Chainlink Sandbox.
