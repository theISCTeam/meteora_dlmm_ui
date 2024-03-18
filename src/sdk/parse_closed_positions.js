import { PublicKey } from "@solana/web3.js";
import { 
    fetch_with_retry,
    get_account_info, 
    get_multiple_token_prices_history, 
    get_multiple_token_prices_history_in_range, 
    get_token_info 
} from "./utils/utils";


export async function get_position_transfers_fees_and_lbInfo (
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

    for(let key in position_transactions) {
        const events = position_transactions[key];
        const event_names = events.map((e) => {return e.name})
        for (let i in events) {
            const event = events[i]
            switch (event.name) {
                case 'AddLiquidity':
                    position_adjustments.push({
                        time:event.blocktime,
                        action: 'add liquidity',
                        x_amount: event.data.amounts[0].toNumber(),
                        y_amount: event.data.amounts[1].toNumber(),
                    })
                    initial_x += event.data.amounts[0].toNumber();
                    initial_y += event.data.amounts[1].toNumber();
                    continue;
                
                case 'ClaimFee':
                    fees_x += event.data.feeX.toNumber();
                    fees_y += event.data.feeY.toNumber();
                    continue;
                    
                case 'RemoveLiquidity':
                    position_adjustments.push({
                        time:event.blocktime,
                        action: 'remove liquidity',
                        x_amount: -event.data.amounts[0].toNumber(),
                        y_amount: -event.data.amounts[1].toNumber(),
                    });
                    final_x += event.data.amounts[0].toNumber();
                    final_y += event.data.amounts[1].toNumber();
                    continue;
    
                case 'PositionCreate':
                    position = event.data.position;
                    lbPair = event.data.lbPair;
                    open_time = event.blocktime;
                    continue;
    
                case 'PositionClose':
                    close_time = event.blocktime;                    
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
    }

    const [xprices, yprices ] = prices
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
        x_price : {open: xopen, last:xclose},
        y_price : {open: yopen, last:yclose},
        position_adjustments
    };
};  


const findNearestPriceToTime = (prices, time) => {
    for(let i in prices) {
        if(!prices[i+1]) {return prices[i]}
        else if(prices[i].time <= time && prices[i+0] >= time) {
            return prices[i].value;
        };
    };
};

export const parse_closed_positions = async (
    positions, 
    program, 
    API_KEY
    ) => {
    let parsed_positions = [];
    for(let key in positions) {
        parsed_positions.push(
            await get_position_transfers_fees_and_lbInfo(
                positions[key], 
                program, 
                API_KEY
            )
        );
    };
    return parsed_positions;
};