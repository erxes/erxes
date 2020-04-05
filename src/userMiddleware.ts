import { inArray } from './redisClient';

const EXCLUDE_PATH = ['/nylas/webhook', '/nylas/auth/callback', '/nylas/oauth2/callback', '/gmaillogin'];

const userMiddleware = async (req, _res, next) => {
  const { path, headers, query } = req;

  if (EXCLUDE_PATH.includes(path)) {
    return next();
  }

  if (path.startsWith('/gmail') || path.startsWith('/accounts') || path.startsWith('/nylas')) {
    try {
      const userId = headers.userid || query.userId;

      if (await inArray('userIds', userId)) {
        return next();
      }

      next(new Error('User not authorized'));
    } catch (e) {
      next(e);
    }
  }

  next();
};

export default userMiddleware;
