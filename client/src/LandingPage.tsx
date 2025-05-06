import "./CSS/LandingPage.css"
import QRGEN from "./assets/QRGEN.svg"
import ARROW from "./assets/ARROW.png"

function LandingPage() {

    return (
        <div className="landing-landing">
            <div className="landing-container">
                <div className="landing-mid-content">
                    <div className="wrapper-mid-content">
                        <div className="welcome">
                            <div className="welcome-hr"></div>
                            <p>welcome to</p>
                            <div className="welcome-hr"></div>
                        </div>
                        <div className="qr-gen">
                            <img src={QRGEN}></img>
                        </div>
                        <div className="welcome">
                            <div className="welcome-hr"></div>
                            <p id="content-text">generate QR-Code instantly with an URL</p>
                            <div className="welcome-hr"></div>
                        </div>
                    </div>
                </div>
                <div className="spacing-bottom">
                    <button
                        id="generate-button"
                        className="gradient-button"
                        onClick={() => {
                            const dashboard = document.getElementById("dashboard");
                            if (!dashboard) return;
                            dashboard.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}>
                        <div>TRYNOW</div>
                        <img src={ARROW}></img>
                    </button>
                </div>
            </div>
        </div>
    )
}
export default LandingPage