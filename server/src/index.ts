import express, { Request, Response } from 'express';
import { apiValidator, connectDB, handleCreateNewBind, isValidDataToSend, sendDataToPython } from './FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';
import cors from "cors";
import upload from './multerConfig';
import path from 'path';
import fs from 'fs';

const app = express();

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

// Route for generating QR code
app.post('/generate/QRCode/:API/:APIKEY', upload.single('logoFile'), async (req: Request, res: Response): Promise<void> => {
  const { API, APIKEY } = req.params;
  const { URL, backgroundColor, fillColor }: DataToSend = req.body;

  // Log incoming data
  console.log("====== Received API details =======");
  console.log("URL:", URL);
  console.log("backgroundColor:", backgroundColor);
  console.log("fillColor:", fillColor);

  // Use a hardcoded logo path (relative to the server directory)
  const hardcodedLogoPath = path.join(__dirname, '../uploads/logoFile-1746679088190.png');
  console.log("Using hardcoded logo path:", hardcodedLogoPath);

  // Validate required fields
  if (!URL || !backgroundColor || !fillColor || !API || !APIKEY) {
    res.status(401).json({ error: "Missing required fields" });
    return;
  }

  // Skip validating `logoFile` — we’re using the hardcoded logo
  if (!isValidDataToSend({ URL, backgroundColor, fillColor })) {
    res.status(400).json({ error: "Invalid data format" });
    return;
  }

  try {
    const result = await sendDataToPython({
      URL,
      backgroundColor: JSON.parse(backgroundColor),
      fillColor: JSON.parse(fillColor),
      logoFilePath: hardcodedLogoPath, // Use the hardcoded logo file path
    });

    res.status(200).json(result);
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
