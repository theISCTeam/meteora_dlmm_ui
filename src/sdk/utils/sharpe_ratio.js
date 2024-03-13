// Sharpe ratio = (Rx - Rf)/StdDev
// Rx - Expected Portfolio Return (Could be Account APR)
// Rf = Risk free return (Could be Deposits value (If you never invested in DLMM))
// StdDev - Standard Deviation (We have this)


export function getSharpeRatio (StdDev, AllTimeAPR, RiskFreeReturns) {
    return (AllTimeAPR-RiskFreeReturns)/StdDev
}