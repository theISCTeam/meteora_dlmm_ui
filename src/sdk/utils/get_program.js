const { 
    AnchorProvider,  
    Program, 
    EventParser 
} = require("@coral-xyz/anchor");
const { LBCLMM_PROGRAM_IDS } = require("../constants/addresses");
const idl = require('../constants/meteora_dlmm_idl.json');
const { Connection } = require("@solana/web3.js");

const cluster = "mainnet-beta";

/** 
* A program instance for the Meteora DLMM program
   * @param  {Connection} connection @solana/web3.js RPC connection
   * @return {Program} Anchor program instance
*/
function get_program_instance (connection) {
    const provider = new AnchorProvider(
        connection,
        {},
        AnchorProvider.defaultOptions()
    );
    return new Program(idl, LBCLMM_PROGRAM_IDS[cluster], provider);
};
/** 
* An Event Parser for the Meteora DLMM program
   * @param  {Connection} connection @solana/web3.js RPC connection
   * @return {EventParser} Anchor Event Parser
*/
function get_event_parser (connection) {
    const coder =  get_program_instance(connection).coder
    return new EventParser(LBCLMM_PROGRAM_IDS[cluster], coder);
};

module.exports = {get_program_instance, get_event_parser};
