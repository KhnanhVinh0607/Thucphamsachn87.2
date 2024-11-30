const Router = require('express').Router();

const inventoryController = require('../controllers/inventory.controller');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

Router.get('/', verifyToken, isAdmin, inventoryController.getAllInventory);
Router.get(
  '/get-all-quantity',
  verifyToken,
  isAdmin,
  inventoryController.getAllQuantityOfProductInInventory
);

Router.put(
  '/:id',
  verifyToken,
  isAdmin,
  inventoryController.updateQuantityOfProductInInventory
);

Router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  inventoryController.deleteProductInInventory
);

module.exports = Router;
