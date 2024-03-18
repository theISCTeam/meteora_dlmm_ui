import { GreenRedTd } from "./GreenRedTd";
import { ToolTip } from "./ToolTip";
import { 
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    useContext, 
    useEffect 
} from "react";
import { 
    getClosedPosFees, 
    getDays, 
    getFinal, 
    getTokenHodl, 
    getUsdAtOpen 
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";

const tooltips = {
    usdHodl:'The USD value of your tokens on day of deposit',
    tokenHodl: 'The current USD value of your initial token deposit',
    strategy: 'The USD value of your tokens within the strategy',
    fees: 'The claimed and unclaimed fees of your position (claimed and unclaimed)',
    pnl: 'PnL is your Impermanent Loss offset with your accumulated liquidity fees'
}

const tableHeaders = <tr>
    <th>Pool</th>
    <th>Position Address</th>
    <th>Duration</th>
    <th>USD HODL <ToolTip tooltip={tooltips.usdHodl}/></th>
    <th>Token HODL <ToolTip tooltip={tooltips.tokenHodl}/></th>
    <th>Strategy <ToolTip tooltip={tooltips.strategy}/></th>
    <th>Fees <ToolTip tooltip={tooltips.fees}/></th>
    <th>PnL <ToolTip tooltip={tooltips.pnl}/></th>
</tr>


export const ClosedPositionsTable = () => {
    const { closedPositions } = useContext(PositionsContext);
    const { pools } = useContext(PoolsContext);

    useEffect(() => {}, [ closedPositions ]);
    
    return (<>
        <h2>Closed Positions</h2>
        <div className='positionTable' id='closedPositions'>
            {
                closedPositions === null 
                ? placeHolderClosed
                : closedPositions.map(item => {
                    const lbInfo = pools.find(
                        (e) => e.address === item.lbPair.toString()
                    );
                    const fees = getClosedPosFees(item);
                    const tokenHodl = getTokenHodl(item);
                    const usdHodl = getUsdAtOpen(item);
                    const final = getFinal(item);
                    const days = getDays(item.open_time, item.close_time)
                    const PnL = (final - usdHodl + fees);
                    return (
                        <table className="closedPositionTable">
                            {tableHeaders}
                            <tr>
                                <td className="poolName text-left">
                                    <a 
                                        href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                                        target="empty"
                                    >
                                        {lbInfo.name}
                                    </a>
                                </td>
                                <td className='positionAddress text-left'>
                                    {'🌏︎'}
                                    <a 
                                        href={`https://solana.fm/address/${item.position.toString()}`} 
                                        target="empty"
                                    >
                                        {item.position.toString().slice(0,10)}...
                                    </a>
                                </td>
                                <td>{days.toFixed(1)} Days</td>
                                <td>${usdHodl.toLocaleString()}</td>
                                <td>${tokenHodl.toLocaleString()}</td>
                                <td>${final.toLocaleString()}</td>
                                <GreenRedTd value={fees}/>
                                <GreenRedTd value={PnL} withPer={true} base={tokenHodl}/>
                            </tr>
                            <Adjustments item={item} lbInfo={lbInfo}/> 
                        </table>
                    )
                })
            }
        </div>
    </>)
};

const placeHolderClosed = (
    <tr>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
)