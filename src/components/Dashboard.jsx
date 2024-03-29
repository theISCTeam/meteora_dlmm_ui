import { fetch_with_retry, get_signatures_for_address } from '../sdk/utils/utils';
import { get_program_instance } from '../sdk/utils/get_program';
import { processPositions } from '../sdk/utils/position_utils';
import { ClosedPositionsTable } from './ClosedPositionsTable';
import { OpenPositionsTable } from './OpenPositionsTable';
import { AccountSummary } from './AccountSummary';
import { PublicKey } from '@solana/web3.js';
import { ToolTip } from './ToolTip';
import { Loader } from './Loader';
import { 
    fetch_and_parse_open_positions, 
    fetch_and_parse_closed_positions 
} from '../sdk/fetch_and_parse_positions';
import { 
    ConnectionContext, 
    PoolsContext, 
    PositionsContext 
} from '../contexts/Contexts';
import { 
    useContext, 
    useState 
} from 'react';



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

    // Init States
    const [ fetchInterval, setFetchInterval] = useState(undefined);
    const [ loadingOpen, setLoadingOpen ] = useState(false);
    const [ sigLen, setSigLen ] = useState(undefined);

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


    // Main function
    const fetch = async (address) => {
        // Return if already loading
        if (loadingOpen) {return}
        // Init Loading State
        else setLoadingOpen(true);
        var dots = startDotsInterval();

        // Get and Set Signatures Count
        const noOfSignatures = await getNoOfSigs(address);
        setSigLen(noOfSignatures);

        try {
            // fetch and build open positions
            const open_positions = await fetch_and_parse_open_positions(address, connection, apiKey);
            // process open positions
            const processed_open_positions = processPositions(open_positions, true, pools);
            const processed_open_positions2 = processPositions(open_positions, true, pools);
            // set open positions
            setOpenPositions(processed_open_positions);
            setOpenSortedPositions(processed_open_positions2);
            // fetch and build closed positions
            const closed_positions = await fetch_and_parse_closed_positions(address, connection, apiKey);
            // process closed positions
            const processed_closed_positions = processPositions(closed_positions, false, pools);
            const processed_closed_positions2 = processPositions(closed_positions, false, pools);
            // set closed positions
            setClosedPositions(processed_closed_positions);
            setClosedSortedPositions(processed_closed_positions2);
        }
        // Error Handler
        catch(e) {
            // handle and return custom error for each alert
            console.log(e);
            alert("something went wrong, please retry");
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
        setLoadingOpen(false);
        setSigLen(undefined);
        clearInterval(dots);
        document.getElementById('submitAddressBtn').innerHTML = 'Search'
    }

    const getNoOfSigs = async (address) => {
        const program = get_program_instance(connection);
        const signatures = await fetch_with_retry(
            get_signatures_for_address, 
            new PublicKey(address), 
            program
        );
        return signatures.length;
    }


    return (
        <div id='tracker'>
            <form onSubmit={handleSubmitAddress} id='addressForm' className='form'>
                <label for="addressInput">Position or Solana Wallet 
                    <ToolTip tooltip={"Wallets with many signatures will take a while to load"}/ >
                </label>
                <br/>
                <div id='addressFormWrapper'>
                    <input type='text' placeholder='Solana Address' id='addressInput' required size={42}/>
                    <button type='submit' id='submitAddressBtn'>Search</button>
                </div>
            </form>

            {
                sigLen 
                ? <Loader sigLen={sigLen} /> 
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