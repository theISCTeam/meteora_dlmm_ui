import { summarizeAccount } from "../sdk/utils/account_math";
import { formatBigNum } from "../sdk/utils/position_math";
import { placeholder } from "../sdk/utils/position_utils";
import { PoolsContext, PositionsContext } from "../contexts/Contexts";
import { GreenRedTd } from "./GreenRedTd";
import { ToolTip } from "./ToolTip";
import { 
    useContext, 
    useEffect, 
    useState
} from "react";

const tooltips =  {
    APR: 'Your combined returns over the amount of days you have provided Liquidity '
    + 'projected over a year of compounding, this is a measure of your portfolio performance',
    tokenPnL: 'Your Token Value minus USD Deposits',
    AllTimePnl: 'Your combined PnL (Profit and Loss) for all Positions including Fees. (DLMM returns - USD Deposits + Fees)',
    StdDev: 'Standard Deviation is a measure of volatility between your positions, '
    + 'a higher number means your position returns are less predictable',
    fees: 'The total trading fees earned by your positions',
    sharpe: 'A measure of how well your portfolio performed compared against '
    + 'holding your initial tokens amounts without market making. '
    + '* A number over 3 is considered excellent. * A number over 1 is considered acceptable. '
    + '* A number less than 1 is generally evidence of a poor investment.',
    points: 'Your Estimated MET points (Not including ANY multipliers) *This is an estimate and is not indicative of real points or MET token allocation'
};
  /**
    * A table that summarizes your positions once either open or closed positions are available
   */
export const AccountSummary = () => {
    const {
        openPositions, 
        closedPositions,
        openSortedPositions,
        closedSortedPositions,
        setOpenSortedPositions,
        setClosedSortedPositions
    } = useContext(PositionsContext);
    const {
        disabledPools,
        setDisabledPools,
        tokens,
        pools
    } = useContext(PoolsContext)

    const [allPools, setAllPools ] = useState([]);
    const [dropdown, setDropdown ] = useState([]);
    const [table, setTable] = useState([])



    useEffect(() => {

        if(openSortedPositions[0] || closedSortedPositions[0]){
            const AccountTable = () => {
                const allPos = openSortedPositions.concat(closedSortedPositions);
                const summary = summarizeAccount(allPos);
                const {noOfPools, noOfPositions, days, noOfBins, usdDeposits:deposits, tokenHodl, dlmm, fees, PnL, points} = summary;
                let pools = [];
                for(let pos of closedPositions.concat(openPositions)) {
                    const pool = pos.lbPair.toString()
                    if (pools.indexOf(pool) === -1){
                        pools.push(pool);
                    }
                }
                setAllPools([...pools]);
                return (
                    <>
                        <tr>
                            <td>{noOfPools} Pools</td>
                            <td>{noOfPositions} Positions</td>
                            <td>{formatBigNum(days)} Days</td>
                            <td>{noOfBins}</td>
                            <td>${formatBigNum(deposits)}</td>
                            <td>${formatBigNum(tokenHodl)}</td>
                            <td>${formatBigNum(dlmm)}</td>
                            <GreenRedTd value={fees} important/>
                            <GreenRedTd value={PnL} withPerc base={deposits} important/>
                            <td>
                                <span> {formatBigNum(summary.points.tvl + summary.points.fee)}</span>
                                <br/>
                                <span className="mediumSmolText">TVL: {formatBigNum(summary.points.tvl)} </span>  
                                | <span className="mediumSmolText">fees: {formatBigNum(summary.points.fee)} </span>  
                            </td>
                        </tr>
                    </>
                )
            }
            setTable(AccountTable)
        }
        else {setTable(placeholder)}
    }, [openSortedPositions, closedSortedPositions])

    const togglePoolsDropdown = () => {
        // Allow user to select/deselect pools to display/calculate
    }

    useEffect(() => {
        if(allPools.length) {
            let elements = [];
            elements.push(
                <>
                    <button className='poolsSelector'onClick={() => setDisabledPools([])} >Select All</button>
                    <button className='poolsSelector'onClick={() => setDisabledPools([...allPools])} >Deselect All</button>
                </>
            )
            for(let pool of allPools) {
                const lbInfo = pools.find(e => e.address === pool);
                const symbols = lbInfo.name.split('-')
                elements.push(
                    <div className="pool">
                    <label for={pool}> 
                        <img className="poolLogo" src={tokens.find(e => e.symbol === symbols[0]).logoURI}></img>
                        <img className="poolLogo" src={tokens.find(e => e.symbol === symbols[1]).logoURI}></img>
                        <span className="mediumText">{lbInfo.name}</span>
                    </label>
                    <input 
                        type="checkbox" 
                        id={pool} 
                        checked={disabledPools.indexOf(pool) === -1}
                        onChange={(g) => {
                            if(disabledPools.indexOf(pool) === -1) {
                                setDisabledPools([...disabledPools, pool])
                            }   
                            else {
                                const index = disabledPools.indexOf(pool);
                                const newArr = disabledPools
                                disabledPools.splice(index, 1)  
                                setDisabledPools([...newArr])
                            }
                        }} 
                    />
                    </div>
                ) 
            }
            setDropdown([...elements]);
        }
        else{
            setDropdown(<></>)
        }
    }, [allPools, disabledPools])

    return (
        <>
            <div className='positionTable' id='closedPositions'>
                <h2>Account Performance 
                    <img className="pointer" onClick={togglePoolsDropdown} src="./filter.svg"/>
                    <div id="poolsDropdown"> 
                        {dropdown}
                    </div>
                </h2>    
                <table>
                    <tr>
                        <th>Used Pools</th>
                        <th>Total Positions</th>
                        <th>Total Days</th> 
                        <th>Total Bins</th>
                        <th>Total Deposits ($)</th>
                        <th>Total Token HODL ($)</th>
                        <th>Total DLMM ($)</th> 
                        <th>Total Fees ($)<ToolTip tooltip={tooltips.fees}/></th>
                        <th>Total PnL ($)<ToolTip tooltip={tooltips.AllTimePnl}/></th>
                        <th>Estimated MET Points<ToolTip tooltip={tooltips.points}/></th>
                    </tr>
                    {table}
                </table>
            </div>
        </>
    )
}