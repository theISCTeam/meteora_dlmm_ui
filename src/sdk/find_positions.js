import { fetch_with_retry, get_signatures_for_address, sleep } from "./utils/utils";
import parse_position  from "./parse_open_positions";
import { Program, utils } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { PublicKey, Transaction } from "@solana/web3.js";

/**
 * Returns object array of position addresses with events
 * @param  {String} pubkey Address to search positions for
 * @param  {Program} program Anchor Program Instance
 * @return {Object[]} Returns a parsed Object array of  positions
 */
export async function find_positions_with_events (pubkey, program) {
    const signatures = await fetch_with_retry(get_signatures_for_address, pubkey, program) 
    return fetch_and_sort_transactions_into_positions(signatures, program);
}


/**
 * Returns object array of position addresses with events
 * @param  {String} pubkey Address to search positions for
 * @param  {Program} program Anchor Program Instance
 * @return {Object[]} Returns a parsed Object array of  positions
 */
const fetch_and_sort_transactions_into_positions = async (signatures, program) => {
    if (!signatures.length) {throw new Error('Signatures are not an array')};
    let transactions = await fetch_with_retry(fetch_parsed_transactions_from_signature_array, signatures, program);
    return sort_transaction_array_into_positions_with_events(transactions, program);
}
/**
 * Fetches transactions from signature array and returns object array of transactions
 * @param  {String[]} signatures List of signatures
 * @param  {Program} program Anchor Program Instance
 * @return {Object[]} Returns an Object array of Transactions
 */
const fetch_parsed_transactions_from_signature_array = async (signatures, program) => {
    let parsed_transactions = [];
    for(let i = 0; i < signatures.length; i+=250) {
        sleep(500)
        let res = []
        try {
            res = await program.provider.connection.getParsedTransactions(signatures.slice(i, i+250), {maxSupportedTransactionVersion: 0});
            if (!res.length)  {throw new Error('result is not an array')}
            parsed_transactions = parsed_transactions.concat(res);
        }
        catch(e) {
            throw new Error('Failed to get txs, retrying')
        }
    }
    return parsed_transactions;
};
/**
 * Parses events for transactions and sorts them into 
 * @param  {Transaction[]} transactions List of transactions
 * @param  {Program} program Anchor Program Instance
 * @return {Object[]} Returns an Object array of Transactions
*/
const sort_transaction_array_into_positions_with_events = (transactions, program) => {
    let all_positions = {}; 
    for(let tx of transactions) {
        const events = get_events_for_transaction(tx, program);
        if (events.length !== 0 && events[0].name !== 'Swap') {
            let position = '';
            if (events[0].name === 'CompositionFee') {
                position = events[1].data.position;
            }
            else {position = events[0].data.position};

            if (all_positions[position.toString()] === undefined) {
                all_positions[position.toString()] = [events];
            }
            else {all_positions[position.toString()].push(events)};
        }
    }

    const sorted_positions = sort_positions(all_positions);
    return sorted_positions;
};
/**
 * Parses events for transactions and sorts them into 
 * @param  {Transaction} transaction Solana getTransaction response
 * @param  {Program} program Anchor Program Instance
 * @return {Object[]} Returns an Object array of OPosition Events
*/
const get_events_for_transaction = (tx, program) => {
    let events = [];

    if (tx && tx.meta) {
        let {meta} = tx;
        meta.innerInstructions?.forEach((ix) => {
            ix.instructions.forEach((iix) => {
                if (!iix.programId.equals(program.programId)) return 0;
                if (!("data" in iix)) return 0; // Guard in case it is a parsed decoded instruction
                
                const ixData = utils.bytes.bs58.decode(iix.data);
                const eventData = utils.bytes.base64.encode(ixData.subarray(8));
                let event = program.coder.events.decode(eventData);
                if (!event) return 0;
                event.blocktime = tx.blockTime;
                
                events.push(event);
                return 0;
            });
        });
    };
    return events;
};
/**
 * Sorts positions into open and closed
 * @param  {Object[]} transactions List of transactions with events
 * @return {Object} Returns an Object containing 2 Object arrays of Positions
*/
const sort_positions = (positions) => {
    let open_positions = {};
    let closed_positions = {};

    for (let key in positions) {
        const position = positions[key];
        if(position[0][2] && position[0][2].name === 'PositionClose') {
            closed_positions[key] = position;
            continue;
        };
        open_positions[key] = position;
    }
    return {open_positions, closed_positions};
};

/**
 * Finds open positions from Program Account
 * @param  {PublicKey]} user_pubkey Target address
 * @param  {Program} transactions Anchor Program Instance
 * @param  {string} transactions Birdeye API key
 * @return {Object} Returns an Object containing 2 Object arrays of Open Positions
*/
export async function find_account_open_positions (user_pubkey, program, API_KEY) {
    const position_accounts = await program.account.position.all([
        {
            memcmp: {
                bytes: bs58.encode(user_pubkey.toBuffer()),
                offset: 8 + 32,
            },
        },
    ]);

    const v2_positions_accounts = await program.account.positionV2.all([
        {
            memcmp: {
                bytes: bs58.encode(user_pubkey.toBuffer()),
                offset: 8 + 32,
            },
        },
    ]);

    let promisesV1 = [];
    for(let p of position_accounts) {
        promisesV1.push(parse_position(p, program, 1, API_KEY));
    };

    let promisesV2 = [];
    for(let p of v2_positions_accounts) {
        promisesV2.push(parse_position(p, program, 2, API_KEY));
    };

    const positionsV1 = await Promise.all(promisesV1);
    const positionsV2 = await Promise.all(promisesV2);
    return {positionsV1, positionsV2};
};
