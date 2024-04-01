export const ToolTip = (params) => {
    const { tooltip } = params;
    return (
        <div className="tooltip">
            <p className="tooltip-text">{tooltip}</p>
            <img src="/meteora_dlmm_ui/info.png" className="info-icon" alt="."/>
        </div>
    )
}

export const ToolTipLow = (params) => {
    const { tooltip } = params;
    return (
        <div className="tooltip">
            <p className="tooltip-text-low">{tooltip}</p>
            <img src="/meteora_dlmm_ui/info.png" className="info-icon" alt="."/>
        </div>
    )
}