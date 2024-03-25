import { formatBigNum, getDays } from "../sdk/utils/position_math"
import { getIsoStr } from "../sdk/utils/position_utils"


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
    const tokenSymbols = lbInfo.name.split('-');
    
    item.position_adjustments.forEach(e => {
        const dateStr = getIsoStr(new Date(e.time*1000))
        const x_amt = e.x_amount/10**item.decimals_x;
        const y_amt = e.y_amount/10**item.decimals_y;
        const total = (x_amt*e.xprice.value) + (y_amt*e.yprice.value)
        adjustments.push(
            <tr className="adjustment">
                <td className="invisTd"/>
                <td className="text-left">{e.action}</td>
                <td className="text-left">{dateStr}</td>
                <td>
                    <span> ${formatBigNum(total)}</span>
                    <br/>
                      <span className="mediumSmolText">{tokenSymbols[0]}:{formatBigNum(x_amt)} </span>  
                    | <span className="mediumSmolText">{tokenSymbols[1]}:{formatBigNum(y_amt)} </span>  
                </td>
            </tr>
        )
    }) 
    
    return adjustments
}