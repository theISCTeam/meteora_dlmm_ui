import { placeholder } from "../sdk/utils/position_utils";
import { PositionHeaders } from "./PositionHeaders";
import { Adjustments } from "./Adjustments";
import { GreenRedTd } from "./GreenRedTd";
import { ExpandBtn } from "./ExpandBtn";
import { 
    formatBigNum
} from "../sdk/utils/position_math";
import { 
    PoolsContext, 
    PositionsContext 
} from "../contexts/Contexts";
import { 
    useContext, 
    useEffect, 
    useState
} from "react";

export const ClosedPositionsTable = () => {
    const { closedSortedPositions } = useContext(PositionsContext);
    const {  tokens } = useContext(PoolsContext);
    const [ page, setPage ] = useState(0);
    const [ entriesPerPage, setEntriesPerPage ] = useState(5);
    const [ elements, setElements ] = useState(<></>);

    useEffect(() => {
        let rows = [];
        if (closedSortedPositions.length/*  < entriesPerPage */) {  
            for(let e of closedSortedPositions){
                rows.push(closedTd(e, tokens));
            }
            setPage(0);
            setElements([...rows]);
        } 
        // else if (closedSortedPositions.length > entriesPerPage) {
        //     for(let e of closedSortedPositions.slice(page*entriesPerPage, (page+1)*entriesPerPage)){
        //         rows.push(closedTd(e, tokens));
        //     }
        //     setElements([...rows]);
        // }
        else { 
            rows = [placeholder] 
            setElements([...rows])
        }
    }, [closedSortedPositions, page]);


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
        {/* {
        closedSortedPositions.length > entriesPerPage
        ?
            <div className="pageBtns">
                <button onClick={() => {if(page>0) {setPage(page-1)}}}>Back</button>
                Page {page+1}/{Math.ceil(closedSortedPositions.length/20)}
                <button onClick={() => {
                    if(page+1 < Math.ceil(closedSortedPositions.length/20)) {
                        setPage(page+1)
                    } 
                }}>Forward</button>
            </div>
        : <></>
        } */}
    </>)
};


const closedTd = (item, tokens) => {  
    const logo1 = tokens.find(e => e.symbol === item.symbols[0]);
    const logo2 = tokens.find(e => e.symbol === item.symbols[1]);
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
                                <img className="poolLogo" src={logo1 ? logo1.logoURI : '/meteora_dlmm_ui/unknownToken.svg'}></img>
                                <img className="poolLogo" src={logo2 ? logo2.logoURI : '/meteora_dlmm_ui/unknownToken.svg'}></img>
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
}