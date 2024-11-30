const Router = require('express').Router();

const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

Router.post('/', verifyToken, isAdmin, categoryController.createCategory);

Router.get('/', categoryController.getAllCategories);
Router.get('/:slug', categoryController.getCategoryBySlug);
Router.get(
  '/quantity/:slug',
  verifyToken,
  isAdmin,
  categoryController.getQuantityProductsOfCategory
);

Router.put('/:slug', verifyToken, isAdmin, categoryController.updateCategory);
Router.delete(
  '/:slug',
  verifyToken,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = Router;
