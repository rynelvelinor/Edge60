import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MatchmakingService } from "./services/matchmaking";
import { GameEngine } from "./services/gameEngine";
import { YellowService } from "./services/yellow";
import { TreasuryService } from "./services/treasury";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  OnlinePlayer,
  PlayerStatus,
  Address,
  GameType,
} from "../types";

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Socket.IO server
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});

// Services
const yellowService = new YellowService();
const treasuryService = new TreasuryService();
const matchmakingService = new MatchmakingService(io, yellowService);
const gameEngine = new GameEngine(io, yellowService, treasuryService);

// Connected players map
const players = new Map<string, OnlinePlayer>();

// ============ Socket.IO Connection Handling ============

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle authentication
  socket.on("authenticate", async ({ address, signature, message }) => {
    try {
      // In production, verify signature here
      const player: OnlinePlayer = {
        address: address as Address,
        socketId: socket.id,
        status: PlayerStatus.ONLINE,
        joinedAt: Date.now(),
      };

      players.set(socket.id, player);
      socket.emit("connected", { playerId: socket.id });

      // Get balance from Yellow
      const balance = await yellowService.getBalance(address);
      socket.emit("balanceUpdate", {
        balance: balance.toString(),
        pending: "0",
      });

      console.log(`Player authenticated: ${address}`);
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("error", {
        message: "Authentication failed",
        code: "AUTH_FAILED",
      });
    }
  });

  // Handle matchmaking
  socket.on("findMatch", async ({ stake, gameType }) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit("error", { message: "Not authenticated", code: "NOT_AUTH" });
      return;
    }

    try {
      player.status = PlayerStatus.SEARCHING;
      socket.emit("searchingForMatch", { stake, gameType });

      const match = await matchmakingService.findMatch(
        player,
        BigInt(stake),
        gameType
      );

      if (match) {
        // Match found - game engine takes over
        gameEngine.startMatch(match);
      }
    } catch (error) {
      console.error("Matchmaking error:", error);
      player.status = PlayerStatus.ONLINE;
      socket.emit("error", {
        message: "Matchmaking failed",
        code: "MATCH_FAILED",
      });
    }
  });

  // Handle cancel search
  socket.on("cancelSearch", () => {
    const player = players.get(socket.id);
    if (player) {
      matchmakingService.cancelSearch(player);
      player.status = PlayerStatus.ONLINE;
      socket.emit("matchCancelled", { reason: "Search cancelled by player" });
    }
  });

  // Handle ready signal
  socket.on("ready", () => {
    const player = players.get(socket.id);
    if (player) {
      gameEngine.playerReady(player.address);
    }
  });

  // Handle game actions
  socket.on("gameAction", (action) => {
    const player = players.get(socket.id);
    if (player) {
      gameEngine.handleAction(player.address, action);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`Player disconnected: ${player.address}`);

      // Notify game engine
      gameEngine.handleDisconnect(player.address);

      // Remove from matchmaking
      matchmakingService.cancelSearch(player);

      // Remove from players
      players.delete(socket.id);
    }
  });
});

// ============ REST API Endpoints ============

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Get leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await treasuryService.getLeaderboard();
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: { message: "Failed to fetch leaderboard" },
      });
  }
});

// Get player stats
app.get("/api/player/:address", async (req, res) => {
  try {
    const stats = await treasuryService.getPlayerStats(
      req.params.address as Address
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: { message: "Failed to fetch player stats" },
      });
  }
});

// Get match history
app.get("/api/matches/:address", async (req, res) => {
  try {
    const matches = await treasuryService.getMatchHistory(
      req.params.address as Address
    );
    res.json({ success: true, data: matches });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: { message: "Failed to fetch match history" },
      });
  }
});

// Get active matches count
app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      onlinePlayers: players.size,
      activeMatches: gameEngine.getActiveMatchCount(),
      searchingPlayers: matchmakingService.getQueueSize(),
    },
  });
});

// ============ Start Server ============

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
  ⚡ FlashStake Server Running
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || "development"}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export { io, players };
