import { useState } from "react";
import "./CreateWallet.css";
import LoadingSpinner from "./LoadingSpinner";

export default function CreateWallet(props) {
  const [invalidOwner, setInvalidOwner] = useState(false);

  const [walletAddress, setWalletAddressHere] = useState("0x");
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    amt: "",
    t: "",
  });

  function handleWallet() {
    props.setWalletAddress(walletAddress);
  }
  function checkInvalidToAddress(address) {
    if (address.length !== 42) {
      setInvalidOwner(true);
      return true;
    } else {
      setInvalidOwner(false);
      return false;
    }
  }

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    const invalidOwner = checkInvalidToAddress(formValues.owner);

    if (invalidOwner) {
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/deploy-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          userEmail: props.email,
        }),
      });
      const data = await response.json();
      setWalletAddressHere(data.walletAddress);
      props.setWalletAddress(data.walletAddress);
      setLoading(false);
    } catch (error) {
      console.log("Error While Fetching Data ", error);
    }
  };

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Create Wallet</h2>
        {/* <label className="label" htmlFor="token">
          Token:
        </label>
        <input
          className="input"
          type="text"
          id="token"
          name="token"
          onChange={handleChange}
        />
        <br /> */}
        <label className="label" htmlFor="to">
          Owner:
        </label>
        {invalidOwner && (
          <text className="error">Please enter valid Address</text>
        )}
        <input
          className={`input ${invalidOwner ? "error" : ""}`}
          type="text"
          id="owner"
          name="owner"
          onChange={handleChange}
        />
        <br />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <button className="button" type="submit">
            Create Wallet
          </button>
        )}
        {walletAddress && (
          <>
            <br />
            <div className="transaction-hash">
              Wallet Address: {walletAddress}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
