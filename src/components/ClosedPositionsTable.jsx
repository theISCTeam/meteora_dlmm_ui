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
    formatBigNum,
    getClosedPosFees, 
    getDays, 
    getFinal, 
    getPosPoints, 
    getTokenHodl, 
    getUsdAtOpen 
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";
import { PositionHeaders } from "./PositionHeaders";
import { get_price_of_bin } from "../sdk/utils/bin_math";
import { getIsoStr, placeholder } from "../sdk/utils/position_utils";
import { ExpandBtn } from "./ExpandBtn";

export const ClosedPositionsTable = () => {
    const { closedPositions } = useContext(PositionsContext);
    const { pools, tokens } = useContext(PoolsContext);

    useEffect(() => {}, [ closedPositions ]);
    
    return (<>
        <div className="positionTable" id='closedPositions'>
            <h2>Closed Positions</h2>
            <table>
            <PositionHeaders open/>
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
                    const points = getPosPoints(item, days, lbInfo.bin_step)
                    let upperBinPrice, lowerBinPrice;
                    const oDate = new Date(item.open_time*1000)
                    const oDateStr = getIsoStr(oDate);
                    const cDate = new Date(item.close_time*1000)
                    const cDateStr = getIsoStr(cDate);
                    if (item.range) {
                        lowerBinPrice = get_price_of_bin(item.range.lowerBinId, lbInfo.bin_step);
                        upperBinPrice = get_price_of_bin(item.range.lowerBinId+item.range.width, lbInfo.bin_step);
                    }
                    if(item.range === undefined) {
                        console.log(item);
                    }
                    return (<>
                        <table>                     
                            <tr>
                                <td className="poolName">
                                    <a 
                                        href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                                        target="empty"
                                    >
                                        <div className="poolLogos">
                                            <img className="poolLogo" src={tokens.find(e => e.symbol === symbols[0]).logoURI}></img>
                                            <img className="poolLogo" src={tokens.find(e => e.symbol === symbols[1]).logoURI}></img>
                                            {lbInfo.name}
                                        </div>
                                    </a>
                                    <br/>
                                    <ExpandBtn item={item}/>
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
                                    <span className="mediumText">{oDateStr}</span>  
                                    <br/>
                                    <span className="mediumSmolText"> {days.toFixed(1)} Days</span>
                                    <br/>
                                    <span className="mediumText">{cDateStr}</span>  
                                </td>
                                <td>
                                    <span className="">
                                            Range: <br/> {
                                                item.range 
                                                    ? `${lowerBinPrice.toFixed(6)} - ${upperBinPrice.toFixed(6)}`
                                                    :"Failed To Get Range"}
                                        </span>                         
                                </td>
                                <td>
                                    <span> ${formatBigNum(usdHodl)}</span>
                                    <br/>
                                    <span className="mediumSmolText">{symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                                   |<span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                </td>
                                <td>
                                    <span> ${formatBigNum(tokenHodl)}</span>
                                    <br/>
                                     <span className="mediumSmolText">{symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                                    |<span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                </td>
                                <td>
                                    <span> ${formatBigNum(final)}</span>
                                    <br/>
                                     <span className="mediumSmolText">{symbols[0]}:{formatBigNum(item.final_x/10**item.decimals_x)} </span>
                                    |<span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.final_y/10**item.decimals_y)} </span>  
                                </td>
                                <td>
                                    <span> ${formatBigNum(fees)}</span>
                                    <br/>
                                     <span className="mediumSmolText">{symbols[0]}:{formatBigNum(item.fees_x/10**item.decimals_x)} </span>  
                                    |<span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.fees_y/10**item.decimals_y)} </span>  
                                </td>
                                <GreenRedTd 
                                    value={PnL} 
                                    withPerc={true} 
                                    base={tokenHodl} 
                                    important={true}
                                />
                                <td>{formatBigNum(points)}</td>
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
