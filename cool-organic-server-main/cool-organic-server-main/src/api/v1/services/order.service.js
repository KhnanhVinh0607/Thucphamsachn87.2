const orderService = {
  handlePaymentMethod: (value) => {
    const paymentMethod = {
      0: 'Thanh toán khi giao hàng (COD)',
      1: 'Thanh toán qua thẻ ATM nội địa',
    };

    return paymentMethod[value];
  },
  handleShippingMethod: (value) => {
    const shippingMethod = {
      0: 'Giao hàng tận nơi',
    };

    return shippingMethod[value];
  },
};

module.exports = orderService;
