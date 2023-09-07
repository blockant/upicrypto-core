import React from "react";
// import {Button} from '@mui/material';
import { AuthConsumer, AuthProvider, AuthProviderData } from "./AuthProvider";

export const Auth = ({ children }) => {
  return (
    <AuthProvider>
      <AuthConsumer>
        {(value) =>
          value.provider ? (
            children(value)
          ) : (
            // <button onClick={value.login} style={{ justifyContent: "center" }}>
            //   Login
            // </button>
            <h2 style={{}}>Login to continue</h2>
          )
        }
      </AuthConsumer>
    </AuthProvider>
  );
};
