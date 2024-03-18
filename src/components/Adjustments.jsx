import { getDays } from "../sdk/utils/position_math"


const adjustmentHeaders = (len) => {
    return (
        <tr className="adjustmentHeaders">
            <th>Events ({len})</th>
            <th>Action</th>
            <th>At Age</th>
            <th>Amount</th>
            <td className="invisTd"/>
        </tr>
    )
}


export const Adjustments = ({item, lbInfo}) => {
    if (!item.position_adjustments) {return <></>}
    let adjustments = [];
    adjustments.push(adjustmentHeaders(
        item.position_adjustments.length
    ));
    const tokenSymbols = lbInfo.name.split('-')
    item.position_adjustments.forEach(e => {
        adjustments.push(
            <tr>
                <td className="invisTd"/>
                <td>{e.action}</td>
                <td>{getDays(item.open_time, e.time).toFixed(1)} days</td>
                <td>
                    {`${tokenSymbols[0]}: ${e.x_amount/10**item.decimals_x}`}
                    <br/>
                    {`${tokenSymbols[1]}: ${e.y_amount/10**item.decimals_y}`}
                </td>
                <td className="invisTd"/>
                <td className="invisTd"/>
                <td className="invisTd"/>
                <td className="invisTd"/>
            </tr>
        )
    }) 
    return adjustments
}