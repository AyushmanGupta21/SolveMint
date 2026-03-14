// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SolveMint
 * @notice Decentralised AI data-labeling micro-task platform.
 *
 * Flow:
 *   1. Company calls createTask(), locking workersRequired * rewardPerWorker wei.
 *   2. Workers call submitAnswer(). Duplicate submissions are rejected.
 *   3. When the required number of answers is reached the contract automatically
 *      computes the majority option and pays every matching worker.
 *   4. After the deadline, if the task was never resolved, anyone may call
 *      claimRefund() to return the locked funds to the company.
 */
contract SolveMint {
    // ─── Types ────────────────────────────────────────────────────────────────

    struct Task {
        address company;
        string  metadataCID;       // IPFS CID of { imageUrl, question, options[] }
        uint8   optionCount;       // how many answer choices exist
        uint256 workersRequired;
        uint256 rewardPerWorker;   // in wei
        uint256 deadline;          // unix timestamp
        uint256 totalFunds;        // wei locked in escrow
        bool    resolved;
        bool    refunded;
        uint256 submissionCount;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    uint256 public taskCount;

    /// taskId => Task
    mapping(uint256 => Task) public tasks;

    /// taskId => worker address => answer index (1-based; 0 = not submitted)
    mapping(uint256 => mapping(address => uint8)) private _submissions;

    /// taskId => option index (0-based) => vote count
    mapping(uint256 => mapping(uint8 => uint256)) private _tally;

    /// taskId => list of worker addresses (for payout iteration)
    mapping(uint256 => address[]) private _workers;

    // ─── Events ────────────────────────────────────────────────────────────────

    event TaskCreated(
        uint256 indexed taskId,
        address indexed company,
        string  metadataCID,
        uint256 workersRequired,
        uint256 rewardPerWorker,
        uint256 deadline,
        uint256 totalFunds
    );

    event AnswerSubmitted(
        uint256 indexed taskId,
        address indexed worker,
        uint8   optionIndex
    );

    event RewardsDistributed(
        uint256 indexed taskId,
        uint8   majorityOption,
        uint256 winnersCount,
        uint256 rewardPerWinner
    );

    event RefundIssued(
        uint256 indexed taskId,
        address indexed company,
        uint256 amount
    );

    // ─── Errors ────────────────────────────────────────────────────────────────

    error InvalidOptions();
    error InvalidWorkerCount();
    error InvalidReward();
    error InsufficientFunds();
    error InvalidDeadline();
    error TaskNotFound();
    error TaskAlreadyResolved();
    error DeadlineNotPassed();
    error AlreadySubmitted();
    error InvalidOption();
    error NotCompany();
    error TaskExpired();
    error NoRefundAvailable();

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier taskExists(uint256 taskId) {
        if (taskId == 0 || taskId > taskCount) revert TaskNotFound();
        _;
    }

    modifier notResolved(uint256 taskId) {
        if (tasks[taskId].resolved) revert TaskAlreadyResolved();
        _;
    }

    // ─── Functions ─────────────────────────────────────────────────────────────

    /**
     * @notice Create a new labeling task and lock the reward escrow.
     * @param metadataCID  IPFS CID pointing to the task metadata JSON.
     * @param optionCount  Number of answer choices (2–10).
    * @param workersRequired Number of workers needed to resolve (minimum 3).
     * @param rewardPerWorker Reward in wei paid to each correct worker.
     * @param deadline     Unix timestamp after which the task can be refunded.
     */
    function createTask(
        string  calldata metadataCID,
        uint8   optionCount,
        uint256 workersRequired,
        uint256 rewardPerWorker,
        uint256 deadline
    ) external payable returns (uint256 taskId) {
        if (optionCount < 2 || optionCount > 10)     revert InvalidOptions();
        if (workersRequired < 3)                      revert InvalidWorkerCount();
        if (rewardPerWorker == 0)                     revert InvalidReward();
        if (deadline <= block.timestamp)              revert InvalidDeadline();

        uint256 required = workersRequired * rewardPerWorker;
        if (msg.value < required)                     revert InsufficientFunds();

        taskCount++;
        taskId = taskCount;

        Task storage t = tasks[taskId];
        t.company         = msg.sender;
        t.metadataCID     = metadataCID;
        t.optionCount     = optionCount;
        t.workersRequired = workersRequired;
        t.rewardPerWorker = rewardPerWorker;
        t.deadline        = deadline;
        t.totalFunds      = required;

        // Refund any excess ETH sent
        uint256 excess = msg.value - required;
        if (excess > 0) {
            (bool ok, ) = msg.sender.call{value: excess}("");
            require(ok, "Excess refund failed");
        }

        emit TaskCreated(taskId, msg.sender, metadataCID, workersRequired, rewardPerWorker, deadline, required);
    }

    /**
     * @notice Worker submits their answer for a task.
     * @param taskId      The task to answer.
     * @param optionIndex 0-based index of the chosen option.
     */
    function submitAnswer(uint256 taskId, uint8 optionIndex)
        external
        taskExists(taskId)
        notResolved(taskId)
    {
        Task storage t = tasks[taskId];

        if (block.timestamp >= t.deadline)             revert TaskExpired();
        if (_submissions[taskId][msg.sender] != 0)     revert AlreadySubmitted();
        if (optionIndex >= t.optionCount)              revert InvalidOption();

        // Store 1-based so that 0 means "not submitted"
        _submissions[taskId][msg.sender] = optionIndex + 1;
        _tally[taskId][optionIndex]++;
        _workers[taskId].push(msg.sender);
        t.submissionCount++;

        emit AnswerSubmitted(taskId, msg.sender, optionIndex);

        // Auto-resolve when enough workers have answered
        if (t.submissionCount >= t.workersRequired) {
            _resolve(taskId);
        }
    }

    /**
     * @notice Refund the company if the deadline has passed and
     *         the task was never resolved (not enough workers answered).
     */
    function claimRefund(uint256 taskId)
        external
        taskExists(taskId)
        notResolved(taskId)
    {
        Task storage t = tasks[taskId];

        if (block.timestamp < t.deadline)  revert DeadlineNotPassed();
        if (t.refunded)                    revert NoRefundAvailable();

        t.refunded = true;
        t.resolved = true;

        uint256 amount = t.totalFunds;
        t.totalFunds = 0;

        (bool ok, ) = t.company.call{value: amount}("");
        require(ok, "Refund transfer failed");

        emit RefundIssued(taskId, t.company, amount);
    }

    // ─── View helpers ──────────────────────────────────────────────────────────

    /// @notice Returns how many workers have answered a task.
    function submissionCount(uint256 taskId) external view returns (uint256) {
        return tasks[taskId].submissionCount;
    }

    /// @notice Returns the answer a given worker submitted (0-based), or
    ///         reverts if the worker has not submitted.
    function workerAnswer(uint256 taskId, address worker)
        external
        view
        returns (uint8)
    {
        uint8 stored = _submissions[taskId][worker];
        require(stored != 0, "No submission");
        return stored - 1;
    }

    /// @notice Returns the vote count for a specific option.
    function optionTally(uint256 taskId, uint8 optionIndex)
        external
        view
        returns (uint256)
    {
        return _tally[taskId][optionIndex];
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _resolve(uint256 taskId) internal {
        Task storage t = tasks[taskId];
        t.resolved = true;

        // Find majority option
        uint8   majority      = 0;
        uint256 highestVotes  = 0;

        for (uint8 i = 0; i < t.optionCount; i++) {
            uint256 votes = _tally[taskId][i];
            if (votes > highestVotes) {
                highestVotes = votes;
                majority     = i;
            }
        }

        // Identify winners (workers who selected the majority option)
        address[] storage workers = _workers[taskId];
        uint256 winnersCount = 0;

        for (uint256 i = 0; i < workers.length; i++) {
            address w = workers[i];
            // stored as 1-based; convert back to 0-based for comparison
            if (_submissions[taskId][w] - 1 == majority) {
                winnersCount++;
            }
        }

        // No winners should be impossible once at least one submission exists,
        // but guard anyway to avoid division by zero.
        require(winnersCount > 0, "No winners");

        // Distribute the FULL locked pool equally among majority winners.
        // Any division remainder (dust) is refunded to the company.
        uint256 rewardPerWinner = t.totalFunds / winnersCount;
        uint256 paid = rewardPerWinner * winnersCount;
        uint256 leftover = t.totalFunds - paid;

        // Effects first
        t.totalFunds = 0;

        // Interactions
        for (uint256 i = 0; i < workers.length; i++) {
            address w = workers[i];
            if (_submissions[taskId][w] - 1 == majority) {
                (bool ok, ) = w.call{value: rewardPerWinner}("");
                require(ok, "Payment failed");
            }
        }

        if (leftover > 0) {
            (bool ok, ) = t.company.call{value: leftover}("");
            require(ok, "Leftover refund failed");
        }

        emit RewardsDistributed(taskId, majority, winnersCount, rewardPerWinner);
    }
}
