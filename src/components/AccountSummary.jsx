import { useContext, useEffect, useState } from "react";
import { PoolsContext, PositionsContext } from "../contexts/Contexts";
import { getSTDvFromPositions } from "../sdk/utils/standard_deviation";
import { getSharpeRatio, get_sharpe_ratio } from "../sdk/utils/sharpe_ratio";
import { ToolTip } from "./ToolTip";

export const AccountSummary = () => {
    const {openPositions, closedPositions, setClosedPositions, setOpenPositions} = useContext(PositionsContext);
    const {pools} = useContext(PoolsContext);

    function getDays() {
        let days = 0.0;
        for(let pos of closedPositions) {
            days += ((pos.close_time - pos.open_time) / 86400);
        };
        for(let pos of openPositions) {
            days += (((pos.close_time  - pos.open_time) / 86400));
        };
        return Number(days.toFixed(1));
    };
 
    function getDeposits() {
        let deposits = 0;
        for(let item of closedPositions) {
            const amt_x = ((item.initial_x / 10**item.decimals_x)*item.x_price.value);
            const amt_y = ((item.initial_y / 10**item.decimals_y)*item.y_price.value);
            deposits += (amt_x+amt_y);
        };
        for(let item of openPositions) {
            const amt_x = ((item.initial_x / 10**item.decimals_x)*item.tokenXPrice.value);
            const amt_y = ((item.initial_y / 10**item.decimals_y)*item.tokenYPrice.value);
            deposits += (amt_x+amt_y);
        };
        return Number(deposits);
    };

    function getValue() {
        let value = 0;
        for(let item of closedPositions) {
            const amt_x = ((item.final_x / 10**item.decimals_x)*item.x_price.value);
            const amt_y = ((item.final_y / 10**item.decimals_y)*item.y_price.value);
            value += (amt_x + amt_y);
        };  
        for(let item of openPositions) {
            const amt_x = ((item.current_x.toNumber() / 10**item.decimals_x)*item.tokenXPrice.value);
            const amt_y = ((item.current_y.toNumber() / 10**item.decimals_y)*item.tokenYPrice.value);
            value += (amt_x + amt_y);
        };
        return Number(value);
    };

    function getRewards() {
        let rewards = 0;
        for(let item of closedPositions) {
            const amt_x = ((item.rewards_x / 10**item.decimals_x)*item.x_price.value);
            const amt_y = ((item.rewards_y / 10**item.decimals_y)*item.y_price.value);
            rewards += (amt_x+amt_y);
        };
        for(let item of openPositions) {
            const amt_x = ((item.rewards_x_claimed / 10**item.decimals_x + item.rewards_x_unclaimed / 10**item.decimals_x)*item.tokenXPrice.value);
            const amt_y = ((item.rewards_y_claimed / 10**item.decimals_x+ item.rewards_y_unclaimed / 10**item.decimals_y)*item.tokenYPrice.value);
            rewards += (amt_x+amt_y);
        };
        return Number(rewards);
    }

    const AccountTable = () => {
        const noOfPositions = openPositions.length + closedPositions.length;
        const standardDeviation = getSTDvFromPositions(openPositions, closedPositions);
        const deposits = getDeposits();
        const rewards = getRewards();
        const value = getValue();
        const days = getDays();
        const IL = value - deposits;
        const PnL = value - deposits + rewards
        const avgPnL = PnL/noOfPositions
        const avgIL = IL /noOfPositions
        let APR
        if ( PnL < 0) {
            let step1 = -PnL/days;
            let step2 = step1/deposits;
            let step3 = 1 - step2;
            let step4 = step3**365;
            let step5 = 1 - step4
            let step6 = step5*100
            APR = -step6
        }
        else if ( PnL > 0) {
            let step1 = PnL/days;
            let step2 = step1/deposits;
            let step3 = 1 - step2;
            let step4 = step3**365;
            let step5 = 1 - step4
            let step6 = step5*100
            APR = step6
        }
        const allTimeIlPercentage = (value/deposits)*100;
        const nuSharpeRatio = getSharpeRatio(standardDeviation, APR, allTimeIlPercentage);

        return (
            <>
                <tr>
                    <td>{openPositions.length + closedPositions.length} Positions</td>
                    <td>{days ? days : '-' } Days</td>
                    <td>${deposits.toLocaleString()}</td>
                    <td>${value.toLocaleString()}</td>
                    <td>${rewards.toLocaleString()}</td>
                    {
                        APR >= 0 
                        ?
                        <td className="greenTd">{APR.toLocaleString()}%</td>
                        :
                        <td className="redTd">{APR.toLocaleString()}%</td>
                    }   
                </tr>
                <tr>
                    <th>All Time IL <ToolTip tooltip={'The combined Impermanent Loss of all your positions, realized and unrealized'}/></th>
                    <th>Avg PnL / position</th>
                    <th>All Time PnL <ToolTip tooltip={'Your combined PnL (Profit and Loss) for all Positions'}/></th>
                    <th>Avg PnL / position</th>
                    <th>Standard Deviation <ToolTip tooltip={'Standard Deviation is a measure of volatility between your positions, a higher number means your position are less predictable'}/></th>
                    <th>Sharpe Ratio <ToolTip tooltip={'A measure of how well your portfolio performed compared against holding your initial tokens amounts without market making. A number over 1 is considered acceptable, a higher number is excellent. A number less than 1 is generally evidence of poor investment practices. '}/></th>
                </tr>
                <tr>
                    {
                        IL >= 0 
                        ?
                        <td className="greenTd">${IL.toLocaleString()}</td>
                        :
                        <td className="redTd">${IL.toLocaleString()}</td>
                    }
                    {
                        avgIL >= 0 
                        ?
                        <td className="greenTd">${avgIL.toLocaleString()}</td>
                        :
                        <td className="redTd">${avgIL.toLocaleString()}</td>
                    }
                    {
                        PnL >= 0 
                        ?
                        <td className="greenTd">${PnL.toLocaleString()} ({((PnL/deposits)*100).toLocaleString()}%)</td>
                        :
                        <td className="redTd">${PnL.toLocaleString()} ({((PnL/deposits)*100).toLocaleString()}%)</td>
                    }
                    {
                        avgPnL >= 0 
                        ?
                        <td className="greenTd">${avgPnL.toLocaleString()}</td>
                        :
                        <td className="redTd">${avgPnL.toLocaleString()}</td>
                    }
                    
                    <td>{Number(standardDeviation).toFixed(1)}</td>

                    {
                        Number(nuSharpeRatio) >= 1 
                        ?
                        <td className="greenTd">{nuSharpeRatio.toLocaleString()}</td>
                        :
                        <td className="redTd">{nuSharpeRatio.toLocaleString()}</td>
                    }
                </tr> 
            </>
        )
    }

    useEffect(() => {}, [openPositions, closedPositions])

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
                        <th>Total Rewards</th>
                        <th>Portfolio APR <ToolTip tooltip={'Your combined returns over the course of days provided Liquidity projected over a year of compounding, this is a measure of your portfolio performance'}/></th>
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
