import { useEffect } from "react";
import { formatBigNum } from "../sdk/utils/position_math"

export const Loader = ({info}) => {
    const {step, maxSteps, text} = info;
    useEffect(() => {
        const max = 300;
        let progress = (max/maxSteps)*(step-1);
        const element = document.getElementById('progress');
        if(progress > 15) {
            element.style.width = progress+'px';
        }
    }, [info])


    return (
        <div className="loader">
            <img className="flipped"src="./loader.gif"/>
            <div className="progressArea">
                <h1 id="loaderh1">{text}</h1>
                <div className="progressBar" id="progressBar">
                    <div id="progress"></div>
                </div>
            </div>
            <img src="./loader.gif"/>
        </div>
    )
}