const getSlug = require('speakingurl');

const generateSlug = (input) => {
  return getSlug(input, {
    lang: 'vn',
    separator: '-',
  });
};

module.exports = generateSlug;
