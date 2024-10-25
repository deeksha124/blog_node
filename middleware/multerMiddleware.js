const multer = require("multer");
const path = require("path");

const basedir = path.resolve(); // Assuming basedir needs to be defined, adjust accordingly

const imageFilter = (req, file, cb) => {
  // Check the file type
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error("Please upload only JPG files."), false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(basedir, "uploads/")); // Ensure the path is correct
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}bezkoder${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
module.exports = uploadFile;
