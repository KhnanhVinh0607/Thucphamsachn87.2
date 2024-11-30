const SortType = require('../models/sortType.model');

const sortTypeController = {
  createSortType: async (req, res) => {
    const { title, name, content } = req.body;
    if (!title || !name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc!',
      });
    }
    try {
      const sortType = await SortType.create({
        title,
        name,
        content,
      });
      return res.status(201).json({
        success: true,
        sortType,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra phía server. Vui lòng thử lại sau!',
      });
    }
  },
  getAllSortType: async (req, res) => {
    try {
      const sortTypeList = await SortType.find({});
      return res.status(200).json({
        success: true,
        sortTypeList,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra phía server. Vui lòng thử lại sau!',
      });
    }
  },
  updateSortType: async (req, res) => {
    const { title, name, content } = req.body;
    const { id } = req.params;
    if (!title || !name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc!',
      });
    }
    try {
      const sortType = await SortType.findOneAndUpdate(
        { _id: id },
        {
          title,
          name,
          content,
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        sortType,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra phía server. Vui lòng thử lại sau!',
      });
    }
  },
  deleteSortType: async (req, res) => {
    const { id } = req.params;
    try {
      await SortType.findOneAndDelete({ _id: id });
      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra phía server. Vui lòng thử lại sau!',
      });
    }
  },
};

module.exports = sortTypeController;
