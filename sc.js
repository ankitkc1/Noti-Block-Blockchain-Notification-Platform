let contract;

document.addEventListener('DOMContentLoaded', async function () {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
        } catch (error) {
            console.error("User denied account access");
        }
    } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.error("No web3 provider detected. Please install MetaMask.");
    }

    const contractAbi = [
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "content",
					"type": "string"
				}
			],
			"name": "addNotification",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "notificationId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "content",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				}
			],
			"name": "NotificationAdded",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "notificationId",
					"type": "uint256"
				}
			],
			"name": "getNotification",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "notificationCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "notifications",
			"outputs": [
				{
					"internalType": "string",
					"name": "content",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]; // Your ABI here
    const contractAddress = "0x5b6D4bD2e47992a1b437Ec7ECaDc85309d147647"; 

	contract = new web3.eth.Contract(contractAbi, contractAddress);

    await displayNotifications(); // Wait for notifications to be displayed
});

async function displayNotifications() {
    if (!contract) {
        console.error("Contract not initialized");
        return;
    }

    try {
        const notificationsDiv = document.getElementById('notifications');
        const notificationCount = await contract.methods.notificationCount().call();
        console.log("Notification Count:", notificationCount);

        for (let i = 0; i < notificationCount; i++) {
            try {
                const notificationDetails = await contract.methods.getNotification(i).call();
                if (notificationDetails && typeof notificationDetails === 'object') {
                    const { content, timestamp } = notificationDetails;
                    const notificationDiv = document.createElement('div');
                    notificationDiv.classList.add('notification');

                    // Check if timestamp is a valid number
                    const date = !isNaN(timestamp) ? new Date(timestamp * 1000) : null;
                } else {
                    console.error("Invalid notification details:", notificationDetails);
                }
            } catch (error) {
                console.error("Error retrieving notification details:", error);
            }
        }
    } catch (error) {
        console.error("Error displaying notifications:", error);
    }
}


async function addNotification() {
    const content = document.getElementById('notification-content').value;
    
    if (!content) {
        alert("Please enter notification content.");
        return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const fromAddress = accounts[0];

        if (!fromAddress) {
            alert("No Ethereum account available. Please check your wallet connection.");
            return;
        }

        await contract.methods.addNotification(content).send({ from: fromAddress });
        // Clear existing notifications and display updated list
        document.getElementById('notifications').innerHTML = '';
        displayNotifications();
    } catch (error) {
        console.error("Error adding notification:", error);
        alert("Error adding notification. Please check the console for details.");
    }
}


async function getNotification() {
    const notificationId = document.getElementById('notification-id').value;

    if (notificationId === '' || isNaN(notificationId)) {
        alert("Invalid notification ID. Please enter a valid number.");
        return;
    }

    try {
        const notificationCount = await contract.methods.notificationCount().call();

        if (notificationId < 0 || notificationId >= notificationCount) {
            alert("Invalid notification ID. Please enter a valid ID within the range.");
            return;
        }

        const notificationDetails = await contract.methods.getNotification(notificationId).call();
        console.log("Notification Details:", notificationDetails);

        if (
            notificationDetails &&
            typeof notificationDetails === 'object' &&
            notificationDetails[0] !== undefined &&
            notificationDetails[1] !== undefined
        ) {
            const content = notificationDetails[0];
            const timestamp = Number(notificationDetails[1]); // Convert to a number

            if (!isNaN(timestamp)) {
                alert(`Notification Content: ${content}\nTimestamp: ${new Date(timestamp * 1000).toLocaleString()}`);
            } else {
                console.error("Invalid timestamp:", notificationDetails[1]);
                alert("Error: Invalid timestamp format. Please check the console for details.");
            }
        } else {
            console.error("Invalid notification details:", notificationDetails);
            alert("Error: Invalid notification details. Please check the console for details.");
        }
    } catch (error) {
        console.error("Error getting notification details:", error);
        alert("Error: Unable to retrieve notification details. Please check the console for details.");
    }
}




async function transferOwnership() {
    const newOwner = document.getElementById('new-owner').value;
    if (newOwner !== '') {
        try {
            await contract.methods.transferOwnership(newOwner).send({ from: web3.eth.defaultAccount });
            alert("Ownership transferred successfully");
        } catch (error) {
            alert("Error transferring ownership. Please check the new owner address.");
        }
    }
}
