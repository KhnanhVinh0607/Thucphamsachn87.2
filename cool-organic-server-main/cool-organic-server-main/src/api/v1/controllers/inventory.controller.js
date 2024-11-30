const Inventory = require('../models/inventory.model');

const inventoryController = {
  addProductToInventory: async (productId, quantity) => {
    try {
      const product = await Inventory.create({
        productId,
        quantity,
      });
      return product;
    } catch (error) {
      return false;
    }
  },
  getAllInventory: async (req, res) => {
    let { page, limit } = req.query;

    if (!page || !limit) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu truyền lên!',
      });
    }

    try {
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;
      const products = await Inventory.find({})
        .populate('productId')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const totalProducts = await Inventory.countDocuments({});

      const totalPages = Math.ceil(totalProducts / limit);

      if (!products) {
        return res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        products,
        pagination: {
          currentPage: page,
          prePage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
          totalPages,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy sản phẩm trong kho hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  getAllQuantityOfProductInInventory: async (req, res) => {
    try {
      let totalQuantity = 0;
      const products = await Inventory.find({}).populate('productId');
      if (!products) {
        return res.status(500).json({
          success: false,
          message:
            'Lấy số lượng sản phẩm trong kho hàng thất bại, Vui lòng thử lại sau!',
        });
      }
      products.forEach((product) => {
        totalQuantity += product.quantity;
      });
      return res.status(200).json({
        success: true,
        totalQuantity,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Lấy số lượng sản phẩm trong kho hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  updateQuantityOfProductInInventory: async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
      const product = await Inventory.findOne({
        productId: id,
      }).populate('productId');
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Cập nhật số lượng sản phẩm không thành công',
        });
      }
      product.quantity = Number(quantity);
      await product.save();
      return res.status(200).json({
        success: true,
        message: 'Cập nhật số lượng sản phẩm thành công',
        product,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server! Vui lòng thử lại sau',
      });
    }
  },
  deleteProductInInventory: async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Inventory.findOneAndDelete({
        productId: id,
      }).populate('productId');
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Xóa sản phẩm khỏi kho hàng không thành công',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Xóa sản phẩm khỏi kho hàng thành công',
        product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server! Vui lòng thử lại sau',
      });
    }
  },
};

module.exports = inventoryController;
