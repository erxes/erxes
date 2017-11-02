import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Users } from './db/models';

const SECRET = 'dfjklsafjjekjtejifjidfjsfd';

/*
 * Creates regular and refresh tokens using given user information
 * @param {Object} _user - User object
 * @param {String} secret - Token secret
 * @return [String] - list of tokens
 */
const createTokens = async (_user, secret) => {
  const user = { _id: _user._id, email: _user.email, details: _user.details };

  const createToken = await jwt.sign({ user }, secret, { expiresIn: '20m' });

  const createRefreshToken = await jwt.sign({ user }, secret, { expiresIn: '7d' });

  return [createToken, createRefreshToken];
};

/*
 * Renews tokens
 * @param {String} token
 * @param {String} refreshToken
 * @return {Object} renewed tokens with user
 */
export const refreshTokens = async (token, refreshToken) => {
  let _id = null;

  try {
    // validate refresh token
    const { user } = jwt.verify(refreshToken, SECRET);

    _id = user._id;

    // if refresh token is expired then force to login
  } catch (e) {
    return {};
  }

  const user = await Users.findOne({ _id });

  // recreate tokens
  const [newToken, newRefreshToken] = await createTokens(user, SECRET);

  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  };
};

/*
 * Validates user credentials and generates tokens
 * @param {Object} args
 * @param {String} args.email - User email
 * @param {String} args.password - User password
 * @return {Object} - generated tokens
 */
export const login = async ({ email, password }) => {
  const user = await Users.findOne({ email });

  if (!user) {
    // user with provided email not found
    throw new Error('Invalid login');
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    // bad password
    throw new Error('Invalid login');
  }

  // create tokens
  const [token, refreshToken] = await createTokens(user, SECRET);

  return {
    token,
    refreshToken,
  };
};

/*
 * Finds user object by passed tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const userMiddleware = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user } = jwt.verify(token, SECRET);

      // save user in request
      req.user = user;

      // if token is invalid or expired
    } catch (e) {
      const refreshToken = req.headers['x-refresh-token'];

      // create new tokens using refresh token & refresh token
      const newTokens = await refreshTokens(token, refreshToken);

      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }

      // save user in request
      req.user = newTokens.user;
    }
  }

  next();
};

export default {
  login,
};
