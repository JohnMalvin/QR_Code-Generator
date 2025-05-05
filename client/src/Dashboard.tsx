import "./CSS/Dashboard.css"
import icon from "./assets/react.svg"
import barcode from "./assets/Barcode.jpg"
import ColorPicker from "./ColorPicker";
function Dashboard() {
    return (
        <>
            <div className="dashboard-dashboard">
                <div className="dashboard-left">
                    <div className="url-component form-component">
                        <label className="form-label">URL :</label>
                        <input id="url-input" type="text" autoComplete="off"></input>
                    </div>
                    <div className="form-hr"></div>
                    <div className="background-component form-component">
                        <label className="form-label">Background Color :</label>
                            <ColorPicker />
                            <ColorPicker />
                    </div>
                </div>
                <div className="dashboard-right">
                    <button id="generate-button" className="gradient-button">
                        <p>GENERATE</p>
                        <img src={icon}></img>
                    </button>
                    <button id="download-button" className="gradient-button">
                        <p>DOWNLOAD</p>
                        <img src={icon}></img>
                    </button>
                    <img className="barcode" src={barcode}></img>
                </div>
            </div>
        </>
    )
}

export default Dashboard;