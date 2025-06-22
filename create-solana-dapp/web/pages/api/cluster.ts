import type { NextApiRequest, NextApiResponse } from "next";

let currentCluster: "mainnet-beta" | "testnet" = "mainnet-beta";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json({ cluster: currentCluster });
  } else if (req.method === "POST") {
    const { cluster } = req.body;
    if (cluster === "mainnet-beta" || cluster === "testnet") {
      currentCluster = cluster;
      res.status(200).json({ cluster: currentCluster });
    } else {
      res.status(400).json({ error: "Invalid cluster" });
    }
  } else {
    res.status(405).end();
  }
}
