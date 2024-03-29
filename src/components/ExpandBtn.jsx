import { useEffect, useState } from "react";

export const ExpandBtn = ({item}) => {
    const [visibility, setVisibility] = useState(false);
    useEffect(() => {
        if (visibility) {
            document.getElementById(`events${item.position.toString()}`).style.visibility = 'visible';
        }
        else {
            document.getElementById(`events${item.position.toString()}`).style.visibility = 'collapse';
        };
    }, [visibility]);

    return (
        <button className="expand" onClick={() =>  {setVisibility(!visibility)}}>{`Expand Events (${item.position_adjustments.length})`}</button>
    );
};