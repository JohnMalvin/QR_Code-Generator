import express, {Request, Response} from 'express';
import { apiValidator, connectDB, handleCreateNewBind, isValidDataToSend, sendDataToPython } from './FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';
import cors from "cors";
import multer from 'multer';

const app = express();
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
const storage = multer.memoryStorage();
const upload = multer({ storage });
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
export default app;
interface DataToSend {
  URL: string;
  backgroundColor: string;
  fillColor: string;
  logoFile?: Buffer;
}

app.post('/generate/QRCode/:API/:APIKEY', upload.single('logoFile'), async (req, res): Promise<void> => {
  const { API, APIKEY } = req.params;

  const { URL, backgroundColor, fillColor }: DataToSend = req.body; 
  const logoFile: Buffer | undefined = req.file?.buffer;

  console.log("====== Received API details =======");
  console.log("Received API:", API);
  console.log("Received APIKEY:", APIKEY);
  console.log("Received URL:", URL);
  console.log("Received backgroundColor:", backgroundColor);
  console.log("Received fillColor:", fillColor);
  console.log(logoFile ? "Received logoFile" : "No logoFile received");
  console.log("===================================");

  if (!URL || !backgroundColor || !fillColor || !API || !APIKEY) {
    res.status(401).json({ error: "Missing required fields (URL, backgroundColor, fillColor, logoFile, API, or APIKEY)" });
    return;
  }

  if (!isValidDataToSend({ URL, backgroundColor, fillColor, logoFile })) {
    res.status(400).json({ error: "Invalid data format" });
    return;
  }

  try {
    // const valid = await apiValidator(API, APIKEY);
    // if (!valid) {
    //   res.status(402).json({ error: "API is not registered" });
    //   return;
    // }
    const result = await sendDataToPython({ URL, backgroundColor: JSON.parse(backgroundColor), fillColor: JSON.parse(fillColor), logoFile });

    console.log("Sending data to Python...");
    res.status(200).json(result);
  } catch (error) {
    // Handle errors properly
    console.error("Error:", error);
    if (error instanceof createHttpError.HttpError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});


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
  
})

const data = {
    "URL": "https://www.example.com",
    "backgroundColor": [0, 255, 255],
    "fillColor": [0, 255, 0],
    "logoURL": "https://static.vecteezy.com/system/resources/previews/023/654/784/non_2x/golden-logo-template-free-png.png"
}



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // sendDataToPython(data);
});
