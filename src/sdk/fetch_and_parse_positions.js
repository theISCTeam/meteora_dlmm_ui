import { parse_closed_positions } from "./parse_closed_positions";
import { get_program_instance } from "./utils/get_program";
import { PublicKey } from "@solana/web3.js"
import { 
    find_account_open_positions, 
    find_positions_with_events 
} from "./find_positions";

export const fetch_and_parse_closed_positions = async (address_string, connection, API_KEY) => {
    const pubkey = new PublicKey(address_string);
    const program = get_program_instance(connection);
    
    const { closed_positions } = await find_positions_with_events(pubkey, program)
    const parsed_closed_positions = await parse_closed_positions(closed_positions, program, API_KEY);
    
    return parsed_closed_positions
}

export const fetch_and_parse_open_positions = async (address_string, connection, API_KEY) => {
    const pubkey = new PublicKey(address_string);
    const program = get_program_instance(connection);

    const {positionsV1, positionsV2} = await find_account_open_positions(pubkey, program, API_KEY);
    const open_positions = positionsV1.concat(positionsV2);
    let positions = []
    for(let position of open_positions) {
        if (position.position !== 'Error') {
            positions.push(position);
        }
        else {
            
        }
    }
    return positions
}
