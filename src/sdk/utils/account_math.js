import { 
    getClosedPosFees, 
    getCurrent, 
    getDays, 
    getFinal, 
    getOpenPosFees, 
    getPosPoints, 
    getTokenHodl, 
    getUsdAtOpen 
} from "./position_math";
/** 
*  Returns position duration for all positions
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as String fixed to 1
*/
export function getAccountDays({openPositions, closedPositions}) {
    let days = 0.0;
    for(let pos of closedPositions) {
        days += (
            (pos.close_time - pos.open_time)
             / 86400
        );
    };
    for(let pos of openPositions) {
        days += (
            (pos.close_time  - pos.open_time) 
            / 86400
        );
    };
    return Number(days.toFixed(1));
};
/** 
*  Returns deposits for all positions in USD
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountDeposits({openPositions, closedPositions}) {
    let deposits = 0;
    for(let item of closedPositions) {
        deposits += getUsdAtOpen(item);
    };
    for(let item of openPositions) {
        deposits += getUsdAtOpen(item);
    };
    return Number(deposits);
};
/** 
*  Returns a total of current and final position values for all positions in USD
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountValue({openPositions, closedPositions}) {
    let value = 0;
    for(let item of closedPositions) {
        value += getFinal(item);
    };  
    for(let item of openPositions) {
        value += getCurrent(item);
    };
    return Number(value);
};
/** 
*  Returns a total of fee values for all positions in USD
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountRewards({openPositions, closedPositions}) {
    let fees = 0;
    for(let item of closedPositions) {
        fees += getClosedPosFees(item);
    };
    for(let item of openPositions) {
        fees += getOpenPosFees(item);
    };
    return Number(fees);
};
/** 
*  Returns deposits for all positions in USD (same as getAccountDeposits)
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountUsdHodl({openPositions, closedPositions}) {
    let value = 0;
    for (let item of closedPositions){
        value += getUsdAtOpen(item);
    };
    for (let item of openPositions) {
        value += getUsdAtOpen(item);
    };
    return value;
};
/** 
*  Returns deposits for all positions in USD (same as getAccountDeposits)
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return value as number
*/
export function getAccountTokenHodl({openPositions, closedPositions}) {
    let value = 0;
    for (let item of closedPositions){
        value += getTokenHodl(item);
    };
    for (let item of openPositions) {
        value += getTokenHodl(item);
    };
    return value;
};
/** 
*  Returns combined sharpe ratio for portfolio
   * @param {number} Rx Expected risk free portfolio return
   * @param {number} Rf Expected portfolio return
   * @param {number} StdDev Standard Deviation of portfolio
   * @return APR as number
*/
export function getSharpeRatio (Rx, Rf, StdDev) {
    return (Rx-Rf)/StdDev;
};

function getValuesAndMeanFromPositions(open_positions, closed_positions, n) {
    let values = [];
    let totalPercent = 0;
    for(let item of open_positions) {
        const init = getTokenHodl(item);
        const current = getCurrent(item);
        const fees = getOpenPosFees(item);
        const returns = current-init+fees;
        const value = (returns/init)*100;
        totalPercent += value;
        values.push(value);
    };
    for(let item of closed_positions) {
        const init = getTokenHodl(item);
        const final  = getFinal(item);
        const fees = getClosedPosFees(item);
        const returns = final-init+fees;
        const value = (returns/init)*100;
        totalPercent += value;
        values.push(value);
    };
    const mean = totalPercent/n;
    return {values, mean};
};
/** 
*  Returns Standard Deviation for positions
   * @param  {Object} positions Object containing two parsed position object arrays {openPositions, closedPositions}
   * @return StdDev as number
*/
export function getSTDvFromPositions (open_positions, closed_positions) {
    const n = (
        open_positions.length 
        + closed_positions.length
    );
    const {values, mean} = getValuesAndMeanFromPositions(
        open_positions, 
        closed_positions,
        n
    );
    
    let sum = 0;
    values.forEach(val => {
        sum += Math.pow((val - mean), 2);
    })
    const STDv =  Math.sqrt(sum/(n-1));
    return STDv;
}

export function getNoOfPools ({openPositions, closedPositions}) {
    let pools = []
    for (let item of closedPositions){
        const pool = item.lbPair.toString()
        if (pools.indexOf(pool)  === -1){
            pools.push(pool)
        }
    };
    for (let item of openPositions) {
        const pool = item.lbPair.toString()
        if (pools.indexOf(pool)  === -1){
            pools.push(pool)
        }
    };
    return pools.length
}

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

export function getTotalPoints({openPositions, closedPositions}) {
/*     1.3x multiplier for OG’s before Dec 1st 2023 at launch.
    1.25x multiplier for everyone else at launch. This reduces to 1.20x in Mar, 1.1x in Apr */
    const ogDeadline = 1701388800;
    const launch = 1706659200;
    const mar = 1709251200;
    const apr = 1711929600;

    const allPos = openPositions.concat(closedPositions);
    let totalPoints = 0;
    let earliest = 9999999999;
    for (let pos of allPos) {
        const days = getDays(pos.open_time, pos.close_time)
        totalPoints += getPosPoints(pos, days);
        if(pos.open_time < earliest) {earliest = Math.round(pos.open_time)}
    }

    let multiplier = 1;
    if (apr > earliest) {multiplier = 1.1};
    if (mar > earliest) { multiplier = 1.2};
    if (launch > earliest) {multiplier = 1.25};
    if (ogDeadline > earliest) {multiplier = 1.3};
    
    return {totalPoints, multiplier};
}