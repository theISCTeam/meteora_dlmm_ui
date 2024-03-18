import { 
    getClosedPosFees, 
    getCurrent, 
    getFinal, 
    getOpenPosFees, 
    getTokenHodl, 
    getUsdAtOpen 
} from "./position_math";

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