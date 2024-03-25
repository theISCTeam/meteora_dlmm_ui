import './App.css';
import { Connection } from '@solana/web3.js';
import { Dashboard } from './components/Dashboard';
import { get_pools } from './sdk/utils/utils';
import { 
    useEffect, 
    useState 
} from 'react';
import { 
    ConnectionContext, 
    PoolsContext, 
    PositionsContext 
} from './contexts/Contexts';
import { DEFAULT_RPC, DEFAULT_BIRDEYE_KEY } from './constants';
import { Header } from './components/Header';

function App() {
    const [ rpc, setRpc ] = useState(DEFAULT_RPC);
    const [ apiKey, setApiKey ] = useState(DEFAULT_BIRDEYE_KEY);
    const [ connection, setConnection ] = useState(new Connection(DEFAULT_RPC));
    const [ openPositions, setOpenPositions ] = useState([])
    const [ closedPositions, setClosedPositions ] = useState([])
    const [ pools, setPools ] = useState([])
    const [ tokens, setTokens ] = useState([])

    useEffect(() => {
        const getPools = async () => {
            let pls = await get_pools(connection);
            let tkns = await(await fetch('https://token.jup.ag/all')).json();
            setPools(pls);
            setTokens(tkns);
        }
        getPools()
    }, [])

    useEffect(() => {
        // console.log(tokens);
    }, [pools, tokens])

    useEffect(() => {
        setConnection(new Connection(rpc));
    }, [rpc])

    return (
        <ConnectionContext.Provider value={{
            rpc, 
            setRpc, 
            apiKey, 
            setApiKey, 
            connection
        }}>   
            <PoolsContext.Provider value={{pools, tokens}}>
                <PositionsContext.Provider value={{
                    openPositions, 
                    closedPositions, 
                    setClosedPositions, 
                    setOpenPositions
                }}>
                    <div className="App">
                        <Header/>
                        <Dashboard/>
                    </div>
                </PositionsContext.Provider>
            </PoolsContext.Provider>
        </ConnectionContext.Provider>
    );
}

export default App;

