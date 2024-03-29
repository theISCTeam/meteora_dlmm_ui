// import { 
//     getClosedPosFees, 
//     getCurrent, 
//     getFinal, 
//     getOpenPosFees, 
//     getTokenHodl, 
// } from "./position_math";

/** 
*  Returns position duration for all positions
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as String fixed to 1
*/
export function getAccountDays({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let days = 0.0;
    for(let pos of allPos) {
        days += pos.days;
    };
    return Number(days.toFixed(1));
};
/** 
*  Returns a total of current and final position values for all positions in USD
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountValue({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let value = 0;
    for(let item of allPos) {
        value += item.lastValue;
    };  
    return Number(value);
};
/** 
*  Returns a total of fee values for all positions in USD
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountRewards({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let fees = 0;
    for(let item of allPos) {
        fees += item.fees
    };
    return Number(fees);
};
/** 
*  Returns deposits for all positions in USD (same as getAccountDeposits)
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountUsdHodl({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let value = 0;
    for (let item of allPos){
        value += item.usdHodl;
    };
    return value;
};
/** 
*  Returns deposits for all positions in USD (same as getAccountDeposits)
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountTokenHodl({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let value = 0;
    for (let item of allPos){
        value += item.tokenHodl;
    };
    return value;
};

/**
 *   
*/
export function getNoOfPools ({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let pools = []
    for (let item of allPos){
        const pool = item.lbPair.toString()
        if (pools.indexOf(pool)  === -1 ){
            pools.push(pool)
        }
    };
    return pools.length
}

/**
 *   
*/
export function getNoOfBins({openPositions, closedPositions}){
    const allPos = openPositions.concat(closedPositions);
    let totalBins = 0;
    for (let pos of allPos) {
        if (pos.range) {
            totalBins += pos.range.width;
        }
    }
    return totalBins;
}
/**
 *   
*/
export function getTotalPoints({openPositions, closedPositions}) {
    const allPos = openPositions.concat(closedPositions);
    let totalPoints = 0;
    for (let pos of allPos) {
        totalPoints += pos.points
    }
    return {totalPoints};
}


export function summarizeAccount (allPos) {
    let summary = {
        noOfPools:0, 
        noOfPositions:0, 
        noOfBins:0, 
        days:0 ,
        usdDeposits:0, 
        tokenHodl:0, 
        dlmm:0, 
        fees:0,
        PnL:0, 
        points:{tvl:0, fee:0},
        pools:[]
    };
    
    for (let pos of allPos) {
        //fees 
        summary.fees += pos.fees
        //deposits
        summary.usdDeposits += pos.usdHodl;
        //tokenHodl
        summary.tokenHodl += pos.tokenHodl;
        // bins
        summary.noOfBins += pos.range.width;
        // points
        summary.points.tvl += pos.points.tvl;
        summary.points.fee += pos.points.fee;
        // dlmm
        summary.dlmm += pos.lastValue;
        // days
        summary.days += pos.days;
        // pools
        const pool = pos.lbPair.toString()
        if (summary.pools.indexOf(pool) === -1){
            summary.pools.push(pool);
        }
    }
    // noOfPositions
    summary.noOfPositions = allPos.length;
    // noOfPools
    summary.noOfPools = summary.pools.length;
    // PnL
    summary.PnL = summary.dlmm - summary.usdDeposits + summary.fees;

    return summary
}



















// /** 
// *  Returns combined sharpe ratio for portfolio
//    * @param {number} Rx Expected risk free portfolio return
//    * @param {number} Rf Expected portfolio return
//    * @param {number} StdDev Standard Deviation of portfolio
//    * @return APR as number
// */
// export function getSharpeRatio (Rx, Rf, StdDev) {
//     return (Rx-Rf)/StdDev;
// };

// function getValuesAndMeanFromPositions(open_positions, closed_positions, n) {
//     let values = [];
//     let totalPercent = 0;
//     for(let item of open_positions) {
//         const init = getTokenHodl(item);
//         const current = getCurrent(item);
//         const fees = getOpenPosFees(item);
//         const returns = current-init+fees;
//         const value = (returns/init)*100;
//         totalPercent += value;
//         values.push(value);
//     };
//     for(let item of closed_positions) {
//         const init = getTokenHodl(item);
//         const final  = getFinal(item);
//         const fees = getClosedPosFees(item);
//         const returns = final-init+fees;
//         const value = (returns/init)*100;
//         totalPercent += value;
//         values.push(value);
//     };
//     const mean = totalPercent/n;
//     return {values, mean};
// };
// /** 
// *  Returns Standard Deviation for positions
//    * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
//    * @return StdDev as number
// */
// export function getSTDvFromPositions (open_positions, closed_positions) {
//     const n = (
//         open_positions.length 
//         + closed_positions.length
//     );
//     const {values, mean} = getValuesAndMeanFromPositions(
//         open_positions, 
//         closed_positions,
//         n
//     );
    
//     let sum = 0;
//     values.forEach(val => {
//         sum += Math.pow((val - mean), 2);
//     })
//     const STDv =  Math.sqrt(sum/(n-1));
//     return STDv;
// }