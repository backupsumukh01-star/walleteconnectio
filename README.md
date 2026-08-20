# WalletConnect Phase 1

Production-ready React + Vite + TypeScript app with official WalletConnect v2.

This release covers **wallet connection only**. It does not include smart contracts, backend APIs, token approvals, signatures, or transactions.

## Stack

- React 19
- Vite 7
- TypeScript (strict)
- Tailwind CSS 4
- ethers v6
- `@walletconnect/ethereum-provider` (WalletConnect v2 Ethereum Provider)

The provider opens the official WalletConnect modal: QR code on desktop, deep linking on mobile, and Explorer wallets.

## Prerequisites

- Node.js 20+
- npm

If `npm` is not recognized in PowerShell, install [Node.js LTS](https://nodejs.org/) and reopen the terminal.

## Setup

1. Create a project ID in [Reown Dashboard](https://dashboard.reown.com/) (WalletConnect Cloud).
2. Copy environment config:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set the project ID. Never commit this value.

```
VITE_PROJECT_ID=your_walletconnect_project_id
```

4. Install and run:

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run lint
npm run build
npm run preview
```

## What this app does

- Full-screen black UI with a centered **Connect Wallet** button
- WalletConnect modal for all WalletConnect-compatible wallets
- Optional `eip155` namespaces for major EVM chains (so single-chain wallets can still connect)
- Session restore after refresh (WalletConnect client storage + localStorage snapshot)
- Disconnect
- Error messages for reject, expired/invalid session, network, provider, and missing project ID

## Requested EVM chains

Namespaces are requested as **optional** (recommended by WalletConnect) for:

Ethereum, BNB Smart Chain, Polygon, Arbitrum, Optimism, Base, Avalanche, Fantom, Linea, zkSync Era, Scroll, Blast, Mantle, Mode, Cronos, Gnosis, Celo, Aurora, Moonbeam, Moonriver.

Additional namespaces (`solana`, `cosmos`, `bip122`, and others) are typed in `src/types/namespace.ts` for a later Universal Provider upgrade. Phase 1 does not propose unsupported chains.

## Architecture

```
src/
  components/     UI pieces (button, connected view, errors)
  pages/          Full-screen home page
  hooks/          useWallet
  context/        React Context for wallet state
  services/       WalletConnect, session, provider, storage, chains
  providers/      App provider tree
  config/         env, chains, WalletConnect init, storage keys
  utils/          CAIP helpers, errors, formatting
  types/          Strict domain types
```

### Services

| Service | Role |
| --- | --- |
| `WalletConnectService` | `EthereumProvider.init`, modal connect, events, restore |
| `SessionService` | Map WalletConnect session → snapshot |
| `ProviderService` | In-memory EIP-1193 provider + ethers `BrowserProvider` for Phase 2 |
| `StorageService` | Persist the session snapshot in `localStorage` |
| `ChainService` | Chain names, CAIP-2, approved-chain extraction |

The live provider cannot be stored as JSON. After refresh, `EthereumProvider.init` restores the WalletConnect session from its official storage; `ProviderService` reattaches the instance and `SessionService` rebuilds the snapshot.

## Phase 2 extension points

Do not rewrite the connection layer. Add onto:

- `ProviderService.getEthersBrowserProvider()` for contract calls, approvals, and txs
- Approved session methods already requested (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_switchEthereumChain`, …)
- `WalletConnectNamespaceKey` for Solana / multi-namespace via Universal Provider
- New services for backend auth, balances, NFTs, and token detection

## GitHub (upload this project)

This PC needs [Git](https://git-scm.com/download/win) and a GitHub account. Do **not** commit `.env`. Render will hold `VITE_PROJECT_ID`.

### Option A — GitHub website (no Git required)

1. Create a new empty repository on GitHub (no README, no .gitignore).
2. On the repo page choose **uploading an existing file**.
3. Drag every project file and folder **except** `.env`, `node_modules`, and `dist`.
4. Commit.

### Option B — Git CLI

```bash
git init
git add .
git commit -m "Add WalletConnect Phase 1 app"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## Render (static site)

Vite bakes `VITE_*` values in at **build** time. Set the env var on Render before the first deploy, then rebuild if you change it.

1. Open [Render](https://dashboard.render.com/) → **New** → **Static Site**.
2. Connect the GitHub repo.
3. Settings:

| Field | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Node version | `22` |

4. **Environment** (Build & Deploy):

| Key | Value |
| --- | --- |
| `VITE_PROJECT_ID` | Your WalletConnect / Reown Cloud project ID |
| `NODE_VERSION` | `22` |

5. Deploy. Copy the site URL, for example `https://walletconnect-phase1.onrender.com`.

6. In [Reown Dashboard](https://dashboard.reown.com/) open the project and add that exact origin (domain + `https`) to allowed domains / Verify. WalletConnect metadata uses `window.location.origin`, so it will match the Render URL automatically.

`render.yaml` is included if you prefer Blueprint deploys. `VITE_PROJECT_ID` is marked `sync: false` so you paste it in the Render dashboard, not in git.

## Official docs

- [Ethereum Provider](https://docs.reown.com/advanced/providers/ethereum)
- [WalletConnect Cloud / Reown Dashboard](https://dashboard.reown.com/)
- [Render static sites](https://render.com/docs/static-sites)
