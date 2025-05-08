import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a filename with a timestamp and original file extension
    const timestampedFileName = `logoFile-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, timestampedFileName);
  },
});

const upload = multer({ storage });
export default upload;
