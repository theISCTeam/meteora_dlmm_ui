export const Footer = () => {
    return (
        <footer>
            <h2>
                {"Built with <3 by International Stable Currency"}
            </h2>
            <div className="socialIcons">   
                <a target='empty' href="https://www.isc.money/" className="socialIcon"><img className="greyscale" src="/meteora_dlmm_ui/socials/home.svg"/></a>
                <a target='empty' href="https://twitter.com/ISC_money" className="socialIcon"><img  src="/meteora_dlmm_ui/socials/twitter.svg"/></a>
                <a target='empty' href="http://t.me/ISC_money" className="socialIcon"><img  src="/meteora_dlmm_ui/socials/telegram.svg"/></a>
                <a target='empty' href="https://medium.com/@ISC_money" className="socialIcon"><img  src="/meteora_dlmm_ui/socials/medium.svg"/></a>
                <a target='empty' href="https://github.com/theISCTeam" className="socialIcon"><img  src="/meteora_dlmm_ui/socials/github.svg"/></a>
                <a target='empty' href="https://www.youtube.com/watch?v=r27at8U5h0M" className="socialIcon"><img  src="/meteora_dlmm_ui/socials/youtube.svg"/></a>
            </div>
        </footer>
    )
}