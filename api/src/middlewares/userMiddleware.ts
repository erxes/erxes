import * as telemetry from 'erxes-telemetry';
import * as jwt from 'jsonwebtoken';
import { frontendEnv } from '../data/utils';
import { Users } from '../db/models';
import memoryStorage from '../inmemoryStorage';
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

      const currentDate = new Date();
      const machineId = telemetry.getMachineId();

      const lastLoginDate = new Date(await memoryStorage().get(machineId));

      if (lastLoginDate.getDay() !== currentDate.getDay()) {
        memoryStorage().set(machineId, currentDate);

        telemetry.trackCli('last_login', { updatedAt: currentDate });
      }

      const hostname = await memoryStorage().get('hostname');

      if (!hostname || hostname === undefined) {
        memoryStorage().set('hostname', frontendEnv({ name: 'API_URL', req }));
      }
    } catch (e) {
      return next();
    }
  }

  next();
};

export default userMiddleware;
