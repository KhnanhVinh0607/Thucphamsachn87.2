const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const userController = {
  createUser: async (req, res) => {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin!',
      });
    }

    try {
      const user = await User.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản đã tồn tại!',
        });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        fullName,
        email,
        password: hashPassword,
        role,
      });
      await newUser.save();

      res.status(201).json({
        success: true,
        user: newUser,
        message: 'Tạo tài khoản thành công!',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, Vui lòng thử lại sau!',
      });
    }
  },
  getAllUsers: async (req, res) => {
    let { page, limit } = req.query;
    try {
      if (page) {
        page = Number(page);
        limit = Number(limit);
        const skip = (page - 1) * limit;
        const users = await User.find({})
          .limit(limit)
          .skip(skip)
          .select({
            password: 0,
          })
          .sort({
            createdAt: -1,
          });

        const totalUsers = await User.countDocuments({});

        const totalPages = Math.ceil(totalUsers / limit);

        if (!users) {
          return res.status(404).json({
            success: false,
            message: 'Có lỗi xảy ra, Vui lòng thử lại!',
          });
        }

        res.status(200).json({
          success: true,
          users,
          pagination: {
            currentPage: page,
            prePage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            totalPages,
            total: totalUsers,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng truyền dữ liệu page và limit!',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, vui lòng thử lại sau!',
      });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findOne({
        _id: id,
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
  updateRole: async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng đặt quyền hạn cho người dùng',
      });
    }
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { role },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        });
      }

      res.status(200).json({
        success: true,
        user,
        message: 'Cập nhật quyền hạn thành công!',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, vui lòng thử lại sau!',
      });
    }
  },
  changePassword: async (req, res) => {
    const { password, newPassword } = req.body;
    const userId = req.userId;

    const saltRounds = 10;

    if (!password || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin truyền lên',
      });
    }

    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu cũ không chính xác, Vui lòng thử lại!',
        });
      }

      const hashPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashPassword;
      await user.save();
      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, vui lòng thử lại sau!',
      });
    }
  },
  updateUser: async (req, res) => {
    const { fullName, phone, address } = req.body;
    const userId = req.userId;

    try {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { fullName: fullName, phone: phone, address: address },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Cập nhật thông tin thất bại, Vui lòng thử lại!',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, vui lòng thử lại sau!',
      });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findOneAndDelete({ _id: id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, vui lòng thử lại sau!',
      });
    }
  },
};

module.exports = userController;
