/** 
*  Returns USD value of position at Open
   * @param  {Object} pos Parsed Position
   * @return value as Number
*/
export const getUsdAtOpen = (pos) => {
    const amt_x = ((pos.initial_x / 10**pos.decimals_x)*pos.x_price.open);
    const amt_y = ((pos.initial_y / 10**pos.decimals_y)*pos.y_price.open);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of initial asset dist at last price (current or close price) 
   * @param  {Object} pos Parsed Position
   * @return value as Number
*/
export const getTokenHodl = (pos) => {
    const amt_x = ((pos.initial_x / 10**pos.decimals_x)*pos.x_price.last);
    const amt_y = ((pos.initial_y / 10**pos.decimals_y)*pos.y_price.last);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of current asset dist at last price 
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getCurrent = (pos) => {
    const amt_x = ((pos.current_x / 10**pos.decimals_x)*pos.x_price.last);
    const amt_y = ((pos.current_y / 10**pos.decimals_y)*pos.y_price.last);
    return (amt_x+amt_y);
};

/** 
* Returns USD value of final asset dist at last price 
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getFinal = (pos) => {
    const amt_x = ((pos.final_x / 10**pos.decimals_x)*pos.x_price.last);
    const amt_y = ((pos.final_y / 10**pos.decimals_y)*pos.y_price.last);
    return (amt_x+amt_y);
};

/** 
Returns USD value of claimed and unclaimed accumulated fees at current price
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getOpenPosFees = (pos) => {
    const amt_x = ((pos.fees_x_claimed+ pos.fees_x_unclaimed)*pos.x_price.last)/10**pos.decimals_x;
    const amt_y = ((pos.fees_y_claimed+ pos.fees_y_unclaimed)*pos.y_price.last)/10**pos.decimals_y;
    return (amt_x+amt_y);
};

/** 
Returns USD value of accumulated fees at last price
* @param  {Object} pos Parsed Position
* @return value as Number
*/
export const getClosedPosFees = (pos) => {
    const amt_x = ((pos.fees_x / 10**pos.decimals_x)*pos.x_price.last);
    const amt_y = ((pos.fees_y / 10**pos.decimals_y)*pos.y_price.last);
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
