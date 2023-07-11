const express = require("express");
const ethers = require("ethers");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const {
  ERC20_ABI,
  getVerifyingPaymaster,
  getSimpleAccount,
  getGasFee,
  printOp,
  getHttpRpcClient,
} = require("../src");
const config = require("../config.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cors());

//EndPoint for getting Simple Account

app.get("/simple-account", async (req, res) => {
  console.log("From Simple-account");
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const accountAPI = getSimpleAccount(
      provider,
      config.signingKey,
      config.entryPoint,
      config.simpleAccountFactory
    );
    const address = await accountAPI.getCounterFactualAddress();

    res.status(200).json({ address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An Error occured while getting Account" });
  }
});

//End point for batchErc20-transfer

app.post("/batcherc20-transfer", async (req, res) => {
  console.log("From batch erc 20");
  try {
    console.log(req.body);
    const { tkn, t, amt, withPM } = req.body;
    console.log("Tkn address", tkn);
    console.log("To array", t);
    console.log("Amount", amt);

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const paymasterAPI = withPM
      ? getVerifyingPaymaster(config.paymasterUrl, config.entryPoint)
      : undefined;
    const accountAPI = getSimpleAccount(
      provider,
      config.signingKey,
      config.entryPoint,
      config.simpleAccountFactory,
      paymasterAPI
    );
    const sender = await accountAPI.getCounterFactualAddress();

    const token = ethers.utils.getAddress(tkn);
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([
      erc20.symbol(),
      erc20.decimals(),
    ]);
    const amount = ethers.utils.parseUnits(amt, decimals);

    let dest = [];
    let data = [];
    t.map((addr) => addr.trim()).forEach((addr) => {
      dest = [...dest, erc20.address];
      data = [
        ...data,
        erc20.interface.encodeFunctionData("transfer", [
          ethers.utils.getAddress(addr),
          amount,
        ]),
      ];
    });

    const ac = await accountAPI._getAccountContract();
    const op = await accountAPI.createSignedUserOp({
      target: sender,
      data: ac.interface.encodeFunctionData("executeBatch", [dest, data]),
      ...(await getGasFee(provider)),
    });
    console.log(`Signed UserOperation: ${await printOp(op)}`);

    const client = await getHttpRpcClient(
      provider,
      config.bundlerUrl,
      config.entryPoint
    );
    const uoHash = await client.sendUserOpToBundler(op);
    console.log(`UserOpHash: ${uoHash}`);

    console.log("Waiting for transaction...");
    const txHash = await accountAPI.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);

    res.status(200).json({ txHash });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occured while executing batcherc20 transfers" });
  }
});

//End point for batch-transafers

app.post("/batch-transfer", async (req, res) => {
  console.log(" From batch-transfers");
  try {
    console.log("body", req.body);
    const { t, amt, withPM } = req.body;

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const paymasterAPI = withPM
      ? getVerifyingPaymaster(config.paymasterUrl, config.entryPoint)
      : undefined;
    const accountAPI = getSimpleAccount(
      provider,
      config.signingKey,
      config.entryPoint,
      config.simpleAccountFactory,
      paymasterAPI
    );
    const sender = await accountAPI.getCounterFactualAddress();

    const ac = await accountAPI._getAccountContract();
    const value = ethers.utils.parseEther(amt);
    let dest = [];
    let data = [];
    t.map((addr) => addr.trim()).forEach((addr) => {
      dest = [...dest, sender];
      data = [
        ...data,
        ac.interface.encodeFunctionData("execute", [
          ethers.utils.getAddress(addr),
          value,
          "0x",
        ]),
      ];
    });

    const op = await accountAPI.createSignedUserOp({
      target: sender,
      data: ac.interface.encodeFunctionData("executeBatch", [dest, data]),
      ...(await getGasFee(provider)),
    });
    console.log(`Signed UserOperation: ${await printOp(op)}`);

    const client = await getHttpRpcClient(
      provider,
      config.bundlerUrl,
      config.entryPoint
    );
    const uoHash = await client.sendUserOpToBundler(op);
    console.log(`UserOpHash: ${uoHash}`);

    console.log("Waiting for transaction...");
    const txHash = await accountAPI.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);

    res.status(200).json({ txHash });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An Error occured while executing Batch-transfers" });
  }
});

//End Point for erc20Transafers

app.post("/erc20-transfer", async (req, res) => {
  console.log("From Erc20 transfers");
  try {
    console.log(req.body);
    const { tkn, t, amt, withPM } = req.body;

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const paymasterAPI = withPM
      ? getVerifyingPaymaster(config.paymasterUrl, config.entryPoint)
      : undefined;
    const accountAPI = getSimpleAccount(
      provider,
      config.signingKey,
      config.entryPoint,
      config.simpleAccountFactory,
      paymasterAPI
    );

    const token = ethers.utils.getAddress(tkn);
    const to = ethers.utils.getAddress(t);
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([
      erc20.symbol(),
      erc20.decimals(),
    ]);
    const amount = ethers.utils.parseUnits(amt, decimals);
    console.log(`Transferring ${amt} ${symbol}...`);

    const op = await accountAPI.createSignedUserOp({
      target: erc20.address,
      data: erc20.interface.encodeFunctionData("transfer", [to, amount]),
      ...(await getGasFee(provider)),
    });
    console.log(`Signed UserOperation: ${await printOp(op)}`);

    const client = await getHttpRpcClient(
      provider,
      config.bundlerUrl,
      config.entryPoint
    );
    const uoHash = await client.sendUserOpToBundler(op);
    console.log(`UserOpHash: ${uoHash}`);

    console.log("Waiting for transaction...");
    const txHash = await accountAPI.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);

    res.status(200).json({ txHash });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while transfering Erc20" });
  }
});

//End point for transfer

app.post("/transfer", async (req, res) => {
  console.log("From transfer");
  try {
    console.log(req.body);
    const { t, amt, withPM } = req.body;

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const paymasterAPI = withPM
      ? getVerifyingPaymaster(config.paymasterUrl, config.entryPoint)
      : undefined;
    const accountAPI = getSimpleAccount(
      provider,
      config.signingKey,
      config.entryPoint,
      config.simpleAccountFactory,
      paymasterAPI
    );

    const target = ethers.utils.getAddress(t);
    const value = ethers.utils.parseEther(amt);
    const op = await accountAPI.createSignedUserOp({
      target,
      value,
      data: "0x",
      ...(await getGasFee(provider)),
    });
    console.log(`Signed UserOperation: ${await printOp(op)}`);

    const client = await getHttpRpcClient(
      provider,
      config.bundlerUrl,
      config.entryPoint
    );
    const uoHash = await client.sendUserOpToBundler(op);
    console.log(`UserOpHash: ${uoHash}`);

    console.log("Waiting for transaction...");
    const txHash = await accountAPI.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);

    res.status(200).json({ txHash });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while Transfer" });
  }
});

app.listen(30001, () => {
  console.log("Server listning to port 30001");
});
