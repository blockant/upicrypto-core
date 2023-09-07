import { useState } from "react";
import "./Header.css";
import { Auth } from "../Features/Auth";
import { AuthConsumer, AuthProvider } from "../Features/Auth/AuthProvider";

// import { BrowserRouter, Route, Link, Routes } from "react-router-dom";

export default function Header({ children }) {
  // const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <header className="header">
      <div>
        <h4>Upi Crypto</h4>
      </div>
      <AuthProvider>
        <AuthConsumer>
          {(value) =>
            value.provider ? (
              <button className="header-button" onClick={value.logout}>
                Logout
              </button>
            ) : (
              <button className="header-button" onClick={value.login}>
                Login
              </button>
            )
          }
        </AuthConsumer>
      </AuthProvider>
    </header>
  );
}
