// const API_KEY = 'dd0abee4829046c49d1052b3a78d6afd';

/* ------------------------------------sleep-------------------------------------- */

export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


export async function fetch_with_retry (callback, ...params) {
    let result;
    const maxRetries = 20;
    let retries = 0;
    while(true) {
      try {
        return await callback(...params);
      } catch (e) {
        retries++;
        console.log(e);
        console.log('waiting 500ms to fetch again');
        await sleep(500)
      }
    }
    return null
}


/* -----------------------------------get_token_info--------------------------------------- */

export async function get_token_info (token_mint, program) {
    const info = await  program.provider.connection.getParsedAccountInfo(token_mint, 'finalized')
    return info.value.data.parsed.info;
};

/* --------------------------------get_account_info------------------------------------------ */

export async function get_account_info (position_pubkey, program) {
    const info = await program.provider.connection.getAccountInfo(position_pubkey);
    const decoded_info = program.coder.accounts.decodeAny(info.data);
    return decoded_info;
};

/* -------------------------------get_pools-------------------------------------- */

export const get_pools = async () => {
    const res = await fetch('https://dlmm-api.meteora.ag/pair/all');
    const json = await res.json();
    return json;
};

/* -------------------------------get_signatures_for_address --------------------------------------- */

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

/* ---------------------------------get_multiple_token_prices_history---------------------------------------- */

export async function get_multiple_token_prices_history (mints, blocktime, API_KEY) { 
    const base_url = 'https://public-api.birdeye.so/public/history_price';
    const headers = {'X-API-KEY':API_KEY};
    let responses = [];
    for(let mint of mints) {
        const url = `${base_url}?address=${mint}&address_type=token&time_from=${(blocktime - 86400000)}&time_to=${(blocktime + 86400000)}`;
        const res = await fetch(
            url, 
            {headers:headers}
        );
        
        const data = await res.json();
        responses.push(data.data.items);
    };
    return responses;
};

/* ---------------------------------get_multiple_token_prices_in_range---------------------------------------- */

export async function get_multiple_token_prices_history_in_range (mints, start, end, API_KEY) { 
    console.log({mints, start, end, API_KEY});
    const base_url = 'https://public-api.birdeye.so/public/history_price';
    const headers = {'X-API-KEY':API_KEY};
    let responses = [];
    for(let mint of mints) {
        const url = `${base_url}?address=${mint}&address_type=token&time_from=${start}&time_to=${end}`;
        const res = await fetch(
            url, 
            {headers:headers}
        );
        
        const data = await res.json();
        responses.push(data.data.items);
    };
    return responses;
};