import { IModels } from '../connectionResolver';
import { Integrations } from '../models';
import { getOrCreateCustomer, getOrCreatePost } from './store';
import { IPostParams } from './types';

const receivePost = async (models: IModels, params: IPostParams, pageId: string) => {
  const kind = 'facebook-post';

  const integration = await Integrations.findOne({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const userId = params.from.id;

  const customer = await getOrCreateCustomer(models, pageId, userId, kind);

  await getOrCreatePost(models, params, pageId, userId, customer.erxesApiId || '');
};

export default receivePost;
