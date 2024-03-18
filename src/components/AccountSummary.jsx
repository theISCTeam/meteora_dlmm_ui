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
    APR: 'Your combined returns over the course of days provided Liquidity '
    + 'projected over a year of compounding, this is a measure of your portfolio performance',
    IL: 'The combined Impermanent Loss of all your positions, realized and unrealized',
    AllTimePnl: 'Your combined PnL (Profit and Loss) for all Positions',
    StdDev: 'Standard Deviation is a measure of volatility between your positions, '
    + 'a higher number means your position returns are less predictable',
    sharpe: 'A measure of how well your portfolio performed compared against '
    + 'holding your initial tokens amounts without market making. '
    + '* A number over 3 is considered excellent. * A number over 1 is considered acceptable. '
    + '* A number less than 1 is generally evidence of a poor investment.',
};

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
        const standardDeviation = getSTDvFromPositions(
            openPositions, 
            closedPositions
        );
        const positions = {openPositions, closedPositions};
        const HODL = getAccountUsdHodl(positions);
        const deposits = getAccountDeposits(positions);
        const fees = getAccountRewards(positions);
        const value = getAccountValue(positions);
        const days = getAccountDays(positions);
        const IL = value - deposits;
        const PnL = value - deposits + fees
        const avgPnL = PnL/noOfPositions
        const avgIL = IL /noOfPositions
        let APR = getAPR(PnL, days, deposits);
        const nuSharpeRatio = getSharpeRatio(
            (HODL/deposits)*100, 
            (PnL/deposits)*100, 
            standardDeviation
        );
 
        return (
            <>
                <tr>
                    <td>{openPositions.length + closedPositions.length} Positions</td>
                    <td>{days ? days : '-' } Days</td>
                    <td>${deposits.toLocaleString()}</td>
                    <td>${value.toLocaleString()}</td>
                    <GreenRedTd value={fees}/>
                    <GreenRedTd value={APR} prefix="" postfix="%"/>
                </tr>
                <tr>
                    <th>All Time IL <ToolTip tooltip={tooltips.IL}/></th>
                    <th>Avg IL / position</th>
                    <th>All Time PnL <ToolTip tooltip={tooltips.AllTimePnl}/></th>
                    <th>Avg PnL / position</th>
                    <th>Standard Deviation <ToolTip tooltip={tooltips.StdDev}/></th>
                    <th>Sharpe Ratio <ToolTip tooltip={tooltips.sharpe}/></th>
                </tr>
                <tr>
                    <GreenRedTd value={IL} withPerc={true} base={deposits}/>
                    <GreenRedTd value={avgIL}/>
                    <GreenRedTd value={PnL} withPerc={true} base={deposits}/>
                    <GreenRedTd value={avgPnL}/>
                    <GreenRedTd value={standardDeviation} prefix=""/>
                    <GreenRedTd value={nuSharpeRatio} prefix=""/>
                </tr> 
            </>
        )
    }

    return (
        <>
            <h2>Account Performance</h2>
            <div className='positionTable' id='closedPositions'>
                <table>
                    <tr>
                        <th>Total Positions</th>
                        <th>Total Days</th> 
                        <th>Total Deposits</th>
                        <th>Total Value</th>
                        <th>Total Fees</th>
                        <th>Portfolio APR <ToolTip tooltip={tooltips.APR}/></th>
                    </tr>
                    
                    {
                        openPositions[0] || closedPositions[0]
                            ? 
                                <AccountTable/>
                            : 
                                <></>
                    }
                </table>
            </div>
        </>
    )
}
