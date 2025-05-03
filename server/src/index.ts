import express from 'express';
import { sendDataToPython } from './FUNCTIONS/bridge';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendDataToPython({ name: "Zucc", age: 19 });
});
