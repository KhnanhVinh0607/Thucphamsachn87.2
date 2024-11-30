const Router = require('express').Router();

const sortTypeController = require('../controllers/sortType.controller');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

Router.post('/', verifyToken, isAdmin, sortTypeController.createSortType);

Router.get('/', sortTypeController.getAllSortType);

Router.put('/:id', verifyToken, isAdmin, sortTypeController.updateSortType);
Router.delete('/:id', verifyToken, isAdmin, sortTypeController.deleteSortType);

module.exports = Router;
