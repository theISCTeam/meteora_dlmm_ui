import { Program } from "@coral-xyz/anchor";
import { 
    fetch_with_retry,
    get_account_info, 
    get_multiple_token_prices_history, 
    get_multiple_token_prices_history_in_range, 
    get_token_info, 
    get_token_metadata
} from "./utils/utils";


/**
 * Sorts positions into open and closed
 * @param  {Object[]} position_transactions List of transactions with events
 * @param  {Program} program Anchor Program Instance
 * @param  {String} API_KEY Birdeye API Key
 * @return {Object} Returns an Object containing compiled position data
*/
export async function parse_position_events (
    position_transactions, 
    program,
    API_KEY
    ) {
    let position = '' // Address
    let lbPair = ''  // Address
    let final_x = 0; // Withdrawals
    let final_y = 0;
    let initial_x = 0; // Deposits
    let initial_y = 0;
    let fees_y = 0; // Claimed Rewards
    let fees_x = 0;
    let open_time = 0; // Timestamp
    let close_time = Math.floor(Date.now()/1000); // Timestamp
    let position_adjustments = [] // Entries
    let range;
    for(let key in position_transactions) {
        const events = position_transactions[key];
        // console.log(events);
        for (let i in events) {
            const event = events[i]
            switch (event.name) {
                case 'AddLiquidity':
                    if (event.data.amounts[0].toNumber() + event.data.amounts[1].toNumber() !== 0) {
                        position_adjustments.push({
                            time:event.blocktime,
                            action: 'add liquidity',
                            x_amount: event.data.amounts[0].toNumber(),
                            y_amount: event.data.amounts[1].toNumber(),
                        });
                    };
                    initial_x += event.data.amounts[0].toNumber();
                    initial_y += event.data.amounts[1].toNumber();
                    continue;
                
                case 'ClaimFee':
                    if (event.data.feeX.toNumber() + event.data.feeY.toNumber() !== 0) {
                        position_adjustments.push({
                            time:event.blocktime,
                            action: 'claim fees',
                            x_amount: event.data.feeX.toNumber(),
                            y_amount: event.data.feeY.toNumber(),
                        });
                    };
                    fees_x += event.data.feeX.toNumber();
                    fees_y += event.data.feeY.toNumber();
                    continue;
                    
                case 'RemoveLiquidity':
                    if (event.data.amounts[0].toNumber() + event.data.amounts[1].toNumber() !== 0) {
                        position_adjustments.push({
                            time:event.blocktime,
                            action: 'withdraw liquidity',
                            x_amount: event.data.amounts[0].toNumber(),
                            y_amount: event.data.amounts[1].toNumber(),
                            bps: event.bps
                        });
                    };
                    final_x += event.data.amounts[0].toNumber();
                    final_y += event.data.amounts[1].toNumber();
                    continue;
    
                case 'PositionCreate':
                    // position_adjustments.push({
                    //     time:event.blocktime,
                    //     action: 'open position',
                    //     x_amount: 0,
                    //     y_amount: 0,
                    // });
                    range = event.range
                    position = event.data.position;
                    lbPair = event.data.lbPair;
                    open_time = event.blocktime;
                    continue;
    
                case 'PositionClose':
                    // position_adjustments.push({
                    //     time:event.blocktime,
                    //     action: 'close position',
                    //     x_amount: 0,
                    //     y_amount: 0,
                    // });
                    close_time = event.blocktime;     
                    continue;            
                
                default:
                    // Unhandled Event
                    // console.log(`Unexpected event: "${event.name}" encountered while parsing position events`);
                    // console.log(event);
            }
        }
    };

    if(!lbPair) {return null};
    const { 
        tokenXMint, 
        tokenYMint 
    } = await fetch_with_retry(
        get_account_info,
        lbPair, 
        program
    );
    
    const {
        decimals:decimals_x
    } = await fetch_with_retry(
        get_token_info, 
        tokenXMint, 
        program
    );

    const {
        decimals:decimals_y
    } = await fetch_with_retry(
        get_token_info, 
        tokenYMint, 
        program
    );

    let prices = [];
    let days = (close_time - open_time)/86400
    if(days < 1) {
        prices = await fetch_with_retry(
            get_multiple_token_prices_history, 
            [tokenXMint, tokenYMint], 
            open_time, 
            API_KEY
        );
    }
    else {
        prices = await fetch_with_retry(
            get_multiple_token_prices_history_in_range, 
            [tokenXMint, tokenYMint], 
            open_time, 
            close_time, 
            API_KEY
        );
        if(!prices.length) {
            throw new Error('Price Api Cooked')
        }
    }

    const [ xprices, yprices ] = prices
    const xopen = xprices[0].value;
    const yopen = yprices[0].value;
    const xclose = xprices[xprices.length -1].value;
    const yclose = yprices[yprices.length -1].value;

    for(let i in position_adjustments) {
        const time = position_adjustments[i].time;
        position_adjustments[i].xprice = findNearestPriceToTime(xprices, time);
        position_adjustments[i].yprice = findNearestPriceToTime(yprices, time);
    }
    
    position_adjustments = position_adjustments.reverse()
    
    return {
        position,
        days,
        lbPair,
        initial_x,
        initial_y,
        final_x,
        final_y,
        fees_x,
        fees_y,
        open_time,
        close_time,
        decimals_x,
        decimals_y,
        range,
        x_price : {open: xopen, last:xclose, all:xprices},
        y_price : {open: yopen, last:yclose, all:yprices},
        position_adjustments
    };
};  

/**
 * Compares price array timestamps with target timestamps to find the closest
 * @param  {Object[]} prices List of prices with timestamps
 * @param  {any} time timestamp
 * @return {Object} Returns an Object containing 2 Object arrays of Positions
*/
const findNearestPriceToTime = (prices, time) => {
    for(let i in prices) {
        if(!prices[i+1]) {return prices[i]}
        else if(prices[i].time <= time && prices[i+0] >= time) {
            return prices[i].value;
        };
    };
};


/**
 * Parses an array of positions
 * @param  {Object[]} positions List of positions with events
 * @param  {Program} program Anchor Program Instance
 * @param  {String} API_KEY Birdeye API Key
 * @return {Object[]} Returns an Object array with parsed positions
*/
export const parse_closed_positions = async (
    positions, 
    program, 
    API_KEY
    ) => {
    let parsed_positions = [];
    for(let key in positions) {
        parsed_positions.push(
            await parse_position_events(
                positions[key], 
                program, 
                API_KEY
            )
        );
    };
    return parsed_positions;
};