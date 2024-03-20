
const { parse_position_events } = require("./parse_position_events");
const { find_positions_with_events } = require("./find_positions");
const { SCALE_OFFSET} = require("./constants/constants");
const { get_account_info, fetch_with_retry } = require('./utils/utils');
const {default: Decimal} = require("decimal.js");
const { BN } = require("@coral-xyz/anchor");
const { 
    bin_id_to_bin_array_index,
    get_bin_array_lower_upper_bin_id,
    get_price_of_bin,
    mul_shares,
    get_bin_from_bin_array
} = require('./utils/bin_math');

export default async function parse_position (
    position_info, 
    program, 
    version,
    API_KEY
    ) {
    const lb_pubkey = position_info.account.lbPair;

    const parsed_position_data = await get_parsed_events_data(
        position_info.publicKey, program, API_KEY
    );
    if (parsed_position_data === null) {console.log(position_info.publicKey);return {position:'Error'}};

    const decimals_x = parsed_position_data.decimals_x;
    const decimals_y = parsed_position_data.decimals_y;
    const x_price = parsed_position_data.x_price
    const y_price = parsed_position_data.y_price
    
    const { binStep } = await fetch_with_retry(get_account_info, lb_pubkey, program);
    
    const binArrays = await fetch_with_retry(
        get_upper_and_lower_bins,
        program, 
        lb_pubkey, 
        position_info
    );

    console.log(binArrays);

    const current_token_amounts = get_position_current_amount(
        binStep, 
        binArrays, 
        position_info, 
        decimals_x, 
        decimals_y
    );    

    const unclaimed_fees = get_position_swap_fees(
        version,
        position_info,
        binArrays
    );
    
    return {
        position: position_info.publicKey.toString(),
        lbPair:lb_pubkey,
        initial_x:parsed_position_data.initial_x,
        initial_y:parsed_position_data.initial_y,
        current_x:current_token_amounts.token_x_amount,
        current_y:current_token_amounts.token_y_amount,
        withdrawn_x: parsed_position_data.final_x,
        withdrawn_y: parsed_position_data.final_y,
        fees_x_claimed: parsed_position_data.fees_x,
        fees_y_claimed: parsed_position_data.fees_y,
        fees_x_unclaimed: unclaimed_fees.feeX.toNumber(),
        fees_y_unclaimed: unclaimed_fees.feeY.toNumber(),
        open_time: parsed_position_data.open_time,
        days:parsed_position_data.days,
        close_time: Math.ceil((parsed_position_data.close_time)),
        x_price, y_price, 
        decimals_x, decimals_y,
        position_adjustments:parsed_position_data.position_adjustments
    };
};

async function get_parsed_events_data (position_pubkey, program, API_KEY) {
    const {open_positions:pos} = await find_positions_with_events(position_pubkey, program);
    return await parse_position_events(pos[Object.keys(pos)[0]], program, API_KEY);
}

async function get_upper_and_lower_bins(program, lb_pubkey, position_info) {
    let binArrays = [];
    (await program.account.binArray.all()).forEach((a) => {
        if (a.account.lbPair.toString() === lb_pubkey.toString()) {
            binArrays.push(a)
        };
    });
    
    const { lowerBinId, upperBinId } = position_info.account;
    
    const lowerBinArrayIndex = bin_id_to_bin_array_index(new BN(lowerBinId));
    const upperBinArrayIndex = bin_id_to_bin_array_index(new BN(upperBinId));

    const lowerBinArray = (binArrays.find((b) => b.account.index.toString() === lowerBinArrayIndex.toString()));
    const upperBinArray = (binArrays.find((b) => b.account.index.toString() === upperBinArrayIndex.toString()));

    return { lowerBinArray, upperBinArray };
};

function get_position_current_amount (
        binStep, 
        bin_arrays, 
        position_info, 
        decimals_x, 
        decimals_y
    ) {

    const { 
        lowerBinId, 
        upperBinId, 
        liquidityShares:liquidity_shares 
    } = position_info.account;

    const bins = get_bins_between_upper_and_lower_bound(
        binStep,
        lowerBinId,
        upperBinId,
        decimals_x, 
        decimals_y,
        bin_arrays
    );

    if (!bins.length) return null;

    let token_x_amount = new Decimal(0);
    let token_y_amount = new Decimal(0);
    
    bins.forEach((bin, idx) => {
        const bin_supply = new Decimal(bin.supply.toString());

        let position_share;

        if (bin.version === 1) {
            position_share = new Decimal(liquidity_shares[idx].shln(64).toString());
        } else{
            position_share = new Decimal(liquidity_shares[idx].toString());
        }

        const position_x_amount = bin_supply.eq(new Decimal("0"))
            ? new Decimal("0")
            : position_share.mul(bin.x_amount.toString()).div(bin_supply).floor();

        const position_y_amount = bin_supply.eq(new Decimal("0"))
            ? new Decimal("0")
            : position_share.mul(bin.y_amount.toString()).div(bin_supply).floor();
     
        token_x_amount = token_x_amount.add(position_x_amount);
        token_y_amount = token_y_amount.add(position_y_amount);
    });
    return {token_x_amount, token_y_amount};
};

function get_position_swap_fees (
    version,
    position_info,
    binArrays
) {
    const { lowerBinArray, upperBinArray } = binArrays;
    const lowerBinArrayIdx = bin_id_to_bin_array_index(new BN(position_info.account.lowerBinId));
    
    let feeX = new BN(0);
    let feeY = new BN(0);

    for (let i = position_info.account.lowerBinId; i <= position_info.account.upperBinId; i++) {
        const bin_array_index = bin_id_to_bin_array_index(new BN(i));

        const binArray = bin_array_index.eq(lowerBinArrayIdx)
            ? lowerBinArray
            : upperBinArray;

        const bin = get_bin_from_bin_array(i, binArray);

        if (bin) {
            const bin_index_in_position = i - position_info.account.lowerBinId;
            const feeInfos = position_info.account.feeInfos[bin_index_in_position];
    
            const liquidity_share =
                version === 1
                    ? position_info.account.liquidityShares[bin_index_in_position]
                    : new BN(position_info.account.liquidityShares[bin_index_in_position]).shrn(64);
            const bin_fee_x = mul_shares(
                liquidity_share,
                bin.feeAmountXPerTokenStored.sub(feeInfos.feeXPerTokenComplete),
                SCALE_OFFSET,
                1
            );
    
            const bin_fee_y = mul_shares(
                liquidity_share,
                bin.feeAmountYPerTokenStored.sub(feeInfos.feeYPerTokenComplete),
                SCALE_OFFSET,
                1
            );
            feeX = feeX.add(bin_fee_x).add(feeInfos.feeXPending);
            feeY = feeY.add(bin_fee_y).add(feeInfos.feeYPending);  
        }
    };
    return { feeX, feeY };
};

function get_bins_between_upper_and_lower_bound (
    binStep, 
    lower_bin_id, 
    upper_bin_id, 
    decimals_x, 
    decimals_y, 
    bin_arrays
    ) {
    const { lowerBinArray, upperBinArray } = bin_arrays;
    const lower_bin_array_index = bin_id_to_bin_array_index(new BN(lower_bin_id));
    const upper_bin_array_index = bin_id_to_bin_array_index(new BN(upper_bin_id));

    let bins = [];
    
    if (lower_bin_array_index === upper_bin_array_index) {
        const bin_array = lowerBinArray;

        const [lower_bin_id_for_bin_array] = get_bin_array_lower_upper_bin_id(
            bin_array.account.index
        );

        bin_array.account.bins.forEach((bin, idx) => {
            const bin_id = lower_bin_id_for_bin_array.toNumber() + idx;

            if (bin_id >= lower_bin_id && bin_id <= upper_bin_id) {
                const price_per_lamport = get_price_of_bin(
                    bin_id,
                    binStep
                );
                bins.push({
                    bin_id,
                    x_amount: bin.amountX,
                    y_amount: bin.amountY,
                    supply: bin.liquiditySupply,
                    price: price_per_lamport,
                    version: bin_array.version,
                    price_per_token: new Decimal(price_per_lamport)
                      .mul(new Decimal(10 ** (decimals_x - decimals_y)))
                      .toString(),
                });
            };
        });
    } else {
        const bin_arrays = [lowerBinArray, upperBinArray];
        bin_arrays.forEach((bin_array) => {
            const [lowerBinIdForBinArray] = get_bin_array_lower_upper_bin_id(
                bin_array.account.index
            );
            bin_array.account.bins.forEach((bin, idx) => {
                const bin_id = lowerBinIdForBinArray.toNumber() + idx;
                if (bin_id >= lower_bin_id && bin_id <= upper_bin_id){
                    const price_per_lamport = get_price_of_bin(
                        bin_id,
                        binStep
                    );
                    bins.push({
                        bin_id,
                        x_amount: bin.amountX,
                        y_amount: bin.amountY,
                        supply: bin.liquiditySupply,
                        price: price_per_lamport,
                        version: bin_array.version,
                        price_per_token: new Decimal(price_per_lamport)
                          .mul(new Decimal(10 ** (decimals_x - decimals_y)))
                          .toString(),
                    });
                };
            });
        });
    };
    return bins;
};
