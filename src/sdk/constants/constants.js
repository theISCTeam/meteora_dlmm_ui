const { BN } = require('@coral-xyz/anchor');
const idl = require('./meteora_dlmm_idl.json');

const CONSTANTS = idl.constants;
const MAX_BIN_ARRAY_SIZE = new BN(CONSTANTS.find((k) => k.name === "MAX_BIN_PER_ARRAY")?.value ?? 0);
const MAX_BASIS_POINT = 10000;
const SCALE_OFFSET = 64;

module.exports = {
    CONSTANTS,
    MAX_BIN_ARRAY_SIZE,
    MAX_BASIS_POINT,
    SCALE_OFFSET
}