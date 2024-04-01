import { ConnectionContext } from '../contexts/Contexts';
import { Connection } from '@solana/web3.js';
import { ToolTipLow } from './ToolTip';
import { useContext } from 'react';
import { 
    DEFAULT_BIRDEYE_KEY, 
    DEFAULT_RPC, 
    announcements
} from '../constants';

export const Header = () => {
    const { 
        rpc, 
        setRpc, 
        apiKey, 
        setApiKey 
    } = useContext(ConnectionContext);

    function randomAnnouncement () {
        const len = announcements.length;
        const index = Math.floor(Math.random()*len)
        return announcements[index]      
    }

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
    window.onload = () => {
        const element = document.getElementById('announcement');
        const inter = setInterval(() => {
            const size = element.style.fontSize;
            if (size === '30px') {
                element.style.fontSize = '33px'
            }
            else {
                element.style.fontSize = '30px'
            }
        }, 500)
    }

    return (
        <header>
            <div className='headerBrand'>
                <img src='/meteora_dlmm_ui/logo.png' alt='logo' className='logo'/>
                <h1>ISC LABS - Meteora DLMM Dashboard </h1>
            </div>
            <h2 id='announcement' className='textWhite'>{randomAnnouncement()}</h2>
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
                                    + 'load at times which may cause slow or failed loading.'
                                }/>
                            </> 
                            : "Custom API Key Connected"}
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
                                {"Default Connected"}
                                <ToolTipLow tooltip={
                                    'There is a Default RPC, this is a shared resource '
                                    + 'and is subject to significant load at times '
                                    + 'which may cause slow or failed loading.'
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
