// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotificationFeed {
    address public owner;
    uint256 public notificationCount;
    mapping(uint256 => Notification) public notifications;

    event NotificationAdded(uint256 notificationId, string content, uint256 timestamp);

    struct Notification {
        string content;
        uint256 timestamp;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addNotification(string memory content) public onlyOwner {
        uint256 notificationId = notificationCount++;
        notifications[notificationId] = Notification(content, block.timestamp);
        emit NotificationAdded(notificationId, content, block.timestamp);
    }

    function getNotification(uint256 notificationId) public view returns (string memory, uint256) {
        require(notificationId < notificationCount, "Invalid notification ID");
        Notification memory notification = notifications[notificationId];
        return (notification.content, notification.timestamp);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}
