const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập',
    });
  }
  next();
};

module.exports = isAdmin;
