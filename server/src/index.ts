import express from 'express';
import { sendDataToPython } from './FUNCTIONS/bridge';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dataToSend = {
  URL: "https://www.google.com/",
  backgroundColor: "(255, 255, 255)",
  fillColor: "(0, 0, 0)",
  logoURL: "https://upload.wikimedia.org/wikipedia/commons/2/25/Intel_logo_%282006-2020%29.jpg?20111021093434"
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendDataToPython(dataToSend);
  // sendDataToPython({ name: "Zucc", age: 19 });
});
