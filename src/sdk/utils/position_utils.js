import { get_price_of_bin } from "./bin_math";
import { getClosedPosFees, getCurrent, getFinal, getOpenPosFees, getPosPoints, getTokenHodl, getUsdAtOpen } from "./position_math";

/** 
 * Builds a ISO date string from a standard JS date object without sub-second values
 */
export const getIsoStr = (date) => {
    return `${date.getFullYear()}-${formatTime(date.getMonth())}-${formatTime(date.getDate())}T${formatTime(date.getHours())}:${formatTime(date.getMinutes())}:${formatTime(date.getSeconds())}Z`
}
/** 
 * formats a numerical time value with a leading 0 if it's less than 10
*/
const formatTime = (num) => {
    if (num < 10) {
        return "0" + num;
    }
    return num
}

/** 
 * Checks if position is in range
*/
export const isInRange = (pos) => {
    if(pos.current_x.toNumber() > 0 && pos.current_y.toNumber() > 0 ) {
        return <span className="greenTd">in range</span>
    }
    return <span className="redTd">out of range</span>
}

/** 
 * A default empty Table Row
*/
export const placeholder = <tr>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
</tr>

/** 
 * Processes Position Data into Table Entries
 * @param  {Object[]} positions
 * @param  {Bool} open Boolean, Are Positions Open?
 * @returns {Object[]} processed Positions Object Array
*/
export const processPositions = (positions, open, pools) => {
    let processedPositions = positions.map((item) => {
        let lastValue, fees, lowerBinPrice, upperBinPrice;
        
        const lbInfo = pools.find((e) => e.address === item.lbPair.toString());
        if(!lbInfo.name) {
            console.log(lbInfo);
        }
        const symbols = lbInfo.name.split('-')
        const tokenHodl = getTokenHodl(item);
        const usdHodl = getUsdAtOpen(item);
        if(open){
            lastValue = getCurrent(item);
            fees = getOpenPosFees(item);
        }
        else {
            lastValue = getFinal(item);
            fees = getClosedPosFees(item);
        }
        const PnL =  lastValue - usdHodl + fees;
        
        const days = item.days;
        const points = getPosPoints(item, open);
        const oDateStr = getIsoStr(new Date(item.open_time*1000));
        const cDateStr = getIsoStr(new Date(item.close_time*1000));
        const currentPrice = lbInfo.current_price;
        
        if (item.range) {
            lowerBinPrice = get_price_of_bin(item.range.lowerBinId, lbInfo.bin_step);
            upperBinPrice = get_price_of_bin(item.range.lowerBinId+item.range.width, lbInfo.bin_step);
        };
        return {
            ...item, 
            points, 
            oDateStr, 
            cDateStr, 
            currentPrice, 
            lowerBinPrice, 
            upperBinPrice, 
            lbInfo, 
            symbols, 
            tokenHodl, 
            usdHodl, 
            lastValue, 
            fees, 
            PnL
        }
    });
    return processedPositions;
}
