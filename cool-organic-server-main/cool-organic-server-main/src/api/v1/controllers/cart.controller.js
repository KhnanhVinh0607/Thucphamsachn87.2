const Cart = require('../models/cart.model');

const cartController = {
  getProductInCart: async (req, res) => {
    const userId = req.userId;

    try {
      const cart = await Cart.findOne({ userId }).populate({
        path: 'products.product',
        populate: {
          path: 'inventory',
        },
      });

      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy giỏ hàng của bạn',
        });
      }
      return res.status(200).json({
        success: true,
        cart: cart.products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
  createCart: async (req, res) => {
    const userId = req.body.userId || req.userId;

    try {
      const cart = await Cart.create({ userId, products: [] });
      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Tạo giỏ hàng không thành công',
        });
      }
      return res.status(200).json({
        success: true,
        cart: cart.products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
  updateCart: async (req, res) => {
    const userId = req.userId;
    const { products } = req.body;

    if (!products) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu products truyền lên',
      });
    }

    try {
      const cart = await Cart.findOneAndUpdate(
        { userId },
        { products },
        { new: true }
      ).populate({
        path: 'products.product',
        populate: {
          path: 'inventory',
        },
      });
      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy giỏ hàng của bạn',
        });
      }
      return res.status(200).json({
        success: true,
        cart: cart.products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
  updateQuantity: async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu productId hoặc quantity truyền lên',
      });
    }

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy giỏ hàng của bạn',
        });
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product == productId
      );

      if (productIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy sản phẩm trong giỏ hàng',
        });
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();

      return res.status(200).json({
        success: true,
        cart: cart.products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
  deleteProductInCart: async (req, res) => {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu productId truyền lên',
      });
    }

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy giỏ hàng của bạn',
        });
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product == productId
      );

      if (productIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy sản phẩm cẫn xóa trong giỏ hàng',
        });
      }

      cart.products.splice(productIndex, 1);
      await cart.save();

      return res.status(200).json({
        success: true,
        cart: cart.products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
  deleteCart: async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
      const cart = await Cart.findOneAndDelete({ userId: id });
      if (!cart) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy giỏ hàng của bạn',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Xóa giỏ hàng thành công',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau!',
      });
    }
  },
};

module.exports = cartController;
