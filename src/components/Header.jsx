import { CiMenuBurger } from "react-icons/ci";
import logo from "../assets/hybridemotion-logo.png";

export default function Header({ onMenuToggle }) {
    return (
        <div className='header-container'>
            <div className="header">
                <div className="logo-icon">
                    <img
                        src={logo}
                        alt="HybridEmotion DZ"
                        className="logo-img"
                    />
                </div>

                <div>
                    <div className="header-title">
                        Hybrid<span>Emotion</span> DZ
                    </div>
                    <div className="header-sub">Dialecte franco-algérien</div>
                </div>

                <div
                    type="button"
                    className="notif-btn"
                    onClick={onMenuToggle}
                    aria-label="Ouvrir le menu"
                >
                    <CiMenuBurger />
                </div>
            </div>
        </div>
    );
}