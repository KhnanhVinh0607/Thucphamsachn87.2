const Router = require('express').Router();

const orderController = require('../controllers/order.controller');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

Router.post('/', verifyToken, orderController.createOrder);

Router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
Router.get(
  '/get-total-revenue',
  verifyToken,
  isAdmin,
  orderController.getTotalRevenue
);
Router.get(
  '/get-compare-two-month-revenue',
  verifyToken,
  isAdmin,
  orderController.getCompareTwoMonthRevenue
);
Router.get('/:orderId', verifyToken, orderController.getOrderByOrderId);
Router.get('/user/:id', verifyToken, orderController.getOrdersByUserId);

Router.patch(
  '/:orderId',
  verifyToken,
  isAdmin,
  orderController.updateStatusOrder
);
Router.delete('/:orderId', verifyToken, isAdmin, orderController.deleteOrder);

module.exports = Router;
