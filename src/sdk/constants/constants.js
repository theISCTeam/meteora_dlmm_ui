import idl from './meteora_dlmm_idl.json'
import BN from 'bn.js';

export const CONSTANTS = idl.constants;
export const MAX_BIN_ARRAY_SIZE = new BN(CONSTANTS.find((k) => k.name === "MAX_BIN_PER_ARRAY")?.value ?? 0);
export const MAX_BASIS_POINT = 10000;
export const SCALE_OFFSET = 64;
