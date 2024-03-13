const { createContext } = require("react");

export const ConnectionContext = createContext('https://api.mainnet-beta.solana.com');
export const PositionsContext = createContext({});
export const PoolsContext = createContext([]);
export const TokenContext = createContext([]);
