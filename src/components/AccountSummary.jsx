import { PositionsContext } from "../contexts/Contexts";
import { ToolTip } from "./ToolTip";
import { 
    useContext, 
    useEffect 
} from "react";
import { 
    getAPR,
} from "../sdk/utils/position_math";
import { GreenRedTd } from "./GreenRedTd";
import { 
    getAccountDays, 
    getAccountDeposits, 
    getAccountRewards, 
    getAccountUsdHodl, 
    getAccountValue,
    getSTDvFromPositions,
    getSharpeRatio
} from "../sdk/utils/account_math";

const tooltips =  {
    APR: 'Your combined returns over the amount of days you have provided Liquidity '
    + 'projected over a year of compounding, this is a measure of your portfolio performance',
    tokenPnL: 'The combined Token Appreciation and Depreciation for the duration of all your positions.',
    AllTimePnl: 'Your combined PnL (Profit and Loss) for all Positions including Fees.',
    StdDev: 'Standard Deviation is a measure of volatility between your positions, '
    + 'a higher number means your position returns are less predictable',
    fees: 'The combined trading fees accumulated by your positions',
    sharpe: 'A measure of how well your portfolio performed compared against '
    + 'holding your initial tokens amounts without market making. '
    + '* A number over 3 is considered excellent. * A number over 1 is considered acceptable. '
    + '* A number less than 1 is generally evidence of a poor investment.',
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
        const HODL = getAccountUsdHodl(positions);
        const deposits = getAccountDeposits(positions);
        const fees = getAccountRewards(positions);
        const value = getAccountValue(positions);
        const days = getAccountDays(positions);
        const TokenPnl = value - deposits;
        const PnL = value - deposits + fees
        const avgPnL = PnL/noOfPositions;
        const avgTokenPnl = TokenPnl /noOfPositions;
        let APR = getAPR(PnL, days, deposits);
 
        return (
            <>
                <tr>
                    <td>{openPositions.length + closedPositions.length} Positions</td>
                    <td>{days ? days : '-' } Days</td>
                    <td>${deposits.toLocaleString()}</td>
                    <td>${value.toLocaleString()}</td>
                    <GreenRedTd value={TokenPnl} withPerc base={deposits} important />
                    <GreenRedTd value={fees} important/>
                    <GreenRedTd value={PnL} withPerc base={deposits} important/>
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
                        <th>Total Positions</th>
                        <th>Total Days</th> 
                        <th>Total USD Deposits</th>
                        <th>Total USD Withdrawals</th>
                        <th>Token PnL <ToolTip tooltip={tooltips.tokenPnL}/></th>
                        <th>Total Fees<ToolTip tooltip={tooltips.fees}/></th>
                        <th>PnL + Fees <ToolTip tooltip={tooltips.AllTimePnl}/></th>
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

const placeholder = <tr>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
</tr>