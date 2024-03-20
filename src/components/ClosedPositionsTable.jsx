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
        <div className="positionTable" id='closedPositions'>
            <h2>Closed Positions</h2>
            <table>
            <PositionHeaders/>
            </table>
            {
                closedPositions.length
                ? closedPositions.map(item => {
                    const lbInfo = pools.find(
                        (e) => e.address === item.lbPair.toString()
                    );
                    const symbols = lbInfo.name.split('-')
                    const fees = getClosedPosFees(item);
                    const tokenHodl = getTokenHodl(item);
                    const usdHodl = getUsdAtOpen(item);
                    const final = getFinal(item);
                    const days = getDays(item.open_time, item.close_time)
                    const PnL = (final - usdHodl + fees);
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
                                    <br/>
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
                                <td className='positionAddress text-left'>
                                    {'🌏︎'}
                                    <a 
                                        href={`https://solana.fm/address/${item.position.toString()}`} 
                                        target="empty"
                                    >
                                        {item.position.toString().slice(0,10)}...
                                    </a>

                                </td>
                                <td>
                                    <span className="smolText">open :{new Date(item.open_time*1000).toLocaleTimeString()}{new Date(item.open_time*1000).toLocaleDateString()}</span>  
                                    <br/>
                                    <span className=""> {days.toFixed(1)} Days</span>
                                    <br/>
                                    <span className="smolText">close :{new Date(item.close_time*1000).toLocaleTimeString()}{new Date(item.close_time*1000).toLocaleDateString()}</span>  
                                </td>
                                <td>
                                    <span> ${usdHodl.toLocaleString()}</span>
                                    <br/>
                                    <span className="mediumSmolText">{symbols[0]}:{(item.initial_x/10**item.decimals_x).toLocaleString()} </span>  
                                   |<span className="mediumSmolText">{symbols[1]}:{(item.initial_y/10**item.decimals_y).toLocaleString()} </span>  
                                </td>
                                <td>
                                    <span> ${tokenHodl.toLocaleString()}</span>
                                    <br/>
                                    <span className="mediumSmolText">{symbols[0]}:{(item.initial_x/10**item.decimals_x).toLocaleString()} </span>  
                                    |<span className="mediumSmolText">{symbols[1]}:{(item.initial_y/10**item.decimals_y).toLocaleString()} </span>  
                                </td>
                                <td>
                                    <span> ${final.toLocaleString()}</span>
                                    <br/>
                                    <span className="mediumSmolText">{symbols[0]}:{(item.final_x/10**item.decimals_x).toLocaleString()} </span>
                                    |<span className="mediumSmolText">{symbols[1]}:{(item.final_y/10**item.decimals_y).toLocaleString()} </span>  
                                </td>
                                <td>
                                    <span> ${fees.toLocaleString()}</span>
                                    <br/>
                                    <span className="mediumSmolText">{symbols[0]}:{(item.fees_x/10**item.decimals_x).toLocaleString()} </span>  
                                    |<span className="mediumSmolText">{symbols[1]}:{(item.fees_y/10**item.decimals_y).toLocaleString()} </span>  
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
                    )
                })
            : placeholder
            }
        </div>
    </>)
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
</tr>