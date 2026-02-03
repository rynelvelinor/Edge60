// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title YellowSettlement
 * @notice State channel settlement contract for Yellow Network integration
 * @dev Handles session creation, deposits, and final settlement of off-chain balances
 */
contract YellowSettlement is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ State Variables ============

    IERC20 public immutable usdc;
    
    // Session structure
    struct Session {
        address user;
        uint256 depositedAmount;
        uint256 nonce;
        bool active;
        uint256 createdAt;
        uint256 lastActivityAt;
    }
    
    // Sessions by session ID
    mapping(bytes32 => Session) public sessions;
    
    // User to active session mapping
    mapping(address => bytes32) public userSessions;
    
    // Yellow Network authorized signers
    mapping(address => bool) public yellowSigners;
    
    // Challenge period for disputes (24 hours)
    uint256 public constant CHALLENGE_PERIOD = 24 hours;
    
    // Minimum session duration
    uint256 public constant MIN_SESSION_DURATION = 1 hours;

    // ============ Events ============

    event SessionCreated(bytes32 indexed sessionId, address indexed user, uint256 amount);
    event SessionDeposit(bytes32 indexed sessionId, uint256 amount);
    event SessionSettled(bytes32 indexed sessionId, address indexed user, uint256 finalBalance);
    event SessionClosed(bytes32 indexed sessionId);
    event YellowSignerUpdated(address indexed signer, bool status);

    // ============ Errors ============

    error SessionNotFound();
    error SessionNotActive();
    error SessionAlreadyExists();
    error InvalidSignature();
    error InvalidAmount();
    error UnauthorizedSigner();
    error SessionTooRecent();
    error ZeroAddress();

    // ============ Constructor ============

    constructor(address _usdc) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    // ============ User Functions ============

    /**
     * @notice Create a new Yellow session with initial deposit
     * @param amount Initial USDC deposit
     * @return sessionId The created session ID
     */
    function createSession(uint256 amount) external nonReentrant returns (bytes32 sessionId) {
        if (amount == 0) revert InvalidAmount();
        if (userSessions[msg.sender] != bytes32(0)) {
            // Check if existing session is still active
            Session storage existing = sessions[userSessions[msg.sender]];
            if (existing.active) revert SessionAlreadyExists();
        }
        
        // Generate session ID
        sessionId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao,
            amount
        ));
        
        // Transfer USDC
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create session
        sessions[sessionId] = Session({
            user: msg.sender,
            depositedAmount: amount,
            nonce: 0,
            active: true,
            createdAt: block.timestamp,
            lastActivityAt: block.timestamp
        });
        
        userSessions[msg.sender] = sessionId;
        
        emit SessionCreated(sessionId, msg.sender, amount);
    }

    /**
     * @notice Add more funds to an existing session
     * @param sessionId Session identifier
     * @param amount Additional USDC to deposit
     */
    function depositToSession(bytes32 sessionId, uint256 amount) external nonReentrant {
        Session storage session = sessions[sessionId];
        
        if (session.user == address(0)) revert SessionNotFound();
        if (!session.active) revert SessionNotActive();
        if (session.user != msg.sender) revert UnauthorizedSigner();
        if (amount == 0) revert InvalidAmount();
        
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        session.depositedAmount += amount;
        session.lastActivityAt = block.timestamp;
        
        emit SessionDeposit(sessionId, amount);
    }

    /**
     * @notice Settle session with final balance from Yellow Network
     * @param sessionId Session identifier
     * @param finalBalance Final balance after off-chain activity
     * @param nonce Transaction nonce for replay protection
     * @param signature Yellow Network signature
     */
    function settleSession(
        bytes32 sessionId,
        uint256 finalBalance,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        Session storage session = sessions[sessionId];
        
        if (session.user == address(0)) revert SessionNotFound();
        if (!session.active) revert SessionNotActive();
        if (session.user != msg.sender) revert UnauthorizedSigner();
        if (nonce <= session.nonce) revert InvalidSignature();
        
        // Verify Yellow Network signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            sessionId,
            finalBalance,
            nonce,
            block.chainid
        ));
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        if (!yellowSigners[signer]) revert UnauthorizedSigner();
        
        // Update session
        session.nonce = nonce;
        session.active = false;
        session.lastActivityAt = block.timestamp;
        
        // Transfer final balance to user
        if (finalBalance > 0) {
            usdc.safeTransfer(msg.sender, finalBalance);
        }
        
        // Clear user session mapping
        userSessions[msg.sender] = bytes32(0);
        
        emit SessionSettled(sessionId, msg.sender, finalBalance);
    }

    /**
     * @notice Force close a stale session (after challenge period)
     * @param sessionId Session identifier
     */
    function forceCloseSession(bytes32 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        
        if (session.user == address(0)) revert SessionNotFound();
        if (!session.active) revert SessionNotActive();
        if (session.user != msg.sender) revert UnauthorizedSigner();
        if (block.timestamp < session.lastActivityAt + CHALLENGE_PERIOD) {
            revert SessionTooRecent();
        }
        
        session.active = false;
        
        // Return full deposited amount on force close
        if (session.depositedAmount > 0) {
            usdc.safeTransfer(session.user, session.depositedAmount);
        }
        
        userSessions[msg.sender] = bytes32(0);
        
        emit SessionClosed(sessionId);
    }

    // ============ Admin Functions ============

    /**
     * @notice Set Yellow Network signer status
     * @param signer Signer address
     * @param status Active status
     */
    function setYellowSigner(address signer, bool status) external onlyOwner {
        if (signer == address(0)) revert ZeroAddress();
        yellowSigners[signer] = status;
        emit YellowSignerUpdated(signer, status);
    }

    // ============ View Functions ============

    /**
     * @notice Get session details
     * @param sessionId Session identifier
     */
    function getSession(bytes32 sessionId) external view returns (Session memory) {
        return sessions[sessionId];
    }

    /**
     * @notice Get active session for user
     * @param user User address
     */
    function getUserSession(address user) external view returns (bytes32) {
        return userSessions[user];
    }

    /**
     * @notice Check if user has active session
     * @param user User address
     */
    function hasActiveSession(address user) external view returns (bool) {
        bytes32 sessionId = userSessions[user];
        if (sessionId == bytes32(0)) return false;
        return sessions[sessionId].active;
    }
}
