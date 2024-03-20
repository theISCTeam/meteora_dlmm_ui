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
                            const symbols = lbInfo.name.split('-')
                            const tokenHodl = getTokenHodl(item);
                            const usdHodl = getUsdAtOpen(item);
                            const current  = getCurrent(item);
                            const fees = getOpenPosFees(item);
                            const PnL =  current - usdHodl + fees;
                            const days = item.days;
                            // console.log(item); 
                            return (<>
                                <table>
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
                                            <span> {days.toFixed(1)} Days</span>
                                            <br/>
                                            <span className="smolText">open :{new Date(item.open_time*1000).toLocaleTimeString()}{new Date(item.open_time*1000).toLocaleDateString()}</span>  
                                        </td>
                                        <td>{isInRange(item)}</td>
                                        <td>
                                            <span> ${usdHodl.toLocaleString()}</span>
                                            <br/>
                                            <span className="mediumSmolText">{symbols[0]}:{(item.initial_x/10**item.decimals_x).toLocaleString()} </span>  
                                            |   <span className="mediumSmolText">{symbols[1]}:{(item.initial_y/10**item.decimals_y).toLocaleString()} </span>  
                                        </td>
                                        <td>
                                            <span> ${tokenHodl.toLocaleString()}</span>
                                            <br/>
                                            <span className="mediumSmolText">{symbols[0]}:{(item.initial_x/10**item.decimals_x).toLocaleString()} </span>  
                                            | <span className="mediumSmolText">{symbols[1]}:{(item.initial_y/10**item.decimals_y).toLocaleString()} </span>  
                                        </td>
                                        <td>
                                            <span> ${current.toLocaleString()}</span>
                                            <br/>
                                            <span className="mediumSmolText">{symbols[0]}:{(item.current_x/10**item.decimals_x).toLocaleString()} </span>
                                            | <span className="mediumSmolText">{symbols[1]}:{(item.current_y/10**item.decimals_y).toLocaleString()} </span>  
                                        </td>
                                        <td>
                                            <span className="smolText">claimed {symbols[0]}:{((item.fees_x_claimed)/10**item.decimals_x).toLocaleString()} </span>  
                                            | <span className="smolText">{symbols[1]}:{((item.fees_y_claimed)/10**item.decimals_y).toLocaleString()} </span>  
                                            <br/>
                                            <span> ${fees.toLocaleString()}</span>
                                            <br/>
                                            <span className="smolText">unclaimed {symbols[0]}:{((item.fees_x_unclaimed)/10**item.decimals_x).toLocaleString()} </span>  
                                            | <span className="smolText">{symbols[1]}:{((item.fees_y_unclaimed)/10**item.decimals_y).toLocaleString()} </span>  
                                        </td>
                                        <GreenRedTd 
                                            value={PnL} 
                                            withPerc={true} 
                                            base={tokenHodl}
                                            important={true}
                                            />
                                    </tr>
                                </table>
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