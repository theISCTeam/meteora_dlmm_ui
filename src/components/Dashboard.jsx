import { fetch_parsed_transactions_from_signature_array } from '../sdk/find_positions';
import { get_program_instance } from '../sdk/utils/get_program';
import { process_positions } from '../sdk/utils/position_utils';
import { ClosedPositionsTable } from './ClosedPositionsTable';
import { OpenPositionsTable } from './OpenPositionsTable';
import { AccountSummary } from './AccountSummary';
import { PublicKey } from '@solana/web3.js';
import { ToolTip } from './ToolTip';
import { Loader } from './Loader';

import { 
    fetch_and_parse_positions_for_account
} from '../sdk/fetch_and_parse_positions';

import { fetch_with_retry, 
    get_multiple_token_prices_history_in_range,
    get_signatures_for_address_after_blocktime
} from '../sdk/utils/utils';

import { 
    ConnectionContext, 
    PoolsContext, 
    PositionsContext, 
    PriceContext
} from '../contexts/Contexts';

import { 
    useContext, 
    useEffect, 
    useState 
} from 'react';
import { DEFAULT_RPC } from '../constants';



export const Dashboard = () => {
    // Load Contexts
    const {pools} = useContext(PoolsContext)
    const {
        rpc,
        apiKey, 
        connection
    } = useContext(ConnectionContext);
    const {
        setClosedPositions, 
        setOpenPositions,
        setOpenSortedPositions,
        setClosedSortedPositions,
    } = useContext(PositionsContext);
    const {tokenPrices, setTokenPrices} = useContext(PriceContext);

    // Init States
    const [ fetchInterval, setFetchInterval] = useState(undefined);
    const [ loadingInfo, setLoadingInfo ] = useState(undefined);
    const maxSteps = 4;

    // Form Submit
    const handleSubmitAddress = async (e) => {;
        e.preventDefault();

        // Clears Previous Auto Refresh
        if (fetchInterval !== undefined) {
            // console.log('clearing interval');
            clearInterval(fetchInterval);
        }
        
        // Validate Address
        const address = e.target.addressInput.value;
        try {
            new PublicKey(address);
        }
        catch (e) {
            console.log(e);
            alert('invalid address')
            return;
        };

        // Call main func
        fetch(address);

        // Init Auto Refresh
        const inter = setInterval(() => {
            console.log('running interval');
            fetch(address);
        }, 12000000);
        setFetchInterval(inter);
    };

    const find_or_get_prices = async (positions) => {
        const keys = Object.keys(positions);
        let allPos = [];
        for(let key of keys) {
            allPos = allPos.concat(positions[key]);
        }
        let tokens = [];
        let storedPrices = Object.keys(tokenPrices);
        let newPrices = tokenPrices;
        let newTokens = []
        for(let position of allPos) {
            if(tokens.indexOf(position.x_mint.toString()) === -1) {tokens.push(position.x_mint.toString())}
            if(tokens.indexOf(position.y_mint.toString()) === -1) {tokens.push(position.y_mint.toString())}
        };
        for(let token of tokens) {
            if (storedPrices.indexOf(token) === -1) {
                newTokens.push(token);
            }
        }
        let fetchedPrices
        if (newTokens.length) {
            try {
                fetchedPrices = await get_multiple_token_prices_history_in_range(newTokens, 1698796800, Math.round(Date.now()/1000), apiKey);
            }
            catch (e) {
                return e
            }
        }
        for(let i in newTokens) {
            newPrices[newTokens[i]] = fetchedPrices[i];
        }
        setTokenPrices(newPrices);
        let positionsWithPrices = {}
        for(let key of keys) {
            const curPos = positions[key];
            let posWithPrice = [];
            for(let position of curPos) {
                posWithPrice.push({
                    ...position,
                    x_prices: newPrices[position.x_mint],
                    y_prices: newPrices[position.y_mint],
                })
            }
            positionsWithPrices[key] = posWithPrice;
        }
        return positionsWithPrices;
    }

    // Main function
    const fetch = async (address) => {
        const max_sigs = 2000;
        // Return if already loading
        if (loadingInfo) {return}
        const dots = startDotsInterval()
        try {
            // Init Loading State
            const program = get_program_instance(connection);
            setLoadingInfo({step:1, maxSteps, text:"Getting Signatures..."});
            // Get and Set Signatures Count
            const signatures = await getSignatures(address, program);
            // Butt ugly error handling but it does the job. God forgive me
            if(!signatures.length) {
                resetLoader(dots);
                if (!Object.keys(positions)) {
                    resetLoader(dots)
                    if (DEFAULT_RPC === rpc) {
                        return alert('RPC Error: failed to load signatures, please retry with a private RPC');
                    }
                    return alert('RPC Error: Failed to load signatures');
                }
            }
            setLoadingInfo({step:2, maxSteps, text:`Collecting ${signatures.length} Transactions...`});
            // fetch transactions and update loader txt each cycle 
            let transactions = await fetch_with_retry(fetch_parsed_transactions_from_signature_array, signatures, program);
            if(!transactions.length) {
                resetLoader(dots);
                if (DEFAULT_RPC === rpc) {
                    return alert('RPC Error: Failed to get Transactions, please retry with a private RPC');
                }
                return alert('RPC Error: Failed to get Transactions');
            }
            // Update loader to compiling positions
            setLoadingInfo({step:3, maxSteps, text:`Compiling Transactions...`});
            const positions = await fetch_and_parse_positions_for_account(address, transactions, connection);
            if (!Object.keys(positions)) {
                resetLoader(dots)
                if (DEFAULT_RPC === rpc) {
                    return alert('RPC Error: Failed to parse positions, please retry with a private RPC')
                }
                return alert('RPC Error: Failed to parse positions');
            }
            // update loader to getting prices and processing positions
            setLoadingInfo({step:4, maxSteps, text:`Getting Prices...`});
            const positions_with_prices = await find_or_get_prices(positions);
            if (!Object.keys(positions_with_prices).length) {
                resetLoader(dots)
                return alert(positions_with_prices)
            }
            const {open_positions, closed_positions} = process_positions(positions_with_prices, pools);
            // set positions states
            setOpenPositions([...open_positions]);
            setOpenSortedPositions([...open_positions]);
            // set closed positions
            setClosedPositions([...closed_positions]);
            setClosedSortedPositions([...closed_positions]);
        }
        // Error Handler
        catch(e) {
            // handle and return custom error for each alert
            alert("something went wrong, please retry. If the problem persists, please create your own Birdeye API Key and RPC Connection." + e);
        }
        // Reset Loader States
        resetLoader(dots);
    }
    // Utils
    const startDotsInterval = () => {
        document.getElementById('submitAddressBtn').innerHTML = 'Searching';
        return window.setInterval( function() {
            var wait = document.getElementById('submitAddressBtn');
            if ( wait.innerHTML.length > 12 ) 
                wait.innerHTML = "Searching";
            else 
                wait.innerHTML += ".";
        }, 500);
    }
    const resetLoader = (dots) => {
        clearInterval(dots)
        setLoadingInfo(undefined);
        document.getElementById('submitAddressBtn').innerHTML = 'Search'
    }

    const getSignatures = async (address, program) => {
        const blocktime = 1701388800 /* Dec  1st 2023 @ 00:00:00 */
        const signatures = await fetch_with_retry(
            get_signatures_for_address_after_blocktime, 
            new PublicKey(address), 
            program,
            blocktime
        );
        return signatures;
    }
    useEffect(() => {

    }, [loadingInfo])

    return (
        <div id='tracker'>
            <form onSubmit={handleSubmitAddress} id='addressForm' className='form'>
                <label for="addressInput">Solana Address 
                    <ToolTip tooltip={"Wallets with many signatures will take a while to load"}/ >
                </label>
                <br/>
                <div id='addressFormWrapper'>
                    <input type='text' placeholder='Solana Address' id='addressInput' required size={42}/>
                    <button type='submit' id='submitAddressBtn'>Search</button>
                </div>
            </form>

            {
                loadingInfo 
                ? <Loader info={loadingInfo} /> 
                : <></>
            }  

            <div id='positionTables'>
                <AccountSummary/>
                <OpenPositionsTable/>
                <ClosedPositionsTable/>
            </div>
        </div>
    )
}