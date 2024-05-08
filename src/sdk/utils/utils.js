// const API_KEY = 'dd0abee4829046c49d1052b3a78d6afd';
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
/* ------------------------------------sleep-------------------------------------- */
/** 
Sleeps for (delay) milliseconds
* @param  {Number} delay Amount of milliseconds to wait
*/
export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

/* ------------------------------------fetch_with_retry-------------------------------------- */
/** 
Tries and retries async function with params until max retries or success
Max retries = 20
* @param  {Function} callback Function to run with retry
* @param  {any} params Params to pass to the function
* @return Resolved Promise
*/
export async function fetch_with_retry (callback, ...params) {
    const maxRetries = 5;
    let retries = 0;
    let error;
    // console.log(callback);
    while(retries < maxRetries) {
      try {
        return await callback(...params);
      } catch (e) {
        retries++;
        error = e;
        console.log('waiting 500ms to fetch again function: ' + callback + e);
        await sleep(500)
      }
    }
    return (error)
}


/* -----------------------------------get_token_info--------------------------------------- */
/** 
Gets and returns token info
* @param  {PublicKey} token_mint Token mint address as PublicKey
* @param  {Program} program An initialized Anchor program instance
* @return Resolved Promise with token info
*/
export async function get_token_info (token_mint, program) {
    const info = await  program.provider.connection.getParsedAccountInfo(token_mint, 'finalized')
    return info.value.data.parsed.info;
};


/* -----------------------------------get_token_metadata--------------------------------------- */
/** 
Gets and returns token info
* @param  {PublicKey} token_mint Token mint address as PublicKey
* @param  {Program} program An initialized Anchor program instance
* @return Resolved Promise with token metadata
*/
export async function get_token_metadata (token_mint, program) {
    const connection = program.provider.connection  


};

/* --------------------------------get_account_info------------------------------------------ */
/** 
Gets and returns program account info
* @param  {PublicKey} account Account address as PublicKey
* @param  {Program} program An initialized Anchor program instance
* @return Resolved Promise
*/
export async function get_account_info (account, program) {
    // console.log(account );
    const info = await program.provider.connection.getAccountInfo(account);
    const decoded_info = program.coder.accounts.decodeAny(info.data);
    return decoded_info;
};

/* -------------------------------get_pools-------------------------------------- */
/** 
Gets and returns program liquidity pools
* @return Resolved Promise containing all DLMM pools
*/
export const get_pools = async () => {
    const res = await fetch('https://dlmm-api.meteora.ag/pair/all');
    const json = await res.json();
    return json;
};

/* -------------------------------get_signatures_for_address --------------------------------------- */
/** 
Gets and returns all signatures for an address
* @param  {PublicKey} pubkey Address as PublicKey
* @param  {Program} program An initialized Anchor program instance
* @return {String[]} Array of signatures
*/
export const get_signatures_for_address = async (pubkey, program) => {
    let len = 1000;
    let last_sig = undefined;
    let signatures = [];
    while (len === 1000) {
        const res = (await program.provider.connection.getSignaturesForAddress(pubkey, {before:last_sig})).map(e => {return e.signature});
        len = res.length;
        last_sig = res[len - 1];
        signatures = signatures.concat(res);
    };
    return signatures;
};
/* -------------------------------get_signatures_for_address_before_blocktime --------------------------------------- */
/** 
Gets and returns all signatures for an address
* @param  {PublicKey} pubkey Address as PublicKey
* @param  {Program} program An initialized Anchor program instance
* @return {String[]} Array of signatures
*/
export const get_signatures_for_address_after_blocktime = async (pubkey, program, earliest_time) => {
    let len = 1000;
    let last_sig = undefined;
    let signatures = [];
    let last_entry
    while (len === 1000) {
        const res = await program.provider.connection.getSignaturesForAddress(pubkey, {before:last_sig});
        len = res.length;
        // console.log(len);
        last_entry = res[len - 1];
        last_sig = last_entry.signature;    

        if(earliest_time > last_entry.blockTime) {
            for(let i in res) {
                // console.log(res[i].blockTime);
                if(res[i].blockTime > earliest_time) {
                    signatures.push(res[i].signature);
                }
                else {
                    return signatures;
                }
            }
        }

        else {
            const signatures_only = res.map(e => {return e.signature})
            signatures = signatures.concat(signatures_only);
        }
    };
    return signatures;
};

/* ---------------------------------get_multiple_token_prices_history---------------------------------------- */
/** 
Deprecated, please use get_multiple_token_prices_in_range
*/
export async function get_multiple_token_prices_history (mints, blocktime, API_KEY) { 
    const base_url = 'https://public-api.birdeye.so/public/history_price';
    const headers = {'X-API-KEY':API_KEY};
    let responses = [];
    for(let mint of mints) {
        const url = `${base_url}?address=${mint}&address_type=token&time_from=${(blocktime - 86400000)}&time_to=${(blocktime + 86400000)}`;
        let res;
        try {
            const res = await fetch(
                url, 
                {headers:headers}
            );
        }
        catch(e) {
            return new Error(e)
        }
        
        const data = await res.json();
        responses.push(data.data.items);
    };
    return responses;
};

/* ---------------------------------get_multiple_token_prices_in_range---------------------------------------- */
/** 
Returns price entries for an array of tokens between start and end timestamps
* @param  {string[]} mints String array of token mints
* @param  {Number} start timestamp in seconds
* @param  {Number} end timestamp in seconds
* @param  {string} API_KEY Birdeye API key
* @return {String[]} Array of signatures
*/
export async function get_multiple_token_prices_history_in_range (mints, start, end, API_KEY) { 
    const base_url = 'https://public-api.birdeye.so/defi/history_price';
    const headers = {'X-API-KEY':API_KEY};
    let responses = [];
    for(let mint of mints) {
        const url = `${base_url}?address=${mint}&type=1H&address_type=token&time_from=${start}&time_to=${end}`;
        const res = await fetch(
            url, 
            {headers:headers}
        );
        const data = await res.json();
        if(data.status === 401) {
            throw new Error('invalid API key');
        }
        if(data.status === 403) {
            throw new Error('rate limit exceeded, please create your own Birdeye API key');
        }
        responses.push(data.data.items);
    };
    return responses;
};