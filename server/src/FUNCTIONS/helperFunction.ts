import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';

interface DataToSend {
  URL: string;
  backgroundColor: string;
  fillColor: string;
  logoURL?: string;
}

export const sendDataToPython = (data: DataToSend): void => {
  const pythonScriptPath = path.resolve(__dirname, '../../PYTHON/QRGen.py');

  if (!fs.existsSync(pythonScriptPath)) {
    console.error('Error: QRGen.py does not exist at the path:', pythonScriptPath);
    return;
  }

  // Spawn Python process
  const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(data)]);

  pythonProcess.stdout.on('data', (data: Buffer) => {
    console.log(`Python says: ${data.toString()}`);
  });

  pythonProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Error: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
};



const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cluster";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🟢 MongoDB connected');
  } catch (err: any) {
    console.error('🔴 MongoDB connection error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};



export const apiValidator = async (API: string, APIKEY: string): Promise<Boolean> => {
  return true;
}