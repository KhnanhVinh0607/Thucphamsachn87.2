const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { schemaOptions } = require('./modelOptions');

const OrderSchema = new Schema(
  {
    cart: [
      {
        product: {
          type: Object,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    district: {
      type: String,
      require: true,
    },
    ward: {
      type: String,
      require: true,
    },
    comment: {
      type: String,
      default: 'Không có ghi chú nào cho đơn hàng!',
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    shippingStatus: {
      type: String,
      required: true,
      default: 'Chưa giao hàng',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'Chưa thanh toán',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  schemaOptions
);

module.exports = mongoose.model('Order', OrderSchema);
