# Smart Wallet API

The Smart Wallet API allows users to deploy wallets and execute transactions on the EVM networks.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Deploying a Wallet](#deploying-a-wallet)
- [Executing a Transaction](#executing-a-transaction)
- [Get Wallet Balance](#get-wallet-balance)
- [Processing an Payment](#processing-an-payment)
- [Add Netowrk](#add-network)
- [Get Netowrk](#get-network)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Deploying a Wallet

### Endpoint

`POST /deploy-wallet`

### Request Body

```json
{
  "owner": "owner_address",
  "userEmail": "user_email_address"
}
```

### Response

```json
{
  "message": "Transaction executed successfully",
  "txHash": "transaction_hash"
}
```

## Examples

### Deploying a Wallet

#### cmd

```bash
curl -X POST -H "Content-Type: application/json" -d '{"owner": "0x123abc", "userEmail": "user@example.com"}' http://UpicryptoApi:3000/deploy-wallet
```

#### Nodejs

```bash
const axios = require('axios');

const data = {
  owner: '0x123abc',
  userEmail: 'user@example.com',
};

axios.post('http://UpicryptoApi/deploy-wallet', data, {
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
```

## Executing a Transaction

To execute a transaction using the Smart Wallet API, you can make a POST request to the `/execute-transaction` endpoint. Provide the required information in the request body, including the recipient address, transaction amount in Ether, and the sender's wallet address.

### Endpoint

`POST /execute-transaction`

### Request Body

```json
{
  "recipientAddress": "recipient_wallet_address",
  "amountEth": "0.1",
  "sender": "sender_wallet_address"
}
```

### Response

```json
{
  "message": "Transaction executed successfully",
  "txHash": "transaction_hash"
}
```

## Examples

### Executing an Transaction

#### cmd

```bash
curl -X POST -H "Content-Type: application/json" -d '{"recipientAddress": "0x456def", "amountEth": "0.1", "sender": "0x123abc"}' http://upicryptoApi:3000/execute-transaction

```

#### Nodejs

```javascript
const axios = require("axios");

const data = {
  recipientAddress: "0x456def",
  amountEth: "0.1",
  sender: "0x123abc",
};

axios
  .post("http://UpicryptoApi:3000/execute-transaction", data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    console.log("Response:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Get Wallet Balance

The Get Wallet Balance API endpoint allows you to retrieve the balance of a wallet based on its address.

### Endpoint

`GET /get-wallet-balance/:walletAddress`

### Request Parameters

- **walletAddress** (URL parameter): The Ethereum address of the wallet for which you want to retrieve the balance.

### Response

Upon successful execution, the API will respond with a JSON object containing the wallet balance.

```json
{
  "balance": "wallet_balance"
}
```

### Response (Success)

```json
{
  "balance": "100.25"
}
```

- **balance** :- wallet balance

### Response (Error)

If the specified wallet address is not found, the API will respond with a 404 error:

```json
{
  "error": "Wallet not found"
}
```

If there's an internal server error, the API will respond with a 500 error:

```json
{
  "error": "Internal server error"
}
```

## Examples

### Getting Wallet FIat balance

#### cmd

```bash
curl http://localhost:3000/get-wallet-balance/0x456def

```

#### Nodejs

```javascript
const axios = require("axios");

const walletAddress = "0x456def";

axios
  .get(`http://localhost:3000/get-wallet-balance/${walletAddress}`)
  .then((response) => {
    console.log("Balance:", response.data.balance);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Process Payment

The Process Payment API endpoint allows you to initiate a payment transaction, adding funds to a user's wallet.

### Endpoint

`POST /payment`

### Request Body

Provide the following information in the request body:

- **amount**: The amount of funds to be added to the wallet.
- **address**: The Ethereum address of the wallet.
- **token**: Payment information including email and token ID.

```json
{
  "amount": 50,
  "address": "0x456def",
  "token": {
    "id": "stripe_token_id",
    "email": "user@example.com"
  }
}
```

### Response

Upon successful execution, the API will respond with details of the payment transaction.

```json
{
  "id": "stripe_charge_id",
  "amount": 5000,
  "currency": "inr",
  "status": "succeeded"
}
```

- **id**: The unique identifier of the Stripe charge.
- **amount**: The amount of funds added (in the smallest currency unit, e.g., cents).
- **currency** : The currency in which the payment was made (in this case, INR).
- **status** : The status of the payment transaction (e.g., "succeeded").

## Examples

### Processing an Payment

#### cmd

```bash
curl -X POST -H "Content-Type: application/json" -d '{"amount": 50, "address": "0x456def", "token": {"id": "stripe_token_id", "email": "user@example.com"}}' http://UpicryptoApi:3000/payment


```

#### Nodejs

```javascript
const axios = require("axios");

const paymentData = {
  amount: 50,
  address: "0x456def",
  token: {
    id: "stripe_token_id",
    email: "user@example.com",
  },
};

axios
  .post("http://UpicryptoApi:3000/payment", paymentData, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    console.log("Payment Details:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Add Network

The Add Network API endpoint allows you to add a new network to a user's wallet.

### Endpoint

`POST /add-network`

### Request Body

Provide the following information in the request body:

- **userEmail**: The email address associated with the user's wallet.
- **networkName**: The name of the network to be added.
- **chainId**: The chain ID of the network.
- **rpcUrl**: The RPC URL of the network.
- **blockExplorerUrl**: The block explorer URL of the network.
- **currencySymbol**: The currency symbol associated with the network.

```json
{
  "userEmail": "user@example.com",
  "networkName": "Custom Network",
  "chainId": "12345",
  "rpcUrl": "https://custom-rpc-url.com",
  "blockExplorerUrl": "https://custom-explorer-url.com",
  "currencySymbol": "CUS"
}
```

### Response

Upon successful execution, the API will respond with a JSON object indicating that the network was added successfully.

```json
{
  "success": "Network added successfully"
}
```

## Examples

### Adding an Network

#### cmd

```bash
curl -X POST -H "Content-Type: application/json" -d '{"userEmail": "user@example.com", "networkName": "Custom Network", "chainId": "12345", "rpcUrl": "https://custom-rpc-url.com", "blockExplorerUrl": "https://custom-explorer-url.com", "currencySymbol": "CUS"}' http://UpicryptoApi:3000/add-network



```

#### Nodejs

```javascript
const axios = require("axios");

const networkData = {
  userEmail: "user@example.com",
  networkName: "Custom Network",
  chainId: "12345",
  rpcUrl: "https://custom-rpc-url.com",
  blockExplorerUrl: "https://custom-explorer-url.com",
  currencySymbol: "CUS",
};

axios
  .post("http://UpicryptoApi:3000/add-network", networkData, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    console.log("Response:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Get Networks

The Get Networks API endpoint allows you to fetch the list of networks associated with a specific wallet.

### Endpoint

`GET /networks/:walletAddress`

### Request Parameters

- **walletAddress** (URL parameter): The Ethereum address of the wallet for which you want to fetch networks.

### Response

Upon successful execution, the API will respond with a JSON object containing an array of networks associated with the wallet.

```json
{
  "networks": [
    {
      "_id": "network_id_1",
      "networkName": "Mainnet",
      "chainId": "1",
      "rpcUrl": "https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY",
      "blockExplorerUrl": "https://etherscan.io/",
      "currencySymbol": "ETH"
    }
    //  additional networks here
  ]
}
```

### Response(ERROR)

If the specified wallet address is not found, the API will respond with a 404 error:

```json
{
  "error": "Wallet not found"
}
```

If there's an internal server error, the API will respond with a 500 error:

```json
{
  "error": "Failed to fetch networks"
}
```

## Examples

### Getting an Network

#### cmd

```bash

curl http://UpicryptoApi:3000/networks/{walletAddress}

```

#### Nodejs

```javascript
const axios = require("axios");

const walletAddress = "0x456def";

axios
  .get(`http://UpicryptoApi:3000/networks/${walletAddress}`)
  .then((response) => {
    console.log("Networks:", response.data.networks);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```
