import { ToolTip } from "./ToolTip";

const tooltips = {
    usdHodl: 'The USD value of your tokens on day of deposit',
    tokenHodl: 'The USD value of your initial token amounts at time of close or at current prices.',
    strategy: 'The USD value of your token ratio within the strategy',
    fees: 'The claimed and unclaimed liquidity fees of your position',
    pnl: 'PnL is your Investment Return (Strategy USD value - Initial USD + Fees) '
};

export const PositionHeaders = ({open}) => {
    return (
        <tr>
            <th>Pool</th>
            <th>Position Address</th>
            <th>Duration</th>
            {open ? <th>Status</th> :<></>}
            <th>Initial USD Deposit Value<ToolTip tooltip={tooltips.usdHodl}/></th>
            <th>Token Pair HODL<ToolTip tooltip={tooltips.tokenHodl}/></th>
            <th>Strategy<ToolTip tooltip={tooltips.strategy}/></th>
            <th>Fees <ToolTip tooltip={tooltips.fees}/></th>
            <th>PnL <ToolTip tooltip={tooltips.pnl}/></th>
        </tr>
    )
}