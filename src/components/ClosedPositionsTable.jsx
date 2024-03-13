import { useContext, useEffect, useState } from "react"
import { PoolsContext, PositionsContext } from "../contexts/Contexts";
import { ToolTip } from "./ToolTip";

export const ClosedPositionsTable = () => {
    const {openPositions, closedPositions, setClosedPositions, setOpenPositions} = useContext(PositionsContext);
    const [ closedPositionHtml, setClosedPositionHtml ] = useState(null);
    const {pools} = useContext(PoolsContext);

    useEffect(() => {
        // console.log(closedPositions);
    }, [closedPositions]);
    return (
        <>
            <h2>Closed Positions</h2>
            <div className='positionTable' id='closedPositions'>
                <tr>
                    <th>Pool</th>
                    <th>Position Address</th>
                    <th>Duration</th>
                    <th>Initial Deposit</th>
                    <th>Final Amount </th>
                    <th>Rewards</th>
                    <th>Realized IL <ToolTip tooltip={'Impermanent loss (IL) is a result of the price difference of your tokens compared to when you deposited them in the pool.'}/></th>
                    <th>PnL <ToolTip tooltip={'PnL is your Impermanent Loss offset with your rewards'}/></th>
                    <th>Realized APR  <ToolTip tooltip={'Realized APR is the projected position returns over the course of a year, short-term positions show unreliable APR'}/></th>
                </tr>
                {
                    closedPositions === null 
                    ?
                        placeHolderClosed
                    :
                        closedPositions.map(item => {
                            const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
                            const init = getInitial(item);
                            const final = getFinal(item);
                            const fees = getFees(item);
                            const IL = final - init
                            const PnL = (IL + fees)
                            const days = ((item.close_time - item.open_time) / 86400 )
                            let APR
                            if ( PnL < 0) {
                                let step1 = -PnL/days;
                                let step2 = step1/init;
                                let step3 = 1 - step2;
                                let step4 = step3**365;
                                let step5 = 1 - step4
                                let step6 = step5*100
                                APR = -step6
                            }
                            else if ( PnL > 0) {
                                let step1 = PnL/days;
                                let step2 = step1/init;
                                let step3 = 1 - step2;
                                let step4 = step3**365;
                                let step5 = 1 - step4
                                let step6 = step5*100
                                APR = step6
                            }
                            else {APR = '0'}
                            return (
                                <tr>
                                    <td className="poolName text-left"><a href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} target="empty">{lbInfo.name}</a></td>
                                    <td className='positionAddress text-left'>🌏︎<a href={`https://solana.fm/address/${item.position.toString()}`} target="empty"> {item.position.toString().slice(0,10)}...</a></td>
                                    <td>{days.toFixed(1)} Days</td>
                                    <td>${init.toLocaleString()}</td>
                                    <td>${final.toLocaleString()}</td>
                                    <td>${fees.toLocaleString()}</td>
                                    {
                                            Number(IL) > 0 
                                            ?
                                            <td className="greenTd">${IL.toLocaleString()}</td>
                                            :
                                            <td className="redTd">${IL.toLocaleString()}</td>
                                        }
                                    {
                                        Number(PnL) > 0 
                                        ?
                                        <td className="greenTd">${PnL.toLocaleString()} ({((PnL/init)*100).toLocaleString()}%)</td>
                                        :
                                        <td className="redTd">${PnL.toLocaleString()} ({((PnL/init)*100).toLocaleString()}%)</td>
                                    }
                                    {/* Make red if negative */}
                                    {
                                        Number(APR) > 0 
                                        ?
                                        <td className="greenTd">{APR.toLocaleString()}%</td>
                                        :
                                        <td className="redTd">{APR.toLocaleString()}%</td>
                                    }
                                </tr>
                            )
                        })
                }
            </div>
        </>
    )
}

const getInitial = (item) => {
    // console.log(item);
    const amt_x = ((item.initial_x / 10**item.decimals_x)*item.x_price.value);
    const amt_y = ((item.initial_y / 10**item.decimals_y)*item.y_price.value);
    return Number((amt_x+amt_y))
}

const getFinal = (item) => {
    // console.log(item);
    const amt_x = ((item.final_x / 10**item.decimals_x)*item.x_price.value);
    const amt_y = ((item.final_y / 10**item.decimals_y)*item.y_price.value);
    return Number((amt_x+amt_y))
}
const getFees = (item) => {
    // console.log(item);
    const amt_x = ((item.rewards_x / 10**item.decimals_x)*item.x_price.value);
    const amt_y = ((item.rewards_y / 10**item.decimals_y)*item.y_price.value);
    return Number((amt_x+amt_y))
}

 

const placeHolderClosed = (
    <tr>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
)
