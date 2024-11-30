const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { schemaOptions } = require('./modelOptions');

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: 'Hiện chưa cập nhật số điện thoại',
    },
    address: {
      type: String,
      default: 'Hiện chưa cập nhật địa chỉ',
    },
    role: {
      type: String,
      required: true,
      default: 'user',
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

module.exports = mongoose.model('User', UserSchema);
