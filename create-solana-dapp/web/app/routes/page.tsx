'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './routes.module.css';

interface SwapInfo {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number;
}

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot: number;
  timeTaken: number;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const popularTokens: TokenInfo[] = [
  { address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9 },
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', decimals: 5 },
  { address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', name: 'dogwifhat', decimals: 6 },
  { address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', name: 'Jupiter', decimals: 6 },
  { address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL', decimals: 9 },
];

export default function RouteVisualizer() {
  const [fromToken, setFromToken] = useState(popularTokens[0]);
  const [toToken, setToToken] = useState(popularTokens[1]);
  const [amount, setAmount] = useState('1');
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    // Create token map for quick lookups
    const map = new Map();
    popularTokens.forEach(token => {
      map.set(token.address, token);
    });
    setTokenMap(map);
  }, []);

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, fromToken.decimals));
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountInSmallestUnit}&slippageBps=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      const data = await response.json();
      setQuoteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromToken.address !== toToken.address) {
      fetchQuote();
    }
  }, [fromToken, toToken, amount]);

  const getTokenInfo = (address: string): TokenInfo => {
    return tokenMap.get(address) || {
      address,
      symbol: address.slice(0, 4) + '...',
      name: 'Unknown Token',
      decimals: 6
    };
  };

  const formatAmount = (amount: string, decimals: number): string => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const getAmmColor = (label: string): string => {
    const colors: { [key: string]: string } = {
      'Whirlpool': '#00D4FF',
      'Meteora DLMM': '#FF6B6B',
      'Raydium': '#8B5CF6',
      'Orca': '#FFD93D',
      'Serum': '#00C896',
      'Saber': '#FF8A65',
      'Aldrin': '#4ECDC4',
      'Crema': '#FF7043',
      'Lifinity': '#AB47BC',
      'Mercurial': '#26A69A',
    };
    return colors[label] || '#64748B';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Jupiter Route Visualizer</h1>
        <p className={styles.subtitle}>
          Explore how Jupiter finds the optimal swap routes through different liquidity pools
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label>From Token</label>
          <select 
            value={fromToken.address} 
            onChange={(e) => setFromToken(popularTokens.find(t => t.address === e.target.value) || popularTokens[0])}
            className={styles.select}
          >
            {popularTokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
            placeholder="Enter amount"
            min="0"
            step="0.000001"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>To Token</label>
          <select 
            value={toToken.address} 
            onChange={(e) => setToToken(popularTokens.find(t => t.address === e.target.value) || popularTokens[1])}
            className={styles.select}
          >
            {popularTokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Finding optimal routes...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
        </div>
      )}

      {quoteData && !loading && (
        <div className={styles.results}>
          <div className={styles.summary}>
            <h2>Route Summary</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Input Amount</span>
                <span className={styles.value}>
                  {formatAmount(quoteData.inAmount, fromToken.decimals)} {fromToken.symbol}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Output Amount</span>
                <span className={styles.value}>
                  {formatAmount(quoteData.outAmount, toToken.decimals)} {toToken.symbol}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Price Impact</span>
                <span className={styles.value}>
                  {(parseFloat(quoteData.priceImpactPct) * 100).toFixed(4)}%
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Route Time</span>
                <span className={styles.value}>
                  {(quoteData.timeTaken * 1000).toFixed(2)}ms
                </span>
              </div>
            </div>
          </div>

          <div className={styles.routeVisualization}>
            <h2>Route Visualization</h2>
            <div className={styles.routeContainer}>
              {quoteData.routePlan.map((route, index) => {
                const inputToken = getTokenInfo(route.swapInfo.inputMint);
                const outputToken = getTokenInfo(route.swapInfo.outputMint);
                const ammColor = getAmmColor(route.swapInfo.label);

                return (
                  <div key={index} className={styles.routeStep}>
                    <div className={styles.stepNumber}>{index + 1}</div>
                    
                    <div className={styles.tokenInfo}>
                      <div className={styles.token}>
                        <span className={styles.tokenSymbol}>{inputToken.symbol}</span>
                        <span className={styles.tokenAmount}>
                          {formatAmount(route.swapInfo.inAmount, inputToken.decimals)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.arrow}>→</div>

                    <div 
                      className={styles.ammInfo}
                      style={{ borderColor: ammColor }}
                    >
                      <div 
                        className={styles.ammLabel}
                        style={{ backgroundColor: ammColor }}
                      >
                        {route.swapInfo.label}
                      </div>
                      <div className={styles.ammDetails}>
                        <span>Split: {route.percent}%</span>
                        <span>Fee: {formatAmount(route.swapInfo.feeAmount, inputToken.decimals)}</span>
                      </div>
                    </div>

                    <div className={styles.arrow}>→</div>

                    <div className={styles.tokenInfo}>
                      <div className={styles.token}>
                        <span className={styles.tokenSymbol}>{outputToken.symbol}</span>
                        <span className={styles.tokenAmount}>
                          {formatAmount(route.swapInfo.outAmount, outputToken.decimals)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.routeStats}>
            <h3>Route Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Hops</span>
                <span className={styles.statValue}>{quoteData.routePlan.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Unique AMMs</span>
                <span className={styles.statValue}>
                  {new Set(quoteData.routePlan.map(r => r.swapInfo.label)).size}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Slippage Tolerance</span>
                <span className={styles.statValue}>{quoteData.slippageBps / 100}%</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Swap Mode</span>
                <span className={styles.statValue}>{quoteData.swapMode}</span>
              </div>
            </div>
          </div>

          <div className={styles.ammBreakdown}>
            <h3>AMM Breakdown</h3>
            <div className={styles.ammList}>
              {Array.from(new Set(quoteData.routePlan.map(r => r.swapInfo.label))).map(ammLabel => {
                const ammRoutes = quoteData.routePlan.filter(r => r.swapInfo.label === ammLabel);
                const totalPercent = ammRoutes.reduce((sum, route) => sum + route.percent, 0);
                const ammColor = getAmmColor(ammLabel);

                return (
                  <div key={ammLabel} className={styles.ammItem}>
                    <div 
                      className={styles.ammColorIndicator}
                      style={{ backgroundColor: ammColor }}
                    ></div>
                    <span className={styles.ammName}>{ammLabel}</span>
                    <span className={styles.ammPercent}>{totalPercent}%</span>
                    <span className={styles.ammHops}>{ammRoutes.length} hop{ammRoutes.length > 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}