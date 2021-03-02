import * as telemetry from 'erxes-telemetry';
import * as jwt from 'jsonwebtoken';
import { frontendEnv, sendRequest } from '../data/utils';
import { Users } from '../db/models';
import { get, set } from '../inmemoryStorage';
/*
 * Finds user object by passed tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const userMiddleware = async (req, _res, next) => {
  const erxesCoreToken = req.headers['erxes-core-token'];
  const url = req.headers['erxes-core-website-url'];

  if (erxesCoreToken && url) {
    try {
      const response = await sendRequest({
        url: 'https://erxes.io/check-website',
        method: 'POST',
        headers: {
          'erxes-core-token': erxesCoreToken
        },
        body: {
          url
        }
      });

      if (response === 'ok') {
        req.user = {
          _id: 'userId',
          customPermissions: [
            {
              action: 'showIntegrations',
              allowed: true,
              requiredActions: []
            },
            {
              action: 'showKnowledgeBase',
              allowed: true,
              requiredActions: []
            },
            {
              action: 'showScripts',
              allowed: true,
              requiredActions: []
            }
          ]
        };
      }
    } catch (e) {
      return next();
    }

    return next();
  }

  const token = req.cookies['auth-token'];

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user } = jwt.verify(token, Users.getSecret());

      // save user in request
      req.user = user;
      req.user.loginToken = token;
      req.user.sessionCode = req.headers.sessioncode || '';

      const currentDate = new Date();
      const machineId = telemetry.getMachineId();

      const lastLoginDate = new Date(await get(machineId));

      if (lastLoginDate.getDay() !== currentDate.getDay()) {
        set(machineId, currentDate);

        telemetry.trackCli('last_login', { updatedAt: currentDate });
      }

      const hostname = await get('hostname');

      if (!hostname) {
        set('hostname', frontendEnv({ name: 'API_URL', req }));
      }
    } catch (e) {
      return next();
    }
  }

  next();
};

export default userMiddleware;
