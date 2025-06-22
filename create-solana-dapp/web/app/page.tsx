'use client'

import { useEffect } from 'react';
import styles from './page.module.css';
import { useCluster } from "../components/cluster/cluster-data-access";

export default function Page() {
  const { cluster, setCluster } = useCluster();

  useEffect(() => {
    // Dynamically load the Jupiter script
    const script = document.createElement('script');
    script.src = "https://terminal.jup.ag/main-v2.js";
    script.onload = () => launchJupiter(); // Initialize Jupiter after the script loads
    document.head.appendChild(script);
  }, []);

  function launchJupiter() {
    if (window.Jupiter) {
      window.Jupiter.init({ 
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE",
        strictTokenList: false,
        defaultExplorer: "SolanaFM",
        formProps: {
          initialAmount: "888888880000",
          initialInputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          initialOutputMint: "AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR",
        },
      });
    } else {
      console.error("Jupiter script not loaded yet");
    }
  }

  const handleToggleCluster = () => {
    setCluster(cluster === "mainnet-beta" ? "testnet" : "mainnet-beta");
  };

  return (
    <div className={styles.body}>
      {/* Blockchain/Jupiter themed header */}
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#00ffe7",
          textShadow: "0 0 16px #00ffe7, 0 0 32px #2d3142",
          marginBottom: "1.5rem",
          zIndex: 1,
        }}
      >
        Jupiter Swap
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          color: "#e0e6f6",
          maxWidth: "600px",
          textAlign: "center",
          marginBottom: "2.5rem",
          textShadow: "0 0 8px #090a1a",
          zIndex: 1,
        }}
      >
        The next-generation decentralized exchange inspired by the power of Jupiter and the security of blockchain.
      </p>
      <a
        href="#integrated-terminal"
        style={{
          padding: "1rem 2.5rem",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#090a1a",
          background: "linear-gradient(90deg, #00ffe7 0%, #00bfff 100%)",
          border: "none",
          borderRadius: "2rem",
          boxShadow: "0 0 16px #00ffe7, 0 0 32px #00bfff",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          marginBottom: "2rem",
          zIndex: 1,
          display: "inline-block",
          textDecoration: "none"
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 32px #00ffe7, 0 0 64px #00bfff";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 16px #00ffe7, 0 0 32px #00bfff";
        }}
      >
        Launch App
      </a>
      <button onClick={handleToggleCluster}>
        Launch App ({cluster === "mainnet-beta" ? "Switch to Testnet" : "Switch to Mainnet"})
      </button>
      <div id="integrated-terminal"></div>
    </div>
  );
}