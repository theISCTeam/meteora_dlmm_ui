import { GreenRedTd } from "./GreenRedTd";
import { 
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    useContext, 
    useEffect, 
    useState
} from "react";
import { 
    formatBigNum
} from "../sdk/utils/position_math";
import { Adjustments } from "./Adjustments";
import { PositionHeaders } from "./PositionHeaders";
import { placeholder } from "../sdk/utils/position_utils";
import { ExpandBtn } from "./ExpandBtn";

export const ClosedPositionsTable = () => {
    const { closedSortedPositions } = useContext(PositionsContext);
    const {  tokens } = useContext(PoolsContext);
    const [ elements, setElements ] = useState(<></>);

    useEffect(() => {
        let rows = [];
        if (closedSortedPositions.length) {  
            for(let e of closedSortedPositions){
                rows.push(closedTd(e, tokens));
            }
            setElements([...rows])
        } 
        else { 
            rows = [placeholder] 
            setElements([...rows])
        }
    }, [closedSortedPositions]);


    useEffect(() => {} ,[elements])
    return (<>
        <div className="positionTable" id='closedPositions'> 
            <h2>Closed Positions</h2>
            <table>
                <PositionHeaders open={false}/>
            </table>
            {
                elements
            }
        </div>
    </>)
};


const closedTd = (item, tokens) => {  
    return (
        <>
            <table>                     
                <tr>
                    <td className="poolName">
                        <a 
                            href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} 
                            target="empty"
                        >
                            <div className="poolLogos">
                                <img className="poolLogo" src={tokens.find(e => e.symbol === item.symbols[0]).logoURI}></img>
                                <img className="poolLogo" src={tokens.find(e => e.symbol === item.symbols[1]).logoURI}></img>
                                {item.lbInfo.name}
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
                        <span className="mediumSmolText">{item.oDateStr}</span> 
                        <br/>
                        <span className="smolText"> {item.days.toFixed(1)} Days</span> 
                        <br/>
                        <span className="mediumSmolText">{item.cDateStr}</span>  
                    </td>
                    <td>
                        <span className="mediumText">
                                    { item.range 
                                        ? `${item.lowerBinPrice.toFixed(6)} - ${item.upperBinPrice.toFixed(6)}`
                                        :"Failed To Get Range"
                                    }
                        </span>                         
                    </td>
                    <td>
                        <span> ${formatBigNum(item.usdHodl)}</span>
                        <br/>
                        <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                    |<span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                    </td>
                    <td>
                        <span> ${formatBigNum(item.tokenHodl)}</span>
                        <br/>
                        <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum(item.initial_x/10**item.decimals_x)} </span>  
                        |<span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.initial_y/10**item.decimals_y)} </span>  
                    </td>
                    <td>
                        <span> ${formatBigNum(item.lastValue)}</span>
                        <br/>
                        <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum(item.final_x/10**item.decimals_x)} </span>
                        |<span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.final_y/10**item.decimals_y)} </span>  
                    </td>
                    <td>
                        <span> ${formatBigNum(item.fees)}</span>
                        <br/>
                        <span className="mediumSmolText">{item.symbols[0]}:{formatBigNum(item.fees_x/10**item.decimals_x)} </span>  
                        |<span className="mediumSmolText">{item.symbols[1]}:{formatBigNum(item.fees_y/10**item.decimals_y)} </span>  
                    </td>
                    <GreenRedTd 
                        value={item.PnL} 
                        withPerc={true} 
                        base={item.tokenHodl} 
                        important={true}
                    />
                    <td>{formatBigNum(item.points)}</td>
                </tr>
            </table>
            <table className="adjustments" id={`events${item.position.toString()}`}>
                <Adjustments item={item} lbInfo={item.lbInfo}/>
            </table>
        </>
    );
}