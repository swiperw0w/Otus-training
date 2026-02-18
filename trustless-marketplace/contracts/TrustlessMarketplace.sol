// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TrustlessMarketplace is Ownable, ReentrancyGuard {

    error InvalidAmount();
    error EmptyDescription();
    error OrderNotFound();
    error NotOpen();
    error ClientCannotAcceptOwnOrder();
    error AlreadyAccepted();
    error NotClient();
    error InvalidStatus();
    error IncorrectAmount();
    error NotFunded();
    error NotFreelancer();
    error CannotCancel();
    error TransferFailed();
    error NoFeesToWithdraw();
    error InvalidFee();

    event OrderCreated(uint256 indexed orderId, address indexed client, uint256 amount);
    event OrderAccepted(uint256 indexed orderId, address indexed freelancer);
    event OrderFunded(uint256 indexed orderId, uint256 amount);
    event OrderCompleted(uint256 indexed orderId, address indexed freelancer, uint256 payout, uint256 fee);
    event OrderCancelled(uint256 indexed orderId);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() Ownable(msg.sender) {}

    enum Status {
        Open,
        Accepted,
        Funded,
        Completed,
        Cancelled
    }

    struct Order {
        address client;
        address freelancer;
        string description;
        uint256 amount;
        Status status;
    }

    uint256 public orderCounter;
    uint256 public platformFee = 1; // 1% комиссия
    uint256 public accumulatedFees;

    mapping(uint256 => Order) public orders;
    
    /// @notice Создаёт новый заказ
    /// @param description Описание работы
    /// @param amount Сумма сделки в wei
    function createOrder(string memory description, uint256 amount) external {

        if (amount == 0) { 
            revert InvalidAmount();
        }

        if (bytes(description).length == 0) {
            revert EmptyDescription();
        }

        orderCounter++;

        orders[orderCounter] = Order({
            client: msg.sender,
            freelancer: address(0),
            description: description,
            amount: amount,
            status: Status.Open
        });

        emit OrderCreated(orderCounter, msg.sender, amount);
    }

    /// @notice Позволяет фрилансеру принять заказ
    /// @param orderId Идентификатор заказа.  
    function acceptOrder(uint256 orderId) external {

        if (orderId == 0 || orderId > orderCounter) {
            revert OrderNotFound();
        }

        Order storage order = orders[orderId];

        if (order.status != Status.Open) {
            revert NotOpen();
        }

        if (order.client == msg.sender) {
            revert ClientCannotAcceptOwnOrder();
        }

        if (order.freelancer != address(0)) {
            revert AlreadyAccepted();
        }

        order.freelancer = msg.sender;
        order.status = Status.Accepted;

        emit OrderAccepted(orderId, msg.sender);
    }

    /// @notice Клиент вносит депозит в контракт
    /// @dev Сумма должна строго соответствовать amount заказа
    function fundOrder(uint256 orderId) external payable nonReentrant {

        if (orderId == 0 || orderId > orderCounter) {
            revert OrderNotFound();
        }

        Order storage order = orders[orderId];

        if (order.client !=  msg.sender) {
            revert NotClient();
        }

        if (order.status != Status.Accepted) {
            revert InvalidStatus();
        }

        if (msg.value != order.amount) {
            revert IncorrectAmount();
        }

        order.status = Status.Funded;

        emit OrderFunded(orderId, msg.value);
    }
    
    /// @notice Подтверждение выполнения заказа
    /// @dev Рассчитывает комиссию платформы и переводит средства исполнителю
    function confirmCompletion(uint256 orderId) external nonReentrant {
        
        if (orderId == 0 || orderId > orderCounter) {
            revert OrderNotFound();
        }

        Order storage order = orders[orderId];

        if (order.client != msg.sender) {
            revert NotClient();
        }

        if (order.status != Status.Funded) {
            revert NotFunded();
        }

        uint256 fee = (order.amount * platformFee) / 100;
        uint256 payout = order.amount - fee;

        order.status = Status.Completed;
        accumulatedFees += fee;

        (bool success, ) = payable(order.freelancer).call{value: payout}("");
        if (!success) {
            revert TransferFailed();
        }

        emit OrderCompleted(orderId, order.freelancer, payout, fee);
    }

    /// @notice Отмена заказа
    /// @dev Логика зависит от текущего статуса заказа
    function cancelOrder(uint256 orderId) external nonReentrant {

        if (orderId == 0 || orderId > orderCounter) {
            revert OrderNotFound();
        }

        Order storage order = orders[orderId];

        // Клиент отменяет
        if (order.status == Status.Open) {

            if(order.client != msg.sender) {
                revert NotClient();
            }

            order.status = Status.Cancelled;

            emit OrderCancelled(orderId);
            return;
        }

        // Фрилансер отменяет
        if (order.status == Status.Accepted) {

            if (order.freelancer != msg.sender) {
                revert NotFreelancer();
            }

            order.freelancer = address(0);
            order.status = Status.Open;

            emit OrderCancelled(orderId);
            return;
        }

        // Клиент отменяет и получает возврат средств
        if (order.status == Status.Funded) {

            if (order.client != msg.sender) {
                revert NotClient();
            }

            uint256 amount = order.amount;

            order.status = Status.Cancelled;

            (bool success, ) = payable(order.client).call{value: amount}("");
            if (!success) {
                revert TransferFailed();
            }

            emit OrderCancelled(orderId);
            return;
        }

        revert CannotCancel();
    }

    /// @notice Вывод накопленной комиссии владельцем
    function withdrawFees() external onlyOwner nonReentrant {

        uint256 amount = accumulatedFees;

        if (amount == 0) {
            revert NoFeesToWithdraw();
        }

        accumulatedFees = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit FeesWithdrawn(owner(), amount);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {

        if (newFee > 10) {
            revert InvalidFee();
        }

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

}
