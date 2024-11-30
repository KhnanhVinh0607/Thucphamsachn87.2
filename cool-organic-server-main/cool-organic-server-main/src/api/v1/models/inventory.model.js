const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { schemaOptions } = require('./modelOptions');

const InventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
      },
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

module.exports = mongoose.model('Inventory', InventorySchema);
