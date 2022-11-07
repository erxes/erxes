import { IModels } from '../connectionResolver';
import { sendNotification } from '../utils';

export const kbHandler = async (models: IModels, subdomain, params) => {
  const data = params.newData;

  if (data.status !== 'publish') {
    return;
  }

  const clientPortals = await models.ClientPortals.find({
    knowledgeBaseTopicId: data.topicId
  });

  if (clientPortals.length === 0) {
    return;
  }

  for (const clientPortal of clientPortals) {
    const userIds = await models.ClientPortalUsers.find({
      clientPortalId: clientPortal._id
    }).distinct('_id');

    if (userIds.length === 0) {
      continue;
    }

    const link = `${clientPortal.url}/knowledge-base/category?id=${data.categoryId}`;

    await sendNotification(models, subdomain, {
      receivers: userIds,
      title: 'New article has been published',
      content: `New article has been published: <a href="${link}" target="_blank" rel="noopener noreferrer">${data.title}</a> `,
      notifType: 'system',
      link
    });
  }

  return;
};
