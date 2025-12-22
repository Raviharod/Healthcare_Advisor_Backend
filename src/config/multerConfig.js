
const multer = require('multer');

// We use disk storage temporarily.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder name
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadToDisk = multer({ storage});

//memory storage

const MemoryStorage = multer.memoryStorage();

const uploadToMemory = multer({ storage: MemoryStorage,  limits: { fileSize: 10 * 1024 * 1024 }, });

module.exports = {
  uploadToDisk,
  uploadToMemory
};