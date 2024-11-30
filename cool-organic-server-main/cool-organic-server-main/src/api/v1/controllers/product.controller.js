const Product = require('../models/product.model');
const Category = require('../models/category.model');
const productService = require('../services/product.service');
const inventoryController = require('./inventory.controller');

const generateSlug = require('../utils/generateSlug');

const productController = {
  createProduct: async (req, res) => {
    const {
      name,
      category,
      price,
      discount,
      origin,
      supplier,
      weight,
      unit,
      description,
      quantity,
    } = req.body;

    const isValidateFalse =
      !name ||
      !category ||
      discount === 'undefined' ||
      quantity === 'undefined' ||
      !origin ||
      !supplier ||
      !weight ||
      !unit ||
      !price ||
      !description;
    if (isValidateFalse) {
      return res.status(400).json({
        message: 'Vui lòng nhập đủ tất cả các trường bắt buộc!',
      });
    }

    try {
      const slug = generateSlug(name);
      const categorySlug = generateSlug(category);
      const salePrice = Math.round(price - price * (discount / 100));
      let status = 'active';
      if (quantity === 0) {
        status = 'inactive';
      }
      let product = await Product.create({
        name,
        category,
        categorySlug,
        price,
        salePrice,
        discount,
        status,
        origin,
        supplier,
        weight,
        unit,
        slug,
        description,
        userId: req.userId,
      });

      if (!product) {
        return res.status(500).json({
          success: false,
          message: 'Tạo sản phẩm thất bại, Vui lòng thử lại!',
        });
      }

      const inventoryProduct = await inventoryController.addProductToInventory(
        product._id,
        quantity
      );

      product = {
        ...product._doc,
        quantity,
      };

      if (!inventoryProduct) {
        return res.status(500).json({
          success: false,
          message: 'Tạo sản phẩm thất bại, Vui lòng thử lại!',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Tạo sản phẩm thất bại, Vui lòng thử lại!',
      });
    }
  },
  getAllProducts: async (req, res) => {
    let { page, limit = 8, price, date, salePrice, supplier } = req.query;
    let sortFilter = {
      createdAt: -1, // default sort by createdAt newest
    };

    let condition = {};
    let combineCondition = {};

    if (supplier) {
      condition.supplier = supplier;
      combineCondition = {
        supplier: condition.supplier,
      };
    }

    if (salePrice) {
      if (!Array.isArray(salePrice)) {
        salePrice = [salePrice];
      }
      condition.salePrice = productService.handleSortByPrice(salePrice);
      combineCondition = {
        ...combineCondition,
        $or: condition.salePrice,
      };
      sortFilter = {
        salePrice: 1,
        ...sortFilter,
      }; // sort ascending price by default if sort by price
    } else {
      condition.salePrice = [
        {
          salePrice: {
            $gte: 0,
          },
        },
      ];
    }

    if (price) {
      switch (price) {
        case 'desc':
          sortFilter = {
            salePrice: -1,
            ...sortFilter,
          };
          break;
        case 'asc':
          sortFilter = {
            salePrice: 1,
            ...sortFilter,
          };
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số price không hợp lệ!',
          });
      }
    }
    if (date) {
      switch (date) {
        case 'newest':
          sortFilter.createdAt = -1;
          break;
        case 'oldest':
          sortFilter.createdAt = 1;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số date không hợp lệ!',
          });
      }
    }

    try {
      if (page) {
        page = Number(page);
        limit = Number(limit);
        const skip = (page - 1) * limit;
        const products = await Product.find(combineCondition)
          .sort(sortFilter)
          .limit(limit)
          .skip(skip)
          .select({
            sold: 0,
          })
          .populate('inventory', 'quantity');

        const totalProducts = await Product.countDocuments(combineCondition);

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
            total: totalProducts,
          },
        });
      } else {
        const products = await Product.find(combineCondition)
          .sort(sortFilter)
          .select({
            sold: 0,
          });

        if (!products) {
          return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, Vui lòng thử lại!',
          });
        }

        return res.status(200).json({
          success: true,
          products,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra, Vui lòng thử lại!',
      });
    }
  },
  getProductBySlug: async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy sản phẩm!',
      });
    }
    try {
      let product = await Product.findOne({ slug })
        .select({
          sold: 0,
        })
        .populate('inventory', 'quantity');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không có sản phẩm này, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy thông tin sản phẩm không thành công, Vui lòng thử lại!',
      });
    }
  },
  getProductsByCategory: async (req, res) => {
    const { categorySlug } = req.params;
    let { page, limit = 8, price, date, salePrice, supplier } = req.query;
    let sortFilter = {
      createdAt: -1, // default sort by createdAt newest
    };

    let condition = {};
    let combineCondition = {};

    if (supplier) {
      condition.supplier = supplier;
      combineCondition = {
        supplier: condition.supplier,
      };
    }

    if (salePrice) {
      if (!Array.isArray(salePrice)) {
        salePrice = [salePrice];
      }
      condition.salePrice = productService.handleSortByPrice(salePrice);
      combineCondition = {
        ...combineCondition,
        $or: condition.salePrice,
      };
      sortFilter = {
        salePrice: 1,
        ...sortFilter,
      }; // sort ascending price by default if sort by price
    } else {
      condition.salePrice = [
        {
          salePrice: {
            $gte: 0,
          },
        },
      ];
    }

    if (price) {
      switch (price) {
        case 'desc':
          sortFilter = {
            salePrice: -1,
            ...sortFilter,
          };
          break;
        case 'asc':
          sortFilter = {
            salePrice: 1,
            ...sortFilter,
          };
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số price không hợp lệ!',
          });
      }
    }
    if (date) {
      switch (date) {
        case 'newest':
          sortFilter.createdAt = -1;
          break;
        case 'oldest':
          sortFilter.createdAt = 1;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số date không hợp lệ!',
          });
      }
    }

    if (!categorySlug) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn danh mục',
      });
    }
    try {
      if (page) {
        page = Number(page);
        limit = Number(limit);
        let categoryName;
        const skip = (page - 1) * limit;

        const products = await Product.find({
          categorySlug,
          ...combineCondition,
        })
          .sort(sortFilter)
          .limit(limit)
          .skip(skip)
          .select({
            sold: 0,
          })
          .populate('inventory', 'quantity');

        const totalProducts = await Product.countDocuments({
          categorySlug,
          ...combineCondition,
        });
        const totalPages = Math.ceil(totalProducts / limit);

        if (!products) {
          return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, Vui lòng thử lại!',
          });
        }

        if (products.length === 0) {
          const category = await Category.findOne({ categorySlug });
          if (!category) {
            return res.status(400).json({
              success: false,
              categoryName: null,
              message: 'Không tìm thấy danh mục!',
            });
          }
          categoryName = category.name;
          if (Object.keys(combineCondition).length === 0) {
            return res.status(404).json({
              success: true,
              categoryName,
              message: 'Không có sản phẩm nào trong danh mục này!',
            });
          }
        } else {
          categoryName = products[0].category;
        }

        return res.status(200).json({
          success: true,
          products,
          categoryName,
          pagination: {
            currentPage: page,
            prePage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            totalPages,
          },
        });
      }

      const products = await Product.find({ categorySlug, ...combineCondition })
        .sort(sortFilter)
        .select({
          sold: 0,
        });
      if (!products) {
        return res.status(500).json({
          success: false,
          message:
            'Không có sản phẩm nào trong danh mục này, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra, vui lòng thử lại!',
      });
    }
  },
  getTopSellingProducts: async (req, res) => {
    let { page, limit = 8, price, date, salePrice, supplier } = req.query;
    let sortFilter = {
      createdAt: -1, // default sort by createdAt newest
    };

    let condition = {};
    let combineCondition = {};

    if (supplier) {
      condition.supplier = supplier;
      combineCondition = {
        supplier: condition.supplier,
      };
    }

    if (salePrice) {
      if (!Array.isArray(salePrice)) {
        salePrice = [salePrice];
      }
      condition.salePrice = productService.handleSortByPrice(salePrice);
      combineCondition = {
        ...combineCondition,
        $or: condition.salePrice,
      };
      sortFilter = {
        salePrice: 1,
        ...sortFilter,
      }; // sort ascending price by default if sort by price
    } else {
      condition.salePrice = [
        {
          salePrice: {
            $gte: 0,
          },
        },
      ];
    }

    if (price) {
      switch (price) {
        case 'desc':
          sortFilter = {
            salePrice: -1,
            ...sortFilter,
          };
          break;
        case 'asc':
          sortFilter = {
            salePrice: 1,
            ...sortFilter,
          };
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số price không hợp lệ!',
          });
      }
    }
    if (date) {
      switch (date) {
        case 'newest':
          sortFilter.createdAt = -1;
          break;
        case 'oldest':
          sortFilter.createdAt = 1;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tham số date không hợp lệ!',
          });
      }
    }

    try {
      if (page) {
        page = Number(page);
        limit = Number(limit);
        const skip = (page - 1) * limit;
        const products = await Product.find(combineCondition)
          .sort({ sold: -1 })
          .limit(limit)
          .skip(skip)
          // .select({
          //   sold: 0,
          // })
          .populate('inventory', 'quantity');

        const totalProducts = await Product.countDocuments(combineCondition);
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
      }

      const products = await Product.find(combineCondition).sort({ sold: -1 });
      // .select({
      //   sold: 0,
      // });
      if (!products) {
        return res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra, Vui lòng thử lại!',
      });
    }
  },
  getRelatedProducts: async (req, res) => {
    const { categorySlug, slug } = req.query;
    if (!categorySlug || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng truyền dữ liệu bắt buộc!',
      });
    }
    try {
      const products = await Product.find({ categorySlug })
        .sort({ sold: -1 })
        .select({
          sold: 0,
        })
        .populate('inventory', 'quantity');

      const relatedProducts = products
        .filter((product) => product.slug !== slug)
        .slice(0, 4); // Select 4 related products

      return res.status(200).json({
        success: true,
        products: relatedProducts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra, Vui lòng thử lại!',
      });
    }
  },
  updateProduct: async (req, res) => {
    const { slug } = req.params;
    const {
      name,
      category,
      price,
      discount,
      origin,
      supplier,
      weight,
      unit,
      description,
      quantity,
      images,
    } = req.body;

    const isValidateFalse =
      !name ||
      !category ||
      discount === 'undefined' ||
      quantity === 'undefined' ||
      !origin ||
      !supplier ||
      !weight ||
      !unit ||
      !price ||
      !description ||
      !images;
    if (isValidateFalse) {
      return res.status(400).json({
        message: 'Vui lòng nhập đủ tất cả các trường bắt buộc!',
      });
    }

    try {
      const newSlug = generateSlug(name);
      const categorySlug = generateSlug(category);
      const salePrice = Math.round(price - price * (discount / 100));
      let status = 'active';
      if (quantity === 0) {
        status = 'inactive';
      }
      const product = await Product.findOneAndUpdate(
        { slug },
        {
          name,
          category,
          categorySlug,
          price,
          salePrice,
          discount,
          status,
          origin,
          supplier,
          weight,
          unit,
          slug: newSlug,
          description,
          images,
        },
        { new: true }
      );
      if (!product) {
        return res.status(500).json({
          success: false,
          message:
            'Cập nhật thông tin sản phẩm không thành công, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sản phẩm thành công',
        product,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message:
          'Cập nhật thông tin sản phẩm không thành công, Vui lòng thử lại!',
      });
    }
  },
  deleteProduct: async (req, res) => {
    const { slug } = req.params;
    try {
      const product = await Product.findOneAndDelete({ slug });
      if (!product) {
        return res.status(500).json({
          success: false,
          message: 'Xóa sản phẩm không thành công, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa sản phẩm thành công',
        product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Xóa sản phẩm không thành công, Vui lòng thử lại!',
      });
    }
  },
  searchProduct: async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm',
      });
    }
    try {
      const products = await Product.find({
        name: { $regex: q, $options: 'i' },
      }).select({
        sold: 0,
      });

      if (products.length === 0) {
        return res.status(404).json({
          success: true,
          message: 'Không có sản phẩm nào phù hợp',
        });
      }

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Không có sản phẩm nào phù hợp',
      });
    }
  },
  uploadSingleFile: async (req, res) => {
    const { productId } = req.body;
    if (!req.image) {
      return res.status(500).json({
        success: false,
        message: 'Tải ảnh lên thất bại, Vui lòng thử lại!',
      });
    }
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu truyền lên!',
      });
    }

    try {
      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy sản phẩm để upload ảnh!',
        });
      }

      await Product.updateOne(
        {
          _id: productId,
        },
        {
          images: [...product.images, req.image],
        }
      );

      return res.status(200).json({
        success: true,
        image: req.image,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
      });
    }
  },
  uploadMultipleFiles: async (req, res) => {
    const { productId } = req.body;
    if (!req.images) {
      return res.status(500).json({
        success: false,
        message: 'Tải ảnh lên thất bại, Vui lòng thử lại!',
      });
    }
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu truyền lên!',
      });
    }

    try {
      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy sản phẩm để upload ảnh!',
        });
      }

      await Product.updateOne(
        {
          _id: productId,
        },
        {
          images: [...product.images, ...req.images],
        }
      );
      return res.status(200).json({
        success: true,
        images: req.images,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
      });
    }
  },
};

module.exports = productController;
