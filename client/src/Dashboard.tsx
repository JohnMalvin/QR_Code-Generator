import "./CSS/Dashboard.css"
import GENERATE from "./assets/GENERATE.png"
import UPLOAD from "./assets/UPLOAD.png"
import DOWNLOAD from "./assets/DOWNLOAD.png"
import barcodeLogo from "./assets/BarcodeLogo.png"
import ColorPicker from "./ColorPicker";
import { useEffect, useState } from "react"
import { hexToRgb, isValidUrl } from "./CLIENT_HELPER";
import axios from "axios";

function Dashboard() {
    const API = "API";
    const APIKEY = "YOUR_API_KEY_HERE";
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const [backgroundColor, setBackgroundColor] = useState("#fff");
    const [fillColor, setFillColor] = useState("#000");
    const [includeLogo, setIncludeLogo] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(barcodeLogo as unknown as File);
    const [retrievedURL, setRetrievedURL] = useState("#");
    const [isCompleted, setIsCompleted] = useState<boolean>(false)
    useEffect(() => {
        if (isCompleted) {
            const barcodeFill = document.querySelector(".barcode-fill") as HTMLDivElement; 
            const cutOut = document.querySelector(".barcode-cut-out") as HTMLDivElement;
            const barcodeLogo = document.querySelector(".barcode-logo") as HTMLImageElement;
            const barcodeElement = document.querySelector(".barcode-retrieve") as HTMLImageElement;
            if (!barcodeFill || !cutOut || !barcodeElement || !barcodeLogo) return;
            barcodeFill.style.display = "flex";
            barcodeLogo.style.display = "block";
            cutOut.style.display = "flex";
            barcodeElement.style.display = "none";
            setIsCompleted(false);
            if (includeLogo) {
                showLogoUI();
                const check = document.querySelector("#checkbox") as HTMLInputElement;
                if (!check) return;
                check.checked = true;
                const generateButton = document.querySelector("#generate-button") as HTMLButtonElement;
                const downloadButton = document.querySelector("#download-button") as HTMLButtonElement;
                if (!generateButton || !downloadButton) return;

                downloadButton.style.display = "none";
                generateButton.style.display = "flex";
            }
        }
        
        const fillElement = document.querySelector(".barcode-svg") as HTMLOrSVGScriptElement; // Select the SVG itself
        if (!fillElement) return
        fillElement.style.fill = fillColor;
    }, [fillColor]);
    
    useEffect(() => {
        if (isCompleted) {
            const barcodeFill = document.querySelector(".barcode-fill") as HTMLDivElement; 
            const cutOut = document.querySelector(".barcode-cut-out") as HTMLDivElement;
            const barcodeLogo = document.querySelector(".barcode-logo") as HTMLImageElement;
            const barcodeElement = document.querySelector(".barcode-retrieve") as HTMLImageElement;
            if (!barcodeFill || !cutOut || !barcodeElement || !barcodeLogo) return;
            barcodeFill.style.display = "flex";
            barcodeLogo.style.display = "block";
            cutOut.style.display = "flex";
            barcodeElement.style.display = "none";
            setIsCompleted(false);
            if (includeLogo) {
                showLogoUI();
                const check = document.querySelector("#checkbox") as HTMLInputElement;
                if (!check) return;
                check.checked = true;
                const generateButton = document.querySelector("#generate-button") as HTMLButtonElement;
                const downloadButton = document.querySelector("#download-button") as HTMLButtonElement;
                if (!generateButton || !downloadButton) return;

                downloadButton.style.display = "none";
                generateButton.style.display = "flex";
            }
        }
        const backElement = document.querySelector(".barcode-background") as HTMLDivElement; // Select the SVG itself
        const backLogoElement = document.querySelector(".barcode-cut-out") as HTMLDivElement; // Select the SVG itself
        if (!backElement || !backLogoElement) return;
        backElement.style.backgroundColor = backgroundColor;
        backLogoElement.style.backgroundColor = backgroundColor;
    }, [backgroundColor]);

    const submitData = () => {
        const fileInput = document.querySelector("#real-upload") as HTMLInputElement;
        if (!fileInput) return;
        if (fileInput.files && fileInput.files.length > 0) {
            setIncludeLogo(true);
        } else {
            setIncludeLogo(false);
            hideLogoUI();
            const check = document.querySelector("#checkbox") as HTMLInputElement;
            if (!check) return;
            check.checked = false;
        }


        const urlInput = document.querySelector("#url-input") as HTMLInputElement;
        if (!urlInput) return;
        const url = urlInput.value;

        if (url === "") {
            alert("Please enter a URL");
            return;
        }

        const isValid = isValidUrl(url);
        if (!isValid) {
            alert("Please enter a valid URL");
            return;
        }

        const formData = new FormData();
        formData.append("URL", url);
        formData.append("backgroundColor", JSON.stringify(hexToRgb(backgroundColor)));
        formData.append("fillColor", JSON.stringify(hexToRgb(fillColor)));

        // Only append logo if it's included
        if (includeLogo && logoFile) {
            const logoFileBlob = new Blob([logoFile], { type: 'image/png' });
            formData.append("logoFile", logoFileBlob, 'logoFile.png');
        }

        sendData(formData);
    }

    const sendData = async (formData: FormData) => {
        alert("Generating QR code...");
        try {
            const response = await axios.post(`${SERVER_URL}/generate/QRCode/${API}/${APIKEY}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const imageUrl = response.data.qrCodeUrl.replace(/\\+/g, '/');

            const barcodeFill = document.querySelector(".barcode-fill") as HTMLDivElement; 
            const cutOut = document.querySelector(".barcode-cut-out") as HTMLDivElement;
            const barcodeLogo = document.querySelector(".barcode-logo") as HTMLImageElement;
            const barcodeElement = document.querySelector(".barcode-retrieve") as HTMLImageElement;
            if (!barcodeFill || !cutOut || !barcodeElement || !barcodeLogo) return;
            barcodeFill.style.display = "none";
            barcodeLogo.style.display = "none";
            cutOut.style.display = "none";
            setRetrievedURL(imageUrl);
            barcodeElement.style.display = "block";

            const generateButton = document.querySelector("#generate-button") as HTMLButtonElement;
            const downloadButton = document.querySelector("#download-button") as HTMLButtonElement;
            if (!generateButton || !downloadButton) return;

            downloadButton.style.display = "flex";
            generateButton.style.display = "none";

            setIsCompleted(true);

        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    const handleBackgroundColorChange = (newColor: string) => {
        setBackgroundColor(newColor);
    };

    const handleFillColorChange = (newColor: string) => {
        setFillColor(newColor);
    };
    const uploadLogo = () => {
    const realUpload = document.querySelector("#real-upload") as HTMLInputElement;
    if (realUpload) {
        realUpload.click();
    }
    };

    const showLogoUI = () => {
        const logoCanvas = document.querySelector(".preview-logo") as HTMLDivElement;
        const button = document.querySelector("#upload-logo") as HTMLDivElement;
        const logoHR = document.querySelector(".logo-hr") as HTMLDivElement;
        const label = document.querySelector(".logo-label-text") as HTMLDivElement;
        const cutOut = document.querySelector(".barcode-cut-out") as HTMLDivElement;
        if (!logoCanvas || !button || !logoHR || !label || !cutOut) return;
        logoCanvas.style.display = "block";
        button.style.display = "flex";
        logoHR.style.display = "block";
        label.style.opacity = "1";
        cutOut.style.display = "block";
    }
    const hideLogoUI = () => {
        const logoCanvas = document.querySelector(".preview-logo") as HTMLDivElement;
        const button = document.querySelector("#upload-logo") as HTMLDivElement;
        const logoHR = document.querySelector(".logo-hr") as HTMLDivElement;
        const label = document.querySelector(".logo-label-text") as HTMLDivElement;
        const cutOut = document.querySelector(".barcode-cut-out") as HTMLDivElement;
        if (!logoCanvas || !button || !logoHR || !label || !cutOut) return;
        logoCanvas.style.display = "none";
        button.style.display = "none";
        logoHR.style.display = "none";
        label.style.opacity = "0.4";
        cutOut.style.display = "none";
    }
    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            showLogoUI();
            setIncludeLogo(true);
        } else {
            hideLogoUI();
            setIncludeLogo(false);
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
                        <ColorPicker
                           color={backgroundColor} onColorChange={handleBackgroundColorChange}
                        />
                    </div>
                    <div className="form-hr"></div>
                    <div className="fill-component form-component">
                        <label className="form-label">Fill Color :</label>
                        <ColorPicker
                            color={fillColor} onColorChange={handleFillColorChange}
                        />
                    </div>
                    <div className="url-component form-component">
                        <div className="form-label logo-label">
                            <div className="checkbox">
                                <input type="checkbox" id="checkbox" onChange={handleCheckbox} defaultChecked={false}></input>
                            </div>
                            <div className="logo-label-text">With logo</div>

                        </div>
                        <div className="form-hr logo-hr"></div>
                        <div className="preview-logo">
                            <img className="logo-here" src={barcodeLogo}></img>
                        </div>
                        <input
                            type="file"
                            id="real-upload"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setLogoFile(file);
                                    const logoImage = document.querySelector(".logo-here") as HTMLImageElement;
                                    const logoImagePreview = document.querySelector(".barcode-logo") as HTMLImageElement;
                                    if (!logoImage || !logoImagePreview) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        if (logoImage && event.target) {
                                            const result = event.target.result as string;
                                            logoImage.src = result;
                                            logoImage.style.display = "block";
                                            logoImagePreview.src = result;
                                            logoImagePreview.style.display = "block";
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <button id="upload-logo" className="gradient-button" onClick={uploadLogo}>
                            <p>UPLOAD LOGO</p>
                            <img src={UPLOAD}></img>
                        </button>
                            
                    </div>
                </div>
                <div className="dashboard-right">
                    <div className="button-wrapper">
                        <button onClick={submitData} id="generate-button" className="gradient-button">
                            <p>GENERATE</p>
                            <img src={GENERATE}></img>
                        </button>
                        <button id="download-button" className="gradient-button"
                            onClick={ async () => {
                                const response = await fetch(retrievedURL);
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `QR-Gen[QRCODE].png`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                location.reload();
                            }}
                        >
                            <p>DOWNLOAD</p>
                            <img src={DOWNLOAD}></img>
                        </button>
                    </div>
                    <div className="barcode-background">
                        <img className="barcode-retrieve" src={retrievedURL}></img>
                        {/* <img className="barcode-fill" src={barcodeFill}></img> */}
                        <div className="barcode-fill">
                            <svg className="barcode-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 456.1 456" xmlSpace="preserve">

                                <defs>
                                </defs>
                                <g id="BARCODE_1_">
                                    <path d="M21.6,260.7c0-21.8,0-43.5,0-65.3l-0.1,0.1c7.1,0,14.1,0,21.6,0c0-7.3,0-14.3,0-21.5c14.7,0,28.9,0,43.7,0
                                        c0,7.2,0,14.3,0,21.5c-7.2,0-14.3,0-21.5,0c0,7.5,0,14.4,0,21.4c7.3,0,14.3,0,21.4,0c0-7.4,0-14.4,0-21.5c7.1,0,14.1,0,21.7,0
                                        c0-7.2,0-14.2,0-21.6c22.1,0,43.8,0,65.4,0l-0.1-0.1c0,7.2,0,14.4,0,21.9c15,0,29.3,0,43.6,0l-0.1-0.1c0.1,14.6,0.2,29.2,0.3,43.7
                                        c-7.3,0-14.7-0.1-22-0.1c0-7.2,0-14.3,0-21.5c-7.5,0-14.4,0-21.4,0c0,7.3,0,14.3,0,21.4c7.4,0,14.4,0,21.5,0c0,14.4,0,28.8,0,43.6
                                        c7.5,0,14.5,0,21.6,0c0,7.2,0,14.3,0,21.8c-7.5,0-14.4,0-21.4,0c0,7.3,0,14.3,0,21.2c14.5,0,28.7,0,42.8,0c0-14.6,0-28.8,0-42.9
                                        c-7.4,0-14.5,0-21.6,0c0.1-14.5,0.2-29.1,0.3-43.6c7.1,0,14.3,0,21.8,0c0-7.7,0-14.7,0-21.8c7.5,0,14.5,0,21.6,0l-0.1-0.1
                                        c0,7.1,0,14.1,0,21.7c7.3,0,14.3,0,21.6,0c0,22,0,43.4,0,65.2c-7.1,0-14,0-21.2,0c0,7.3,0,14.3,0,21.8c14.2,0,28.5,0,42.9,0
                                        c0,7.4,0,14.2,0,21.6c-6.9,0-13.9,0-21.4,0c0,22.1,0,43.8,0,65.5c-7.2,0-14.3,0-21.5,0c0,7.5,0,14.4,0,21.4c7.3,0,14.3,0,21.4,0
                                        c0-7.4,0-14.4,0-21.5c14.3,0,28.6,0,43.6,0c0-7.4,0-14.5,0-21.7l-0.1,0.1c7.1,0,14.1,0,21.6,0c0,7.1,0,14.1,0,21.7
                                        c7.6,0,14.8,0,22,0l-0.1-0.1c0,7.1,0,14.1,0,21.7c14.6,0,28.8,0,43.3,0c0,7.4,0,14.2,0,21.5c-21.4,0-42.9,0-64.8,0
                                        c0-6.9,0-13.9,0-21.1c-7.4,0-14.2,0-21.6,0c0,6.8,0,13.8,0,21.2c-29.2,0-57.9,0-87.1,0c0-7,0-14,0-21.2c-7.4,0-14.3,0-21.6,0
                                        c0,6.9,0,13.9,0,21.2c-14.7,0-29,0-43.4,0c0-7,0-13.9,0-21.2c6.9,0,13.9,0,21.2,0c0-7.5,0-14.5,0-21.8c-7,0-13.9,0-21.1,0
                                        c0-14.6,0-28.8,0-43.7c7.1,0,14.3,0,21.4,0c0,7.2,0,14.3,0,21.5c22,0,43.4,0,64.8,0c0-7.3,0-14.3,0-21.4c-21.9,0-43.4,0-65,0
                                        c0-7.1,0-14.1,0-21.7c-7.2,0-14.2,0-21.5,0c0-21.9,0-43.2,0-65.1c-14.6,0-28.8,0-43.6,0c0-7.7,0-14.8,0-22l-0.1,0.1
                                        c7.2,0,14.3,0,21.5,0c0-7.6,0-14.6,0-21.9c-7.4,0-14.4,0-21.5,0c0,0,0.1,0.1,0.1,0.1c0-7.3-0.1-14.6-0.1-21.9c7.2,0,14.3,0,21.5,0
                                        c0-7.5,0-14.4,0-21.4c-7.3,0-14.3,0-21.4,0c0,7.4,0,14.4,0,21.5c-7.2,0-14.4,0-21.9,0c0,7.6,0,14.7,0,21.7l0.1-0.1
                                        c-21.7,0-43.3,0-65.3,0c0,7.7,0,14.8,0,21.9l0.1-0.1c-7.3,0-14.6,0-21.9,0L21.6,260.7z"/>
                                    <path d="M0.1,0c50.7,0,101,0,151.6,0c0,50.5,0,100.9,0,151.6c-50.4,0-100.8,0-151.6,0C0.1,101.3,0.1,50.8,0.1,0z M21.9,21.7
                                        c0,36.3,0,72.3,0,108.1c36.3,0,72.2,0,108.1,0c0-36.2,0-72.1,0-108.1C93.9,21.7,58,21.7,21.9,21.7z"/>
                                    <path d="M0,456c0-50.7,0-101,0-151.6c50.6,0,100.9,0,151.6,0c0,50.4,0,100.8,0,151.6C101.3,456,50.8,456,0,456z M129.9,434.4
                                        c0-36.3,0-72.3,0-108.1c-36.3,0-72.3,0-108.1,0c0,36.2,0,72.1,0,108.1C57.9,434.4,93.7,434.4,129.9,434.4z"/>
                                    <path d="M304.5,0c50.7,0,101,0,151.6,0c0,50.5,0,100.9,0,151.6c-50.4,0-100.8,0-151.6,0C304.5,101.3,304.5,50.8,304.5,0z
                                        M434.4,21.9c-36.3,0-72.3,0-108.1,0c0,36.3,0,72.3,0,108.1c36.2,0,72.1,0,108.1,0C434.4,93.9,434.4,58,434.4,21.9z"/>
                                    <path d="M195.5,130.3c0-7.1,0-14.1,0-21.7c7.2,0,14.2,0,21.4,0c0-7.5,0-14.4,0-21.7c-14.3,0-28.4,0-42.8,0c0-7.3,0-14.3,0-22
                                        c21.5,0,43.1,0,64.7,0c0,0-0.1-0.1-0.1-0.1c0,7.1,0,14.2,0,21.7c7.4,0,14.4,0,21.9,0c0,7.5,0,14.5,0,21.8c7.4,0,14.3,0,21.5,0
                                        c0,36.3,0,72.3,0,108.8c-7.1,0-14.3,0-21.5,0c0,0,0.1,0.1,0.1,0.1c0-7.2,0-14.4,0-21.9c-15,0-29.3,0-43.6,0l0.1,0.1
                                        c0-7.2,0-14.3,0-22c7.5,0,14.5,0,21.6,0c0-7.5,0-14.6,0-21.6c7.2,0,14.3,0,21.5,0c0-7.5,0-14.4,0-21.4c-7.3,0-14.3,0-21.4,0
                                        c0,7.4,0,14.4,0,21.5c-7.2,0-14.3,0-22,0c0-7.6,0-14.6,0-21.9c-7.5,0-14.6,0-21.6,0L195.5,130.3z"/>
                                    <path d="M369.3,282.4c0,7.1,0,14.1,0,21.7c21.8,0,43.3,0,65,0c0,29.1,0,57.7,0,87.1c-7.1,0-14.2,0-21.4,0c0,0,0.1,0.1,0.1,0.1
                                        c0-7.1,0-14.2,0-21.7c-14.6,0-28.9,0-43.6,0c0-14.7,0-29,0-43.4c-7.4,0-14.3,0-21.6,0c0,6.9,0,13.9,0,21.2c-7.5,0-14.5,0-21.7,0
                                        c0-14.2,0-28.3,0-42.9c6.9,0,13.9,0,21.6,0c0-7.7,0-14.8,0-22l-0.1,0.1c7.3,0,14.6,0,21.8,0L369.3,282.4z"/>
                                    <path d="M369.4,282.5c0-21.6,0-43.1,0-65.4c-7.5,0-14.7,0-21.8,0l0.1,0.1c0-7.1,0-14.1,0-21.7c7.2,0,14.2,0,21.5,0
                                        c0-7.4,0-14.3,0-21.5c7.3,0,14.3,0,21.8,0c0,6.9,0,13.9,0,21.1c7.4,0,14.3,0,21.6,0c0-6.9,0-13.9,0-21.2c14.7,0,29,0,43.4,0
                                        c0,7,0,13.9,0,21.2c-6.9,0-13.9,0-21.2,0c0,7.5,0,14.5,0,21.8c7,0,13.8,0,21.1,0c0,14.6,0,28.8,0,43.6c-7.1,0-14.3,0-21.4,0
                                        l0.1,0.1c0-7.1,0-14.1,0-21.7c-7.3,0-14.3,0-21.6,0c0-7.4,0-14.2,0-21.5c-7.3,0-14.3,0-21.7,0c0,21.3,0,42.8,0,64.8
                                        c-7.6,0-14.8,0-22,0C369.3,282.4,369.4,282.5,369.4,282.5z"/>
                                    <path d="M238.7,43.5c7.1,0,14.2,0,21.7,0c0-14.6,0-28.9,0-43.4c7.5,0,14.5,0,21.7,0c0,21.5,0,43,0,64.7c-14.6,0-29,0-43.5,0
                                        c0,0,0.1,0.1,0.1,0.1c0-7.2,0-14.4,0-21.5C238.8,43.4,238.7,43.5,238.7,43.5z"/>
                                    <path d="M217.2,21.5c-7.1,0-14.1,0-21.7,0c0,7.3,0,14.3,0,21.6c-7.4,0-14.2,0-21.5,0c0-14.1,0-28.3,0-42.9c14.1,0,28.3,0,43,0
                                        c0,7.1,0,14.3,0,21.5L217.2,21.5z"/>
                                    <path d="M108.4,260.6c0,7.1,0,14.1,0,21.5c-21.7,0-43.1,0-65.1,0c0-7.2,0-14.3,0-21.5c0,0-0.1,0.1-0.1,0.1c21.8,0,43.6,0,65.3,0
                                        L108.4,260.6z"/>
                                    <path d="M173.8,173.8c0-14.3,0-28.6,0-43.5c7.4,0,14.6,0,21.7,0c0,0-0.1-0.1-0.1-0.1c0,14.4,0,28.8,0,43.5c-7.6,0-14.7,0-21.7,0
                                        L173.8,173.8z"/>
                                    <path d="M347.7,282.4c-14.3,0-28.6,0-43.2,0c0-7.1,0-14.1,0-21.4c14.1,0,28.4,0,43.1,0c0,7.2,0,14.3,0,21.5
                                        C347.6,282.5,347.7,282.4,347.7,282.4z"/>
                                    <path d="M369.4,412.9c0-7.1,0-14.1,0-21.6c14.7,0,29.2,0,43.7,0c0,0-0.1-0.1-0.1-0.1c0,7,0,14.1,0,21.6c-14.9,0-29.3,0-43.7,0
                                        C369.3,412.8,369.4,412.9,369.4,412.9z"/>
                                    <path d="M217.1,21.6c7,0,14.1,0,21.6,0c0,7.4,0,14.7,0,21.9c0,0,0.1-0.1,0.1-0.1c-7,0-14.1,0-21.6,0c0-7.6,0-14.8,0-21.9
                                        C217.2,21.5,217.1,21.6,217.1,21.6z"/>
                                    <path d="M21.6,195.4c-7.1,0-14.1,0-21.5,0c0-7.1,0-14.1,0-21.4c6.9,0,13.9,0,21.4,0c0,7.2,0,14.3,0,21.5
                                        C21.5,195.5,21.6,195.4,21.6,195.4z"/>
                                    <path d="M325.5,195.3c-7.1,0-14,0-21.1,0c0-7.1,0-14.1,0-21.3c7,0,13.9,0,21.1,0C325.5,180.9,325.5,187.9,325.5,195.3z"/>
                                    <path d="M347.6,217.1c0,7.1,0,14.1,0,21.5c-7.1,0-14.1,0-21.4,0c0-6.9,0-13.9,0-21.4c7.2,0,14.3,0,21.5,0
                                        C347.7,217.2,347.6,217.1,347.6,217.1z"/>
                                    <path d="M130.3,260.6c-7.3,0-14.6,0-21.9,0c0,0,0.1,0.1,0.1,0.1c0-7.3,0-14.6,0-21.9l-0.1,0.1c7.3,0,14.6,0,21.9,0l-0.1-0.1
                                        c0,7.3,0,14.6,0,21.9L130.3,260.6z"/>
                                    <path d="M21.5,260.6c0,7.1,0,14.1,0,21.5c-7.1,0-14.1,0-21.4,0c0-6.9,0-13.9,0-21.4c7.2,0,14.3,0,21.5,0
                                        C21.6,260.7,21.5,260.6,21.5,260.6z"/>
                                    <path d="M434.5,260.6c0,7.1,0,14.1,0,21.5c-7.1,0-14.1,0-21.4,0c0-6.9,0-13.9,0-21.4c7.2,0,14.3,0,21.5,0
                                        C434.7,260.7,434.5,260.6,434.5,260.6z"/>
                                    <path d="M434.8,413c7.2,0,14.1,0,21.2,0c0,7.1,0,14.1,0,21.3c-7,0-14,0-21.2,0C434.8,427.3,434.8,420.4,434.8,413z"/>
                                    <path d="M326,391.1c-7.1,0-14.1,0-21.5,0c0-7.1,0-14.1,0-21.4c6.9,0,13.9,0,21.4,0c0,7.2,0,14.3,0,21.5
                                        C325.8,391.2,326,391.1,326,391.1z"/>
                                    <path d="M108.3,43.6c0,21.7,0,43.1,0,64.7c-21.6,0-42.9,0-64.7,0c0-21.4,0-42.9,0-64.7C65,43.6,86.5,43.6,108.3,43.6z"/>
                                    <path d="M43.6,347.8c21.7,0,43,0,64.7,0c0,21.6,0,42.9,0,64.7c-21.4,0-42.9,0-64.7,0C43.6,391.1,43.6,369.7,43.6,347.8z"/>
                                    <path d="M347.9,43.5c21.7,0,43,0,64.7,0c0,21.6,0,42.9,0,64.7c-21.4,0-42.9,0-64.7,0C347.9,86.8,347.9,65.3,347.9,43.5z"/>
                                </g>
                            </svg>
                        </div>
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