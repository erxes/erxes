import * as jwt from 'jsonwebtoken';
import { Users } from './db/models';

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
      const { user } = jwt.verify(token, Users.getSecret());

      // save user in request
      req.user = user;

      // if token is invalid or expired
    } catch (e) {
      const refreshToken = req.headers['x-refresh-token'];

      // create new tokens using refresh token & refresh token
      const newTokens = await Users.refreshTokens(refreshToken);

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
