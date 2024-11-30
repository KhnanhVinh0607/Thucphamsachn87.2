const Router = require('express').Router();

const userController = require('../controllers/user.controller');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

Router.post('/', verifyToken, isAdmin, userController.createUser);
Router.get('/', verifyToken, isAdmin, userController.getAllUsers);
Router.get('/:id', verifyToken, isAdmin, userController.getUserById);

Router.post('/change-password', verifyToken, userController.changePassword);
Router.put('/', verifyToken, userController.updateUser);
Router.put('/role/:id', verifyToken, isAdmin, userController.updateRole);
Router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = Router;
