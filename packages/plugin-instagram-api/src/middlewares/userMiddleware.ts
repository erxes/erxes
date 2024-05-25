import { sendInboxMessage } from '../messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export const userIds: string[] = [];

const userMiddleware = async (req, _res, next) => {
  const { path, headers, query } = req;
  const subdomain = getSubdomain(req);

  if (userIds.length === 0) {
    try {
      const response = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'getUserIds'
        },
        isRPC: true
      });

      // Update the contents of userIds instead of reassigning the variable
      userIds.push(...response.userIds);
    } catch (error) {
      return next(error);
    }
  }

  if (path.startsWith('/accounts')) {
    try {
      const userId = headers.userid || query.userId;

      if (userIds.includes(userId)) {
        return next();
      }

      return next(new Error('User not authorized'));
    } catch (error) {
      return next(error);
    }
  }

  next();
};

export default userMiddleware;
