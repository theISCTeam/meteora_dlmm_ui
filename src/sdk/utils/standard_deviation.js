// Get historical prices for assets between open and c


const getInitial = (item) => {
    const amt_x = ((item.initial_x / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.initial_y / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}

const getCurrent = (item) => {
    const amt_x = ((item.current_x.toNumber() / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.current_y.toNumber() / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}
const getFees = (item) => {
    const amt_x = ((item.rewards_x_claimed + item.rewards_x_unclaimed / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.rewards_y_claimed + item.rewards_y_unclaimed / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}

function getValuesAndMeanFromPositions(open_positions, closed_positions, n) {
    let values = []
    let totalPercent = 0
    for(let item of open_positions) {
        const init = getInitial(item);
        const current = getCurrent(item);
        const rewards = getFees(item);
        const returns = current-init+rewards
        const value = (returns/init)*100
        totalPercent += value;
        values.push(value)
    }
    for(let item of closed_positions) {
        const init = ((item.initial_x / 10**item.decimals_x)*item.x_price.value) + ((item.initial_y / 10**item.decimals_y)*item.y_price.value)
        const final  = ((item.final_x / 10**item.decimals_x)*item.x_price.value) + ((item.final_y / 10**item.decimals_y)*item.y_price.value);
        const rewards = ((item.rewards_x / 10**item.decimals_x)*item.x_price.value) + ((item.rewards_y / 10**item.decimals_y)*item.y_price.value);
        const returns = final-init+rewards
        const value = (returns/init)*100
        totalPercent += value;
        values.push(value)
    }
    const mean = totalPercent/n;
    return {values, mean}
}


export function getSTDvFromPositions (open_positions, closed_positions) {
    const n = open_positions.length + closed_positions.length;
    const {values, mean} = getValuesAndMeanFromPositions(open_positions, closed_positions, n);
    let sum = 0;
    values.forEach(val => {
        sum += Math.pow((val - mean), 2);
    })
    const STDv =  Math.sqrt(sum/(n-1));
    return STDv

}