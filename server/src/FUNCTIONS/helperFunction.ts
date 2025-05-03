import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import Bind from '../models/bind.model';
import createHttpError from 'http-errors';

interface DataToSend {
  URL: string;
  backgroundColor: string;
  fillColor: string;
  logoURL?: string;
}
interface ReturnBind {
  API: string;
  APIKEY: string;
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

  pythonProcess.on('error', (err) => {
    console.error(`Failed to start Python process: ${err.message}`);
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

const apiGenerator = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 12; i++) {
    if (i % 4 === 0 && i !== 0) result += "-";
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const apiKeyGenerator = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*:?|+_=()/`~1234567890';
  let result = '';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const handleCreateNewBind = async (): Promise<ReturnBind | null> => {
  try {
    const API = apiGenerator();
    const APIKEY = apiKeyGenerator();
    const bindSchema = await Bind.create({ API, APIKEY });
    return { API, APIKEY };
  } catch (error) {
    console.error('Error creating bind:', error);
    return null;
  }
};

export const apiValidator = async (API: string, APIKEY: string): Promise<Boolean> => {
  const bind = await Bind.findOne({ API });
  if (!bind) {
    console.log(`API ${API} not found.`);
    return false;
  }
  if (bind.APIKEY === APIKEY) return true;
  console.log(`APIKEY mismatch for API ${API}`);
  return false;
};

export const isValidDataToSend = (data: any): data is DataToSend => {
  return (
    typeof data === 'object' &&
    typeof data.URL === 'string' &&
    typeof data.backgroundColor === 'string' &&
    typeof data.fillColor === 'string' &&
    (data.logoURL === undefined || typeof data.logoURL === 'string')
  );
};