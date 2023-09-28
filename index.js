const express = require("express");
const cors = require("cors");
const ethers = require("ethers");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const factoryAbi = require("./factoryabi.json");
const entryPointAbi = require("./entrypointabi.json");
const smartWalletAbi = require("./smartwalletabi.json");
const mongoose = require("mongoose");
const Wallet = require("./model/wallet");
const { isAddress } = require("ethers/lib/utils");

const app = express();

app.use(express.json());
app.use(cors());
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/KFGiZ9X78dt4jBe16IjpjVXbhlPzuSx8"
);

const factoryAddress = "0xbc7cb1188006553fCA5E2aeB76974CfF66Dd9791";
const entryPoint = "0x1781dD58E10698Ce327d493771F7Ba9E5B394BF2";
const salt = 1;

app.post("/deploy-wallet", async (req, res) => {
  console.log("Inside deploy wallet");
  const { owner, userEmail } = req.body;
  console.log("account address", owner);
  console.log("Email", userEmail);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Factory");

  const factory = new ethers.Contract(factoryAddress, factoryAbi, wallet);

  // console.log("factory", factory);

  const deployTx = await factory.deployWallet(entryPoint, owner, salt);
  await deployTx.wait();

  const computedAddress = await factory.computeAddress(entryPoint, owner, salt);

  const newWallet = new Wallet({
    userEmail,
    walletAddress: computedAddress,
  });

  try {
    await newWallet.save();
    res.json({ walletAddress: computedAddress });
  } catch (error) {
    console.error("Error saving wallet data:", error);
    res.status(500).json({ error: "Failed to save wallet data" });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  console.log("Body", req.body);
  const { address, amount } = req.body;
  console.log("Type of amount", amount);
  const wallet = await Wallet.findOne({ walletAddress: address });

  if (!wallet) {
    return res.status(404).json({ error: "Wallet not found" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: address,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      address: address,
    },
    client_reference_id: address,
    mode: "payment",
    success_url: "http://localhost:3000/",
    cancel_url: "http://localhost:3000/cancel",
  });
  console.log("Session", session);

  wallet.balance += +amount;
  await wallet.save();
  res.json({ id: session.id });
});

app.post("/payment", async (req, res) => {
  const { amount, address, token } = req.body;
  console.log("AMount ", amount);
  console.log("token ", token);

  try {
    // Find the wallet with the same userEmail
    const wallet = await Wallet.findOne({ walletAddress: address });

    if (!wallet) {
      res.status(400).json({ error: "No wallet found for this user." });
      return;
    }

    // Check if the wallet already has a customerId
    if (!wallet.customerId) {
      // If the wallet does not have a customerId, create a customer in Stripe
      const stripeCustomer = await stripe.customers.create({
        email: token.email,
        source: token.id,
      });

      // Update the wallet's customerId field
      wallet.customerId = stripeCustomer.id;
      await wallet.save();
    }

    // Create a charge using the customerId
    const charge = await stripe.charges.create(
      {
        amount: amount * 100,
        currency: "inr",
        customer: wallet.customerId,
        receipt_email: token.email,
        description: `Adding Funds`,
      }
      // { idempontencyKey: uuid() }
    );
    wallet.balance += +amount;
    await wallet.save();

    res.status(200).json(charge);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your payment." });
  }
});

app.get("/get-wallet-balance/:walletAddress", async (req, res) => {
  try {
    const address = req.params.walletAddress;
    console.log("Address fron balance ", address);

    const wallet = await Wallet.findOne({ walletAddress: address });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const balance = wallet.balance;
    console.log("Balance", balance);

    res.json({ balance });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get-wallet-balance-new/:walletAddress", async (req, res) => {
  try {
    const address = req.params.walletAddress;
    console.log("Address fron balance ", address);

    const wallet = await Wallet.findOne({ walletAddress: address });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const customer_id = wallet.customerId;
    console.log("Customer Id", customer_id);
    const customer = await stripe.customers.retrieve(customer_id);

    const balance = customer.balance;
    console.log("Balance from new", balance);

    res.json({ balance });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/get-charges-new/:walletAddress", async (req, res) => {
  try {
    const address = req.params.walletAddress;
    console.log("Address fron balance ", address);

    const wallet = await Wallet.findOne({ walletAddress: address });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const customer_id = wallet.customerId;
    const charges = await stripe.charges.list({
      limit: 3,
      customer: customer_id,
    });

    const allCharges = charges.data;
    console.log("Balance", allCharges);

    res.json({ allCharges });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/get-charges", async (req, res) => {
  const { address } = req.body;
  try {
    const charge = await stripe.customers.search({
      query: `metadata['address']:${address}`,
    });

    console.log("charges", charge);
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/check-wallet/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail;

    const wallet = await Wallet.findOne({ userEmail });

    if (wallet) {
      res.json({ hasWallet: true, walletAddress: wallet.walletAddress });
    } else {
      res.json({ hasWallet: false });
    }
  } catch (error) {
    console.error("Error checking wallet:", error);
    res.status(500).json({ error: "Failed to check wallet" });
  }
});

app.post("/execute-transaction", async (req, res) => {
  try {
    const { recipientAddress, amountEth, sender } = req.body;
    console.log("Receipent address", recipientAddress);
    console.log("amount", amountEth);
    console.log("Sender", sender);
    const provider = new ethers.providers.JsonRpcProvider(
      "https://polygon-mumbai.g.alchemy.com/v2/KFGiZ9X78dt4jBe16IjpjVXbhlPzuSx8"
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Walllet", wallet);

    const benificiaryAddress = "0x1781dD58E10698Ce327d493771F7Ba9E5B394BF2";
    const EntryPoint_Addr = "0x1781dD58E10698Ce327d493771F7Ba9E5B394BF2";
    const callGasLimit = "1000000";
    const verificationGasLimit = "200000";
    const preVerificationGas = "5000000";
    const maxFeePerGas = "10000000000";
    const maxPriorityFeePerGas = "10000000000";

    const smartAccount = new ethers.utils.Interface(smartWalletAbi);
    const amount = ethers.utils.parseEther(amountEth.toString());

    const calldata = smartAccount.encodeFunctionData("executeFromEntryPoint", [
      recipientAddress,
      amount,
      "0x",
    ]);

    const smartwallet = new ethers.Contract(sender, smartWalletAbi, wallet);

    const nonce = await smartwallet.nonce();
    const owner = await smartwallet.owner();
    console.log("Owner", owner);

    const EntryPoint = new ethers.Contract(
      EntryPoint_Addr,
      entryPointAbi,
      provider
    );

    let userOpHash;
    try {
      userOpHash = await EntryPoint.getUserOpHash({
        sender: sender,
        nonce: nonce,
        initCode: "0x",
        callData: calldata,
        callGasLimit: callGasLimit,
        verificationGasLimit: verificationGasLimit,
        preVerificationGas: preVerificationGas,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        paymasterAndData: "0x",
        signature: "0x",
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Error generating userOpHash" });
    }
    console.log("UserOpHash", userOpHash);

    const arraifiedHash = ethers.utils.arrayify(userOpHash);

    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://polygon-mumbai.g.alchemy.com/v2/KFGiZ9X78dt4jBe16IjpjVXbhlPzuSx8"
    // );
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const signature = await wallet.signMessage(arraifiedHash);
    const { r, s, v } = ethers.utils.splitSignature(signature);

    const userOperations = [
      {
        sender: sender,
        nonce: nonce,
        initCode: "0x",
        callData: calldata,
        callGasLimit: callGasLimit,
        verificationGasLimit: verificationGasLimit,
        preVerificationGas: preVerificationGas,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        paymasterAndData: "0x",
        signature: signature,
      },
    ];

    try {
      const tx = await EntryPoint.connect(wallet).handleOps(
        userOperations,
        benificiaryAddress,
        { gasLimit: 15000000 }
      );
      await tx.wait();
      return res.status(200).json({
        message: "Transaction executed successfully",
        txHash: tx.hash,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Error executing transaction" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to Wallet db");
    app.listen(8000, () => {
      console.log(" Listning to port no 8000");
    });
  })
  .catch((error) => {
    console.log(error);
  });
