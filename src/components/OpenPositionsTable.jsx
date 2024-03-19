import { GreenRedTd } from "./GreenRedTd";
import { useContext } from "react"
import {
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    getCurrent,
    getOpenPosFees, 
    getTokenHodl, 
    getUsdAtOpen
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";
import { PositionHeaders } from "./PositionHeaders";

export const OpenPositionsTable = () => {
    const { openPositions } = useContext(PositionsContext);
    const {pools} = useContext(PoolsContext);

    return (
        <>
            <h2>Open Positions</h2>
            <div className='positionTable'  id='openPositions'>
                <table>
                    {
                        !openPositions.length
                        ?
                            <PositionHeaders open={true}/>
                        :
                        openPositions.map(item => {
                            const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
                            const tokenHodl = getTokenHodl(item);
                            const usdHodl = getUsdAtOpen(item);
                            const current  = getCurrent(item);
                            const fees = getOpenPosFees(item);
                            const PnL =  current - usdHodl + fees;
                            const days = item.days;

                            return (
                                <table className="innerTable">
                                    <PositionHeaders open={true}/>
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
                                            important={true}
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