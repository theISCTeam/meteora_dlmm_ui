import { useContext, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetch_and_parse_open_positions, fetch_and_parse_closed_positions } from '../sdk/fetch_and_parse_positions';
import { ConnectionContext, PoolsContext, PositionsContext } from '../contexts/Contexts';
import { OpenPositionsTable } from './OpenPositionsTable';
import { ClosedPositionsTable } from './ClosedPositionsTable';
import { AccountSummary } from './AccountSummary';
import { ToolTip, ToolTipLow } from './ToolTip';
import { DEFAULT_BIRDEYE_KEY, DEFAULT_RPC } from '../constants';


export const Header = () => {
    const {rpc, setRpc, apiKey, setApiKey, connection} = useContext(ConnectionContext)
    const {openPositions, closedPositions, setClosedPositions, setOpenPositions} = useContext(PositionsContext);
    const {pools} = useContext(PoolsContext);
    const [ connectTxt, setConnectTxt ] = useState('Connect')


    const handleSubmitRpc = async (e) => {
        e.preventDefault();
        try {
            new Connection(e.target.rpcInput.value)
            setRpc(e.target.rpcInput.value)
        }
        catch (e) {
            alert('invalid RPC url')
        }
    }

    const handleSubmitApi = async (e) => {
        e.preventDefault();
        try {
            const key = e.target.apiInput.value;
            if(key.length !== 32 ) {throw new Error('invalid key length')}
            setApiKey(e.target.apiInput.value)
        }
        catch (e) {
            alert('invalid API key')
        }
    }


    return (
        <header>
            <div className='headerBrand'>
                <img src='./logo.png' className='logo'/>
                <h1>ISC LABS - Meteora DLMM Dashboard </h1>\
            </div>
            <div className='headerForms'>
                <form onSubmit={handleSubmitApi}>
                    <label for="apiInput">Birdeye.so API key (Free Tier Is Enough)</label> <br/>
                    <input type='text' placeholder='Birdeye API key' id='apiInput' required size={12}/>
                    <button>Save</button><br/>
                    <label for="rpcInput">{apiKey === DEFAULT_BIRDEYE_KEY ? <> 
                        {"Default Connected"} 
                        <ToolTipLow tooltip={'There Is a Default API key, this is a shared resource and is subject to significant load at times which may cause slow loading.'}/>
                    </> : "Custom API connected"}</label><br/>
                </form>
                <form onSubmit={handleSubmitRpc}>
                    <label for="rpcInput">Solana RPC that allows Transaction fetches </label><br/>
                    <input type='text' placeholder='RPC' id='rpcInput' required size={12}></input>
                    <button>{connectTxt}</button><br/>
                    <label for="rpcInput">{rpc === DEFAULT_RPC ? <>
                        {"Alchemy Connected"}
                        <ToolTipLow tooltip={'There Is Already a Default RPC, this is a shared resource and is subject to significant load at times which may cause slow loading times.'}/>
                    </> : "Custom RPC connected"}</label><br/>
                </form>
            </div>
        </header>
    )
}
