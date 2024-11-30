const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { schemaOptions } = require('./modelOptions');

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
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

module.exports = mongoose.model('Category', CategorySchema);
