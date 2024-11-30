const Category = require('../models/category.model');
const Product = require('../models/product.model');
const generateSlug = require('../utils/generateSlug');

const categoryController = {
  createCategory: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên danh mục!',
      });
    }
    try {
      const categorySlug = generateSlug(name);
      const isExist = await Category.findOne({
        categorySlug,
      });
      if (isExist) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục đã tồn tại!',
        });
      }

      const category = await Category.create({ name, categorySlug });
      if (!category) {
        return res.status(500).json({
          success: false,
          message: 'Tạo danh mục thất bại, Vui lòng thử lại sau!',
        });
      }
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Tạo danh mục thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  getAllCategories: async (req, res) => {
    let { limit, page } = req.query;
    try {
      if (limit && !page) {
        const categories = await Category.find().limit(Number(limit));
        return res.status(200).json({
          success: true,
          categories,
        });
      }

      if (limit && page) {
        limit = Number(limit);
        page = Number(page);
        const skip = (page - 1) * limit;
        const categories = await Category.find({})
          .limit(limit)
          .skip(skip)
          .sort({
            createdAt: -1,
          });

        const totalCategories = await Category.countDocuments({});

        const totalPages = Math.ceil(totalCategories / limit);

        if (!categories) {
          return res.status(404).json({
            success: false,
            message: 'Có lỗi xảy ra, Vui lòng thử lại!',
          });
        }

        return res.status(200).json({
          success: true,
          categories,
          pagination: {
            currentPage: page,
            prePage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            totalPages,
            total: totalCategories,
          },
        });
      }

      const categories = await Category.find({}).sort({
        createdAt: -1,
      });
      return res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Lấy thống tin danh mục thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  getCategoryBySlug: async (req, res) => {
    const { slug } = req.params;
    try {
      const category = await Category.findOne({ categorySlug: slug });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục',
        });
      }
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy thông tin danh mục thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  getQuantityProductsOfCategory: async (req, res) => {
    const { slug } = req.params;
    try {
      const products = await Product.find({ categorySlug: slug });
      return res.status(200).json({
        success: true,
        quantity: products.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra phía Server, Vui lòng thử lại sau!',
      });
    }
  },
  updateCategory: async (req, res) => {
    const { slug } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên danh mục!',
      });
    }
    try {
      const categorySlug = generateSlug(name);
      if (slug !== categorySlug) {
        const isExist = await Category.findOne({
          categorySlug,
        });
        if (isExist) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục đã tồn tại!',
          });
        } else {
          await Product.updateMany(
            { categorySlug: slug },
            { categorySlug, category: name }
          );
        }
      }

      const category = await Category.findOneAndUpdate(
        { categorySlug: slug },
        { name, categorySlug },
        {
          new: true,
        }
      );
      if (!category) {
        return res.status(500).json({
          success: false,
          message: 'Cập nhật danh mục thất bại, Vui lòng thử lại sau!',
        });
      }
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Cập nhật danh mục thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  deleteCategory: async (req, res) => {
    const { slug } = req.params;
    try {
      await Product.deleteMany({ categorySlug: slug });
      const category = await Category.findOneAndDelete({ categorySlug: slug });
      if (!category) {
        return res.status(500).json({
          success: false,
          message: 'Xóa danh mục thất bại, Vui lòng thử lại sau!',
        });
      }
      return res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Xóa danh mục thất bại, Vui lòng thử lại sau!',
      });
    }
  },
};

module.exports = categoryController;
