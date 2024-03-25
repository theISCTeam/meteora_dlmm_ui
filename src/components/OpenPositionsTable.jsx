import { GreenRedTd } from "./GreenRedTd";
import { useContext } from "react"
import {
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    formatBigNum,
    getCurrent,
    getOpenPosFees, 
    getPosPoints, 
    getTokenHodl, 
    getUsdAtOpen
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";
import { PositionHeaders } from "./PositionHeaders";
import { get_price_of_bin } from "../sdk/utils/bin_math";
import { getIsoStr, isInRange, placeholder } from "../sdk/utils/position_utils";
import { ExpandBtn } from "./ExpandBtn";

export const OpenPositionsTable = () => {
    const { openPositions } = useContext(PositionsContext);
    const {pools, tokens} = useContext(PoolsContext);

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
                            const points = getPosPoints(item, days, lbInfo.bin_step);
                            const currentPrice = lbInfo.current_price;
                            let lowerBinPrice, upperBinPrice
                            const oDate = new Date(item.open_time*1000)
                            const oDateStr = getIsoStr(oDate)
                            if (item.range) {
                                lowerBinPrice = get_price_of_bin(item.range.lowerBinId, lbInfo.bin_step);
                                upperBinPrice = get_price_of_bin(item.range.lowerBinId+item.range.width, lbInfo.bin_step);
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
                                        <td className='positionAddress'>
                                            <a 
                                                href={`https://solana.fm/address/${item.position.toString()}`} 
                                                target="empty"
                                                >
                                                {"🌏︎ "+item.position.toString().slice(0,8)}...
                                            </a>
                                        </td>
                                        <td>
                                            <span className="mediumSmolText">Open: {oDateStr}</span>  
                                            <br/>
                                            <span className="mediumText"> {days.toFixed(1)} Days</span>
                                        </td>
                                        <td>
                                            {isInRange(item)} 
                                            <br/>
                                            <span className="">Price: {currentPrice.toFixed(6)}</span>
                                            <br/> 
                                            <span className="mediumSmolText">Range: {item.range ? `${lowerBinPrice.toFixed(6)} - ${upperBinPrice.toFixed(6)}`:"Failed To Get Range"}</span></td>                               
                                        <td>
                                            <span> ${formatBigNum(usdHodl)}</span>
                                            <br/>
                                              <span className="mediumSmolText">{symbols[0]}:{formatBigNum((item.initial_x/10**item.decimals_x))} </span>  
                                            | <span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                            <span> ${formatBigNum(tokenHodl)}</span>
                                            <br/>
                                              <span className="mediumSmolText">{symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                                            | <span className="mediumSmolText">{symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                              <span className="smolText">withdrawn: {symbols[0]}:{formatBigNum(item.withdrawn_x/10**item.decimals_x)} </span>
                                            | <span className="smolText">{symbols[1]}:{formatBigNum(item.withdrawn_y/10**item.decimals_y)} </span>  
                                            <br/>
                                            <span> ${formatBigNum(current)}</span>
                                            <br/>
                                              <span className="smolText">active: {symbols[0]}:{formatBigNum(item.current_x/10**item.decimals_x)} </span>
                                            | <span className="smolText">{symbols[1]}:{formatBigNum(item.current_y/10**item.decimals_y)} </span>  
                                        </td>
                                        <td>
                                              <span className="smolText">claimed {symbols[0]}:{formatBigNum(item.fees_x_claimed/10**item.decimals_x)} </span>  
                                            | <span className="smolText">{symbols[1]}:{formatBigNum(item.fees_y_claimed/10**item.decimals_y)} </span>  
                                            <br/>
                                            <span> ${formatBigNum(fees)}</span>
                                            <br/>
                                              <span className="smolText">unclaimed {symbols[0]}:{(formatBigNum(item.fees_x_unclaimed/10**item.decimals_x))} </span>  
                                            | <span className="smolText">{symbols[1]}:{formatBigNum(item.fees_y_unclaimed/10**item.decimals_y)} </span>  
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
                            );
                        })
                        : placeholder
                    }
            </div>
        </>
    );
};