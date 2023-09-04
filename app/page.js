"use client";
import Image from "next/image";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function Home() {
  const [addFiatAmount, setAddFiatAmount] = useState("");
  const [addCryptoAmount, setAddCryptoAmount] = useState("");
  const [fiatBalance, setFiatBalance] = useState(1000); // Initialize with a default balance
  const [cryptoBalance, setCryptoBalance] = useState(0); // Initialize with a default balance

  const handleAddFiat = async () => {
    console.log("Inside");
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY);
    const body = {
      address: "0x84C632431C444b0b076fc5784cd59c065E75dCdc",
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

    const result = stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error);
    }
    setFiatBalance((prevBalance) => prevBalance + parseFloat(addFiatAmount));
    setAddFiatAmount("");
  };

  const handleAddCrypto = async () => {
    // You should send a request to your backend to add crypto here
    // After a successful request, update the balance and reset the form
    setCryptoBalance(
      (prevBalance) => prevBalance + parseFloat(addCryptoAmount)
    );
    setAddCryptoAmount("");
  };
  return (
    <div className="wallet-container">
      <h2>Wallet</h2>
      <div className="balance-section">
        <h3>Fiat Balance: {fiatBalance} USD</h3>
        <div className="form">
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
        <h3>Crypto Balance: {cryptoBalance} BTC</h3>
        <button onClick={() => setAddCryptoAmount("")}>Add Crypto</button>
        {addCryptoAmount !== "" && (
          <div className="form">
            <input
              type="number"
              value={addCryptoAmount}
              onChange={(e) => setAddCryptoAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handleAddCrypto}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
