const Router = require('express').Router();
const userRouter = require('./user.route');
const authRouter = require('./auth.route');
const productRouter = require('./product.route');
const categoryRouter = require('./category.route');
const sortTypeRouter = require('./sortType.route');
const inventoryRouter = require('./inventory.route');
const cartRouter = require('./cart.route');
const orderRouter = require('./order.route');

Router.use('/users', userRouter);
Router.use('/auth', authRouter);
Router.use('/products', productRouter);
Router.use('/categories', categoryRouter);
Router.use('/sort-type', sortTypeRouter);
Router.use('/inventory', inventoryRouter);
Router.use('/cart', cartRouter);
Router.use('/orders', orderRouter);

module.exports = Router;
