const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const orderService = require('../services/order.service');
// lấy các thông tin cần thiết từ đơn hàng
const OrderController = {
  createOrder: async (req, res) => {
    let {
      email,
      fullName,
      phone,
      city,
      district,
      ward,
      comment,
      shippingMethod,
      shippingFee,
      paymentMethod,
      totalPrice,
      cart,
    } = req.body;
    if (
      !email ||
      !fullName ||
      !phone ||
      !city ||
      !district ||
      !ward ||
      !shippingMethod ||
      !shippingFee ||
      !paymentMethod ||
      !totalPrice ||
      !cart
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin!',
      });
    }
    shippingMethod = orderService.handleShippingMethod(shippingMethod);
    paymentMethod = orderService.handlePaymentMethod(paymentMethod);

    try {
      const order = await Order.create({
        email,
        fullName,
        phone,
        city,
        district,
        ward,
        comment,
        shippingMethod,
        shippingFee,
        paymentMethod,
        totalPrice,
        cart,
        userId: req.userId,
      });
      if (!order) {//kiểm tra xem order có tồn tại hay không
        return res.status(500).json({
          success: false,
          message: 'Đặt hàng thất bại, Vui lòng thử lại sau!',
        });
      }

      // Update inventory
      const handleUpdateInventory = async () => {
        for (const item of cart) {
          const productInventory = await Inventory.findOne({
            productId: item.product._id,
          }).populate('productId');
          if (!productInventory) {//check xem có or không -> không msg
            return res.status(500).json({
              success: false,
              message: 'Đặt hàng thất bại, Vui lòng thử lại sau!',
            });
          }
          productInventory.quantity -= item.quantity;//trừ số lượng trong kho khi mà đặt hàng
          if (productInventory.quantity < 0) {//nếu số lượng trong kho < 0 -> in ra thông báo 
            productInventory.quantity = 0;// đặt số lượng trong kho bằng 0
            return res.status(500).json({
              success: false,
              message: `Sản phẩm ${productInventory.productId.name} đã hết hàng! Vui lòng thử lại sau!`,
            });
          }//await sử dụng cho các hàm bất đồng bộ 
          // JS sẽ tạm dừng thực thi hàm cho đến khi hàm bất đồng bộ trả về
          const product = await Product.findById(item.product._id);//tìm ID của mô hình Product
          //await đợi trả về kết quả 
          product.sold += item.quantity;// tăng trường sold của đối tượng product lên 
          await product.save();// cập nhật đối tượng product vào csdl
          await productInventory.save();// tương tự
        }
      };
                  
      await handleUpdateInventory();// đợi trả về kết quả

      return res.status(200).json({// thành công thì in
        success: true,
        message: 'Đặt hàng thành công!',
        order,
      });
    } catch (error) {// sử dụng try catch để bắt lỗi phát sinh khi gặp lỗi
      return res.status(500).json({
        success: false,
        message: 'Đặt hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // lấy danh sách đơn hàng từ CSDL
  getAllOrders: async (req, res) => {
    let { page, limit } = req.query;// trích xuất giá trị của page và limit
    //xác định số lượng trang hiện tại và số lượng đơn hàng đc trả về trên mỗi trang
    try {
      if (page && limit) {// kiểm tra sự tồn tại của page và limit
        page = Number(page);// chuyển kiểu chuỗi sang kiểu số
        limit = Number(limit);
        const skip = (page - 1) * limit;// các lượt bản ghi cần bỏ qua -> xác định vị trí của trang hiện tại
        const orders = await Order.find({})// truy vấn vào csdl -> lấy d/s đơn hàng
          .sort({ createdAt: -1 })// sắp xếp theo giảm dần
          .limit(limit)// giới hạn 
          .skip(skip);//bỏ qua số lượng các bản ghi dducc xác định bởi  skip

        const totalOrders = await Order.countDocuments({});// đếm tổng số đơn hàng

        const totalPages = Math.ceil(totalOrders / limit);// tổng số trang tối đa có 
                                      //  thể hiện thị, dựa trên tổng số đơn hàng và số trang
        if (!orders) {// check order tồn tại
          return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, Vui lòng thử lại!',
          });
        }

        return res.status(200).json({
          success: true,
          orders,// d/s đơn hàng
          pagination: {// thông tin phân trang
            currentPage: page,
            prePage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            totalPages,
            total: totalOrders,// tổng đơn hàng
          },
        });
      } else {// page và limit không có thì sẽ đc thực thi
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          orders,
        });
      }
    } catch (error) {// try catch bắt lỗi
      return res.status(500).json({
        success: false,
        message: 'Lấy đơn hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // lấy danh sách đơn hàng dựa trên id người dùng
  getOrdersByUserId: async (req, res) => {
    const { id } = req.params;
    let { page, limit } = req.query;

    if (!page || !limit) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu truyền lên!',
      });
    }

    if (req.role === 'user' && req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập!',
      });
    }

    try {
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;
      const orders = await Order.find({
        userId: id,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const totalOrders = await Order.countDocuments({
        userId: id,
      });

      const totalPages = Math.ceil(totalOrders / limit);

      if (!orders) {
        return res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra, Vui lòng thử lại!',
        });
      }

      return res.status(200).json({
        success: true,
        orders,
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
        message: 'Lấy đơn hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // hàm sử dụng  lấy thông tin chi tiết của một đơn hàng dựa trên orderID
  getOrderByOrderId: async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu orderId!',
      });
    }

    try {
      const order = await Order.findOne({
        _id: orderId,
      });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng!',
        });
      }

      if (req.role === 'user' && req.userId !== order.userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập!',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy đơn hàng thành công!',
        order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy đơn hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // hàm sử dụng để tính toán tổng doanh thu của các 
  //đơn hàng đã giao hàng thành công và được thanh toán
  getTotalRevenue: async (req, res) => {
    try {
      const orders = await Order.find({
        shippingStatus: 'Giao hàng thành công',
        paymentStatus: 'Đã thanh toán',
      });
      let totalRevenue = 0;

      if (orders.length > 0) {
        totalRevenue = orders.reduce((acc, order) => {
          return acc + order.totalPrice;
        }, 0);
      }

      return res.status(200).json({
        success: true,
        totalRevenue,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy doanh thu thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // hàm sự dụng so sánh doanh thu giữa hai tháng liên tiếp 
  getCompareTwoMonthRevenue: async (req, res) => {
    try {
      const ordersCurrentMonth = await Order.find({
        shippingStatus: 'Giao hàng thành công',
        paymentStatus: 'Đã thanh toán',
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      });
      const ordersPreMonth = await Order.find({
        shippingStatus: 'Giao hàng thành công',
        paymentStatus: 'Đã thanh toán',
        createdAt: {
          $gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1
          ),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      });

      let totalRevenueCurrentMonth = 0;
      let totalRevenuePreMonth = 0;

      if (ordersCurrentMonth.length > 0) {
        totalRevenueCurrentMonth = ordersCurrentMonth.reduce((acc, order) => {
          return acc + order.totalPrice;
        }, 0);
      }

      if (ordersPreMonth.length > 0) {
        totalRevenuePreMonth = ordersPreMonth.reduce((acc, order) => {
          return acc + order.totalPrice;
        }, 0);
      }

      return res.status(200).json({
        success: true,
        totalRevenueCurrentMonth,
        totalRevenuePreMonth,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lấy doanh thu thất bại, Vui lòng thử lại sau!',
      });
    }
  },
  // hàm cập nhật trạng thái vận chuyển và trạng thái thanh toán của một đơn hàng
  updateStatusOrder: async (req, res) => {
    const { shippingStatus, paymentStatus } = req.body;
    const { orderId } = req.params;

    if (!shippingStatus || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu truyền lên!',
      });
    }

    try {
      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          shippingStatus,
          paymentStatus,
        },
        {
          new: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin đơn hàng thành công!',
        order,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message:
          'Cập nhật thông tin đơn hàng không thành công, Vui lòng thử lại sau!',
      });
    }
  },
  // hàm xóa một đơn hàng dựa trên orderID
  deleteOrder: async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findOneAndDelete({
        _id: orderId,
      });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng!',
        });
      }

      return res.status(200).json({
        success: true,
        order,
        message: 'Xóa đơn hàng thành công!',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Xóa đơn hàng thất bại, Vui lòng thử lại sau!',
      });
    }
  },
};

module.exports = OrderController;
