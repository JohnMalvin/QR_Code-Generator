import express, { Request, Response } from 'express';
import { apiValidator, connectDB, handleCreateNewBind, isValidDataToSend, sendDataToPython } from './src/FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';
import cors from "cors";
import upload from './src/multerConfig';
import path from 'path';
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use('/RESULT', cors(corsOptions), express.static(path.join(__dirname, '..', '..', 'RESULT')));

connectDB();

app.use(express.json());

interface DataToSend {
  URL: string;
  backgroundColor: string;
  fillColor: string;
  logoFile?: Buffer;
}


app.post('/generate/QRCode/:API/:APIKEY', upload.single('logoFile'), async (req: Request, res: Response): Promise<void> => {
  const { API, APIKEY } = req.params;
  const { URL, backgroundColor, fillColor }: DataToSend = req.body;

  // Log incoming data
  console.log("====== Received API details =======");
  console.log("URL:", URL);
  console.log("backgroundColor:", backgroundColor);
  console.log("fillColor:", fillColor);

  // Get the dynamically generated filename from Multer
  let uploadedLogoFileName = "";
  if (req.file?.filename) {
    uploadedLogoFileName = req.file.filename;
  }

  const hardcodedLogoPath = path.join(__dirname, '../uploads', uploadedLogoFileName);
  console.log("Using uploaded logo path:", hardcodedLogoPath);

  // Validate required fields
  if (!URL || !backgroundColor || !fillColor || !API || !APIKEY) {
    res.status(401).json({ error: "Missing required fields" });
    return;
  }

  // Skip validating `logoFile` — we’re using the uploaded logo
  if (!isValidDataToSend({ URL, backgroundColor, fillColor })) {
    res.status(400).json({ error: "Invalid data format" });
    return;
  }

  try {
    const result = await sendDataToPython({
      URL,
      backgroundColor: JSON.parse(backgroundColor),
      fillColor: JSON.parse(fillColor),
      logoFilePath: hardcodedLogoPath, // Use the dynamically generated logo file path
    });

    // Expecting result to have a resultPath
    if (result && result.resultPath) {
      res.status(200).json({
        message: "QR code generated successfully",
        qrCodeUrl: `${process.env.BASE_URL}${result.resultPath}`,
      });
    } else {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof createHttpError.HttpError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});




// Example route for creating a bind (not relevant for QR code but useful for testing other APIs)
app.post("create/bind", (req: Request, res: Response) => {
  try {
    const result = handleCreateNewBind();
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
