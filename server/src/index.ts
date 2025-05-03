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
    "backgroundColor": [255, 255, 255],
    "fillColor": [0, 0, 0],
    "logoURL": "https://img.freepik.com/free-psd/camera-outline-logo-design_23-2151263987.jpg?t=st=1746281349~exp=1746284949~hmac=26ff5f31f9a451f8c7c56db929d0653580be7b7b22e4e453272ed4952fc0f6f8&w=900"
}



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendDataToPython(data);
});
