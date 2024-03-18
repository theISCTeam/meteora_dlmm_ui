export const GreenRedTd = (
    {
        value, 
        withPerc=false, 
        base, 
        prefix='$',
        postfix=''
    }) => {

    if(!value) {
        return (
            <td className="redTd">#ERROR</td>
        )
    }

    if(!withPerc) {
        return (
            value >= 0 
            ?
            <td className="greenTd">{prefix}{value.toLocaleString()}{postfix}</td>
            :
            <td className="redTd">{prefix}{value.toLocaleString()}{postfix}</td>
        )
    }
    else {
        return (
            value >= 0 
            ?
            <td className="greenTd">{prefix}{value.toLocaleString()}{postfix} ({((value/base)*100).toLocaleString()}%)</td>
            :
            <td className="redTd">{prefix}{value.toLocaleString()}{postfix} ({((value/base)*100).toLocaleString()}%)</td>
        )
    }

}