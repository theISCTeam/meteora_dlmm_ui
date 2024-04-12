import { useContext, useEffect } from "react"
import { ErrorContext } from "../contexts/Contexts"


export const ErrorSlider = () => {
    const {error, setError} = useContext(ErrorContext);

    useEffect(() => {
        if(error) {
            const el = document.getElementById("errorSlider");
            el.style.opacity = 1;
            el.style.left = '100px';
            setTimeout(() => {
                if(error) {
                    const el = document.getElementById("errorSlider");
                    el.style.opacity = 0;
                    el.style.left = '-400px';
                    setTimeout(() => {
                        setError(undefined)
                    }, 1000)
                }
            }, 60000);
        }
    }, [error])

    const handleClick = () => {
        const el = document.getElementById("errorSlider");
        el.style.opacity = 0;
        el.style.left = '-400px';
        setTimeout(() => {
            setError(undefined)
        }, 1000)
    }

    return (
            <div className="errorSlider" id="errorSlider">
                <button onClick={handleClick}>X</button>
                <p>{error}</p>
                <img src="/meteora_dlmm_ui/icrinaow.gif"/>
            </div>
    )
}
