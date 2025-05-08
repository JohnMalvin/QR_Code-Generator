import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import Bind from '../models/bind.model';
import createHttpError from 'http-errors';
interface ReturnBind {
  API: string;
  APIKEY: string;
}

interface DataToSend {
  URL: string;
  backgroundColor: number[];
  fillColor: number[];
  logoFilePath?: string;
}

function arrayToString(arr: number[]): string {
  return `(${arr.join(', ')})`;
}

export const sendDataToPython = (datas: DataToSend): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log("🌀 sendDataToPython function called");

    const data: {
      URL: string;
      backgroundColor: string;
      fillColor: string;
      logoFile?: string;
    } = {
      URL: datas.URL,
      backgroundColor: arrayToString(datas.backgroundColor),
      fillColor: arrayToString(datas.fillColor),
    };

    if (datas.logoFilePath) {
      const absoluteLogoFilePath = path.resolve(__dirname, '../uploads', datas.logoFilePath);
      if (!fs.existsSync(absoluteLogoFilePath)) {
        console.error("Logo file does not exist at:", absoluteLogoFilePath);
        throw createHttpError(404, "Logo file not found.");
      }
      data.logoFile = absoluteLogoFilePath; // Send the file path, not the content
      console.log("✅ Logo file path added:", data.logoFile);
    }

    console.log(" Data being sent to Python:", data);

    const pythonScriptPath = path.resolve(__dirname, '../../PYTHON/QRGen.py');
    if (!fs.existsSync(pythonScriptPath)) {
      const msg = ` QRGen.py does not exist at path: ${pythonScriptPath}`;
      console.error(msg);
      return reject(createHttpError(404, msg));
    }

    const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(data)]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(' Python stdout:', text);
      output += text;
    });

    pythonProcess.stderr.on('data', (data) => {
      const errText = data.toString();
      console.error(' Python stderr:', errText);
      errorOutput += errText;
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(' Python process finished successfully');
        resolve(output);
      } else {
        const msg = ` Python process exited with code ${code}`;
        console.error(msg);
        reject(new Error(`${msg}\nDetails:\n${errorOutput}`));
      }
    });

    pythonProcess.on('error', (err) => {
      console.error(' Failed to start Python process:', err);
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
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