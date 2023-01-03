import { debugError } from '@erxes/api-utils/src/debuggers';
import { IModels } from '.';
import { sendClientPortalMessage } from '../../messageBroker';
import { IPost } from './post';

function extend<T>(a: T[], b: T[]) {
  b.forEach(v => a.push(v));
}

export const notifyUsersPublishedPost = async (
  subdomain: string,
  models: IModels,
  post: IPost
) => {
  try {
    const excludeIds: string[] = [];

    if (post.createdByCpId) {
      // don't send to its creator
      excludeIds.push(post.createdByCpId);
    }

    const userFollowerIdsList = post.createdByCpId
      ? await models.FollowCpUser.getFollowerIds(post.createdByCpId, excludeIds)
      : [];

    extend(excludeIds, userFollowerIdsList);

    if (userFollowerIdsList.length) {
      await sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: 'NA',
          content: 'NA',
          receivers: userFollowerIdsList,
          notifType: 'system',
          link: '',
          isMobile: true,
          eventData: {
            type: 'userPublishPost',
            followeeId: post.createdByCpId,
            postId: post._id
          }
        }
      });
    }

    for (const tagId of post.tagIds || []) {
      const tagFollowerIdsList = await models.FollowTag.getFollowerIds(
        tagId,
        excludeIds
      );
      extend(excludeIds, tagFollowerIdsList);

      if (tagFollowerIdsList.length) {
        await sendClientPortalMessage({
          subdomain,
          action: 'sendNotification',
          data: {
            title: 'NA',
            content: 'NA',
            receivers: tagFollowerIdsList,
            notifType: 'system',
            link: '',
            isMobile: true,
            eventData: {
              type: 'tagPublishPost',
              tagId,
              postId: post._id
            }
          }
        });
      }
    }
  } catch (error) {
    debugError(error);
  }
};

export const notifyFollowedYou = async (
  subdomain: string,
  models: IModels,
  followeeId: string,
  followerId: string
) => {
  try {
    await sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: {
        title: 'NA',
        content: 'NA',
        receivers: [followeeId],
        notifType: 'system',
        link: '',
        isMobile: true,
        eventData: {
          type: 'followedYou',
          followerId
        }
      }
    });
  } catch (e) {
    debugError(e);
  }
};
