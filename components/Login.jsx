import "./Login.css";
import { AuthConsumer, AuthProvider } from "../Features/Auth/AuthProvider";
import { useEffect, useState, useRef } from "react";
// import BIRDS from "vanta/dist/vanta.birds.min";
// import * as THREE from "three";

export default function Login(props) {
  // const [vantaEffect, setVantaEffect] = useState(0);
  // const vantaRef = useRef(null);

  // useEffect(() => {
  //   if (!vantaEffect) {
  //     setVantaEffect(
  //       BIRDS({
  //         el: vantaRef.current,
  //         THREE: THREE,
  //         mouseControls: true,
  //         touchControls: true,
  //         gyroControls: false,
  //         minHeight: 600.0,
  //         minWidth: 600.0,
  //         scale: 1.0,
  //         scaleMobile: 1.0,
  //       })
  //     );
  //   }
  //   return () => {
  //     if (vantaEffect) vantaEffect.destroy();
  //   };
  // }, [vantaEffect]);
  return (
    <div className="form">
      <h2 style={{ fontFamily: "monospace" }}>Please Login To Continue</h2>
      <span>
        <img height={200} width={200} src="/Wallet.png" alt="Wallet"></img>

        <button onClick={props.auth.logout} className="login-button">
          Login
        </button>
      </span>
    </div>
  );
}
