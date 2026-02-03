// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GameTreasury
 * @notice Central treasury contract for FlashStake gaming platform
 * @dev Manages USDC deposits, match outcomes, rake collection, and withdrawals
 */
contract GameTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    IERC20 public immutable usdc;
    
    // Player balances
    mapping(address => uint256) public balances;
    
    // Rake configuration (basis points, 100 = 1%)
    uint256 public rakeBps = 300; // 3% default
    uint256 public constant MAX_RAKE_BPS = 1000; // 10% max
    
    // Collected rake
    uint256 public collectedRake;
    
    // Match tracking
    struct Match {
        bytes32 matchId;
        address playerA;
        address playerB;
        uint256 stake;
        address winner;
        bool settled;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Match) public matches;
    
    // Player statistics
    struct PlayerStats {
        uint256 totalWins;
        uint256 totalLosses;
        uint256 totalVolume;
        uint256 totalWinnings;
    }
    
    mapping(address => PlayerStats) public playerStats;
    
    // Authorized operators (backend servers)
    mapping(address => bool) public operators;

    // ============ Events ============

    event Deposited(address indexed player, uint256 amount);
    event Withdrawn(address indexed player, uint256 amount);
    event MatchCreated(bytes32 indexed matchId, address playerA, address playerB, uint256 stake);
    event MatchSettled(bytes32 indexed matchId, address winner, uint256 payout, uint256 rake);
    event RakeUpdated(uint256 oldRake, uint256 newRake);
    event RakeWithdrawn(address indexed to, uint256 amount);
    event OperatorUpdated(address indexed operator, bool status);

    // ============ Errors ============

    error InsufficientBalance();
    error InvalidAmount();
    error InvalidRake();
    error MatchAlreadyExists();
    error MatchNotFound();
    error MatchAlreadySettled();
    error UnauthorizedOperator();
    error InvalidPlayer();
    error ZeroAddress();

    // ============ Modifiers ============

    modifier onlyOperator() {
        if (!operators[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedOperator();
        }
        _;
    }

    // ============ Constructor ============

    constructor(address _usdc) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    // ============ Player Functions ============

    /**
     * @notice Deposit USDC into the treasury
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Withdraw USDC from the treasury
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        usdc.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Get player balance
     * @param player Player address
     * @return balance Player's USDC balance
     */
    function getBalance(address player) external view returns (uint256) {
        return balances[player];
    }

    // ============ Operator Functions ============

    /**
     * @notice Create a new match (called by authorized operator)
     * @param matchId Unique match identifier
     * @param playerA First player address
     * @param playerB Second player address
     * @param stake Amount staked by each player
     */
    function createMatch(
        bytes32 matchId,
        address playerA,
        address playerB,
        uint256 stake
    ) external onlyOperator {
        if (matches[matchId].matchId != bytes32(0)) revert MatchAlreadyExists();
        if (playerA == address(0) || playerB == address(0)) revert InvalidPlayer();
        if (playerA == playerB) revert InvalidPlayer();
        if (stake == 0) revert InvalidAmount();
        if (balances[playerA] < stake) revert InsufficientBalance();
        if (balances[playerB] < stake) revert InsufficientBalance();
        
        // Lock stakes
        balances[playerA] -= stake;
        balances[playerB] -= stake;
        
        matches[matchId] = Match({
            matchId: matchId,
            playerA: playerA,
            playerB: playerB,
            stake: stake,
            winner: address(0),
            settled: false,
            timestamp: block.timestamp
        });
        
        emit MatchCreated(matchId, playerA, playerB, stake);
    }

    /**
     * @notice Settle a match and distribute winnings (called by authorized operator)
     * @param matchId Match identifier
     * @param winner Winner address
     */
    function settleMatch(bytes32 matchId, address winner) external onlyOperator {
        Match storage m = matches[matchId];
        
        if (m.matchId == bytes32(0)) revert MatchNotFound();
        if (m.settled) revert MatchAlreadySettled();
        if (winner != m.playerA && winner != m.playerB) revert InvalidPlayer();
        
        m.winner = winner;
        m.settled = true;
        
        uint256 totalPot = m.stake * 2;
        uint256 rake = (totalPot * rakeBps) / 10000;
        uint256 payout = totalPot - rake;
        
        // Update balances
        balances[winner] += payout;
        collectedRake += rake;
        
        // Update stats
        address loser = winner == m.playerA ? m.playerB : m.playerA;
        
        playerStats[winner].totalWins++;
        playerStats[winner].totalVolume += m.stake;
        playerStats[winner].totalWinnings += payout - m.stake;
        
        playerStats[loser].totalLosses++;
        playerStats[loser].totalVolume += m.stake;
        
        emit MatchSettled(matchId, winner, payout, rake);
    }

    /**
     * @notice Refund a match (e.g., both players disconnected)
     * @param matchId Match identifier
     */
    function refundMatch(bytes32 matchId) external onlyOperator {
        Match storage m = matches[matchId];
        
        if (m.matchId == bytes32(0)) revert MatchNotFound();
        if (m.settled) revert MatchAlreadySettled();
        
        m.settled = true;
        
        // Refund both players
        balances[m.playerA] += m.stake;
        balances[m.playerB] += m.stake;
        
        emit MatchSettled(matchId, address(0), 0, 0);
    }

    // ============ Admin Functions ============

    /**
     * @notice Set operator status
     * @param operator Operator address
     * @param status Active status
     */
    function setOperator(address operator, bool status) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = status;
        emit OperatorUpdated(operator, status);
    }

    /**
     * @notice Update rake percentage
     * @param newRakeBps New rake in basis points
     */
    function setRake(uint256 newRakeBps) external onlyOwner {
        if (newRakeBps > MAX_RAKE_BPS) revert InvalidRake();
        
        uint256 oldRake = rakeBps;
        rakeBps = newRakeBps;
        
        emit RakeUpdated(oldRake, newRakeBps);
    }

    /**
     * @notice Withdraw collected rake
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawRake(address to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount > collectedRake) revert InsufficientBalance();
        
        collectedRake -= amount;
        usdc.safeTransfer(to, amount);
        
        emit RakeWithdrawn(to, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get match details
     * @param matchId Match identifier
     */
    function getMatch(bytes32 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    /**
     * @notice Get player statistics
     * @param player Player address
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @notice Calculate win rate for a player
     * @param player Player address
     * @return winRate Win rate in basis points (10000 = 100%)
     */
    function getWinRate(address player) external view returns (uint256) {
        PlayerStats memory stats = playerStats[player];
        uint256 totalGames = stats.totalWins + stats.totalLosses;
        
        if (totalGames == 0) return 0;
        
        return (stats.totalWins * 10000) / totalGames;
    }
}
