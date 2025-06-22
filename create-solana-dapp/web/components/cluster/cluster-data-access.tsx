'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

export type Cluster = "mainnet-beta" | "testnet";

interface ClusterContextType {
  cluster: Cluster;
  setCluster: (cluster: Cluster) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

export const ClusterProvider = ({ children }: { children: ReactNode }) => {
  const [cluster, setClusterState] = useState<Cluster>("mainnet-beta");

  // Sync with backend
  useEffect(() => {
    fetch("/api/cluster")
      .then((res) => res.json())
      .then((data) => {
        if (data.cluster === "mainnet-beta" || data.cluster === "testnet") {
          setClusterState(data.cluster);
        }
      });
  }, []);

  const setCluster = (cluster: Cluster) => {
    setClusterState(cluster);
    fetch("/api/cluster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cluster }),
    });
  };

  return (
    <ClusterContext.Provider value={{ cluster, setCluster }}>
      {children}
    </ClusterContext.Provider>
  );
};

export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}

// Utility to map cluster to Solana endpoint
export function getSolanaEndpoint(cluster: Cluster): string {
  switch (cluster) {
    case "mainnet-beta":
      return "https://api.mainnet-beta.solana.com";
    case "testnet":
      return "https://api.testnet.solana.com";
    default:
      return "https://api.mainnet-beta.solana.com";
  }
}

export function toWalletAdapterNetwork(
  cluster?: ClusterNetwork
): WalletAdapterNetwork | undefined {
  switch (cluster) {
    case ClusterNetwork.Mainnet:
      return WalletAdapterNetwork.Mainnet;
    case ClusterNetwork.Testnet:
      return WalletAdapterNetwork.Testnet;
    case ClusterNetwork.Devnet:
      return WalletAdapterNetwork.Devnet;
    default:
      return undefined;
  }
}
