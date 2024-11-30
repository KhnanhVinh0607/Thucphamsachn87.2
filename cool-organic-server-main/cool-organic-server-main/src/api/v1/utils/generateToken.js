const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;
