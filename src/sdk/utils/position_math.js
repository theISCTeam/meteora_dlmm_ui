import { find_nearest_price_to_time } from "../parse_position_events";

/** 
*  Returns USD value of position at Open
   * @param  {Object} pos Parsed Position
   * @return value as Number
*/
export const getUsdAtOpen = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.open_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.open_time);
    const amt_x = ((pos.initial_x / 10**pos.decimals_x)*price_x.value);
    const amt_y = ((pos.initial_y / 10**pos.decimals_y)*price_y.value);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of initial asset dist at last price (current or close price) 
   * @param  {Object} pos Parsed Position
   * @return value as Number
*/
export const getTokenHodl = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.close_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.close_time);
    const amt_x = ((pos.initial_x / 10**pos.decimals_x)*price_x.value);
    const amt_y = ((pos.initial_y / 10**pos.decimals_y)*price_y.value);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of current asset dist at last price 
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getCurrent = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.close_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.close_time);
    const amt_x = (((Number(pos.current_x)+Number(pos.withdrawn_x)) / (10**pos.decimals_x))*price_x.value);
    const amt_y = (((Number(pos.current_y)+Number(pos.withdrawn_y)) / (10**pos.decimals_y))*price_y.value);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of final asset dist at last price 
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getFinal = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.close_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.close_time);
    const amt_x = ((pos.final_x / 10**pos.decimals_x)*price_x.value);
    const amt_y = ((pos.final_y / 10**pos.decimals_y)*price_y.value);
    return (amt_x+amt_y);
};

/** 
Returns USD value of claimed and unclaimed accumulated fees at current price
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getOpenPosFees = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.close_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.close_time);
    console.log(price_x, price_y)
    const amt_x = ((pos.fees_x_claimed + pos.fees_x_unclaimed)*price_x.value)/10**pos.decimals_x;
    const amt_y = ((pos.fees_y_claimed + pos.fees_y_unclaimed)*price_y.value)/10**pos.decimals_y;
    return (amt_x+amt_y);
};

/** 
Returns USD value of accumulated fees at last price
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getClosedPosFees = (pos) => {
    const price_x = find_nearest_price_to_time(pos.x_prices, pos.close_time);
    const price_y = find_nearest_price_to_time(pos.y_prices, pos.close_time);
    console.log(price_x, price_y)
    const amt_x = ((pos.fees_x / 10**pos.decimals_x)*price_x.value);
    const amt_y = ((pos.fees_y / 10**pos.decimals_y)*price_y.value);
    return Number((amt_x+amt_y));
};

/** 
Returns days between two timestamps (based in seconds)
* @param  {Number} pre Earlier Timestamp
* @param  {Number} post Later Timestamp
* @return value as Number
*/
export const getDays = (pre, post) => {
    return (post-pre)/86400;
};

/** 
Returns APR 
* @param  {Number} pnl Difference in value between initial investment and current ()
* @param  {Number} days Amount of days passed
* @param  {Number} initialValue Initial Investment
* @return APR as Number
*/
export const getAPR = (
    pnl, 
    days, 
    initialvalue
    ) => {
    let APR = 0;
    if ( pnl < 0) {
        let step1 = -pnl/days;
        let step2 = step1/initialvalue;
        let step3 = 1 - step2;
        let step4 = step3**365;
        let step5 = 1 - step4;
        let step6 = step5*100;
        APR = -step6;
    }
    else if ( pnl > 0) {
        let step1 = pnl/days;
        let step2 = step1/initialvalue;
        let step3 = 1 - step2;
        let step4 = step3**365;
        let step5 = 1 - step4;
        let step6 = step5*100;
        APR = step6;
    };
    return APR;
};


export const formatBigNum = (value) => {
    if (value > 1 && value < 1000) {
        return value.toFixed(2)
    }
    else if (value > 1000 &&  value < 10**6) {
        return (value/1000).toFixed(2) + "K"
    }
    else if (value > 10**6) {
        return (value/10**6).toFixed(2) + "M"
    }
    else {
        return value.toLocaleString()
    }
}

export const getPosPoints = (pos, open) => {
    if(!pos.position_adjustments.length){
        return {fee:0, tvl:0}
    }
    const events = pos.position_adjustments;
    const max_events = events.length - 1;
    
    const { x_prices, y_prices } = pos;
    
    let current_event = events[0];
    let amt_x = current_event.x_amount;
    let amt_y = current_event.y_amount;
    
    const points_start = 1706659200; // 2024-01-31
    let eventIndex = 0;
    
    if(pos.days <= 1 || x_prices.length === 1) {
        if(pos.close_time) {
            let tvl = getUsdAtOpen(pos)*pos.days
            let fee = getClosedPosFees(pos)*1000
            return ({tvl:(tvl ? tvl : 0), fee:(fee ? fee : 0)});
        };
        let tvl = getUsdAtOpen(pos)*pos.days
        let fee = getOpenPosFees(pos)*1000
        console.log(fee);
        return ({tvl:(tvl ? tvl : 0), fee:(fee ? fee : 0)});
    };

    const points_arr = x_prices.map((entry, i) => {
        if(
               points_start   > entry.unixTime
            || pos.open_time  > entry.unixTime  
            || entry.unixTime > pos.close_time
        ) { return 0 }
        
        if(eventIndex + 1 <= max_events && entry.unixTime > events[eventIndex+1].time) {
            eventIndex++;
            current_event = events[eventIndex];  
            if(current_event.action === 'add liquidity'){
                amt_x += current_event.x_amount
                amt_y += current_event.y_amount
            }
            else if(current_event.action === 'withdraw liquidity'){
                amt_x = current_event.x_amount*((10000/current_event.bps)-1);
                amt_y = current_event.y_amount*((10000/current_event.bps)-1);
            }
        }
        if(i+1 <= x_prices.length -1) {
            return (((amt_x/10**pos.decimals_x)*x_prices[i].value) + ((amt_y/10**pos.decimals_y)*y_prices[i].value))*((x_prices[i+1].unixTime-entry.unixTime)/86400)
        }
        else {
            return 0;
        }
    }) 
    let points = 0;
    for (let points_entry of points_arr) {
        points += points_entry;
    }
    if(!open) {
        let fee = getClosedPosFees(pos)*1000
        return {tvl:(points ? points : 0), fee: (fee ? fee : 0)}; 
    }
    let fee = getOpenPosFees(pos)*1000
    return {tvl:(points ? points : 0), fee:(fee ? fee : 0)};
}