import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   useNavigate,
// } from "react-router-dom";
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CONNECTED_EVENT_DATA,
  CustomChainConfig,
  UserInfo,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/web3auth";
import { LOGIN_MODAL_EVENTS } from "@web3auth/ui";

const WEB3AUTH_CLIENT_ID =
  "BPXquy7pVKpvSW4MX1AIiot1Lj25U6pWmso7xXD9v4BDqxTTi17_GbLKRM1xnYbVxdBULlnsfY6hH9LI-5qqI7Y"; // get your clientId from https://developer.web3auth.io

const solanaChainConfig = {
  chainNamespace: "eip155",
  rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
  blockExplorer: "https://mumbai.polygonscan.com/",
  chainId: "0x13881",
  displayName: "MUMBAI Testnet",
  ticker: "MATIC",
  tickerName: "Matic",
};

export const AuthProviderContext = React.createContext({
  web3auth: null,
  provider: null,
  user: null,
  onSuccessfulLogin: (data) => {},
  login: () => {},
  logout: () => {},
});

const web3auth = new Web3Auth({
  chainConfig: solanaChainConfig,
  clientId: WEB3AUTH_CLIENT_ID, // get your clientId from https://developer.web3auth.io
});

export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  // const navigate = useNavigate();
  const router = useRouter();

  const onSuccessfulLogin = useCallback((data, user) => {
    console.log("onSuccessfulLogin", data, user);
    setProvider(data);
    setUser(user);
  }, []);

  const login = useCallback(() => {
    console.log("Inside login");
    web3auth
      .connect()
      .then((data) => {
        console.log("login data", data);
        router.push("/");
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const logout = useCallback(() => {
    web3auth
      .logout()
      .then(() => {
        // login on logout
        // navigate("/");
        router.push("/");
      })
      .catch((err) => {
        console.log("logout", err);
      });
  }, []);

  const subscribeAuthEvents = useCallback(
    (web3auth) => {
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data) => {
        console.log("Yeah!, you are successfully logged in", data);
        web3auth.getUserInfo().then((user) => {
          onSuccessfulLogin(data, user);
        });
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
        setProvider(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.log("some error or user have cancelled login request", error);
      });

      web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
        console.log("modal visibility", isVisible);
      });
    },
    [onSuccessfulLogin]
  );

  useEffect(() => {
    subscribeAuthEvents(web3auth);

    web3auth.initModal().catch((err) => {
      alert("error" + err);
    });
  }, []);

  const ctx = {
    web3auth,
    provider,
    user,
    onSuccessfulLogin,
    login,
    logout,
  };

  return (
    <AuthProviderContext.Provider value={ctx}>
      {children}
    </AuthProviderContext.Provider>
  );
};

export const AuthConsumer = AuthProviderContext.Consumer;
