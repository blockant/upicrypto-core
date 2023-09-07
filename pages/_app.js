import Success from "../components/Success";
import "../styles/globals.css";
import { AuthConsumer, AuthProvider } from "../Features/Auth/AuthProvider";
import Login from "@/components/Login";
import { Auth } from "@/Features/Auth";
import Header from "@/components/Header";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Auth>
        {(value) => (
          <>
            {/* <Login auth={value} /> */}
            <Component {...pageProps} auth={value} />;
          </>
        )}
      </Auth>
    </>
  );
}
