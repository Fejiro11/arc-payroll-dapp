// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BatchPayroll {
    address public owner;
    
    event PayrollExecuted(address indexed employer, uint256 staffCount, uint256 totalAmount);
    event PaymentSent(address indexed recipient, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    struct Payment {
        address recipient;
        uint256 amount;
    }
    
    /**
     * @notice Execute batch payroll transfers
     * @param token The ERC20 token address (USDC)
     * @param payments Array of recipient addresses and amounts
     */
    function executeBatchPayroll(
        address token,
        Payment[] calldata payments
    ) external {
        require(payments.length > 0, "No payments provided");
        
        uint256 totalAmount = 0;
        
        // Calculate total amount needed
        for (uint256 i = 0; i < payments.length; i++) {
            require(payments[i].recipient != address(0), "Invalid recipient");
            require(payments[i].amount > 0, "Invalid amount");
            totalAmount += payments[i].amount;
        }
        
        // Transfer total amount from employer to this contract
        require(
            IERC20(token).transferFrom(msg.sender, address(this), totalAmount),
            "Transfer to contract failed"
        );
        
        // Distribute to each staff member
        for (uint256 i = 0; i < payments.length; i++) {
            require(
                IERC20(token).transfer(payments[i].recipient, payments[i].amount),
                "Payment failed"
            );
            emit PaymentSent(payments[i].recipient, payments[i].amount);
        }
        
        emit PayrollExecuted(msg.sender, payments.length, totalAmount);
    }
    
    /**
     * @notice Emergency function to recover stuck tokens
     * @param token The token address to recover
     */
    function emergencyWithdraw(address token) external {
        require(msg.sender == owner, "Only owner");
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(tokenContract.transfer(owner, balance), "Transfer failed");
    }
}
