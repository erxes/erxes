import { IModels } from '../connectionResolver';
import { getOrCreateCustomer, getOrCreatePost } from './store';
import { IPostParams } from './types';

const receivePost = async (models: IModels, subdomain: string, params: IPostParams, pageId: string) => {
  const kind = 'facebook-post';

  const integration = await models.Integrations.findOne({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const userId = params.from.id;

  const customer = await getOrCreateCustomer(models, subdomain, pageId, userId, kind);

  await getOrCreatePost(models, subdomain, params, pageId, userId, customer.erxesApiId || '');
};

export default receivePost;
