import { parse_closed_positions, parse_open_positions } from "./parse_position_events";
import { get_program_instance } from "./utils/get_program";
import { Connection, PublicKey } from "@solana/web3.js"
import { 
    find_account_open_positions, 
    find_positions_with_events 
} from "./find_positions";
import { fetch_with_retry } from "./utils/utils";

/**
   * @param  {String}  Address  Address to search positions for
   * @param  {Connection} connection @solana/web3.js RPC connection
   * @param  {String}  API_KEY Birdeye Api Key
   * @return {Object} Returns an Object containing account positions
*/
export async function fetch_and_parse_positions_for_account (address_string, transactions, connection) {
    const pubkey = new PublicKey(
        address_string
    );

    const program = get_program_instance(
        connection
    );

    const { 
        closed_positions, 
        open_positions 
    } = await find_positions_with_events(
        transactions,
        program
    );

    const parsed_closed_positions_unfiltered = await parse_closed_positions(
        closed_positions, 
        program
    );

    let parsed_closed_positions = []
    for (let i in parsed_closed_positions_unfiltered){
        const p = parsed_closed_positions_unfiltered[i]
        if (Object.keys(p).length > 0){
            parsed_closed_positions.push(p)
        }
    }

    // const parsed_open_position_events_unfiltered = await parse_open_positions(
    //     open_positions, 
    //     program
    // );
    // let parsed_open_position_events = []
    // for (let i in parsed_open_position_events_unfiltered){
    //     const p = parsed_open_position_events_unfiltered[i]

    //     if (Object.keys(p).length > 0){
    //         parsed_open_position_events.push(p)
    //     }
    // }

    // let {positionsV1, positionsV2} = await find_account_open_positions(
    //     pubkey, 
    //     program, 
    //     parsed_open_position_events
    // );

    let positionsV1, positionsV2
    if(!positionsV1) {
        positionsV1 = []
    }
    if(!positionsV2) {
        positionsV2 = []
    }

    const parsed_open_positions = [...positionsV1, ...positionsV2];
    return {closed_positions:parsed_closed_positions, open_positions:parsed_open_positions}
}