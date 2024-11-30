const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { schemaOptions } = require('./modelOptions');

const ProductSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
    },
    sold: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: Array,
      required: true,
      default: [],
    },
    origin: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
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

ProductSchema.virtual('inventory', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'productId',
});

module.exports = mongoose.model('Product', ProductSchema);
