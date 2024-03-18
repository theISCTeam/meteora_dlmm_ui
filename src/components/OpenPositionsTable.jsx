import { GreenRedTd } from "./GreenRedTd";
import { ToolTip } from "./ToolTip";
import { useContext } from "react"
import {
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    getCurrent,
    getDays,
    getOpenPosFees, 
    getTokenHodl, 
    getUsdAtOpen
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";


const tooltips = {
    usdHodl: 'The USD value of your tokens on day of deposit',
    tokenHodl: 'The current USD value of your initial token deposit',
    strategy: 'The USD value of your tokens within the strategy',
    fees: 'The claimed and unclaimed fees of your position (claimed and unclaimed)',
    pnl: 'PnL is your Impermanen Loss (USD hodl - Strategy) '
    + 'offset with your accumulated liquidity fees'
};

const tableHeaders =  <tr>
    <th>Pool</th>
    <th>Position Address</th>
    <th>Duration</th>
    <th>Status</th>
    <th>USD HODL <ToolTip tooltip={tooltips.usdHodl}/></th>
    <th>Token HODL <ToolTip tooltip={tooltips.tokenHodl}/></th>
    <th>Strategy <ToolTip tooltip={tooltips.strategy}/></th>
    <th>Fees <ToolTip tooltip={tooltips.fees}/></th>
    <th>PnL <ToolTip tooltip={tooltips.pnl}/></th>
</tr>;

export const OpenPositionsTable = () => {
    const { openPositions } = useContext(PositionsContext);
    const {pools} = useContext(PoolsContext);

    return (
        <>
            <h2>Open Positions</h2>
            <div className='positionTable'  id='openPositions'>
                <table>
                    {
                        openPositions === null 
                        ?
                            PlaceHolderOpen
                        :
                        openPositions.map(item => {
                            const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
                            const tokenHodl = getTokenHodl(item);
                            const usdHodl = getUsdAtOpen(item);
                            const current  = getCurrent(item);
                            const fees = getOpenPosFees(item);
                            const PnL =  current - usdHodl + fees;
                            const days = item.days;

                            return (<table className="closedPositionTable">
                                {tableHeaders}
                                <tr>
                                    <td className="poolName">
                                        <a 
                                            href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                                            target="empty"
                                        >
                                            {lbInfo.name}
                                        </a>
                                    </td>
                                    <td className='positionAddress'>
                                        <a 
                                            href={`https://solana.fm/address/${item.position.toString()}`} 
                                            target="empty"
                                        >
                                            {"🌏︎ "+item.position.toString().slice(0,8)}...
                                        </a>
                                    </td>
                                    <td>{days.toFixed(1)} Days</td>
                                    <td>{isInRange(item)}</td>
                                    <td>${usdHodl.toLocaleString()}</td>
                                    <td>${tokenHodl.toLocaleString()}</td>
                                    <td>${current.toLocaleString()}</td>
                                    <GreenRedTd value={fees}/>
                                    <GreenRedTd 
                                        value={PnL} 
                                        withPerc={true} 
                                        base={tokenHodl}
                                    />
                                </tr>
                                <Adjustments item={item} lbInfo={lbInfo} />  
                                </table>
                            );
                        })
                    }
                </table>
            </div>
        </>
    );
};

const isInRange = (pos) => {
    if(pos.current_x.toNumber() > 0 && pos.current_y.toNumber() > 0 ) {
        return 'in range'
    }
    return 'out of range'
}

const PlaceHolderOpen = (
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