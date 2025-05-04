import { useState } from "react";
import "./CSS/Header.css";
import ParticlesComponent from "./ParticlesComponent";

function Header() {
  const [home, setHome] = useState<boolean>(true);

  return (
    <>
      <div className="particle-wrapper">
        <ParticlesComponent />
      </div>
      <div className="header-header">
        <div className="header-top">
          <div id="header-dashboard" className="header-navigator">
            <div className="header-text-content-container" onClick={() => setHome(true)}>
              <p className={home ? "identicator-content-active" : "identicator-content"}>
                DASHBOARD
              </p>
            </div>
          </div>
          <div id="header-api" className="header-navigator">
            <div className="header-text-content-container" onClick={() => setHome(false)}>
              <p className={!home ? "identicator-content-active" : "identicator-content"}>
                API
              </p>
            </div>
          </div>
        </div>

        <div className="header-bottom-wrapper">
          <div
            className="header-indicator"
            style={{ transform: home ? "translateX(0%)" : "translateX(100%)" }}
          ></div>
        </div>
      </div>
    </>
      
  );
}

export default Header;
