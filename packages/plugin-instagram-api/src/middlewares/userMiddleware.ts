import { sendInboxMessage } from '../messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let userIds: string[] = [];

const userMiddleware = async (req, _res, next) => {
  const { path, headers, query } = req;
  const subdomain = getSubdomain(req);

  if (userIds.length === 0) {
    const response = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'getUserIds'
      },
      isRPC: true
    });

    userIds = response.userIds;
  }

  if (path.startsWith('/accounts')) {
    try {
      const userId = headers.userid || query.userId;

      if (userIds.includes(userId)) {
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
