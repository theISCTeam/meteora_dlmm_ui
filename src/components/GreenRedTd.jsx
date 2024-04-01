
  /**
   * A table cell that takes a numerical value and displays it in either red or green with customization options.
   * @param  {Number} value  Numerical value to display.
   * @param  {Boolean} withPerc Determines wether or not to display a percentage value (requires base)
   * @param  {Number} base The base value for percentages.
   * @param  {String} prefix A character or string to display before the value (default = $)
   * @param  {String} postfix A character or string to display after the value (default = '')
   * @param  {Boolean} important If true, adds a important class to the cell
   * @return A properly formatted (td) table cell 
   */
export const GreenRedTd = (
    {
        value, 
        withPerc=false, 
        base, 
        prefix='$',
        postfix='',
        important=false
    }) => {
    let greenClasses = 'greenTd'
    let redClasses = 'redTd'
     
    if(Number(value) === 0 && Number(base) === 0){
        return (
            <td className={redClasses}>No Data!</td>
        )
    }
    if(withPerc && !base) {
        return (
            <td className={"redTd"}>#ERROR</td>
        )
    }

    if (important === true) { 
        greenClasses += ' important'
        redClasses += ' important'
    }

    if(!value) {
        return (
            <td className={"redTd"}>#ERROR</td>
        )
    }

    if(!withPerc) {
        return (
            value >= 0 
            ?
            <td className={greenClasses}>{prefix}{value.toLocaleString()}{postfix}</td>
            :
            <td className={redClasses}>{prefix}{value.toLocaleString()}{postfix}</td>
        )
    }
    else {
        return (
            value >= 0 
            ?
            <td className={greenClasses}>{prefix}{value.toLocaleString()}{postfix} <br/> ({((value/base)*100).toLocaleString()}%)</td>
            :
            <td className={redClasses}>{prefix}{value.toLocaleString()}{postfix} <br/> ({((value/base)*100).toLocaleString()}%)</td>
        )
    };
};