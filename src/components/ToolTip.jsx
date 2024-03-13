export const ToolTip = (params) => {
    const { tooltip } = params;
    
    return (
        <div className="tooltip">
            <p className="tooltip-text">{tooltip}</p>
            <img src="info.png" className="info-icon" alt="hover to learn more"/>
        </div>
    )
}

export const ToolTipLow = (params) => {
    const { tooltip } = params;
    
    return (
        <div className="tooltip">
            <p className="tooltip-text-low">{tooltip}</p>
            <img src="info.png" className="info-icon" alt="hover to learn more"/>
        </div>
    )
}