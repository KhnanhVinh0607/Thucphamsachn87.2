const bcrypt = require('bcrypt');

const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

const authController = {
  handleLogin: async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Email là bắt buộc' });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Mật khẩu là bắt buộc' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
        });
      }

      const userInfo = {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        accessToken: generateToken(user),
        user: userInfo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Đăng nhập không thành công, Vui lòng thử lại!',
      });
    }
  },
  handleRegister: async (req, res) => {
    const { email, password, fullName } = req.body;
    const saltRounds = 10;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Email là bắt buộc' });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Nật khẩu là bắt buộc' });
    }
    if (!fullName) {
      return res
        .status(400)
        .json({ success: false, message: 'Tên đầy đủ là bắt buộc' });
    }

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: 'Tài khoản đã tồn tại' });
      }

      const hashPassword = await bcrypt.hash(password, saltRounds);
      const newUser = await User.create({
        email,
        password: hashPassword,
        fullName,
      });

      if (!newUser) {
        return res.status(400).json({
          success: false,
          message: 'Tạo tài khoản không thành công, vui lòng thử lại!',
        });
      }

      const userInfo = {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };

      return res.status(200).json({
        success: true,
        message: 'Tạo tài khoản thành công',
        accessToken: generateToken(newUser),
        user: userInfo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Tạo tài khoản không thành công, vui lòng thử lại!',
      });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.userId,
      }).select({
        password: 0,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng!',
        });
      }
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.json(500).json({
        success: false,
        message: 'Lỗi máy chủ, Vui lòng thử lại!',
      });
    }
  },
};

module.exports = authController;
