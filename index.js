const express = require("express");
const cors = require("cors");
const ethers = require("ethers");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const factoryAbi = require("./factoryabi.json");

const app = express();

app.use(express.json());
app.use(cors());
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/KFGiZ9X78dt4jBe16IjpjVXbhlPzuSx8"
);

const factoryAddress = "0xbc7cb1188006553fCA5E2aeB76974CfF66Dd9791";
const entryPoint = "0x1d965463060CF0baC17C67ec8FF9ace46d6D53d8";
const salt = 1;

app.post("/deploy-wallet", async (req, res) => {
  const { accountAddress } = req.body;
  console.log("account address", accountAddress);

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );
  console.log("Factory");

  const factory = new ethers.Contract(factoryAddress,factoryAbi,wallet);

  console.log("factory", factory);

  const deployTx = await factory.deployWallet(entryPoint, accountAddress, salt);
  await deployTx.wait();

  const computedAddress = await factory.computeAddress(
    entryPoint,
    accountAddress,
    salt
  );

  res.json({ walletAddress: computedAddress });
});

app.post("/create-checkout-session", async (req, res) => {
  const { address, amount } = req.body;
  console.log("Type of amount", amount);
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
    client_reference_id: address,
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.json({ id: session.id });
});

app.listen(8000, () => {
  console.log("Server started at port 8000");
});
