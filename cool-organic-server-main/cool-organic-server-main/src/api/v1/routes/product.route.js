const Router = require('express').Router();
const upload = require('../utils/multer');

const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const uploadMultiFiles = require('../middlewares/uploadMultiFiles');
const uploadSingleFile = require('../middlewares/uploadSingleFile');

Router.post('/', verifyToken, isAdmin, productController.createProduct);

Router.post(
  '/upload-single-file',
  verifyToken,
  isAdmin,
  upload.single('image'),
  uploadSingleFile,
  productController.uploadSingleFile
);
Router.post(
  '/upload-multiple-files',
  verifyToken,
  isAdmin,
  upload.any('images'),
  uploadMultiFiles,
  productController.uploadMultipleFiles
);

Router.get('/', productController.getAllProducts);
Router.get('/category/:categorySlug', productController.getProductsByCategory);
Router.get('/search', productController.searchProduct);
Router.get('/top-selling', productController.getTopSellingProducts);
Router.get('/related', productController.getRelatedProducts);
Router.get('/:slug', productController.getProductBySlug);

Router.put('/:slug', verifyToken, isAdmin, productController.updateProduct);

Router.delete('/:slug', verifyToken, isAdmin, productController.deleteProduct);

module.exports = Router;
