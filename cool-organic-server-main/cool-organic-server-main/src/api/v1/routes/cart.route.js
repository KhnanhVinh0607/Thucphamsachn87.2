const Router = require('express').Router();

const cartController = require('../controllers/cart.controller');
const verifyToken = require('../middlewares/verifyToken');

Router.get('/', verifyToken, cartController.getProductInCart);

Router.post('/', verifyToken, cartController.createCart);

Router.put('/update-quantity', verifyToken, cartController.updateQuantity);
Router.put('/', verifyToken, cartController.updateCart);

Router.delete(
  '/delete-product',
  verifyToken,
  cartController.deleteProductInCart
);
Router.delete('/:id', verifyToken, cartController.deleteCart);

module.exports = Router;
