const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const cloudinaryConfig = require('./cloudinaryConfig');

cloudinary.config(cloudinaryConfig);

exports.uploadImage = async (res, file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      public_id: `${Date.now()}`,
    });
    const url = result.secure_url.replace(
      '/upload',
      '/upload/w_500,h_500,c_fill'
    );
    const image = {
      public_id: result.public_id,
      url,
    };
    fs.unlinkSync(file.path);
    return image;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tải ảnh thất bại abc',
    });
  }
};
