import { PositionsContext } from "../contexts/Contexts";
import { ToolTip } from "./ToolTip";
import { 
    useContext, 
    useEffect 
} from "react";
import { 
    formatBigNum,
    getAPR,
} from "../sdk/utils/position_math";
import { GreenRedTd } from "./GreenRedTd";
import { 
    getAccountDays, 
    getAccountDeposits, 
    getAccountRewards, 
    getAccountTokenHodl, 
    getAccountUsdHodl, 
    getAccountValue,
    getNoOfBins,
    getNoOfPools,
    getSTDvFromPositions,
    getSharpeRatio,
    getTotalPoints
} from "../sdk/utils/account_math";
import { placeholder } from "../sdk/utils/position_utils";

const tooltips =  {
    APR: 'Your combined returns over the amount of days you have provided Liquidity '
    + 'projected over a year of compounding, this is a measure of your portfolio performance',
    tokenPnL: 'Your Token Value minus USD Deposits',
    AllTimePnl: 'Your combined PnL (Profit and Loss) for all Positions including Fees.',
    StdDev: 'Standard Deviation is a measure of volatility between your positions, '
    + 'a higher number means your position returns are less predictable',
    fees: 'The total trading fees earned by your positions',
    sharpe: 'A measure of how well your portfolio performed compared against '
    + 'holding your initial tokens amounts without market making. '
    + '* A number over 3 is considered excellent. * A number over 1 is considered acceptable. '
    + '* A number less than 1 is generally evidence of a poor investment.',
    points: 'Your Estimated MET points (Not including ANY multipliers)'
};
  /**
    * A table that summarizes your positions once either open or closed positions are available
   */
export const AccountSummary = () => {
    const {
        openPositions, 
        closedPositions
    } = useContext(PositionsContext);

    useEffect(() => {}, [openPositions, closedPositions]);

    const AccountTable = () => {
        const noOfPositions = (
            openPositions.length 
            + closedPositions.length
        );
        
        const positions = {openPositions, closedPositions};
        const noOfPools = getNoOfPools(positions);
        const noOfBins = getNoOfBins(positions)
        const deposits = getAccountDeposits(positions);
        const fees = getAccountRewards(positions);
        const value = getAccountValue(positions);
        const tokenHodl = getAccountTokenHodl(positions)
        const days = getAccountDays(positions);
        const PnL = value - deposits + fees
        const {totalPoints, multiplier} = getTotalPoints(positions)
 
        return (
            <>
                <tr>
                    <td>{noOfPools}</td>
                    <td>{noOfPositions} Positions</td>
                    <td>{days ? days : '-'} Days</td>
                    <td>{noOfBins}</td>
                    <td>${deposits.toLocaleString()}</td>
                    <td>${tokenHodl.toLocaleString()}</td>
                    <td>{value.toLocaleString()}</td>
                    <GreenRedTd value={fees} important/>
                    <GreenRedTd value={PnL} withPerc base={deposits} important/>
                    <td>{formatBigNum(totalPoints)}</td>
                </tr>
            </>
        )
    }

    return (
        <>
            <div className='positionTable' id='closedPositions'>
                <h2>Account Performance</h2>    
                <table>
                    <tr>
                        <th>Used Pools</th>
                        <th>Total Positions</th>
                        <th>Total Days</th> 
                        <th>Total bins</th>
                        <th>Total Deposits ($)</th>
                        <th>Total Token HODL ($)</th>
                        <th>Total DLMM ($)</th> {/* Need to calc this */}
                        <th>Total Fees ($)<ToolTip tooltip={tooltips.fees}/></th>
                        <th>Total PnL ($)<ToolTip tooltip={tooltips.AllTimePnl}/></th>
                        <th>Estimated MET Points<ToolTip tooltip={tooltips.points}/></th>
                    </tr>
                    {
                        openPositions[0] || closedPositions[0]
                        ? <AccountTable/>
                        : placeholder
                    }
                </table>
            </div>
        </>
    )
}