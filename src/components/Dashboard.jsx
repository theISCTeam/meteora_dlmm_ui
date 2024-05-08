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
    ErrorContext, 
    PoolsContext, 
    PositionsContext, 
    PriceContext
} from '../contexts/Contexts';

import { 
    useContext, 
    useEffect, 
    useState 
} from 'react';
import { ErrorSlider } from './ErrorSlider';



export const Dashboard = () => {
    // Load Contexts
    const {pools} = useContext(PoolsContext)
    const {
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
    const {setError} = useContext(ErrorContext)
    // Init States
    const [ fetchInterval, setFetchInterval] = useState(undefined);
    const [ loadingInfo, setLoadingInfo ] = useState(undefined);
    const maxSteps = 4;
    const dlmmStart = 1701388800; /* Dec  1st 2023 @ 00:00:00 */

    // Form Submit
    const handleSubmitAddress = async (e) => {
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
            console.error(e);
            setError('invalid address')
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
        let tokens = [];
        let storedPrices = Object.keys(tokenPrices);
        let newPrices = tokenPrices;
        let newTokens = [];

        let all_positions = [];
        for(let key of Object.keys(positions)) {
            all_positions = [...all_positions, ...positions[key]];
        }  

        // Find all unique tokens in positions
        for(let position of all_positions) {
            let x_mint_s, y_mint_s;
            try {
                x_mint_s = position.x_mint.toString();
                y_mint_s = position.y_mint.toString();
            }
            catch(e) {
                console.log(e);
            }

            if(tokens.indexOf(x_mint_s) === -1) {tokens.push(x_mint_s)};
            if(tokens.indexOf(y_mint_s) === -1) {tokens.push(y_mint_s)};
        };
        
        // Check If Token Prices Have Already Been Cached
        for(let token of tokens) {
            if (storedPrices.indexOf(token) === -1) {
                newTokens.push(token);
            };
        };

        // Fetch Prices For New Tokens
        let fetchedPrices
        if (newTokens.length) {
            fetchedPrices = await fetch_with_retry(
                get_multiple_token_prices_history_in_range,
                newTokens, 
                dlmmStart, 
                Math.round(Date.now()/1000), 
                apiKey
            );
            if(!fetchedPrices.length) {
                throw new Error('No Prices Found')
            }
        };
        // If no new tokens, all needed prices are cached

        // Create and set new cached prices object
        for(let i in newTokens) {
            newPrices[newTokens[i]] = fetchedPrices[i];
        };
        setTokenPrices(newPrices);

        // Append Prices to positions objects for processing
        let positionsWithPrices = {}
        for(let key of Object.keys(positions)) {
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
        };

        return positionsWithPrices;
    }

    // Main function
    const fetch = async (address) => {
        // Return if already loading
        if (loadingInfo) {return};
        
        // Init Loading State
        const dots = startDotsInterval();
        setLoadingInfo({step:1, maxSteps, text:"Getting Signatures..."});
        
        // Initialize program instance
        const program = get_program_instance(connection);
        
        // Get Signatures for address
        let signatures
        try {
            signatures = await getSignatures(address, program);
            if(!signatures.length) {
                throw new Error('No Signatures Found!');
            }
        }
        catch(e) {
            setError('Error while getting signatures: ' + e);
            console.error(e)
            resetLoader(dots);
            return
        }

        // Get Transactions
        setLoadingInfo({step:2, maxSteps, text:`Collecting ${signatures.length} Transactions...`});
        let transactions
        try {
            transactions = await fetch_with_retry(fetch_parsed_transactions_from_signature_array, signatures, program);
            if(!transactions.length) {
                throw new Error('No Transactions Found');
            }
        }
        catch(e) {
            setError('Error while getting transactions: ' + e);
            console.error(e)
            resetLoader(dots);
            return
        }

        // Process Transactions
        setLoadingInfo({step:3, maxSteps, text:`Compiling Transactions...`});
        let positions;
        try{
            positions = await fetch_and_parse_positions_for_account(address, transactions, connection);
            if (!Object.keys(positions)) {
                throw new Error('No Positions Found');
            }
        }
        catch(e) {
            setError('Error while compiling positions: ' + e);
            console.error(e);
            resetLoader(dots);
            return;
        }
        // Get Prices
        setLoadingInfo({step:4, maxSteps, text:`Getting Prices...`});
        let positions_with_prices;
        try {
            positions_with_prices = await find_or_get_prices(positions);
        }
        catch(e) {
            console.error(e);
            setError('Error while getting prices: ' + e);
            resetLoader(dots);
            return;
        }

        // Set Positions States
        try {
            // calculate data to display
            const {open_positions, closed_positions} = process_positions(positions_with_prices, pools);
            // set open positions 
            setOpenPositions([...open_positions]);
            setOpenSortedPositions([...open_positions]);
            // set closed positions
            setClosedPositions([...closed_positions]);
            setClosedSortedPositions([...closed_positions]);
        }
        catch(e) {
            setError('Error while setting data: ' + e);
            console.error(e);
        }
        finally{
            resetLoader(dots);
            return;
        }
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

    // Resets Loader to waiting state
    const resetLoader = (dots) => {
        clearInterval(dots)
        setLoadingInfo(undefined);
        document.getElementById('submitAddressBtn').innerHTML = 'Search'
    }

    // Gets signatures for an address after DLMM launch date to conserve RPC and RAM 
    const getSignatures = async (address, program) => {
        const blocktime = dlmmStart
        const signatures = await fetch_with_retry(
            get_signatures_for_address_after_blocktime, 
            new PublicKey(address), 
            program,
            blocktime
        );
        return signatures;
    }
    
    // useEffect(() => {}, [loadingInfo]);

    return (
        <div id='tracker'>
            <ErrorSlider/>
            {
                pools[0] !== undefined
                ?
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
                :
                    <></>
            }

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