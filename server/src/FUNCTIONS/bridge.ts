import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

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

// Example usage

