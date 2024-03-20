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
            <div className='positionTable'  id='openPositions'>
                <h2>Open Positions</h2>
                <table>
                <PositionHeaders open/>
                </table>
                    {
                        openPositions.length
                        ? openPositions.map(item => {
                            const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
                            const tokenHodl = getTokenHodl(item);
                            const usdHodl = getUsdAtOpen(item);
                            const current  = getCurrent(item);
                            const fees = getOpenPosFees(item);
                            const PnL =  current - usdHodl + fees;
                            const days = item.days;
                            // console.log(item); 
                            return (
                                <>
                                    <tr>
                                        <td className="poolName">
                                            <a 
                                                href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                                                target="empty"
                                            >
                                                {lbInfo.name}
                                            </a>
                                            <button className="expand" onClick={() => {
                                                const element = document.getElementById(`events${item.position.toString()}`)
                                                console.log(element.style.visibility);
                                                if (element.style.visibility === 'collapse') {
                                                    element.style.visibility = 'visible'
                                                }
                                                else {
                                                    element.style.visibility = 'collapse'
                                                }
                                            }}>{`Expand Events (${item.position_adjustments.length})`}</button>
                                        </td>
                                        <td className='positionAddress'>
                                            <a 
                                                href={`https://solana.fm/address/${item.position.toString()}`} 
                                                target="empty"
                                                >
                                                {"🌏︎ "+item.position.toString().slice(0,8)}...
                                            </a>
                                        </td>
                                        <td>
                                            <span className="smolText">open :{new Date(item.open_time*1000).toLocaleTimeString()}{new Date(item.open_time*1000).toLocaleDateString()}</span>  
                                            <br/>
                                            <span> {days.toFixed(1)} Days</span>
                                        </td>
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
                                    <table className="adjustments" id={`events${item.position.toString()}`}>
                                        <Adjustments item={item} lbInfo={lbInfo}/>
                                    </table> 
                                </>
                            );
                        })
                        : placeholder
                    }
            </div>
        </>
    );
};

const placeholder = <tr>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
</tr>

const isInRange = (pos) => {
    if(pos.current_x.toNumber() > 0 && pos.current_y.toNumber() > 0 ) {
        return 'in range'
    }
    return 'out of range'
}