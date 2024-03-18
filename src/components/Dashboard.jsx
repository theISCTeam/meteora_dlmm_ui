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
    useState 
} from 'react';
import { 
    ConnectionContext, 
    PositionsContext 
} from '../contexts/Contexts';

export const Dashboard = () => {
    const {
        apiKey, 
        connection
    } = useContext(ConnectionContext);

    const {
        setClosedPositions, 
        setOpenPositions
    } = useContext(PositionsContext);
    
    const [ loadingOpen, setLoadingOpen ] = useState(false);
    const [ fetchInterval, setFetchInterval] = useState(undefined);

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
        try {
            const open_positions = await fetch_and_parse_open_positions(address, connection, apiKey);
            setOpenPositions(open_positions);
            const closed_positions = await fetch_and_parse_closed_positions(address, connection, apiKey);
            setClosedPositions(closed_positions);
        }
        catch(e) {
            console.log(e);
            setLoadingOpen(false);
            clearInterval(dots)
        }
        setLoadingOpen(false);
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
            {/* <p className='white-p'>{`RPC: ${rpc}`}</p> */}
            <form onSubmit={handleSubmitAddress} id='addressForm'>
                <label for="addressInput">Position or Solana Wallet 
                    <ToolTip tooltip={"Wallets with many signatures will take a while to load"}/ >
                </label>
                <br/>
                <input type='text' placeholder='Solana Address' id='addressInput' required size={42}/>
                <button type='submit' id='submitAddressBtn'>Search</button>
            </form>

            <div id='positionTables'>
                <AccountSummary/>
                <OpenPositionsTable/>
                <ClosedPositionsTable/>
            </div>
        </div>
    )
}