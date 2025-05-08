import express, { Request, Response } from 'express';
import { apiValidator, connectDB, handleCreateNewBind, isValidDataToSend, sendDataToPython } from './FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';
import cors from "cors";
import upload from './multerConfig';
import path from 'path';
import fs from 'fs';

const app = express();
app.use('/RESULT', express.static(path.join(__dirname, '..', '..', 'RESULT')));
// CORS setup
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
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
  const uploadedLogoFileName = req.file?.filename;
  if (!uploadedLogoFileName) {
    res.status(400).json({ error: "Logo file not uploaded." });
    return;
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
        qrCodeUrl: `http://localhost:3000${result.resultPath}`,
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
