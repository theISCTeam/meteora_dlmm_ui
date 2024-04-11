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
   * @return {Object[]} Returns a parsed array of closed positions
   */
export async function fetch_and_parse_closed_positions (address, connection, API_KEY) {
    const pubkey = new PublicKey(address);
    const program = get_program_instance(connection);
    
    const { closed_positions } = await find_positions_with_events(pubkey, program);
    const parsed_closed_positions = await parse_closed_positions(closed_positions, program, API_KEY);
    
    return parsed_closed_positions
}

/**
   * @param  {String}  Address  Address to search positions for
   * @param  {Connection} connection @solana/web3.js RPC connection
   * @param  {String}  API_KEY Birdeye Api Key
   * @return {Object[]} Returns a parsed array of open positions
*/
export async function fetch_and_parse_open_positions (address_string, connection, API_KEY) {
    const pubkey = new PublicKey(address_string);
    const program = get_program_instance(connection);

    const {positionsV1, positionsV2} = await fetch_with_retry(find_account_open_positions, pubkey, program, API_KEY);
    const open_positions = positionsV1.concat(positionsV2);
    let positions = [];
    for(let position of open_positions) {
        if (position.position !== 'Error') {
            positions.push(position);
        }
        else {
            console.log('position with Error');
        }
    }
    return positions;
}

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

    const parsed_closed_positions = await parse_closed_positions(
        closed_positions, 
        program
    );

    const parsed_open_position_events = await parse_open_positions(
        open_positions, 
        program
    );

    console.log(parsed_open_position_events);

    const {positionsV1, positionsV2} = await fetch_with_retry(
        find_account_open_positions, 
        pubkey, 
        program, 
        parsed_open_position_events
    );

    const parsed_open_positions = positionsV1.concat(positionsV2);

    return {closed_positions:parsed_closed_positions, open_positions:parsed_open_positions}
}