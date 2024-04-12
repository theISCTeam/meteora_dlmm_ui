const { createContext } = require("react");

export const ConnectionContext = createContext('');
export const PositionsContext = createContext({});
export const PoolsContext = createContext([]);
export const TokenContext = createContext([]);
export const FilterContext = createContext([]);
export const PriceContext = createContext({});
export const ErrorContext = createContext({});