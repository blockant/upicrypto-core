"use client";
import Image from "next/image";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Login from "@/components/Login";
import CreateWallet from "@/components/CreateWallet";

export default function Home({ auth }) {
  const [addFiatAmount, setAddFiatAmount] = useState("");
  const [addCryptoAmount, setAddCryptoAmount] = useState("");
  const [fiatBalance, setFiatBalance] = useState(1000);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("0x");

  const handleAddFiat = async () => {
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

    console.log("result is", result);

    if (result.error) {
      console.log(result.error);
    }
    setFiatBalance((prevBalance) => prevBalance + parseFloat(addFiatAmount));
    setAddFiatAmount("");
  };

  const handleAddCrypto = async () => {
    setCryptoBalance(
      (prevBalance) => prevBalance + parseFloat(addCryptoAmount)
    );
    setAddCryptoAmount("");
  };
  let jsxToRender;
  console.log("Insode index.js");

  return (
    <>
      {walletAddress == "0x" ? (
        <CreateWallet setWalletAddress={setWalletAddress} />
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
                type="number"
                value={addFiatAmount}
                onChange={(e) => setAddFiatAmount(e.target.value)}
                placeholder="Enter amount"
              />
              {/* <button onClick={handleAddFiat}>Submit</button> */}
            </div>
            <button onClick={handleAddFiat}>Add Fiat</button>
          </div>
          <div className="balance-section">
            <h3>Crypto Balance: {cryptoBalance} MATIC</h3>
            <button onClick={() => setAddCryptoAmount("")}>Add Crypto</button>
            {addCryptoAmount !== "" && (
              <div className="form">
                <input
                  type="number"
                  value={addCryptoAmount}
                  onChange={(e) => setAddCryptoAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <button className="form-button" onClick={handleAddCrypto}>
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
