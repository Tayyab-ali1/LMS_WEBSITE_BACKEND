import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // save file with original name
  },
});

const upload = multer({ storage });

export default upload;
