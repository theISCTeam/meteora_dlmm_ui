import { ClosedPositionsTable } from './ClosedPositionsTable';
import { OpenPositionsTable } from './OpenPositionsTable';
import { AccountSummary } from './AccountSummary';
import { PublicKey } from '@solana/web3.js';
import { ToolTip } from './ToolTip';
import { 
    fetch_and_parse_open_positions, 
    fetch_and_parse_closed_positions 
} from '../sdk/fetch_and_parse_positions';
import { 
    useContext, 
    useEffect, 
    useState 
} from 'react';
import { 
    ConnectionContext, 
    PoolsContext, 
    PositionsContext 
} from '../contexts/Contexts';
import { get_signatures_for_address } from '../sdk/utils/utils';
import { get_program_instance } from '../sdk/utils/get_program';
import { Loader } from './Loader';
import { processPositions } from '../sdk/utils/position_utils';

export const Dashboard = () => {
    const {
        apiKey, 
        connection
    } = useContext(ConnectionContext);

    const {pools} = useContext(PoolsContext)

    const {
        setClosedPositions, 
        setOpenPositions,
        setOpenSortedPositions,
        setClosedSortedPositions,
    } = useContext(PositionsContext);
    
    const [ loadingOpen, setLoadingOpen ] = useState(false);
    const [ fetchInterval, setFetchInterval] = useState(undefined);
    const [ sigLen, setSigLen ] = useState(undefined);

    const fetch = async (address) => {
        if (loadingOpen) {return};
        setLoadingOpen(true);

        document.getElementById('submitAddressBtn').innerHTML = 'Searching';
        var dots = window.setInterval( function() {
            var wait = document.getElementById('submitAddressBtn');
            if ( wait.innerHTML.length > 12 ) 
                wait.innerHTML = "Searching";
            else 
                wait.innerHTML += ".";
        }, 500);

        const program = get_program_instance(connection)
        const signatures = await get_signatures_for_address(new PublicKey(address), program);
        setSigLen(signatures.length);

        try {
            // fetch and build open positions
            const open_positions = await fetch_and_parse_open_positions(address, connection, apiKey);
            console.log('setting open');
            // process open positions
            const processed_open_positions = processPositions(open_positions, true, pools);
            const processed_open_positions2 = processPositions(open_positions, true, pools);
            // set open positions
            setOpenPositions(processed_open_positions);
            setOpenSortedPositions(processed_open_positions2);
            // fetch and build closed positions
            const closed_positions = await fetch_and_parse_closed_positions(address, connection, apiKey);
            console.log('setting closed');
            // process closed positions
            const processed_closed_positions = processPositions(closed_positions, false, pools);
            const processed_closed_positions2 = processPositions(closed_positions, false, pools);
            // set closed positions
            setClosedPositions(processed_closed_positions);
            setClosedSortedPositions(processed_closed_positions2);
        }
        catch(e) {
            console.log(e);
            setLoadingOpen(false);
            setSigLen(undefined)
            clearInterval(dots)
        }
        setLoadingOpen(false);
        setSigLen(undefined)
        document.getElementById('submitAddressBtn').innerHTML = 'Search'
        clearInterval(dots)
    }

    const handleSubmitAddress = async (e) => {;
        e.preventDefault();

        if (fetchInterval !== undefined) {
            console.log('clearing interval');
            clearInterval(fetchInterval);
        }

        const address = e.target.addressInput.value;

        try {
            new PublicKey(address);
        }
        catch (e) {
            console.log(e);
            alert('invalid address')
            return;
        };
        fetch(address);

        const inter = setInterval(() => {
            console.log('running interval');
            fetch(address);
        }, 12000000);
        setFetchInterval(inter);
    };

    return (
        <div id='tracker'>
            <form onSubmit={handleSubmitAddress} id='addressForm' className='form'>
                <label for="addressInput">Position or Solana Wallet 
                    <ToolTip tooltip={"Wallets with many signatures will take a while to load"}/ >
                </label>
                <br/>
                <div id='addressFormWrapper'>
                    <input /* type='password' */type='text' placeholder='Solana Address' id='addressInput' required size={42}/>
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