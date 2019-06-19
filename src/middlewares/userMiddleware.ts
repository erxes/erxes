import * as jwt from 'jsonwebtoken';
import { Users } from '../db/models';

/*
 * Finds user object by passed tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const userMiddleware = async (req, _res, next) => {
  const token = req.cookies['auth-token'];

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user } = jwt.verify(token, Users.getSecret());

      // save user in request
      req.user = user;
      req.user.loginToken = token;
    } catch (e) {
      return next();
    }
  }

  next();
};

export default userMiddleware;
