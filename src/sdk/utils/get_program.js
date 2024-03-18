const { 
    AnchorProvider,  
    Program, 
    EventParser 
} = require("@coral-xyz/anchor");
const { LBCLMM_PROGRAM_IDS } = require("../constants/addresses");
const idl = require('../constants/meteora_dlmm_idl.json');

const cluster = "mainnet-beta";

function get_program_instance (connection) {
    const provider = new AnchorProvider(
        connection,
        {},
        AnchorProvider.defaultOptions()
    );
    return new Program(idl, LBCLMM_PROGRAM_IDS[cluster], provider);
};

function get_event_parser (connection) {
    const coder =  get_program_instance(connection).coder
    return new EventParser(LBCLMM_PROGRAM_IDS[cluster], coder);
};

module.exports = {get_program_instance, get_event_parser};
