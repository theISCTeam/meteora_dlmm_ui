import { GreenRedTd } from "./GreenRedTd";
import { useContext, useEffect } from "react"
import {
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    formatBigNum,
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";
import { PositionHeaders } from "./PositionHeaders";
import { isInRange, placeholder } from "../sdk/utils/position_utils";
import { ExpandBtn } from "./ExpandBtn";

export const OpenPositionsTable = () => {
    const { openPositions, openSortedPositions } = useContext(PositionsContext);
    const { tokens } = useContext(PoolsContext);
    
    return (
        <>
            <div className='positionTable'  id='openPositions'>
                <h2>Open Positions</h2>
                <table>
                <PositionHeaders open/>
                </table>
                    {
                        openSortedPositions.length
                        ? openSortedPositions.map(item => {
                            const logo1 = tokens.find(e => e.symbol === item.symbols[0]);
                            const logo2 = tokens.find(e => e.symbol === item.symbols[1]);
                            return (<>
                                <table>
                                    <tr>
                                        <td className="poolName">
                                            <a 
                                                href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                                                target="empty"
                                            >
                                                <div className="poolLogos">
                                                    <img className="poolLogo" src={logo1 ? logo1.logoURI : './unknownToken.svg'}></img>
                                                    <img className="poolLogo" src={logo2 ? logo2.logoURI : './unknownToken.svg'}></img>
                                                    {item.lbInfo.name}
                                                </div>
                                            </a>
                                            <br/>
                                            <ExpandBtn item={item}/>
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
                                            <span className="mediumSmolText">Open: {item.oDateStr}</span>  
                                            <br/>
                                            <span className="mediumText"> {item.days.toFixed(1)} Days</span>
                                        </td>
                                        <td>
                                            {isInRange(item)} 
                                            <br/>
                                            <span className="">{item.currentPrice.toFixed(6)}</span>
                                            <br/> 
                                            <span className="mediumSmolText">{item.range ? `${item.lowerBinPrice.toFixed(6)} - ${item.upperBinPrice.toFixed(6)}`:"Failed To Get Range"}</span></td>                               
                                        <td>
                                            <span> ${formatBigNum(item.usdHodl)}</span>
                                            <br/>
                                              <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum((item.initial_x/10**item.decimals_x))} </span>  
                                            | <span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                            <span> ${formatBigNum(item.tokenHodl)}</span>
                                            <br/>
                                              <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                                            | <span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                              <span className="smolText">withdrawn: {item.symbols[0]}:{formatBigNum(item.withdrawn_x/10**item.decimals_x)} </span>
                                            | <span className="smolText">{item.symbols[1]}:{formatBigNum(item.withdrawn_y/10**item.decimals_y)} </span>  
                                            <br/>
                                            <span> ${formatBigNum(item.lastValue)}</span>
                                            <br/>
                                              <span className="smolText">active: {item.symbols[0]}:{formatBigNum(item.current_x/10**item.decimals_x)} </span>
                                            | <span className="smolText">{item.symbols[1]}:{formatBigNum(item.current_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                              <span className="smolText">claimed {item.symbols[0]}:{formatBigNum(item.fees_x_claimed/10**item.decimals_x)} </span>  
                                            | <span className="smolText">{item.symbols[1]}:{formatBigNum(item.fees_y_claimed/10**item.decimals_y)} </span>  
                                            <br/>
                                            <span> ${formatBigNum(item.fees)}</span>
                                            <br/>
                                              <span className="smolText">unclaimed {item.symbols[0]}:{(formatBigNum(item.fees_x_unclaimed/10**item.decimals_x))} </span>  
                                            | <span className="smolText">{item.symbols[1]}:{formatBigNum(item.fees_y_unclaimed/10**item.decimals_y)} </span>  
                                        </td>
                                        <GreenRedTd 
                                            value={item.PnL} 
                                            withPerc={true} 
                                            base={item.tokenHodl}
                                            important={true}
                                        />
                                        <td>
                                            <span> {formatBigNum(item.points.tvl + item.points.fee)}</span>
                                            <br/>
                                            <span className="mediumSmolText">TVL: {formatBigNum(item.points.tvl)} </span>  
                                            | <span className="mediumSmolText">Fees: {formatBigNum(item.points.fee)} </span>  
                                        </td>
                                    </tr>
                                </table>
                                <table className="adjustments" id={`events${item.position.toString()}`}>
                                    <Adjustments item={item} lbInfo={item.lbInfo}/>
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