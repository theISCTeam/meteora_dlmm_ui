import { PublicKey } from "@solana/web3.js";
import { 
    fetch_with_retry,
    get_account_info, 
    get_multiple_token_prices_history, 
    get_token_info 
} from "./utils/utils";


export async function get_position_transfers_rewards_and_lbInfo (
    position_transactions, 
    program,
    API_KEY
    ) {

    let position = ''
    let lbPair = ''
    let final_x = 0;
    let final_y = 0;
    let initial_x = 0;
    let initial_y = 0;
    let rewards_y = 0;
    let rewards_x = 0;
    let open_time = 0;
    let close_time = Date.now();

    console.log(position_transactions);
    console.log(position_transactions.length -2);
    for(let key in position_transactions) {
        console.log({key});
        const events = position_transactions[key];
        const event_names = events.map((e) => {return e.name})
        for (let i in events) {
            const event = events[i]
            switch (event.name) {
                
                case 'AddLiquidity':
                    if (Number(key) !== position_transactions.length -2) {
                        console.log('position was enlarged');
                        // Init new position from this point forward
                        console.log(event_names);
                    }
                    console.log('position was initialized');
                    initial_x += event.data.amounts[0].toNumber();
                    initial_y += event.data.amounts[1].toNumber();
                    continue;
                
                case 'ClaimFee':
                    rewards_x += event.data.feeX.toNumber();
                    rewards_y += event.data.feeY.toNumber();
                    continue;
                    
                case 'RemoveLiquidity':
                    if (event_names.indexOf('PositionClose') === -1) {
                        console.log('position was diminished');
                        // Init new position from this point forward
                        console.log(event_names);
                    }
                    final_x += event.data.amounts[0].toNumber();
                    final_y += event.data.amounts[1].toNumber();
                    continue;
    
                case 'PositionCreate':
                    position = event.data.position;
                    lbPair = event.data.lbPair;
                    open_time = event.blocktime;
                    continue;
    
                case 'PositionClose':
                    console.log(event_names);
                    close_time = event.blocktime;                    
            }
        }
    };

    // const { tokenXMint, tokenYMint } = await get_account_info(lbPair, program);
    if(!lbPair) {return null};
    const { tokenXMint, tokenYMint } = await fetch_with_retry(get_account_info, lbPair, program);
    const { decimals: decimals_x } =   await fetch_with_retry(get_token_info, tokenXMint, program);
    const { decimals: decimals_y } =   await fetch_with_retry(get_token_info, tokenYMint, program);

    const [ tokenXPrice, tokenYPrice ] = await fetch_with_retry(get_multiple_token_prices_history, [tokenXMint, tokenYMint], close_time, API_KEY)
        
    return {
        position,
        lbPair,
        initial_x,
        initial_y,
        final_x,
        final_y,
        rewards_x,
        rewards_y,
        open_time,
        close_time,
        decimals_x,
        decimals_y,
        x_price : tokenXPrice[0],
        y_price : tokenYPrice[0],
    }
};  

export const parse_closed_positions = async (positions, program, API_KEY) => {
    let parsed_positions = [];
    for(let key in positions) {
        parsed_positions.push(await get_position_transfers_rewards_and_lbInfo(positions[key], program, API_KEY));
    };
    return parsed_positions;
};