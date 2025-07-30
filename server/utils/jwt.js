const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '15m',
      issuer: 'ShopHub',
      audience: 'ShopHub-Client'
    }
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: 'ShopHub',
      audience: 'ShopHub-Client'
    }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'ShopHub',
      audience: 'ShopHub-Client'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateTokens,
  verifyToken,
  generateRandomToken,
  extractTokenFromHeader
};