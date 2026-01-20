// messagebroker had been used on 2.0 
import { receiveInboxMessage } from '@/inbox/receiveMessage'; 
import { getSubdomain } from 'erxes-api-shared/src/utils';

export let userIds: string[] = [];

const userMiddleware = async (req, _res, next) => {
  const { path, headers, query } = req;
  const subdomain = getSubdomain(req);

  if (userIds.length === 0) {
    const data = {
        action: 'getUserIds',
      };
  
      const response = await receiveInboxMessage(subdomain, data);
      if (response.status === 'success') {
        userIds = response.data.userIds;
      } else {
        throw new Error(` userMiddleware failed:`);
      }
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
