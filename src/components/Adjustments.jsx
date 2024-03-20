import { getDays } from "../sdk/utils/position_math"


const adjustmentHeaders = (len) => {
    return (
        <tr className="adjustmentHeaders adjustment">
            <th>Events ({len})</th>
            <th>Action</th>
            <th>Date</th>
            <th>Amount</th>
        </tr>
    )
}

  /**
    * A table that summarizes your position adjustments
   */
export const Adjustments = ({item, lbInfo}) => {
    if (!item.position_adjustments) {return <></>}
    let adjustments = [];
    adjustments.push(adjustmentHeaders(
        item.position_adjustments.length
    ));
    const tokenSymbols = lbInfo.name.split('-')
    item.position_adjustments.forEach(e => {
        adjustments.push(
            <tr className="adjustment">
                <td className="invisTd"/>
                <td className="text-left">{e.action}</td>
                <td className="text-left">{new Date(e.time*1000).toLocaleTimeString()} {new Date(e.time*1000).toLocaleDateString()}</td>
                <td className="text-left">
                    {`${tokenSymbols[0]}: ${e.x_amount/10**item.decimals_x}`}
                    <br/>
                    {`${tokenSymbols[1]}: ${e.y_amount/10**item.decimals_y}`}
                </td>
            </tr>
        )
    }) 
    
    return adjustments
}