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
export const process_positions = (positions, pools) => {
    let processed_positions = {};
    for(let key of Object.keys(positions)){
        let categoryPositions = positions[key];
        processed_positions[key] = categoryPositions.map((pos) => {
            let lastValue, fees, lowerBinPrice, upperBinPrice;

            const lbInfo = pools.find((e) => e.address === pos.lbPair.toString());

            if(!lbInfo.name) {
                console.log(lbInfo);
            }

            const symbols = lbInfo.name.split('-');

            const usdHodl = getUsdAtOpen(pos);
            const tokenHodl = getTokenHodl(pos);

            if(key === 'open_positions'){
                lastValue = getCurrent(pos);
                fees = getOpenPosFees(pos);
            }
            else {
                lastValue = getFinal(pos);
                fees = getClosedPosFees(pos);
            }

            const PnL =  lastValue - usdHodl + fees;
            const days = pos.days;

            const {tvl, fee, totalPoints} = getPosPoints(
                pos, 
                key === 'open_positions'
            );
            const oDateStr = getIsoStr(new Date(pos.open_time*1000));
            const cDateStr = getIsoStr(new Date(pos.close_time*1000));
            const currentPrice = lbInfo.current_price;
            
            if (pos.range) {
                lowerBinPrice = get_price_of_bin(pos.range.lowerBinId, lbInfo.bin_step);
                upperBinPrice = get_price_of_bin(pos.range.lowerBinId+pos.range.width, lbInfo.bin_step);
            };

            return {
                ...pos, 
                points:{tvl, fee},
                totalPoints, 
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
            };
        });
    };
    return processed_positions;
};
