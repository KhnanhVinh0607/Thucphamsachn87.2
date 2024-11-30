const multer = require('multer');

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    cb(new Error('Định dạng file này không được hỗ trợ!'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

module.exports = upload;
