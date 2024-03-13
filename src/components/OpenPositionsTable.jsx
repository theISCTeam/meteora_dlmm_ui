import { useContext, useEffect, useState } from "react"
import { PoolsContext, PositionsContext } from "../contexts/Contexts";
import { ToolTip } from "./ToolTip";

export const OpenPositionsTable = () => {
    const { openPositions, closedPositions, setClosedPositions, setOpenPositions } = useContext(PositionsContext);
    const [ openPositionHtml, setOpenPositionHtml ] = useState(null)
    const {pools} = useContext(PoolsContext)

    useEffect(() => {

    }, [openPositions]);

    useEffect(() => {
    }, [openPositionHtml])


    return (
        <>
                <h2>Open Positions</h2>
                <div className='positionTable'  id='openPositions'>
                    <table>
                        <tr>
                            <th>Pool</th>
                            <th>Position Address</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Initial Deposit</th>
                            <th>Current Value</th>
                            <th>Rewards</th>
                            <th>IL <ToolTip tooltip={'Impermanent Loss (IL) is a result of the price difference of your tokens compared to when you deposited them in the pool.'}/></th>
                            <th>PnL <ToolTip tooltip={'PnL is your Impermanent Loss offset with your rewards'}/></th>
                            <th>Real APR  <ToolTip tooltip={'Position APR is a reflection of your position performance during its duration projected over a year of compounding, short-term positions show unreliable APR'}/></th>
                        </tr>
                        {
                            openPositions === null 
                            ?
                                PlaceHolderOpen
                            :
                            openPositions.map(item => {
                                const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
                                const init = getInitial(item);
                                const current  = getCurrent(item);
                                const fees = getFees(item);
                                const IL = current - init;
                                const PnL = ((Number(current) - Number(init)) + Number(fees))
                                const days = (((item.close_time) - item.open_time) / 86400 )
                                let APR = 0;
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
                                        <td className="poolName"><a href={`https://app.meteora.ag/dlmm/${item.lbPair.toString()}`} target="empty">{lbInfo.name}</a></td>
                                        <td className='positionAddress'><a href={`https://solana.fm/address/${item.position.toString()}`} target="empty"> {"🌏︎ "+item.position.toString().slice(0,8)}...</a></td>
                                        <td>{days.toFixed(1)} Days</td>
                                        <td>{isInRange(item)}</td>
                                        <td>${init.toLocaleString()}</td>
                                        <td>${current.toLocaleString()}</td>
                                        <td>${fees.toLocaleString()}</td>
                                        {/* <td>${IL.toLocaleString()}</td> */}
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
                    </table>
                </div>
        </>
    )
}

const getInitial = (item) => {
    const amt_x = ((item.initial_x / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.initial_y / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}

const getCurrent = (item) => {
    const amt_x = ((item.current_x.toNumber() / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.current_y.toNumber() / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}
const getFees = (item) => {
    const amt_x = ((item.rewards_x_claimed + item.rewards_x_unclaimed / 10**item.decimals_x)*item.tokenXPrice.value);
    const amt_y = ((item.rewards_y_claimed + item.rewards_y_unclaimed / 10**item.decimals_y)*item.tokenYPrice.value);
    return (amt_x+amt_y)
}

const isInRange = (pos) => {
    if(pos.current_x.toNumber() > 0 && pos.current_y.toNumber() > 0 ) {
        return 'in range'
    }
    return 'out of range'
}

const PlaceHolderOpen = (
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