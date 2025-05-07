import "./CSS/Dashboard.css"
// import icon from "./assets/react.svg"
import GENERATE from "./assets/GENERATE.png"
import UPLOAD from "./assets/UPLOAD.png"
import DOWNLOAD from "./assets/DOWNLOAD.png"
import barcodeFill from "./assets/BarcodeFill.png"
import barcodeLogo from "./assets/BarcodeLogo.jpg"
import ColorPicker from "./ColorPicker";
function Dashboard() {
    const uploadLogo = () => {
        const realUpload = document.querySelector("#real-upload") as HTMLInputElement;
        if (!realUpload) return;
        realUpload.click();
        realUpload.addEventListener("change", () => {
        const file = realUpload.files ? realUpload.files[0] : null;
        if (file) {
            alert(`Selected file: ${file.name}`);
        }
        })
    }

    const showLogoUI = () => {
        const logoCanvas = document.querySelector(".preview-logo") as HTMLDivElement;
        const button = document.querySelector("#upload-logo") as HTMLDivElement;
        const logoHR = document.querySelector(".logo-hr") as HTMLDivElement;
        const label = document.querySelector(".logo-label-text") as HTMLDivElement;
        if (!logoCanvas || !button || !logoHR || !label) return;
        logoCanvas.style.display = "block";
        button.style.display = "flex";
        logoHR.style.display = "block";
        label.style.opacity = "1";
    }
    const hideLogoUI = () => {
        const logoCanvas = document.querySelector(".preview-logo") as HTMLDivElement;
        const button = document.querySelector("#upload-logo") as HTMLDivElement;
        const logoHR = document.querySelector(".logo-hr") as HTMLDivElement;
        const label = document.querySelector(".logo-label-text") as HTMLDivElement;
        if (!logoCanvas || !button || !logoHR || !label) return;
        logoCanvas.style.display = "none";
        button.style.display = "none";
        logoHR.style.display = "none";
        label.style.opacity = "0.4";
    }
    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            showLogoUI();
        } else {
            hideLogoUI();
        }
        const overflow = document.querySelector(".dashboard-left") as HTMLDivElement;
        if (!overflow) return;
        overflow.scrollTo({ top: overflow.scrollHeight, behavior: 'smooth' });
    }
    return (
        <div className="dashboard-wrapper" id="dashboard">
            <div className="dashboard-dashboard">
                <div className="dashboard-left">
                    <div className="url-component form-component">
                        <label className="form-label">URL :</label>
                        <input id="url-input" type="text" autoComplete="off" placeholder="htpps://www.example.com"></input>
                    </div>
                    <div className="form-hr"></div>
                    <div className="background-component form-component">
                        <label className="form-label">Background Color :</label>
                        <ColorPicker />
                    </div>
                    <div className="form-hr"></div>
                    <div className="fill-component form-component">
                        <label className="form-label">Fill Color :</label>
                        <ColorPicker />
                    </div>
                    <div className="url-component form-component">
                        <div className="form-label logo-label">
                            <div className="checkbox">
                                <input type="checkbox" id="checkbox" onChange={handleCheckbox}></input>
                            </div>
                            <div className="logo-label-text">With logo</div>

                        </div>
                        <div className="form-hr logo-hr"></div>
                        <div className="preview-logo">
                            <img src={barcodeLogo}></img>
                        </div>
                        <input type="file" id="real-upload"></input>
                        <button id="upload-logo" className="gradient-button" onClick={uploadLogo}>
                            <p>UPLOAD LOGO</p>
                            <img src={UPLOAD}></img>
                        </button>
                            
                    </div>
                </div>
                <div className="dashboard-right">
                    <div className="button-wrapper">
                        <button id="generate-button" className="gradient-button">
                            <p>GENERATE</p>
                            <img src={GENERATE}></img>
                        </button>
                        <button id="download-button" className="gradient-button">
                            <p>DOWNLOAD</p>
                            <img src={DOWNLOAD}></img>
                        </button>
                    </div>
                    <div className="barcode-background">
                        <img className="barcode-fill" src={barcodeFill}></img>
                        <div className="barcode-cut-out">
                            <img className="barcode-logo" src={barcodeLogo}></img>
                        </div>
                    </div>
                    <div className="preview">
                        <div className="preview-hr"></div>
                        PREVIEW
                        <div className="preview-hr"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;