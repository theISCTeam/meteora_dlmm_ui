import { useContext, useEffect, useState } from "react";
import { ToolTip } from "./ToolTip";
import { PoolsContext, PositionsContext } from "../contexts/Contexts";

const tooltips = {
    usdHodl: 'The USD value of your tokens on day of deposit',
    tokenHodl: 'The USD value of your initial token amounts at time of close or at current prices.',
    strategy: 'The USD value of your token ratio within the strategy',
    fees: 'The claimed and unclaimed liquidity fees of your position',
    pnl: 'PnL is your Investment Return (Strategy USD value - Initial USD + Fees) ',
    points: 'Your Estimated MET points (Not including ANY multipliers)'
};

export const PositionHeaders = ({open}) => {
    const {openPositions, openSortedPositions ,setOpenSortedPositions, closedSortedPositions, closedPositions, setClosedSortedPositions} = useContext(PositionsContext);
    const [activeSort, setActiveSort] = useState(undefined);
    const [direction, setDirection] = useState(undefined);
    const {
        disabledPools
    } = useContext(PoolsContext)

    const handleClick = (key, rerender=false) => {
        const positions = filter(open ? openSortedPositions : closedSortedPositions);

        if(!rerender){
            if(activeSort === key && direction !== 'desc') {
                setDirection('desc');
                const sorted = sortByKey(positions, key, 'desc');
                if(open) {setOpenSortedPositions([...sorted])}
                else {setClosedSortedPositions([...sorted])};
            }
            else if (direction === 'desc' && activeSort === key) {
                setActiveSort(undefined);
                setDirection(undefined);
                if (open) {setOpenSortedPositions([...openPositions])}
                else {setClosedSortedPositions([...closedPositions])};
            }
            else {
                setActiveSort(key);
                setDirection('asc');
                const sorted = sortByKey(positions, key, 'asc');
                if(open) {setOpenSortedPositions([...sorted])}
                else {setClosedSortedPositions([...sorted])};
            };
        }
        else {
            const positions = filter(open ? openPositions : closedPositions);
            const sorted = sortByKey(positions, activeSort, direction);
            console.log(sorted);
            if (open) {setOpenSortedPositions([...sorted])}
            else {setClosedSortedPositions([...sorted])};
        }
    };

    useEffect(() => {
        console.log('rerendering');
        handleClick(activeSort, true)
    }, [disabledPools])

    const filter = (positions) => {
        if(disabledPools.length) {
            let filtered = []
            for(let i of positions) {
                if(disabledPools.indexOf(i.lbPair.toString()) === -1){
                    filtered.push(i);
                }
            }
            return filtered;
        }
        else return positions;
    }

    const PositionHeader = ({objKey, title, tooltip}) => {
        return (
            <th 
                class='positionHeader' 
                onClick={() => {handleClick(objKey)}}
            >
                <div className="inner">
                    <div>
                        {title} 
                        {tooltip ? <ToolTip tooltip={tooltip}/> : <></>}
                    </div>
                    <Indicator objKey={objKey}/>
                </div>
            </th>
        )
    }

    const Indicator = ({objKey}) => {
        return (
            <div>
                {
                activeSort === objKey
                    ? <img src={`./${direction}.svg`}/>
                    : <img src={`defaultSort.svg`}/>
                }
            </div>
        )
    }
    return (
        <tr>
            {/* <th classname='positionHeader' onClick={() => {handleClick('lbPair')}}>Pool <Indicator /></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('position')}}>Position Address</th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('open_time')}}>Time</th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('lowerBinPrice')}}>Range</th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('usdHodl')}}>Deposits ($)<ToolTip tooltip={tooltips.usdHodl}/></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('tokenHodl')}}>Token HODL ($)<ToolTip tooltip={tooltips.tokenHodl}/></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('lastValue')}}>DLMM ($)<ToolTip tooltip={tooltips.strategy}/></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('fees')}}>Fees ($) <ToolTip tooltip={tooltips.fees}/></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('PnL')}}>PnL ($) <ToolTip tooltip={tooltips.pnl}/></th> */}
            {/* <th classname='positionHeader' onClick={() => {handleClick('points')}}>Estimated MET Points <ToolTip tooltip={tooltips.points}/></th> */}
            <PositionHeader  objKey={'lbPair'}        title={'Pool'}                />
            <PositionHeader  objKey={'position'}      title={'Position Address'}     />
            <PositionHeader  objKey={'open_time'}     title={'Time'}                 />
            <PositionHeader  objKey={'lowerBinPrice'} title={'Range'}                />
            <PositionHeader  objKey={'usdHodl'}       title={'Deposits ($)'}          tooltip={tooltips.usdHodl}   />
            <PositionHeader  objKey={'tokenHodl'}     title={'Token HODL ($)'}        tooltip={tooltips.tokenHodl} />
            <PositionHeader  objKey={'lastValue'}     title={'DLMM ($)'}              tooltip={tooltips.strategy}  />
            <PositionHeader  objKey={'fees'}          title={'Fees ($)'}              tooltip={tooltips.fees}      />
            <PositionHeader  objKey={'PnL'}           title={'PnL ($)'}               tooltip={tooltips.pnl}       />
            <PositionHeader  objKey={'points'}        title={'Estimated MET Points'}  tooltip={tooltips.points}    />
        </tr>
    )
}

const sortByKey = (positions, key, dir) => {
    if(!positions) {return positions} 
    if(!positions.length || positions.length === 1) {return positions};
    return positions.sort(dynamicSort(`${dir==='desc' ? '' : '-'}${key}`))
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}