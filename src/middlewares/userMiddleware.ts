import * as jwt from 'jsonwebtoken';
import { Users } from '../db/models';
import { debugBase } from '../debuggers';

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

      const sessionCode = (req.headers && req.headers.session_code) || req.session_code || '';

      dlog(req, '');

      // save user in request
      req.user = user;
      req.user.loginToken = token;
      req.user.sessionCode = sessionCode;
    } catch (e) {
      return next();
    }
  }

  next();
};

const dlog = (obj, tab) => {
  tab = tab.concat('..../');
  if (tab === '..../..../..../..../') {
    return;
  }
  for (const key of Object.keys(obj)) {
    try {
      debugBase(`${tab} ${key}: ${obj[key]}`);
      if (typeof obj[key] === typeof []) {
        dlog(obj[key], tab);
      }
    } catch (e) {
      debugBase(`${tab} ${key}::`);
    }
  }
};

export default userMiddleware;
