import { ToolTip } from "./ToolTip";

const tooltips = {
    usdHodl: 'The USD value of your tokens on day of deposit',
    tokenHodl: 'The USD value of your initial token amounts at time of close or at current prices.',
    strategy: 'The USD value of your token ratio within the strategy',
    fees: 'The claimed and unclaimed liquidity fees of your position',
    pnl: 'PnL is your Investment Return (Strategy USD value - Initial USD + Fees) ',
    points: 'Your Estimated MET points (Not including ANY multipliers)'
};

export const PositionHeaders = ({open}) => {
    return (
        <tr>
            <th>Pool</th>
            <th>Position Address</th>
            <th>Duration</th>
            <th>Range</th>
            <th>Deposits ($)<ToolTip tooltip={tooltips.usdHodl}/></th>
            <th>Token HODL ($)<ToolTip tooltip={tooltips.tokenHodl}/></th>
            <th>DLMM ($)<ToolTip tooltip={tooltips.strategy}/></th>
            <th>Fees ($) <ToolTip tooltip={tooltips.fees}/></th>
            <th>PnL ($) <ToolTip tooltip={tooltips.pnl}/></th>
            <th>Estimated MET Points <ToolTip tooltip={tooltips.points}/></th>
        </tr>
    )
}