const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeaders = req.headers['authorization'];

  if (!authHeaders) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần phải đăng nhập để tiếp tục',
    });
  }
  const token = authHeaders.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần phải đăng nhập để tiếp tục',
    });
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = data.userId;
    req.role = data.role;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần phải đăng nhập để tiếp tục',
    });
  }

  next();
};

module.exports = verifyToken;
