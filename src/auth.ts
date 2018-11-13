import * as jwt from 'jsonwebtoken';
import { Session, Users } from './db/models';

/*
 * Finds user object by passed tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const userMiddleware = async (req, _res, next) => {
  const token = req.cookies['auth-token'];

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user } = jwt.verify(token, Users.getSecret());

      // logged out
      const isLoggedout = await Session.findOne({ invalidToken: token });

      if (isLoggedout) {
        return next();
      }

      // save user in request
      req.user = user;
      req.user.loginToken = token;
    } catch (e) {
      return next();
    }
  }

  next();
};
