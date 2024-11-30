const productService = {
  handleSortByPrice: (values) => {
    const condition = [];
    const sortType = {
      1: () => {
        condition.push({
          salePrice: {
            $gte: 0,
            $lte: 100000,
          },
        });
      },
      2: () => {
        condition.push({
          salePrice: {
            $gte: 100000,
            $lte: 200000,
          },
        });
      },
      3: () => {
        condition.push({
          salePrice: {
            $gte: 200000,
            $lte: 300000,
          },
        });
      },
      4: () => {
        condition.push({
          salePrice: {
            $gte: 300000,
            $lte: 500000,
          },
        });
      },
      5: () => {
        condition.push({
          salePrice: {
            $gte: 500000,
            $lte: 1000000,
          },
        });
      },
      6: () => {
        condition.push({
          salePrice: {
            $gte: 1000000,
          },
        });
      },
    };

    values.forEach((value) => {
      sortType[value]();
    });

    return condition;
  },
};

module.exports = productService;
