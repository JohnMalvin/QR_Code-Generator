import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import Bind from '../models/bind.model';
import createHttpError from 'http-errors';

interface DataToSend {
  URL: string;
  backgroundColor: number[];
  fillColor: number[];
  logoFile?: Buffer;
}
interface ReturnBind {
  API: string;
  APIKEY: string;
}

function arrayToString(arr: number[]): string {
  return `(${arr.join(', ')})`;
}

export const sendDataToPython = (datas: DataToSend): void => {
  console.log("function called");

  // Create the data object, converting arrays to strings and Buffer to base64
  let data: { URL: string; backgroundColor: string; fillColor: string; logoFile?: string } = {
    URL: datas.URL,
    backgroundColor: arrayToString(datas.backgroundColor),
    fillColor: arrayToString(datas.fillColor),
  };

  if (datas.logoFile) {
    // Convert the logo file buffer to a base64 string
    data = { ...data, logoFile: datas.logoFile.toString('base64') };
  }

  console.log("Data being sent to Python");

  // Get the Python script path
  const pythonScriptPath = path.resolve(__dirname, '../../PYTHON/QRGen.py');

  // Check if the script exists
  if (!fs.existsSync(pythonScriptPath)) {
    console.error('Error: QRGen.py does not exist at the path:', pythonScriptPath);
    throw createHttpError(404, "QRGen.py script not found.");
  }

  // Spawn the Python process to run the script
  const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(data)]);

  // Listen for standard output from Python
  pythonProcess.stdout.on('data', (data: Buffer) => {
    console.log(`Python says: ${data.toString()}`);
  });

  // Listen for error output from Python
  pythonProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Error: ${data.toString()}`);
    throw new Error(`Python process error: ${data.toString()}`);
  });

  // Listen for the process close event
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      throw new Error(`Python process exited with non-zero code: ${code}`);
    } else {
      console.log('Python process finished successfully');
    }
  });

  // Handle errors starting the Python process
  pythonProcess.on('error', (err) => {
    console.error(`Failed to start Python process: ${err.message}`);
    throw new Error(`Failed to start Python process: ${err.message}`);
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