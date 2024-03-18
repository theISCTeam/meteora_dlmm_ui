const { BN } = require("@coral-xyz/anchor");
const { 
    MAX_BASIS_POINT, 
    MAX_BIN_ARRAY_SIZE 
} = require("../constants/constants");

function mul_div_num (x, y, denominator) {
    return (x * y)/denominator;
}

function bin_id_to_bin_array_index(binIdBN) {
    const { div: idx, mod } = binIdBN.divmod(MAX_BIN_ARRAY_SIZE);
    return binIdBN < 0 && mod !== 0 ? idx.sub(new BN(1)) : idx;
}

function get_bin_array_lower_upper_bin_id(bin_array_index_bn) {
    const lower_bin_id = bin_array_index_bn.mul(MAX_BIN_ARRAY_SIZE);
    const upper_bin_id = lower_bin_id.add(MAX_BIN_ARRAY_SIZE).sub(new BN(1));
    return [lower_bin_id, upper_bin_id];
}
  
function get_price_of_bin (binId, binStep) {
    const binStepNum = binStep/MAX_BASIS_POINT;
    return (1 + binStepNum)**binId;
}

function mul_shares(x, y, offset, rounding) {
    const denominator = new BN(1).shln(offset);
    return mul_div(x, y, denominator, rounding);
}

// BN BN Number (0 or undefined)
function mul_shr (x, y, offset, rounding) {
    const denominator = new BN(1).shln(offset);
    return mul_div(x, y, denominator, rounding);
}

// BN BN Number (0 or undefined)
function shl_div (x, y, offset, rounding) {
    const scale = new BN(1).shln(offset);
    return mul_div(x, scale, y, rounding)
}

function mul_div(x, y, denominator, rounding) {
    const { div, mod } = x.mul(y).divmod(denominator);
  
    if (rounding ===  0 && !mod.isZero()) {
      return div.add(new BN(1));
    }
    return div;
}

function get_bin_from_bin_array (binID, binArray) {
    const [lowerBinId, upperBinId] = get_bin_array_lower_upper_bin_id(new BN(binArray.account.index));   
    
    let index = 0;
    if (binID > 0) {
        index = binID - lowerBinId.toNumber();
    } else {
        const delta = upperBinId.toNumber() - binID;
        index = MAX_BIN_ARRAY_SIZE.toNumber() - delta - 1;
    }
    return binArray.account.bins[index];
}


module.exports = {
    mul_div_num,
    bin_id_to_bin_array_index,
    get_bin_array_lower_upper_bin_id,
    get_price_of_bin,
    mul_shares,
    mul_shr,
    shl_div,
    get_bin_from_bin_array
};  