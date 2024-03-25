import { useEffect } from "react";
import { formatBigNum } from "../sdk/utils/position_math"



export const Loader = ({sigLen}) => {

    useEffect(() => {
        let progress = 20;
        const max = 300;
        if (sigLen !== undefined) {

            const iter = setInterval(() => {
                const element = document.getElementById('progress')
                if (element && sigLen) {
                    const change = (max-progress)/500
                    progress = progress + change
                    element.style.width = progress+'px'
                }
                else {
                    clearInterval(iter)
                }
            }, 100)
        }
    }, [])


    return (
        <div className="loader">
            <img src="./loader.gif"/>
            <div>
                <h1>Loading {formatBigNum(sigLen)} transactions</h1>
                <div className="progressBar" id="progressBar">
                    <div id="progress"></div>
                </div>
            </div>
            <img src="./loader.gif"/>
        </div>
    )
}