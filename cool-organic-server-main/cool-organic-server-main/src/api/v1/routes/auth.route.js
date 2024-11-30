const Router = require('express').Router();

const authController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/verifyToken');

Router.get('/', verifyToken, authController.getUser);

Router.post('/login', authController.handleLogin);
Router.post('/register', authController.handleRegister);

module.exports = Router;
