# FlashStake ⚡

> Real-Time USDC Skill Gaming via State Channels

FlashStake is a real-time, skill-based USDC gaming platform where two players stake USDC, compete in short deterministic games (under 60 seconds), and receive instant payouts.

## 🏗️ Architecture

FlashStake separates the system into three distinct layers:

| Layer               | Responsibility                       | Technology                      |
| ------------------- | ------------------------------------ | ------------------------------- |
| **Gameplay Layer**  | Real-time skill competition          | WebSocket, Server-authoritative |
| **Payment Layer**   | Instant off-chain balance updates    | Yellow Network State Channels   |
| **Liquidity Layer** | Cross-chain USDC treasury management | Arc Protocol                    |
| **Identity Layer**  | Decentralized reputation             | Ethereum Name Service (ENS)     |

## 🎮 Games

- **⚡ Reaction Race** - Fastest tap wins
- **🧠 Memory Match** - Find matching pairs
- **🔢 Quick Math** - Speed arithmetic
- **🎯 Pattern Tap** - Remember and repeat sequences

## 🛠️ Tech Stack

### Frontend

- Next.js 16
- wagmi v2 + viem
- RainbowKit
- Framer Motion
- TailwindCSS 4
- Zustand

### Backend

- Node.js + Express
- Socket.IO
- TypeScript

### Smart Contracts

- Solidity 0.8.20
- Hardhat
- OpenZeppelin

## 📦 Project Structure

```
flashstake/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── play/              # Game lobby
│   ├── leaderboard/       # Rankings
│   └── profile/           # User profile
├── components/
│   ├── ui/                # Reusable UI components
│   ├── game/              # Game-specific components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── contracts/             # Solidity smart contracts
│   ├── GameTreasury.sol   # Main treasury contract
│   └── YellowSettlement.sol # State channel settlement
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── server/                # Backend server
│   ├── index.ts          # Entry point
│   └── services/         # Business logic
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/flashstake.git
cd flashstake
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Run the development servers:

```bash
npm run dev
```

This starts both the Next.js frontend (port 3000) and the WebSocket backend (port 3001).

### Smart Contract Deployment

1. Compile contracts:

```bash
npm run compile
```

2. Deploy to testnet:

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## 🎯 How It Works

### Game Flow

1. **Connect** - User connects wallet
2. **Deposit** - User deposits USDC (on-chain)
3. **Session** - Yellow session created (off-chain)
4. **Match** - Players matched by stake amount
5. **Play** - Real-time game via WebSocket
6. **Payout** - Winner receives funds (off-chain)
7. **Settle** - User withdraws (on-chain)

### Only Two On-Chain Transactions

- **Deposit** - Lock USDC into Yellow session
- **Settlement** - Final state committed on-chain

Everything else happens off-chain with instant finality.

## 🔐 Security

- Server-authoritative gameplay (no client trust)
- Off-chain signed balance updates
- Escrow isolation per match
- Deterministic payout logic
- Minimal on-chain surface area

## 🌐 Integrations

### Yellow Network

State channel infrastructure for instant off-chain transactions.

### Arc Protocol

Cross-chain liquidity hub for unified USDC management.

### ENS

Decentralized identity with on-chain gaming reputation.

## 📊 Smart Contract Functions

### GameTreasury.sol

```solidity
// Player functions
function deposit(uint256 amount) external
function withdraw(uint256 amount) external

// Operator functions (backend)
function createMatch(bytes32 matchId, address playerA, address playerB, uint256 stake) external
function settleMatch(bytes32 matchId, address winner) external
function refundMatch(bytes32 matchId) external

// View functions
function getBalance(address player) external view returns (uint256)
function getPlayerStats(address player) external view returns (PlayerStats)
function getWinRate(address player) external view returns (uint256)
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏆 ETHGlobal Submission

This project was built for ETHGlobal hackathon, demonstrating how Web3 infrastructure can deliver Web2-grade user experience:

- ⚡ Instant interactions via state channels
- 💸 No gas per action
- 🌉 Seamless cross-chain liquidity

---

Built with ❤️ by the FlashStake team
