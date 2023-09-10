"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Login from "@/components/Login";
import CreateWallet from "@/components/CreateWallet";
import { ethers } from "ethers";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home({ auth }) {
  const [addFiatAmount, setAddFiatAmount] = useState("");
  const [addCryptoAmount, setAddCryptoAmount] = useState("");
  const [fiatBalance, setFiatBalance] = useState(0);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountEth, setAmountEth] = useState("");
  const [transactionHash, setTransactionHash] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState("");
  console.log("auth is here", auth);

  async function checkAndUpdateWallet(userEmail) {
    try {
      const response = await fetch(
        `http://localhost:8000/check-wallet/${userEmail}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const data = await response.json();

      if (data.hasWallet) {
        const walletAddress = data.walletAddress;
        console.log(`User has a wallet with address: ${walletAddress}`);
        setWalletAddress(walletAddress);
      } else {
        console.log("User does not have a wallet");
        return;
      }
    } catch (error) {
      console.error("Error checking and updating wallet:", error);

      return null;
    }
  }

  async function updateBalance(walletAddress) {
    console.log("inside update fiat balance ", walletAddress);
    try {
      const response = await fetch(
        `http://localhost:8000/get-wallet-balance/${walletAddress}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch balance", response);
      }

      const data = await response.json();
      setFiatBalance(data.balance);
      console.log("Wallet balance ", data.balance);
    } catch (error) {
      console.error("Error checking and updating balance:", error);

      return null;
    }
  }

  async function connectToMetaMask() {
    try {
      if (typeof window !== undefined) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected to MetaMask");

        return new ethers.providers.Web3Provider(window.ethereum);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  }

  async function getWalletBalance(walletAddress) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://polygon-mumbai.g.alchemy.com/v2/KFGiZ9X78dt4jBe16IjpjVXbhlPzuSx8"
      );

      if (walletAddress) {
        const balanceWei = await provider.getBalance(walletAddress);

        const balanceEther = ethers.utils.formatEther(balanceWei);
        console.log(balanceEther);

        setCryptoBalance(balanceEther);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  }

  async function handleTransfer() {
    setLoading("crypto");
    try {
      const provider = await connectToMetaMask();

      const signer = provider.getSigner();

      const transaction = {
        to: walletAddress,
        value: ethers.utils.parseEther(amountEth),
      };

      const txResponse = await signer.sendTransaction(transaction);
      console.log("Transaction sent:", txResponse);

      // setTransactionHash(txResponse.hash);
      getWalletBalance(walletAddress);
    } catch (error) {
      console.error("Error sending transaction:", error);
      alert(
        `Transaction failed. Please check the recipient address and try again.`
      );
    }
    setLoading("");
  }

  const handleAATransfer = async () => {
    setLoading("aa");
    console.log("Inside AA Transfer");
    const body = {
      recipientAddress: recipientAddress,
      amountEth: amount,
      sender: walletAddress,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch("http://localhost:8000/execute-transaction", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    setTransactionHash(data.txHash);
    getWalletBalance(walletAddress);
    console.log(data.txHash);
    setLoading("");
  };

  const handleAddFiat = async () => {
    setLoading("fiat");
    console.log("Inside");
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY);
    const body = {
      address: walletAddress,
      amount: addFiatAmount,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      "http://localhost:8000/create-checkout-session",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      }
    );

    const session = await response.json();
    console.log("Session", session);

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    updateBalance(walletAddress);
    setLoading("");

    console.log("result is", result);

    if (result.error) {
      console.log(result.error);
    }
    // setFiatBalance((prevBalance) => prevBalance + parseFloat(addFiatAmount));
    // setAddFiatAmount("");
  };

  console.log("Insode index.js");
  useEffect(() => {
    auth && checkAndUpdateWallet(auth.user.email);
  }, []);

  useEffect(() => {
    try {
      if (walletAddress !== "") {
        getWalletBalance(walletAddress);
        updateBalance(walletAddress);
      }
    } catch (error) {
      console.log(err);
    }
  }, [walletAddress]);

  return (
    <>
      {/* {loading ? (
        <LoadingSpinner />
      ) : ( */}
      <>
        {!walletAddress ? (
          <CreateWallet
            setWalletAddress={setWalletAddress}
            email={auth.user.email}
            // setLoading={setLoading}
          />
        ) : (
          <div className="wallet-container">
            <div className="transaction-hash">
              Wallet Address: {walletAddress}
            </div>
            <h2>Wallet</h2>
            <div className="balance-section">
              <h3>Fiat Balance: {fiatBalance} INR</h3>
              <div className="">
                <input
                  style={{ width: 400, height: 30 }}
                  type="number"
                  value={addFiatAmount}
                  onChange={(e) => setAddFiatAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                {/* <button onClick={handleAddFiat}>Submit</button> */}
              </div>
              {loading == "fiat" ? (
                <LoadingSpinner />
              ) : (
                <button onClick={handleAddFiat}>Add Fiat</button>
              )}
            </div>
            <div className="balance-section">
              <h3>Crypto Balance: {cryptoBalance} MATIC</h3>

              <div className="">
                <input
                  style={{ width: 400, height: 30 }}
                  type="number"
                  value={amountEth}
                  onChange={(e) => setAmountEth(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              {loading == "crypto" ? (
                <LoadingSpinner />
              ) : (
                <button onClick={handleTransfer}>Add Crypto</button>
              )}
            </div>

            <div className="balance-section">
              <h3>Transfer</h3>

              <div className="">
                <input
                  style={{ width: 400, height: 30 }}
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </div>
              <br />
              <div>
                <input
                  style={{ width: 400, height: 30 }}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              {loading == "aa" ? (
                <LoadingSpinner />
              ) : (
                <button className="button-i" onClick={handleAATransfer}>
                  Transfer Token
                </button>
              )}
              {transactionHash && (
                <div className="transaction-hash">
                  Transaction Hash: {transactionHash}
                </div>
              )}
            </div>
          </div>
        )}
      </>
      {/* )} */}
    </>
  );
}
