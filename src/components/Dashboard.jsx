import { useContext, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetch_and_parse_open_positions, fetch_and_parse_closed_positions } from '../sdk/fetch_and_parse_positions';
import { ConnectionContext, PoolsContext, PositionsContext } from '../contexts/Contexts';
import { OpenPositionsTable } from './OpenPositionsTable';
import { ClosedPositionsTable } from './ClosedPositionsTable';
import { AccountSummary } from './AccountSummary';
import { ToolTip } from './ToolTip';

export const Dashboard = () => {
    const {rpc, setRpc, apiKey, setApiKey, connection} = useContext(ConnectionContext)
    const {openPositions, closedPositions, setClosedPositions, setOpenPositions} = useContext(PositionsContext);
    const {pools} = useContext(PoolsContext);
    
    const [ loadingOpen, setLoadingOpen ] = useState(false);
    const [ loadingClosed, setLoadingClosed ] = useState(false);
    const [ connectTxt, setConnectTxt ] = useState('Connect')
    const [ fetchInterval, setFetchInterval] = useState(undefined)
    const [ dots, setDots ] = useState('.')

    const fetchOpen = async (address) => {
        if (loadingOpen) {return};
        setLoadingOpen(true);
        var dots = window.setInterval( function() {
            var wait = document.getElementById("wait");
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
        clearInterval(dots)
    
    }

    const fetchClosed = async (address) => {
        setLoadingClosed(true);
        try {
            // const closed_positions = await fetch_and_parse_closed_positions(address, connection);
            // setClosedPositions(closed_positions);
        }
        catch(e) {
            console.log(e);
            alert('Fetch failed')
        }
        setLoadingClosed(false);
    }

    const handleSubmitAddress = async (e) => {;
        if (fetchInterval != undefined) {
            console.log('clearing interval');
            clearInterval(fetchInterval);
        }
        const address = e.target.addressInput.value
        e.preventDefault();
        try {
            new PublicKey(address);
        }
        catch (e) {
            console.log(e);
            alert('invalid address')
            return;
        }
        fetchClosed(address);
        fetchOpen(address);

        const inter = setInterval(() => {
            console.log('running interval');
            fetchClosed(address);
            fetchOpen(address);
        }, 12000000)
        setFetchInterval(inter)
    };
    useEffect(() => {
        if (rpc === document.getElementById('rpcInput').value) {
            setConnectTxt("Connected")
        }
        else {
            setConnectTxt("Connect")
        }
        // console.log(rpc === document.getElementById('rpcInput').value);
    }, [rpc]) 

    return (
        <div id='tracker'>
            {/* <h2>{`RPC: ${rpc}`}</h2> */}
            <form onSubmit={handleSubmitAddress}>
                <label for="addressInput">Position or Solana Wallet <ToolTip tooltip={"Wallets with many signatures will take a while to load"}/ ></label><br/>
                <input type='text' placeholder='Solana Address' id='addressInput' required size={42}></input>
                <button>Search</button>
            </form>

            {
                loadingClosed === true || loadingOpen === true
                ?
                <div>
                    <br/>
                    <h2 id='wait'>Searching</h2>
                </div>
                : 
                <></>
            }
            <div id='positionTables'>
                <AccountSummary/>
                <OpenPositionsTable/>
                <ClosedPositionsTable/>
            </div>
        </div>
    )
}