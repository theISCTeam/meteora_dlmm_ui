import { ConnectionContext } from '../contexts/Contexts';
import { Connection } from '@solana/web3.js';
import { ToolTipLow } from './ToolTip';
import { useContext } from 'react';
import { 
    DEFAULT_BIRDEYE_KEY, 
    DEFAULT_RPC 
} from '../constants';

export const Header = () => {
    const { 
        rpc, 
        setRpc, 
        apiKey, 
        setApiKey 
    } = useContext(ConnectionContext);

    const handleSubmitRpc = async (e) => {
        e.preventDefault();
        try {
            await(new Connection(e.target.rpcInput.value)).getBlockHeight();
            setRpc(e.target.rpcInput.value);
        }
        catch (e) {
            alert('error while validating URL');
        };
    };

    const handleSubmitApi = async (e) => {
        e.preventDefault();
        try {
            const key = e.target.apiInput.value;
            if(key.length !== 32 ) {throw new Error('invalid key length')};
            setApiKey(e.target.apiInput.value);
        }
        catch (e) {
            alert('invalid API key length');
        };
    };

    return (
        <header>
            <div className='headerBrand'>
                <img src='./logo.png' alt='logo' className='logo'/>
                <h1>ISC LABS - Meteora DLMM Dashboard </h1>
            </div>
            <div className='headerForms'>
                <form onSubmit={handleSubmitApi} id='apiForm'>
                    <label for="apiInput">
                        Birdeye.so API key (Free Tier Is Enough)
                    </label>
                    <br/>
                    <input 
                        type='text' 
                        placeholder='Birdeye API key' 
                        id='apiInput' 
                        required 
                    />
                    <button>
                        Save
                    </button>
                    <br/>
                    <label>
                        {apiKey === DEFAULT_BIRDEYE_KEY 
                            ?<> 
                                {"Default Connected"} 
                                <ToolTipLow tooltip={
                                    'There Is a Default API key, this is a shared '
                                    + 'resource and is subject to significant '
                                    + 'load at times which may cause slow loading.'
                                }/>
                            </> 
                            : "Custom API Key Stored"}
                    </label>
                </form>
                <form onSubmit={handleSubmitRpc} id='rpcForm'>
                    <label for="rpcInput">
                        Solana RPC that allows Transaction fetches 
                    </label>
                    <br/>
                    <input 
                        type='text' 
                        placeholder='RPC'
                        id='rpcInput' 
                        required 
                    />
                    <button>
                        {'connect'}
                    </button>
                    <br/>
                    <label>
                        {rpc === DEFAULT_RPC 
                            ? <> 
                                {"Alchemy Connected"}
                                <ToolTipLow tooltip={
                                    'There is a Default RPC, this is a shared resource '
                                    + 'and is subject to significant load at times '
                                    + 'which may cause slow loading times.'
                                }/>
                            </> 
                            : "Custom RPC connected"
                        }
                    </label>
                </form>
            </div>
        </header>
    )
}
