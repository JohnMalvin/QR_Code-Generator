import express, {Request, Response} from 'express';
import { apiValidator, connectDB, sendDataToPython } from './FUNCTIONS/helperFunction';
import createHttpError from 'http-errors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());

// const dataToSend = {
//   URL: "https://www.google.com/",
//   backgroundColor: "(255, 255, 255)",
//   fillColor: "(0, 0, 0)",
//   logoURL: "https://upload.wikimedia.org/wikipedia/commons/2/25/Intel_logo_%282006-2020%29.jpg?20111021093434"
// };
// sendDataToPython(dataToSend);
app.post("/generate/QRCode/:API/:APIKEY", async (req: Request, res: Response) => {
  const data = req.body.data;
  const API = req.params.API;
  const APIKEY = req.params.APIKEY;
  if (!data) {
    res.status(401).json({ error: "Data undefined" });
    return;
  }
  if (!API) {
    res.status(401).json({ error: "API undefined" });
    return;
  }
  if (!APIKEY) {
    res.status(401).json({ error: "APIKEY undefined" });
    return;
  }
  const valid = await apiValidator(API, APIKEY);
  if (!valid) {
    res.status(402).json({ error: "invalid API" });
    return;
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
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
