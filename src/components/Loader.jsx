import { useEffect } from "react";
import { formatBigNum } from "../sdk/utils/position_math"

export const Loader = ({sigLen}) => {
    useEffect(() => {
        let progress = 20;
        const max = 300;
        if (sigLen !== undefined) {

            const iter = setInterval(() => {
                const element = document.getElementById('progress');
                const h1 = document.getElementById('loaderh1');
                if (element && sigLen) {
                    const change = (max-progress)/500
                    progress = progress + change
                    element.style.width = progress+'px'
                    const processedTxs = sigLen*((progress+change)/max);
                    h1.innerHTML = `Loading ${Math.floor(processedTxs)}/${sigLen > 1000 ? formatBigNum(sigLen) : sigLen} transactions`
                }
                else {
                    clearInterval(iter)
                }
            }, 100)
        }
    }, [])


    return (
        <div className="loader">
            <img className="flipped"src="./loader.gif"/>
            <div className="progressArea">
                <h1 id="loaderh1">Loading {sigLen > 1000 ? formatBigNum(sigLen) : sigLen} transactions</h1>
                <div className="progressBar" id="progressBar">
                    <div id="progress"></div>
                </div>
            </div>
            <img src="./loader.gif"/>
        </div>
    )
}