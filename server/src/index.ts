import express, {Request, Response} from 'express';
import { apiValidator, connectDB, handleCreateNewBind, isValidDataToSend, sendDataToPython } from './FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
export default app;
interface DataToSend {
  URL: string;
  backgroundColor: string;
  fillColor: string;
  logoURL?: string;
}

app.post("/generate/QRCode/:API/:APIKEY", async (req: Request, res: Response): Promise<void> => {
  const data = req.body.data;
  const { API, APIKEY } = req.params;

  if (!data || !API || !APIKEY) {
    res.status(401).json({ error: "Missing data, API, or APIKEY" });
  }

  if (!isValidDataToSend(data)) {
    res.status(400).json({ error: "Invalid data format" });
  }

  const valid = await apiValidator(API, APIKEY);
  if (!valid) {
    res.status(402).json({ error: "API is not registered" });
  }

  try {
    const result = sendDataToPython(data);
    res.status(200).json(result);
  } catch (error) {
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
  sendDataToPython(data);
});
