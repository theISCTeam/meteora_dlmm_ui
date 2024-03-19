import { GreenRedTd } from "./GreenRedTd";
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
import { PositionHeaders } from "./PositionHeaders";

export const ClosedPositionsTable = () => {
    const { closedPositions } = useContext(PositionsContext);
    const { pools } = useContext(PoolsContext);

    useEffect(() => {}, [ closedPositions ]);
    
    return (<>
        <h2>Closed Positions</h2>
        <div className='positionTable' id='closedPositions'>
            <table>
            {
                !closedPositions.length
                ? <PositionHeaders/>
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
                        <table className="innerTable">
                            <PositionHeaders/>
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
                                <GreenRedTd 
                                    value={PnL} 
                                    withPerc={true} 
                                    base={tokenHodl} 
                                    important={true}
                                />
                            </tr>
                            <Adjustments item={item} lbInfo={lbInfo}/> 
                        </table>
                    )
                })
            }
            </table>
        </div>
    </>)
};

