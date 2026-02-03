import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GameAction,
  GameType,
  Address,
} from "../types";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to the game server
   */
  connect(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }) as TypedSocket;

    this.setupListeners();

    return this.socket;
  }

  /**
   * Get the current socket instance
   */
  getSocket(): TypedSocket | null {
    return this.socket;
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ============ Emit Methods ============

  /**
   * Authenticate with the server
   */
  authenticate(address: Address, signature: string, message: string): void {
    this.socket?.emit("authenticate", { address, signature, message });
  }

  /**
   * Find a match
   */
  findMatch(stake: string, gameType: GameType): void {
    this.socket?.emit("findMatch", { stake, gameType });
  }

  /**
   * Cancel match search
   */
  cancelSearch(): void {
    this.socket?.emit("cancelSearch");
  }

  /**
   * Signal ready for match
   */
  ready(): void {
    this.socket?.emit("ready");
  }

  /**
   * Send game action
   */
  sendGameAction(action: GameAction): void {
    this.socket?.emit("gameAction", action);
  }

  // ============ Event Subscription ============

  /**
   * Subscribe to an event
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ): void {
    this.socket?.on(event, callback as any);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K]
  ): void {
    if (callback) {
      this.socket?.off(event, callback as any);
    } else {
      this.socket?.off(event);
    }
  }

  // ============ Internal Methods ============

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to game server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from game server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.reconnectAttempts++;
    });
  }
}

// Singleton instance
export const socketService = new SocketService();

// React hook helper
export function useSocketConnection() {
  return {
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
    isConnected: () => socketService.isConnected(),
    socket: socketService.getSocket(),
  };
}
