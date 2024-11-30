const cloudinary = require('../utils/cloudinary');

const uploadMultiFiles = async (req, res, next) => {
  const uploader = async (file) =>
    await cloudinary.uploadImage(res, file, 'Images');

  if (req.method === 'POST') {
    const images = [];
    const files = req.files;
    for (const file of files) {
      const newImage = await uploader(file);
      images.push(newImage);
    }
    req.images = images;
    next();
  } else {
    res.status(405).json({
      success: false,
      message: 'Tải ảnh chỉ hỗ trợ phương thức POST',
    });
  }
};

module.exports = uploadMultiFiles;
