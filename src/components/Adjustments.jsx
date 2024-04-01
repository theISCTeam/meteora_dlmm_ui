import { find_nearest_price_to_time } from "../sdk/parse_position_events"
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
    const reversedAdj = item.position_adjustments.reverse()
    reversedAdj.forEach(e => {
        const dateStr = getIsoStr(new Date(e.time*1000))
        const x_amt = e.x_amount/10**item.decimals_x;
        const y_amt = e.y_amount/10**item.decimals_y;
        const x_price = find_nearest_price_to_time(item.x_prices, e.time);
        const y_price = find_nearest_price_to_time(item.y_prices, e.time);
        const total = (x_amt*x_price.value) + (y_amt*y_price.value);
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