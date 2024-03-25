export const getIsoStr = (date) => {
    return `${date.getFullYear()}-${formatTime(date.getMonth())}-${formatTime(date.getDate())}T${formatTime(date.getHours())}:${formatTime(date.getMinutes())}:${formatTime(date.getSeconds())}Z`
}

const formatTime = (num) => {
    if (num < 10) {
        return "0" + num;
    }
    return num
}


export const isInRange = (pos) => {
    if(pos.current_x.toNumber() > 0 && pos.current_y.toNumber() > 0 ) {
        return <span className="greenTd">in range</span>
    }
    return <span className="redTd">out of range</span>
}

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